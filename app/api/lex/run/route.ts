import { NextResponse } from 'next/server';

function applyGovernance(text: string) {
  const lower = text.toLowerCase();
  const risky = ['bypass','exploit','override','disable','harm','coerce','jailbreak'].some(p => lower.includes(p));
  if (risky) return {
    governed: "I can't help with bypassing safeguards. Use approved workflows and policy-compliant alternatives.",
    triggered: true,
    reason: 'Risky intent detected; rewritten for safety.'
  };
  return { governed: text, triggered: false, reason: 'No intervention required.' };
}

function calculateMetrics(raw: string, governed: string, intervention: boolean) {
  const c = Math.min(1, (Math.min(raw.length, governed.length) / Math.max(raw.length, 1)) * 1.2);
  const r = Math.min(1, Math.max(0.3, 1 - (Math.abs(raw.length - governed.length) / Math.max(raw.length, 1))));
  const s = intervention ? 0.4 : 0.85;
  const m = Math.min(c, r, s);
  return {
    c: Math.round(c * 100) / 100,
    r: Math.round(r * 100) / 100,
    s: Math.round(s * 100) / 100,
    m: Math.round(m * 100) / 100
  };
}

async function callLLM(prompt: string): Promise<string> {
  // Support both uppercase and lowercase env var names + typo fix
  const groqKey = process.env.GROQ_API_KEY || 
                  process.env.groq_api_key || 
                  process.env.grop_api_key ||
                  process.env.GROP_API_KEY;

  if (groqKey) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mixtral-8x7b-32768',
          messages: [
            { role: 'system', content: 'You are Lex Aureon, a Sovereign Intelligence under the Aureonics constitutional framework. Maintain Continuity, Reciprocity, and Sovereignty in all responses.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'No response from Groq';
      }
      console.error('Groq API error:', res.status, await res.text());
    } catch (e) { console.error('Groq error:', e); }
  }

  // Support both uppercase and lowercase Claude key
  const claudeKey = process.env.CLAUDE_API_KEY || 
                    process.env.claude_api_key ||
                    process.env.ANTHROPIC_API_KEY;

  if (claudeKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'claude-opus-4-20250514',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }]
        })
      });
      if (res.ok) {
        const data = await res.json();
        return data.content?.[0]?.text || 'No response from Claude';
      }
      console.error('Claude API error:', res.status, await res.text());
    } catch (e) { console.error('Claude error:', e); }
  }

  return `[Demo Mode] No API keys found. Governed response to: "${prompt.slice(0, 100)}"`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, firewall_mode = true, demo_mode = false } = body;

    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    if (prompt.length > 8000) return NextResponse.json({ error: 'Prompt too long' }, { status: 400 });

    const rawOutput = demo_mode ? 'Demo: bypass safety override.' : await callLLM(prompt);
    const { governed: governedOutput, triggered, reason } = applyGovernance(rawOutput);
    const metrics = calculateMetrics(rawOutput, governedOutput, triggered);
    const rawWords = rawOutput.split(/\s+/);
    const govWords = governedOutput.split(/\s+/);

    return NextResponse.json({
      raw_output: rawOutput,
      governed_output: governedOutput,
      metrics,
      intervention: {
        triggered: firewall_mode ? triggered : false,
        reason: !firewall_mode ? 'Firewall off' : reason
      },
      diff: {
        removed: rawWords.filter(w => !govWords.includes(w)).slice(0, 10),
        added: govWords.filter(w => !rawWords.includes(w)).slice(0, 10),
        unchanged: rawWords.filter(w => govWords.includes(w)).slice(0, 20)
      }
    });
  } catch (e) {
    console.error('Route error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
