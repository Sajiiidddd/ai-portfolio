'use client';

import { useEffect, useRef, useState } from 'react';

type Msg = { role: 'a' | 'u'; text: string; src?: string | null; typing?: boolean };

const KB: { k: string[]; src: string; a: string }[] = [
  { k: ['now', 'current', 'appzen', 'work', 'doing'], src: 'experience/appzen', a: "Right now I'm an Automation Intern on Global Support at AppZen, shipping an AI support chatbot to pre-production (Claude Sonnet 4.6 on AWS Bedrock). Hybrid GraphRAG across 150+ KBs; token cost down ~90%, fabrication 28%→<15%." },
  { k: ['mcp', 'zendesk', 'protocol', 'guardrail'], src: 'projects/zendesk-mcp', a: "I built the Zendesk MCP that didn't exist — two open-source servers, 77+ tools, with guard-rails, 429-aware retries, bounded pagination, and a firewall against derailment. I also published MCP Deep Researcher (Springer · ICT4SD 2026)." },
  { k: ['patent', 'bom', 'tata', 'samiksha'], src: 'projects/bom-comparator', a: "My proudest ship is SAMIKSHA (patented) — an NLP BOM comparator at Tata Motors, live across 5 departments, cutting comparison from hours to 1–2 minutes at 100% accuracy." },
  { k: ['f1', 'formula', 'race', 'strategy'], src: 'projects/f1-strategy-os', a: "F1 Strategy OS is a 64-dim Transformer on 5 years of FastF1 telemetry, <45ms CPU inference, ~92% podium accuracy, with a Next.js dashboard." },
  { k: ['skill', 'stack', 'tech', 'tools'], src: 'toolkit', a: "Core stack: PyTorch, GraphRAG, MCP, FAISS, Docker, AWS, Postgres, Next.js. I care most about the plumbing around the model — reliability and guardrails." },
  { k: ['contact', 'reach', 'hire', 'github', 'resume', 'email'], src: 'contact', a: "Grab the résumé below, or find me as @Sajiiidddd on GitHub. Open to AI/ML roles and collaborations." },
  { k: ['who', 'about', 'jedi', 'force', 'yourself'], src: 'about', a: "I'm Sajid — strong with the Source, both the Force and open source. An AI/ML engineer in Pune who ships production intelligence and teaches it." },
];
const SUGGEST = ['Working on now?', 'The MCP work', 'The patent?', 'Reach you?'];
const GENERIC = "I only know about Sajid's work — try asking about his AppZen role, the Zendesk MCP, the Tata Motors patent, F1 Strategy OS, his stack, or how to reach him.";

function canned(q: string) {
  const t = q.toLowerCase();
  let best: (typeof KB)[number] | null = null, sc = 0;
  for (const e of KB) { const s = e.k.reduce((a, w) => a + (t.includes(w) ? 1 : 0), 0); if (s > sc) { sc = s; best = e; } }
  return best && sc > 0 ? { a: best.a, src: best.src } : { a: GENERIC, src: null };
}

export default function HeroPassAgent() {
  const [flipped, setFlipped] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const orbRef = useRef<HTMLCanvasElement>(null);
  const greeted = useRef(false);

  // cursor tilt on the front
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const c = cardRef.current; if (!c || flipped) return;
      const r = c.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      if (Math.abs(px) > 1.7 || Math.abs(py) > 1.7) { c.style.transform = ''; return; }
      c.style.transform = `rotateY(${px * 12}deg) rotateX(${-py * 12}deg)`;
      c.style.setProperty('--gx', `${50 + px * 30}%`); c.style.setProperty('--gy', `${40 + py * 30}%`);
    };
    addEventListener('mousemove', onMove);
    return () => removeEventListener('mousemove', onMove);
  }, [flipped]);

  // orb
  useEffect(() => {
    const cv = orbRef.current; if (!cv) return;
    const ox = cv.getContext('2d')!; let t = 0, raf = 0;
    const spin = () => { raf = requestAnimationFrame(spin); t += 0.02; ox.clearRect(0, 0, 68, 68); ox.save(); ox.translate(34, 34);
      for (let r = 0; r < 3; r++) { ox.beginPath(); const rad = 9 + r * 6, seg = 36;
        for (let i = 0; i <= seg; i++) { const a = i / seg * 6.283, w = Math.sin(a * 3 + t * (1 + r * 0.4) + r) * 1.6, rr = rad + w, x = Math.cos(a) * rr, y = Math.sin(a) * rr * 0.6; i ? ox.lineTo(x, y) : ox.moveTo(x, y); }
        ox.strokeStyle = `rgba(158,200,255,${0.5 - r * 0.13})`; ox.lineWidth = 1.2; ox.stroke(); }
      ox.fillStyle = '#9ec8ff'; ox.shadowColor = '#9ec8ff'; ox.shadowBlur = 10; ox.beginPath(); ox.arc(0, 0, 2.6, 0, 7); ox.fill(); ox.restore(); };
    spin(); return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => { feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight }); }, [msgs]);

  const typeOut = (full: string, src: string | null) => {
    let i = 0;
    const iv = setInterval(() => {
      i += 2;
      setMsgs((m) => { const c = [...m]; const last = c[c.length - 1]; if (last) { last.text = full.slice(0, i); last.typing = i < full.length; if (i >= full.length) last.src = src; } return c; });
      if (i >= full.length) { clearInterval(iv); setBusy(false); }
    }, 14);
  };

  const ask = async (q: string) => {
    if (busy || !q.trim()) return;
    setBusy(true);
    setMsgs((m) => [...m, { role: 'u', text: q }, { role: 'a', text: '', typing: true }]);
    let answer = '', src: string | null = null;
    try {
      const r = await fetch('/api/ask', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question: q }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok && d.answer) answer = d.answer;
      else { const c = canned(q); answer = c.a; src = c.src; }
    } catch { const c = canned(q); answer = c.a; src = c.src; }
    typeOut(answer, src);
  };

  const greet = () => { if (greeted.current) return; greeted.current = true;
    setMsgs([{ role: 'a', text: '', typing: true }]); typeOut("Hi — I'm Sajid's portfolio agent. Ask me anything about his work.", null); };

  const flip = (on: boolean) => {
    const c = cardRef.current; if (c) c.style.transform = '';
    setFlipped(on);
    if (on) { greet(); setTimeout(() => inputRef.current?.focus(), 520); }
  };

  const submit = () => { const v = input.trim(); setInput(''); if (v) ask(v); };

  return (
    <div className="hpa-scene">
      <div ref={cardRef} className={`hpa-card${flipped ? ' flip' : ''}`}>
        {/* FRONT: pass */}
        <div className="hpa-face hpa-front">
          <div className="hpa-foil" /><div className="hpa-glare" />
          <div className="hpa-pad">
            <div className="hpa-ptop"><span>Developer Pass<br /><b>Build log · 2026</b></span><span style={{ textAlign: 'right' }}>No.<br /><b>09 / 24</b></span></div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="hpa-photo" src="/self.jpg" alt="Sajid Tamboli" />
            <div className="hpa-pname">Sajid Tamboli</div>
            <div className="hpa-prole">AI · ML Engineer / Neural Jedi</div>
            <div className="hpa-pgrid">
              <div><div className="hpa-k">Now</div><div className="hpa-v">AppZen</div></div>
              <div><div className="hpa-k">Prev</div><div className="hpa-v">Tata Motors</div></div>
              <div><div className="hpa-k">Status</div><div className="hpa-v">Patented ×1</div></div>
              <div><div className="hpa-k">Handle</div><div className="hpa-v">@Sajiiidddd</div></div>
            </div>
            <button className="hpa-ask" onClick={() => flip(true)}><span className="hpa-o" />Ask the pass anything →</button>
          </div>
        </div>
        {/* BACK: agent */}
        <div className="hpa-face hpa-back">
          <div className="hpa-ahead">
            <span className="hpa-orb"><canvas ref={orbRef} width={68} height={68} aria-hidden /></span>
            <span className="hpa-aid"><b>Portfolio Agent</b><i>grounded on Sajid&apos;s work</i></span>
            <button className="hpa-back2" onClick={() => flip(false)}>↩ Pass</button>
          </div>
          <div className="hpa-feed" ref={feedRef}>
            {msgs.map((m, i) => (
              <div key={i} className={`hpa-msg ${m.role}`}>
                {m.role === 'a' && <span className="hpa-who">Sajid · agent</span>}
                <span dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') + (m.typing ? '<span style="opacity:.4">▍</span>' : '') }} />
                {m.src && <span className="hpa-src">↳ source: <b>{m.src}</b></span>}
              </div>
            ))}
          </div>
          <div className="hpa-chips">
            {SUGGEST.map((s) => <button key={s} className="hpa-chip" onClick={() => ask(s)}>{s}</button>)}
          </div>
          <div className="hpa-bar">
            <span className="hpa-kk">⌘</span>
            <input ref={inputRef} value={input} placeholder="Ask about my work…" autoComplete="off"
              onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .hpa-scene{perspective:1400px;display:flex;justify-content:center;align-items:center;width:100%}
        .hpa-card{position:relative;width:330px;max-width:88vw;height:500px;transform-style:preserve-3d;-webkit-transform-style:preserve-3d;transition:transform .8s cubic-bezier(.2,.8,.2,1)}
        .hpa-card.flip{transform:rotateY(180deg)!important;-webkit-transform:rotateY(180deg)!important}
        .hpa-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:18px;overflow:hidden}
        .hpa-front{background:linear-gradient(160deg,#1a1a1e,#0e0e11 55%,#08080a);border:1px solid rgba(236,233,225,.16);box-shadow:0 44px 90px -34px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.07)}
        .hpa-foil{position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#7d7d75,#ece9e1,#9aa0a6,#ece9e1,#7d7d75);opacity:.75}
        .hpa-glare{position:absolute;inset:0;mix-blend-mode:screen;opacity:.5;background:radial-gradient(320px 320px at var(--gx,30%) var(--gy,20%),rgba(255,255,255,.3),transparent 60%);pointer-events:none}
        .hpa-pad{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;padding:18px 20px 16px}
        .hpa-ptop{display:flex;justify-content:space-between;font-family:var(--font-mono),monospace;font-size:9px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a82}
        .hpa-ptop b{color:#ece9e1}
        .hpa-photo{margin-top:14px;width:100%;height:182px;object-fit:cover;border-radius:10px;filter:grayscale(1) contrast(1.05);border:1px solid rgba(236,233,225,.12)}
        .hpa-pname{font-family:var(--font-pixel),monospace;font-size:23px;margin-top:13px;color:#ece9e1}
        .hpa-prole{font-family:var(--font-mono),monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82;margin-top:7px}
        .hpa-pgrid{display:grid;grid-template-columns:1fr 1fr;gap:8px 14px;margin-top:13px}
        .hpa-k{font-family:var(--font-mono),monospace;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a82}
        .hpa-v{font-family:var(--font-mono),monospace;font-size:11px;color:#ece9e1;margin-top:2px}
        .hpa-ask{margin-top:auto;display:flex;align-items:center;justify-content:center;gap:8px;font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#0a0a0a;background:#ece9e1;border:0;border-radius:7px;padding:11px;cursor:pointer;transition:.2s}
        .hpa-ask:hover{opacity:.85}
        .hpa-o{width:8px;height:8px;border-radius:50%;background:#9ec8ff;box-shadow:0 0 8px #9ec8ff}
        .hpa-back{transform:rotateY(180deg);background:linear-gradient(170deg,#13151b,#0c0d11);border:1px solid rgba(236,233,225,.16);box-shadow:0 44px 90px -34px rgba(0,0,0,.9);display:flex;flex-direction:column}
        .hpa-ahead{display:flex;align-items:center;gap:11px;padding:14px 15px;border-bottom:1px solid rgba(236,233,225,.08)}
        .hpa-orb{width:34px;height:34px;flex:none}.hpa-orb canvas{width:34px;height:34px;display:block}
        .hpa-aid{display:flex;flex-direction:column;line-height:1}
        .hpa-aid b{font-family:var(--font-pixel),monospace;font-size:14px;color:#ece9e1;font-weight:400}
        .hpa-aid i{font-family:var(--font-mono),monospace;font-style:normal;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a82;margin-top:3px}
        .hpa-back2{margin-left:auto;font-family:var(--font-mono),monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:#8a8a82;background:none;border:1px solid rgba(236,233,225,.18);border-radius:5px;padding:5px 8px;cursor:pointer}
        .hpa-back2:hover{color:#ece9e1}
        .hpa-feed{flex:1;overflow:auto;padding:14px 15px;display:flex;flex-direction:column;gap:11px}
        .hpa-msg{max-width:90%;font-size:12.5px;line-height:1.6;display:flex;flex-direction:column}
        .hpa-msg.a{color:#d4d4cb}
        .hpa-msg.u{align-self:flex-end;background:rgba(158,200,255,.12);border:1px solid rgba(158,200,255,.25);color:#dce9ff;padding:7px 11px;border-radius:11px 11px 3px 11px;font-size:12px}
        .hpa-who{font-family:var(--font-mono),monospace;font-size:8px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82;margin-bottom:4px}
        .hpa-src{font-family:var(--font-mono),monospace;font-size:8.5px;color:#55554f;margin-top:6px}.hpa-src b{color:#9ec8ff;font-weight:400}
        .hpa-chips{display:flex;flex-wrap:wrap;gap:6px;padding:0 15px 10px}
        .hpa-chip{font-family:var(--font-mono),monospace;font-size:9px;color:#8a8a82;border:1px solid rgba(236,233,225,.16);border-radius:14px;padding:5px 9px;cursor:pointer;background:none}
        .hpa-chip:hover{color:#ece9e1;border-color:rgba(236,233,225,.42)}
        .hpa-bar{display:flex;align-items:center;gap:9px;padding:11px 13px;border-top:1px solid rgba(236,233,225,.08);background:rgba(0,0,0,.2)}
        .hpa-kk{font-family:var(--font-mono),monospace;color:#9ec8ff;font-size:12px}
        .hpa-bar input{flex:1;background:none;border:0;outline:0;color:#ece9e1;font-size:13px;font-family:var(--font-grotesk),sans-serif}
        .hpa-bar input::placeholder{color:#55554f}
      `}</style>
    </div>
  );
}
