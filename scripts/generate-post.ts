import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const DRAFT_PATH = path.join(process.cwd(), 'posts', 'draft.md');

function generatePostFromCommit(message: string): string {
  const clean = message.trim().replace(/^feat:|^fix:|^chore:|^refactor:/i, '').trim();
  return `Just shipped: ${clean}

Building Lex Aureon — a Constitutional AI Governance System where every decision is constrained by C + R + S = 1. The PRAXIS governor pipeline ensures no AI action can violate constitutional limits, ever.

This isn't a chatbot. It's a governed intelligence layer for organizations that can't afford to get AI wrong.

If your team is deploying AI at scale without constitutional constraints, you're one prompt away from a governance failure.

lexaureon.com`;
}

function main(): void {
  if (fs.existsSync(DRAFT_PATH)) {
    const draft = fs.readFileSync(DRAFT_PATH, 'utf-8').trim();
    console.log('--- posts/draft.md ---\n');
    console.log(draft);
    return;
  }

  let commitMsg = '';
  try {
    commitMsg = execSync('git log -1 --pretty=%s', { encoding: 'utf-8' }).trim();
  } catch {
    commitMsg = 'latest update to Lex Aureon';
  }

  const post = generatePostFromCommit(commitMsg);
  console.log('--- Generated LinkedIn Post ---\n');
  console.log(post);
}

main();
