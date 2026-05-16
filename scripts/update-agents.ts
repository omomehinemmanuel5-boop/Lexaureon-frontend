import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const AGENTS_PATH = path.join(process.cwd(), 'AGENTS.md');

function getLastCommit(): { message: string; date: string } {
  try {
    const message = execSync('git log -1 --pretty=%s', { encoding: 'utf-8' }).trim();
    const date = execSync('git log -1 --pretty=%cs', { encoding: 'utf-8' }).trim();
    return { message, date };
  } catch {
    return { message: 'update', date: new Date().toISOString().slice(0, 10) };
  }
}

function detectCategory(message: string): string | null {
  if (message.startsWith('feat:')) return 'SYSTEM';
  if (message.startsWith('fix:')) return 'FIX';
  if (message.startsWith('design:')) return 'DESIGN';
  if (message.startsWith('grant:')) return 'GRANT';
  if (message.startsWith('research:')) return 'RESEARCH';
  if (message.startsWith('add:')) return 'AUTOMATION';
  if (message.startsWith('auto:')) return null;
  return 'SYSTEM';
}

function summarize(message: string): string {
  return message
    .replace(/^(feat|fix|design|grant|research|add|auto):\s*/i, '')
    .trim();
}

function main(): void {
  const { message, date } = getLastCommit();
  const category = detectCategory(message);

  if (!category) {
    console.log('Skipping auto: commit — no AGENTS.md update needed.');
    return;
  }

  const summary = summarize(message);
  const entry = `[${date}] ${category}: ${summary}`;

  let content = fs.readFileSync(AGENTS_PATH, 'utf-8');

  const marker = '## CHANGELOG — WHAT HAS BEEN BUILT';
  const idx = content.indexOf(marker);
  if (idx === -1) {
    console.log('AGENTS.md CHANGELOG section not found.');
    process.exit(1);
  }

  const insertAt = content.indexOf('\n', idx + marker.length) + 1;
  content = content.slice(0, insertAt) + '\n' + entry + '\n' + content.slice(insertAt);

  fs.writeFileSync(AGENTS_PATH, content, 'utf-8');
  console.log(`AGENTS.md updated: ${entry}`);
}

main();
