#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PROJECT_DIR = path.resolve(__dirname, '..', '..');

function extractText(content) {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .filter(b => b && b.type === 'text' && b.text)
    .map(b => b.text)
    .join('\n')
    .trim();
}

function shouldSkip(text) {
  if (!text || !text.trim()) return true;
  if (text.includes('<local-command-caveat>')) return true;
  if (text.includes('<command-name>')) return true;
  if (text.includes('<command-message>')) return true;
  return false;
}

let stdinData = '';
process.stdin.on('data', chunk => { stdinData += chunk; });
process.stdin.on('end', () => {
  try {
    main();
  } catch (e) {
    // Silently exit on errors
  }
});

function main() {
  const input = JSON.parse(stdinData || '{}');
  const sessionId = input.session_id;
  if (!sessionId) return;

  // Find JSONL file for this session
  const sanitized = PROJECT_DIR.replace(/[:\\/]/g, '-');
  const jsonlPath = path.join(os.homedir(), '.claude', 'projects', sanitized, `${sessionId}.jsonl`);
  if (!fs.existsSync(jsonlPath)) return;

  // Parse user/assistant messages
  const messages = [];
  const rawLines = fs.readFileSync(jsonlPath, 'utf8').split('\n');

  for (const line of rawLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let entry;
    try { entry = JSON.parse(trimmed); } catch { continue; }

    if (entry.isMeta) continue;
    if (entry.type !== 'user' && entry.type !== 'assistant') continue;

    const msg = entry.message;
    if (!msg || !msg.role) continue;

    const text = extractText(msg.content);
    if (shouldSkip(text)) continue;

    messages.push({ role: msg.role, text });
  }

  // Skip sessions with no real conversation
  if (messages.length < 2) return;

  // Determine output filename: YYYY-MM-DD-save-chat-log-NNN.md
  const chatLogsDir = path.join(PROJECT_DIR, 'docs', 'chat-logs');
  fs.mkdirSync(chatLogsDir, { recursive: true });

  const today = new Date().toISOString().slice(0, 10);
  const prefix = `${today}-save-chat-log-`;

  const existing = fs.readdirSync(chatLogsDir)
    .filter(f => f.startsWith(prefix) && f.endsWith('.md'))
    .map(f => parseInt(f.slice(prefix.length, -'.md'.length)) || 0)
    .filter(n => !isNaN(n) && n > 0);

  const nextNum = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  const filename = `${prefix}${String(nextNum).padStart(3, '0')}.md`;
  const filepath = path.join(chatLogsDir, filename);

  // Write markdown
  let md = `# ${today} チャットログ\n\n## やり取り\n\n`;
  messages.forEach((msg, i) => {
    const label = msg.role === 'user' ? 'ユーザー' : 'Claude';
    md += `**${label}:** ${msg.text}\n\n`;
    if (i < messages.length - 1) md += '---\n\n';
  });

  fs.writeFileSync(filepath, md, 'utf8');

  // Git commit
  try {
    execSync(`git add "${filepath}"`, { cwd: PROJECT_DIR, stdio: 'ignore' });
    execSync(`git commit -m "log: チャットログ自動保存 ${filename}"`, { cwd: PROJECT_DIR, stdio: 'ignore' });
  } catch {
    // Git failures are non-fatal
  }
}
