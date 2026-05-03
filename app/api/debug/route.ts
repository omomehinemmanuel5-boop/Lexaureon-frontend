import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    groq_found: !!process.env.groq_api_key,
    GROQ_found: !!process.env.GROQ_API_KEY,
    Claude_found: !!process.env.Claude_api_key,
    CLAUDE_found: !!process.env.CLAUDE_API_KEY,
    keys_with_api: Object.keys(process.env).filter(k => 
      k.toLowerCase().includes('groq') || 
      k.toLowerCase().includes('claude') ||
      k.toLowerCase().includes('key')
    )
  });
}
