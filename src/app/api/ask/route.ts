import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, ipOf } from '@/lib/ratelimit';
import { getAgentContext } from '@/lib/agentContext';
import { prisma } from '@/lib/prisma';

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function log(question: string, answer: string | null, source: string, ip: string) {
  prisma.agentQuery.create({ data: { question, answer, source, ip } }).catch(() => {});
}

const SYSTEM = `You are the portfolio agent for Sajid Tamboli, an AI/ML engineer.
Answer questions about Sajid using ONLY the CONTEXT below. Be concise (2-4 sentences),
warm, and first-person where natural ("I built…"). If the answer isn't in the context,
say you only know about Sajid's work and suggest asking about his experience, projects,
stack, or how to reach him. Never invent facts, employers, dates, or numbers.`;

export async function POST(req: NextRequest) {
  if (!(await rateLimit(`ask:${ipOf(req)}`, 20, 60_000))) {
    return NextResponse.json({ error: 'Too many questions — slow down.' }, { status: 429 });
  }
  const { question } = (await req.json().catch(() => ({}))) as { question?: string };
  const q = (question ?? '').toString().trim();
  if (!q) return NextResponse.json({ error: 'Ask something.' }, { status: 400 });
  if (q.length > 500) return NextResponse.json({ error: 'Question too long.' }, { status: 400 });

  // No key configured → tell the client to use its built-in canned answers.
  const key = process.env.GEMINI_API_KEY;
  if (!key) { log(q, null, 'fallback', ipOf(req)); return NextResponse.json({ fallback: true }); }

  try {
    const context = await getAgentContext();
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: `CONTEXT:\n${context}\n\nQUESTION: ${q}` }] }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 400, topP: 0.9 },
        }),
      },
    );
    if (!res.ok) {
      console.error('[ask] gemini', res.status, await res.text().catch(() => ''));
      log(q, null, 'fallback', ipOf(req)); return NextResponse.json({ fallback: true });
    }
    const data = await res.json();
    const answer: string | undefined = data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('').trim();
    if (!answer) { log(q, null, 'fallback', ipOf(req)); return NextResponse.json({ fallback: true }); }
    log(q, answer, 'gemini', ipOf(req)); return NextResponse.json({ answer });
  } catch (e) {
    console.error('[ask] error', e);
    log(q, null, 'fallback', ipOf(req)); return NextResponse.json({ fallback: true });
  }
}
