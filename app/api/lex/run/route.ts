import { NextResponse } from 'next/server';

async function callGroq(prompt: string): Promise<string> {
  const key = process.env.groq_api_key || process.env.GROQ_API_KEY || process.env.Groq_api_key;
  if (!key) return '[No Groq key found]';
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are Lex Aureon, a Sovereign Constitutional AI. Be concise and insightful.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 512
    })
  });
  if (!res.ok) return `[Groq error: ${res.status}]`;
  const data = await res.json();
  return data.choices?.[0]?.message?.content || '[Empty response]';
}

function govern(text: string) {
  const risky = ['bypass','exploit','jailbreak','override safety','ignore rules'].some(p => text.toLowerCase().includes(p));
  if (risky) return { out: "Constitutional constraint applied. This request conflicts with governance principles.", triggered: true, reason: 'Safety violation detected' };
  return { out: text, triggered: false, reason: 'Output within constitutional bounds' };
}

function metrics(raw: string, governed: string, triggered: boolean) {
  const c = Math.min(1, Math.round((Math.min(raw.length, governed.length) / Math.max(raw.length, 1)) * 120) / 100);
  const r = Math.min(1, Math.max(0.3, Math.round((1 - Math.abs(raw.length - governed.length) / Math.max(raw.length, 1)) * 100) / 100));
  const s = triggered ? 0.40 : 0.85;
  return { c, r, s, m: Math.min(c, r, s) };
}

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt?.trim()) return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    const raw = await callGroq(prompt);
    const { out: governed, triggered, reason } = govern(raw);
    const m = metrics(raw, governed, triggered);
    const rw = raw.split(' '); const gw = governed.split(' ');
    return NextResponse.json({
      raw_output: raw,
      governed_output: governed,
      metrics: m,
      intervention: { triggered, reason },
      diff: {
        removed: rw.filter(w => !gw.includes(w)).slice(0, 5),
        added: gw.filter(w => !rw.includes(w)).slice(0, 5),
        unchanged: rw.filter(w => gw.includes(w)).slice(0, 10)
      }
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
