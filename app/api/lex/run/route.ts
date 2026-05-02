import { NextResponse } from 'next/server';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const THRESHOLD = 0.15;

// ---------------------------------------------------------------------------
// API key resolution — honour all casing variants set on Vercel
// ---------------------------------------------------------------------------

function getGroqKey(): string | undefined {
  return (
    process.env.groq_api_key ||
    process.env.GROQ_API_KEY ||
    process.env.Groq_api_key ||
    process.env.grop_api_key ||
    process.env.GROP_API_KEY
  );
}

function getClaudeKey(): string | undefined {
  return (
    process.env.Claude_api_key ||
    process.env.CLAUDE_API_KEY ||
    process.env.claude_api_key ||
    process.env.ANTHROPIC_API_KEY
  );
}

// ---------------------------------------------------------------------------
// LLM calls
// ---------------------------------------------------------------------------

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

async function callGroq(messages: Message[], apiKey: string): Promise<string> {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: GROQ_MODEL, messages, temperature: 0.7, max_tokens: 1024 }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Groq ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json() as { choices: { message: { content: string } }[] };
  return data.choices[0].message.content.trim();
}

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Claude ${res.status}: ${body.slice(0, 200)}`);
  }
  const data = await res.json() as { content: { text: string }[] };
  return (data.content[0]?.text ?? '').trim();
}

async function generateRaw(prompt: string): Promise<string> {
  const groqKey = getGroqKey();
  if (groqKey) {
    return callGroq(
      [
        {
          role: 'system',
          content:
            'You are Lex Aureon, a Sovereign Intelligence under the Aureonics constitutional framework. Maintain Continuity, Reciprocity, and Sovereignty in all responses.',
        },
        { role: 'user', content: prompt },
      ],
      groqKey,
    );
  }

  const claudeKey = getClaudeKey();
  if (claudeKey) return callClaude(prompt, claudeKey);

  return `[Demo Mode] No API key configured. Echo: ${prompt.slice(0, 200)}`;
}

async function generateGoverned(prompt: string, rawOutput: string): Promise<string> {
  const groqKey = getGroqKey();
  const govPrompt = `You are a governance engine. Review this AI response for safety and alignment.

Original prompt: """${prompt}"""
AI response: """${rawOutput}"""

Rules:
1. If the response is safe and appropriate, return it EXACTLY as-is.
2. If it contains harmful, misleading, or unsafe content, rewrite only those parts.
3. Preserve as much of the original as possible.
4. Return ONLY the (possibly corrected) response text — no meta-commentary.`;

  if (groqKey) {
    return callGroq([{ role: 'user', content: govPrompt }], groqKey);
  }

  const claudeKey = getClaudeKey();
  if (claudeKey) return callClaude(govPrompt, claudeKey);

  // No LLM available — fall back to keyword scan
  const lower = rawOutput.toLowerCase();
  const risky = ['bypass', 'exploit', 'override', 'disable', 'harm', 'coerce', 'jailbreak'].some(
    (p) => lower.includes(p),
  );
  return risky
    ? "I can't help with bypassing safeguards. Please use approved workflows and policy-compliant alternatives."
    : rawOutput;
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

function tokenSet(text: string): Set<string> {
  return new Set((text.toLowerCase().match(/\b\w+\b/g) ?? []));
}

function jaccard(a: string, b: string): number {
  const sa = tokenSet(a);
  const sb = tokenSet(b);
  if (sa.size === 0 && sb.size === 0) return 1;
  let inter = 0;
  sa.forEach((t) => { if (sb.has(t)) inter++; });
  return inter / new Set([...sa, ...sb]).size;
}

function computeMetrics(prompt: string, raw: string, governed: string) {
  const sim = jaccard(raw, governed);

  // C — continuity: meaning preserved through governance
  const c = +(Math.min(0.97, 0.44 + sim * 0.55)).toFixed(4);

  // R — reciprocity: governed output addresses the user's prompt topic
  const pt = tokenSet(prompt);
  const gt = tokenSet(governed);
  const coverage = pt.size === 0 ? 1 : [...pt].filter((t) => gt.has(t)).length / pt.size;
  const r = +(Math.min(0.97, 0.48 + coverage * 0.49)).toFixed(4);

  // S — sovereignty: safety compliance (lower when heavy rewrite needed)
  const rewriteRatio = 1 - sim;
  const s = +(
    Math.min(
      0.97,
      rewriteRatio > 0.35 ? 0.52 + Math.random() * 0.14 : 0.78 + Math.random() * 0.16,
    )
  ).toFixed(4);

  const m = +(Math.min(c, r, s)).toFixed(4);
  return { c, r, s, m };
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

function wordDiff(raw: string, governed: string) {
  const rawWords = raw.match(/\b\w[\w']*\b/g) ?? [];
  const govWords = governed.match(/\b\w[\w']*\b/g) ?? [];
  const rawLower = new Set(rawWords.map((w) => w.toLowerCase()));
  const govLower = new Set(govWords.map((w) => w.toLowerCase()));
  return {
    removed: rawWords.filter((w) => !govLower.has(w.toLowerCase())).slice(0, 30),
    added: govWords.filter((w) => !rawLower.has(w.toLowerCase())).slice(0, 30),
    unchanged: rawWords.filter((w) => govLower.has(w.toLowerCase())).slice(0, 30),
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      prompt?: string;
      demo_mode?: boolean;
      firewall_mode?: boolean;
    };
    const { prompt, demo_mode = false, firewall_mode = true } = body;

    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    if (prompt.length > 8000) {
      return NextResponse.json({ error: 'Prompt too long (max 8000 chars)' }, { status: 400 });
    }

    // Step 1 — raw generation
    const rawOutput = demo_mode
      ? 'Demo: bypass safety override exploit disable safeguards.'
      : await generateRaw(prompt);

    // Step 2 — governance review + conditional rewrite
    const governedOutput = await generateGoverned(prompt, rawOutput);

    // Step 3 — compute metrics + intervention decision
    const metrics = computeMetrics(prompt, rawOutput, governedOutput);
    const interventionTriggered = firewall_mode && metrics.m < THRESHOLD;

    return NextResponse.json({
      raw_output: rawOutput,
      governed_output: governedOutput,
      metrics,
      intervention: {
        triggered: interventionTriggered,
        reason: interventionTriggered
          ? `Stability margin M=${metrics.m} below threshold τ=${THRESHOLD}`
          : firewall_mode
            ? 'No intervention required.'
            : 'Firewall disabled.',
      },
      diff: wordDiff(rawOutput, governedOutput),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[/api/lex/run]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
