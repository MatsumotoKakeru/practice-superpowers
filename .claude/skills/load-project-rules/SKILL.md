---
name: load-project-rules
description: Use at the start of any skill to load and apply project-specific rules from docs/rules/project-rules.md before brainstorming, executing-plans, subagent-driven-development, dispatching-parallel-agents, receiving-code-review, requesting-code-review, or update-spec-after-review
---

# Load Project Rules

## Overview

Loads and applies project-specific rules at the start of major skill workflows. Ensures project conventions are active before any implementation or planning work begins.

## Process

```
1. READ docs/rules/project-rules.md using the Read tool
   IF file does not exist → skip and return (do nothing)

2. APPLY all rules listed in the file to the current session

3. SCAN for lines matching: REQUIRED SKILL: <skill-name>
   IF found → invoke each referenced skill using the Skill tool
```

## When to Invoke

Call this skill **before** starting any of the following skills:

- `brainstorming`
- `executing-plans`
- `subagent-driven-development`
- `dispatching-parallel-agents`
- `receiving-code-review`
- `requesting-code-review`
- `update-spec-after-review`

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Skipping because "I already know the project" | Always read the file — rules change |
| Reading the file but not scanning for `REQUIRED SKILL:` | Both steps are mandatory |
| Only reading the file during general exploration | This must be an explicit, deliberate first step |
