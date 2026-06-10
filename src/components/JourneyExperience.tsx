"use client";

import { useEffect, useRef } from "react";

type Motif = "awaken" | "bloom" | "forge" | "fleet" | "horizon";
type Trial = {
  id: string; roman: string; trial: string; org: string; role: string;
  range: string; code: string; now?: boolean; motif: Motif; verb: string;
  body: string; stats: { label: string; value: string }[];
};

const trials: Trial[] = [
  { id: "adypu", roman: "I", trial: "The Awakening", org: "ADYPU", role: "Student · Builder", range: "2023", code: "2023", motif: "awaken", verb: "LEARN",
    body: "B.Tech in Artificial Intelligence & Data Science with a Minor in Robotics — CGPA 8.04 (Semester 7: 9.40), graduating June 2026. Coursework across DSA, DBMS, OS, Deep Learning, NLP, Computer Vision, Robotics and LLMs — plus the curiosity and blinking cursor where it all started.",
    stats: [{ label: "CGPA", value: "8.04" }, { label: "Class of", value: "2026" }] },
  { id: "gdgoc", roman: "II", trial: "The Mentor", org: "GDGoC · ADYPU", role: "AI / ML Lead", range: "Dec 2024 — Dec 2025", code: "12.24", motif: "bloom", verb: "TEACH",
    body: "The fastest way to master something is to teach it. Founded a 150+ member AI/ML club and walked 100+ students through CNN fundamentals and PyTorch from scratch across 7+ workshops — including an AlexNet session with 100+ RSVPs.",
    stats: [{ label: "Members", value: "150+" }, { label: "Workshops", value: "7+" }] },
  { id: "tata", roman: "III", trial: "The Forge", org: "Tata Motors", role: "AIML Intern · ECM", range: "Jul 2025 — Jan 2026", code: "07.25", motif: "forge", verb: "FORGE",
    body: "Developed and patented SAMIKSHA (IP: CIP 20251027 TML 15884) — an AI-powered BOM Comparator adopted by ECM across CVBU, cutting comparison time from hours/days to 1–2 minutes at 100% accuracy across 20+ vehicle configurations. An optimised tree-traversal algorithm reduces ~10¹⁵ raw operations to ~2–3 lakh per BOM pair — projected to save 10,40,000 SMH/year across 5 departments.",
    stats: [{ label: "Compare time", value: "1–2 min" }, { label: "Accuracy", value: "100%" }] },
  { id: "appzen", roman: "IV", trial: "The Knight", org: "AppZen", role: "Automation Intern · Global Support", range: "Feb 2026 — Present", code: "02.26", now: true, motif: "fleet", verb: "SHIP",
    body: "Shipped an AI support chatbot to pre-production on an OpenAI → AWS Bedrock migration (Claude Sonnet 4.6) — hybrid GraphRAG retrieval (FAISS + BM25 + NetworkX, fused via Reciprocal Rank Fusion) across 150+ KB articles. Prompt caching cut token costs ~90%; fabrication driven 28.4% → ≤15%. Two open-source Zendesk MCP servers (77+ tools), an 8-schema Postgres backend with Row-Level Security — Docker → AWS ECR, deployed on Kubernetes (EKS) via Argo CD.",
    stats: [{ label: "MCP tools", value: "77+" }, { label: "Token cost", value: "−90%" }] },
  { id: "next", roman: "V", trial: "The Horizon", org: "What's next", role: "Open to 2026 roles", range: "2026 →", code: "→", motif: "horizon", verb: "ASCEND",
    body: "The trials forge the knight; the knight becomes the teacher. Next: production AI systems at scale — and passing the craft on. The archive stays open.",
    stats: [{ label: "Status", value: "Open" }, { label: "Mode", value: "The way" }] },
];

const INK = "rgba(236,233,225,";
function hashSeed(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a: number) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));

export default function JourneyExperience() {
  const chRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cvRefs = useRef<(HTMLCanvasElement | null)[]>([]);
  const titleRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const railRef = useRef<HTMLDivElement | null>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const fillRef = useRef<HTMLDivElement | null>(null);
  const decoded = useRef<Set<number>>(new Set());

  useEffect(() => {
    const A = (x: number) => INK + clamp(x) + ")";

    const size = () => cvRefs.current.forEach((cv) => { if (cv) { const b = cv.getBoundingClientRect(); cv.width = Math.max(1, b.width); cv.height = Math.max(1, b.height); } });
    size();
    addEventListener("resize", size);

    const grid = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
      ctx.fillStyle = A(0.045); for (let x = 12; x < W; x += 22) for (let y = 12; y < H; y += 22) ctx.fillRect(x, y, 1.5, 1.5);
    };

    const draw = (motif: Motif, ctx: CanvasRenderingContext2D, W: number, H: number, p: number, t: number, rnd: () => number, seedPts: { x: number; y: number }[]) => {
      const cx = W / 2, cy = H / 2;
      ctx.clearRect(0, 0, W, H); ctx.lineWidth = 1.1; grid(ctx, W, H);

      if (motif === "awaken") {
        const R = Math.min(W, H) * 0.34, vis = Math.floor(p * 6 + 0.001);
        for (let i = 0; i < 6; i++) {
          if (i >= vis) break;
          const a = (i / 6) * Math.PI * 2 + t * 0.06, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
          ctx.strokeStyle = A(0.15 + 0.45 * p); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
          ctx.fillStyle = A(0.85); ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 7); ctx.fill();
        }
        if (p < 0.35) for (let k = 0; k < 5; k++) { const a = k * 1.4 + t * 1.5, r = ((t * 50 + k * 20) % (R)); ctx.fillStyle = A((1 - r / R) * 0.5); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.3, 0, 7); ctx.fill(); }
        ctx.fillStyle = A(0.5 + 0.5 * p + 0.2 * Math.sin(t * 2)); ctx.beginPath(); ctx.arc(cx, cy, 3.4 + p * 1.5, 0, 7); ctx.fill();
      }

      else if (motif === "bloom") {
        const n = Math.min(seedPts.length, 4 + Math.floor(p * (seedPts.length - 4)));
        const pts = seedPts.slice(0, n).map((b, i) => ({ x: b.x * W, y: b.y * H, ph: i }));
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < W * 0.32) { ctx.globalAlpha = (1 - d / (W * 0.32)) * 0.4; ctx.strokeStyle = A(1); ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke(); }
        }
        ctx.globalAlpha = 1;
        pts.forEach((q, i) => { const pulse = 0.4 + 0.3 * Math.sin(t * 1.2 + q.ph); ctx.fillStyle = A(i === 0 ? 0.95 : pulse); ctx.beginPath(); ctx.arc(q.x, q.y, i === 0 ? 3.2 : 2, 0, 7); ctx.fill(); });
      }

      else if (motif === "forge") {
        const baseY = H * 0.18, tipY = H * 0.66;
        for (let i = 0; i < 5; i++) {
          const x0 = W * (0.16 + i * 0.17); const len = p;
          ctx.strokeStyle = A(0.5); ctx.beginPath(); ctx.moveTo(x0, baseY); ctx.lineTo(x0 + (cx - x0) * len, baseY + (tipY - baseY) * len); ctx.stroke();
        }
        const s = 26 + 8 * Math.sin(t * 1.5);
        ctx.strokeStyle = A(0.4 + 0.5 * p); ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(cx, tipY - s); ctx.lineTo(cx + s * 0.8, tipY); ctx.lineTo(cx, tipY + s); ctx.lineTo(cx - s * 0.8, tipY); ctx.closePath(); ctx.stroke();
        if (p > 0.82) { ctx.fillStyle = A(0.12); ctx.fill(); ctx.fillStyle = A(0.85); ctx.font = '11px "JetBrains Mono", monospace'; ctx.fillText("◆ PATENTED", cx - 28, tipY + s + 22); }
      }

      else if (motif === "fleet") {
        const hx = W * 0.18, vis = Math.floor(p * 7 + 0.001);
        ctx.fillStyle = A(0.95); ctx.fillRect(hx - 6, cy - 6, 12, 12);
        ctx.fillStyle = A(0.45); ctx.font = '9px "JetBrains Mono", monospace'; ctx.fillText("HUB", hx - 10, cy + 24);
        for (let i = 0; i < 7; i++) {
          if (i >= vis) break;
          const ex = W * 0.82, ey = H * (0.18 + i * 0.11);
          ctx.strokeStyle = A(0.22); ctx.beginPath(); ctx.moveTo(hx, cy); ctx.lineTo(ex, ey); ctx.stroke();
          ctx.strokeStyle = A(0.5); ctx.strokeRect(ex, ey - 5, 10, 10);
          const f = (t * 0.6 + i * 0.13) % 1; ctx.fillStyle = A(0.9); ctx.beginPath(); ctx.arc(hx + (ex - hx) * f, cy + (ey - cy) * f, 1.8, 0, 7); ctx.fill();
        }
      }

      else if (motif === "horizon") {
        ctx.strokeStyle = A(0.25); ctx.beginPath(); ctx.moveTo(20, cy); ctx.lineTo(W - 20, cy); ctx.stroke();
        const maxR = Math.min(W, H) * 0.5;
        for (let k = 0; k < 3; k++) { const r = ((t * 30 + k * (maxR / 3)) % maxR); ctx.strokeStyle = A((1 - r / maxR) * 0.3); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke(); }
        const steps = Math.floor(p * 8);
        for (let i = 0; i < steps; i++) { const x = cx + (i + 1) * (W * 0.42 / 8); ctx.fillStyle = A(0.8); ctx.beginPath(); ctx.arc(x, cy, 2, 0, 7); ctx.fill(); }
        if (p > 0.7) { const ax = W * 0.9; ctx.strokeStyle = A(0.7); ctx.beginPath(); ctx.moveTo(ax, cy - 12); ctx.lineTo(ax + 10, cy - 12); ctx.lineTo(ax + 10, cy + 12); ctx.lineTo(ax, cy + 12); ctx.stroke(); }
      }
    };

    const meta = trials.map((tr) => { const rnd = mulberry32(hashSeed(tr.id)); const pts = Array.from({ length: 22 }, () => ({ x: 0.1 + rnd() * 0.8, y: 0.12 + rnd() * 0.76 })); return { rnd: mulberry32(hashSeed(tr.id)), pts }; });

    let raf = 0;
    const loop = (now: number) => {
      const t = now / 1000, vh = innerHeight;
      let active = 0, sectionInView = false;
      chRefs.current.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        const inView = r.bottom > 0 && r.top < vh; if (inView) sectionInView = true;
        const p = clamp((vh * 0.55 - r.top) / (r.height * 0.7));
        if (p > 0.02 && !decoded.current.has(i)) { decoded.current.add(i); scramble(titleRefs.current[i], trials[i].trial); }
        if (Math.abs(r.top + r.height / 2 - vh / 2) < Math.abs((chRefs.current[active]?.getBoundingClientRect().top ?? 0) + (chRefs.current[active]?.getBoundingClientRect().height ?? 0) / 2 - vh / 2)) active = i;
        const cv = cvRefs.current[i]; if (cv && inView) { const ctx = cv.getContext("2d"); if (ctx) draw(trials[i].motif, ctx, cv.width, cv.height, p, t, meta[i].rnd, meta[i].pts); }
      });
      dotRefs.current.forEach((d, i) => d?.classList.toggle("on", i === active));
      if (fillRef.current) fillRef.current.style.height = `${(active / (trials.length - 1)) * 100}%`;
      if (railRef.current) railRef.current.style.opacity = sectionInView ? "1" : "0";
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, []);

  const scramble = (el: HTMLElement | null, final: string) => {
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = final; return; }
    const ch = "▚▞░▒/\\<>=+*"; let f = 0;
    const iv = setInterval(() => {
      el.textContent = final.split("").map((c, k) => (k < f ? c : c === " " ? " " : ch[Math.floor(Math.random() * ch.length)])).join("");
      f += 0.6; if (f > final.length) { clearInterval(iv); el.textContent = final; }
    }, 28);
  };

  return (
    <section className="jx">
      <div className="jx-head">
        <h2 className="ab-display">Experience</h2>
        <span className="ab-dim ab-monoLabel">The path · 05 trials · 2023 → now</span>
      </div>

      <div ref={railRef} className="jx-rail" aria-hidden="true">
        <div className="jx-railline"><div ref={fillRef} className="jx-railfill" /></div>
        {trials.map((tr, i) => (
          <span key={tr.id} ref={(e) => { dotRefs.current[i] = e; }} className="jx-dot">{tr.roman}</span>
        ))}
      </div>

      {trials.map((tr, i) => (
        <div key={tr.id} ref={(e) => { chRefs.current[i] = e; }} className="jx-ch">
          <div className="jx-text">
            <div className="jx-top"><span className="jx-roman">{tr.roman}</span><span className="jx-verb">{tr.now ? "● NOW · " : ""}{tr.verb}</span></div>
            <h3 ref={(e) => { titleRefs.current[i] = e; }} className="jx-trial ab-display">{tr.trial}</h3>
            <div className="jx-org ab-display">{tr.org}</div>
            <div className="jx-role">{tr.role} · {tr.range}</div>
            <p className="jx-body">{tr.body}</p>
            <div className="jx-stats">{tr.stats.map((s) => (<div key={s.label}><span className="jx-statv ab-display">{s.value}</span><span className="jx-statl">{s.label}</span></div>))}</div>
          </div>
          <div className="jx-canvasbox"><canvas ref={(e) => { cvRefs.current[i] = e; }} /></div>
        </div>
      ))}

      <style jsx>{`
        .jx{position:relative;padding:70px 0 10px}
        .jx-head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid rgba(236,233,225,.12);padding-bottom:14px;margin-bottom:10px}
        .jx-head h2{font-size:clamp(2rem,5vw,3.2rem);line-height:1;margin:0}
        .jx-rail{position:fixed;left:30px;top:50%;transform:translateY(-50%);z-index:30;display:flex;flex-direction:column;align-items:center;gap:18px;opacity:0;transition:opacity .5s}
        .jx-railline{position:absolute;top:6px;bottom:6px;width:1px;background:rgba(236,233,225,.12)}
        .jx-railfill{width:1px;background:#ece9e1;transition:height .3s cubic-bezier(.16,1,.3,1)}
        .jx-dot{position:relative;font-family:var(--font-mono),monospace;font-size:9px;letter-spacing:.06em;color:#3a3a36;background:#0a0a0a;padding:3px 0;transition:color .3s,transform .3s}
        .jx-dot.on{color:#ece9e1;transform:scale(1.25)}
        .jx-ch{display:grid;grid-template-columns:1fr 380px;gap:50px;align-items:start;min-height:88vh}
        .jx-text{padding:14vh 0 6vh}
        .jx-top{display:flex;align-items:center;gap:14px;margin-bottom:14px}
        .jx-roman{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.2em;color:#8a8a82;border:1px solid rgba(236,233,225,.18);border-radius:3px;padding:3px 9px}
        .jx-verb{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:#8a8a82}
        .jx-trial{font-size:clamp(2.2rem,5.5vw,3.6rem);line-height:1;margin:0 0 10px;min-height:1.1em}
        .jx-org{font-family:var(--font-mono),monospace;font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#ece9e1;margin-bottom:6px}
        .jx-role{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a82;margin-bottom:18px}
        .jx-body{max-width:540px;font-size:15px;line-height:1.85;color:#bdbdb3;font-weight:300}
        .jx-stats{display:flex;gap:42px;margin-top:24px}
        .jx-statv{font-size:1.9rem;display:block;line-height:1}
        .jx-statl{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a82;margin-top:6px;display:block}
        .jx-canvasbox{position:sticky;top:24vh;height:300px;border:1px solid rgba(236,233,225,.12);border-radius:6px;background:#0c0c0c;overflow:hidden}
        .jx-canvasbox canvas{width:100%;height:100%;display:block}
        @media(max-width:900px){
          .jx-rail{display:none}
          .jx-ch{grid-template-columns:1fr;gap:18px;min-height:0;padding:36px 0;border-bottom:1px solid rgba(236,233,225,.08)}
          .jx-text{padding:0}
          .jx-canvasbox{position:relative;top:0;height:200px;order:-1}
        }
      `}</style>
    </section>
  );
}
