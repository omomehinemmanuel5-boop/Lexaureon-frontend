import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const AGENTS_PATH = path.join(process.cwd(), 'AGENTS.md');
const PROBLEMS_PATH = path.join(process.cwd(), 'research', 'open-problems.md');

function extractSection(content: string, header: string): string {
  const start = content.indexOf(header);
  if (start === -1) return '(not found)';
  const end = content.indexOf('\n---', start);
  return content.slice(start, end === -1 ? undefined : end).trim();
}

function main(): void {
  const agents = fs.existsSync(AGENTS_PATH)
    ? fs.readFileSync(AGENTS_PATH, 'utf-8')
    : '';

  const status = extractSection(agents, '## CURRENT STATUS');
  const next = extractSection(agents, '## NEXT ACTIONS');

  let commits = '';
  try {
    commits = execSync('git log -3 --pretty=format:"[%cs] %s"', { encoding: 'utf-8' }).trim();
  } catch {
    commits = '(git log unavailable)';
  }

  const problems = fs.existsSync(PROBLEMS_PATH)
    ? fs.readFileSync(PROBLEMS_PATH, 'utf-8').trim()
    : '(research/open-problems.md not found)';

  console.log('═══════════════════════════════════════');
  console.log('  LEX AUREON — PROJECT BRIEF');
  console.log('═══════════════════════════════════════\n');
  console.log(status);
  console.log('\n── LAST 3 COMMITS ──────────────────────');
  console.log(commits);
  console.log('\n── OPEN PROBLEMS ────────────────────────');
  console.log(problems);
  console.log('\n── NEXT ACTIONS ─────────────────────────');
  console.log(next);
  console.log('\n═══════════════════════════════════════');
}

main();
