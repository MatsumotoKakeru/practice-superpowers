#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PROJECT_DIR = path.resolve(__dirname, '..', '..');
const LOG_FILE = path.join(__dirname, 'session-end.log');

function logError(msg) {
  try {
    const ts = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${ts}] ERROR: ${msg}\n`, 'utf8');
  } catch {}
}

function logInfo(msg) {
  try {
    const ts = new Date().toISOString();
    fs.appendFileSync(LOG_FILE, `[${ts}] INFO: ${msg}\n`, 'utf8');
  } catch {}
}

function extractText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter(b => b && b.type === 'text' && b.text)
    .map(b => b.text)
    .join('\n')
    .trim();
}

function extractLocalCommand(text) {
  const nameMatch = text.match(/<command-name>\/?([^\n<]*)<\/command-name>/);
  const argsMatch = text.match(/<command-args>([^<]*)<\/command-args>/);
  if (nameMatch) {
    const name = nameMatch[1].trim();
    const args = argsMatch ? argsMatch[1].trim() : '';
    return args ? `/${name} ${args}` : `/${name}`;
  }
  const msgMatch = text.match(/<command-message>([^<]*)<\/command-message>/);
  if (msgMatch) return `/${msgMatch[1].trim()}`;
  return null;
}

function processText(text) {
  if (!text || !text.trim()) return null;
  if (text.includes('<command-name>') || text.includes('<command-message>')) {
    return extractLocalCommand(text);
  }
  return text.trim() || null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForFile(filePath, retries = 5, delayMs = 1000) {
  for (let i = 0; i < retries; i++) {
    if (fs.existsSync(filePath)) return true;
    logInfo(`JSONL not ready, retry ${i + 1}/${retries}: ${filePath}`);
    await sleep(delayMs);
  }
  return false;
}

async function gitCommit(filepath, filename) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      execSync(`git add "${filepath}"`, { cwd: PROJECT_DIR });
      execSync(`git commit -m "log: チャットログ自動保存 ${filename}"`, { cwd: PROJECT_DIR });
      return true;
    } catch (e) {
      logError(`Git attempt ${attempt}/3 failed: ${e.message.split('\n')[0]}`);
      if (attempt < 3) await sleep(2000);
    }
  }
  return false;
}

let stdinData = '';
process.stdin.on('data', chunk => { stdinData += chunk; });
process.stdin.on('end', () => {
  main().catch(e => logError('Unhandled error: ' + e.message));
});

async function main() {
  let input;
  try {
    input = JSON.parse(stdinData || '{}');
  } catch (e) {
    logError('Failed to parse stdin: ' + e.message);
    return;
  }

  const sessionId = input.session_id;
  if (!sessionId) {
    logError('No session_id in input: ' + JSON.stringify(input).slice(0, 200));
    return;
  }

  const sanitized = PROJECT_DIR.replace(/[:\\/]/g, '-');
  const jsonlPath = path.join(os.homedir(), '.claude', 'projects', sanitized, `${sessionId}.jsonl`);

  const found = await waitForFile(jsonlPath);
  if (!found) {
    logError(`JSONL not found after retries: ${jsonlPath}`);
    return;
  }

  let rawLines;
  try {
    rawLines = fs.readFileSync(jsonlPath, 'utf8').split('\n');
  } catch (e) {
    logError(`Failed to read JSONL: ${e.message}`);
    return;
  }

  const messages = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let entry;
    try { entry = JSON.parse(trimmed); } catch { continue; }

    if (entry.isMeta) continue;
    if (entry.type !== 'user' && entry.type !== 'assistant') continue;

    const msg = entry.message;
    if (!msg || !msg.role) continue;

    const rawText = extractText(msg.content);
    const text = processText(rawText);
    if (!text) continue;

    messages.push({ role: msg.role, text });
  }

  if (messages.length < 2) {
    logInfo(`Session ${sessionId}: only ${messages.length} message(s), skipping`);
    return;
  }

  const chatLogsDir = path.join(PROJECT_DIR, 'docs', 'chat-logs');
  try {
    fs.mkdirSync(chatLogsDir, { recursive: true });
  } catch (e) {
    logError(`Failed to create chat-logs dir: ${e.message}`);
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const prefix = `${today}-save-chat-log-`;

  const existing = fs.readdirSync(chatLogsDir)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .map(f => parseInt(f.slice(prefix.length, -'.md'.length)) || 0)
    .filter(n => !isNaN(n) && n > 0);

  const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  const filename = `${prefix}${String(nextNum).padStart(3, '0')}.md`;
  const filepath = path.join(chatLogsDir, filename);

  let md = `# ${today} チャットログ\n\n## やり取り\n\n`;
  messages.forEach((msg, i) => {
    const label = msg.role === 'user' ? 'ユーザー' : 'Claude';
    md += `**${label}:** ${msg.text}\n\n`;
    if (i < messages.length - 1) md += '---\n\n';
  });

  try {
    fs.writeFileSync(filepath, md, 'utf8');
  } catch (e) {
    logError(`Failed to write chat log: ${e.message}`);
    return;
  }

  const committed = await gitCommit(filepath, filename);
  if (!committed) {
    logError(`Git commit failed for ${filename} — file written but not committed`);
  } else {
    logInfo(`Success: ${filename}`);
  }
}
