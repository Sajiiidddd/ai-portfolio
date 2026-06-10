'use client';

import { useEffect, useRef } from 'react';

function hashSeed(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(a: number) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Theme = 'training' | 'terminal' | 'text' | 'vision' | 'data' | 'signal';

/** The motif theme is derived from the post's tags — art that matches content. */
function pickTheme(tags: string[]): Theme {
  const t = tags.join(' ').toLowerCase();
  if (/(machine|deep|learning|colab|train|model|gpu|pytorch|tensorflow)/.test(t)) return 'training';
  if (/(python|code|typescript|javascript|engineering|tooling)/.test(t)) return 'terminal';
  if (/(nlp|language|llm|rag|prompt|token|text)/.test(t)) return 'text';
  if (/(vision|image|cv|opencv|detection)/.test(t)) return 'vision';
  if (/(data|sql|pipeline|database|etl|analytics)/.test(t)) return 'data';
  return 'signal';
}

export default function BlogMotif({ slug, tags = [] }: { slug: string; tags?: string[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = (cv.width = 1200), H = (cv.height = 340);
    const rnd = mulberry32(hashSeed(slug));
    const A = (x: number) => `rgba(236,233,225,${x})`;
    const theme = pickTheme(tags);
    const label = ('LOG · ' + (tags[0] || 'FIELD NOTES')).toUpperCase();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---- seeded assets per theme ---- */
    const waves = Array.from({ length: 3 }, () => ({ f: 0.004 + rnd() * 0.006, a: H * (0.05 + rnd() * 0.08), p: rnd() * Math.PI * 2, s: 0.3 + rnd() * 0.6 }));
    const yAt = (x: number, t: number) => {
      let y = H * 0.28 + (x / W) * H * 0.32;
      waves.forEach((w) => { y += Math.sin(x * w.f + w.p + t * w.s) * w.a * (x / W) * 0.8; });
      return y;
    };
    const ckpts = Array.from({ length: 5 }, () => 140 + rnd() * (W - 280)).sort((a, b) => a - b);
    const lines = Array.from({ length: 40 }, () => ({ w: 0.18 + rnd() * 0.55, ind: rnd() < 0.3 ? 26 : 0, ok: rnd() < 0.2 }));
    const rows = Array.from({ length: 6 }, () => {
      const words: { x: number; w: number; hot: boolean }[] = []; let x = 70;
      while (x < W - 120) { const w = 26 + rnd() * 80; words.push({ x, w, hot: rnd() < 0.18 }); x += w + 16; }
      return words;
    });
    const pts = Array.from({ length: 7 }, () => ({ x: 90 + rnd() * (W - 180), y: 60 + rnd() * (H - 140), c: (0.86 + rnd() * 0.13).toFixed(2) }));
    const stages = [0.16, 0.42, 0.68].map((f) => W * (f + (rnd() - 0.5) * 0.04));
    const nodes = Array.from({ length: 14 }, () => ({ x: 60 + rnd() * (W - 120), y: 50 + rnd() * (H - 110), r: 1.6 + rnd() * 1.9, ph: rnd() * Math.PI * 2 }));

    const grid = () => { ctx.fillStyle = A(0.05); for (let x = 14; x < W; x += 26) for (let y = 14; y < H; y += 26) ctx.fillRect(x, y, 2, 2); };
    const mono = (px: number) => { ctx.font = `${px}px "JetBrains Mono", monospace`; };

    const R: Record<Theme, (t: number) => void> = {
      /* loss curve that SAVES CHECKPOINTS as it passes them — the Colab story */
      training(t) {
        const tip = Math.min(W, (t / 3) * W);
        ckpts.forEach((x) => { ctx.strokeStyle = A(0.12); ctx.setLineDash([3, 7]); ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, H - 26); ctx.stroke(); ctx.setLineDash([]); });
        ctx.strokeStyle = A(0.85); ctx.lineWidth = 2; ctx.beginPath();
        for (let x = 0; x <= tip; x += 4) { const y = yAt(x, t); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
        if (tip < W) { ctx.fillStyle = A(1); ctx.beginPath(); ctx.arc(tip, yAt(tip, t), 3.4, 0, 7); ctx.fill(); }
        let saved = 0;
        ckpts.forEach((x) => {
          if (x > tip) return;
          saved++;
          const y = yAt(x, t) - 30; const fresh = tip - x < 90;
          ctx.strokeStyle = A(fresh ? 0.95 : 0.4); ctx.lineWidth = 1.4; ctx.strokeRect(x - 8, y - 8, 16, 16);
          ctx.fillStyle = A(fresh ? 0.95 : 0.4); mono(11); ctx.fillText('✓', x - 4, y + 4);
          if (fresh) { ctx.fillStyle = A(0.8); mono(10); ctx.fillText('CKPT SAVED', x + 14, y + 3); }
        });
        ctx.fillStyle = A(0.5); mono(12);
        ctx.fillText(`TRAINING RUN · EPOCH ${String(3 + Math.floor(t * 1.2)).padStart(2, '0')} · ${saved}/${ckpts.length} CHECKPOINTS`, 28, 34);
      },
      /* live terminal — lines type in, statuses land */
      terminal(t) {
        const lh = 23, maxRows = 11, y0 = 44;
        const n = Math.floor(t * 2);
        const start = Math.max(0, n - maxRows);
        for (let i = start; i <= Math.min(n, lines.length - 1); i++) {
          const L = lines[i % lines.length]; const row = i - start; const y = y0 + row * lh;
          const isNew = i === n; const frac = isNew ? t * 2 - n : 1;
          ctx.fillStyle = A(0.35); mono(11); if (!L.ind) ctx.fillText('>>>', 28, y + 4);
          ctx.fillStyle = A(isNew ? 0.9 : 0.45);
          ctx.fillRect(64 + L.ind, y - 3, L.w * W * 0.55 * frac, 6);
          if (L.ok && !isNew) { ctx.fillStyle = A(0.5); mono(10); ctx.fillText('[ok]', 80 + L.ind + L.w * W * 0.55, y + 3); }
        }
        const cy = y0 + Math.min(n - start + 1, maxRows) * lh;
        if (Math.floor(t * 2.5) % 2 === 0) { ctx.fillStyle = A(0.85); ctx.fillRect(64, cy - 3, 9, 13); }
      },
      /* token scanner — text rows, highlights bracket as the scan passes */
      text(t) {
        const rh = (H - 110) / rows.length;
        const scan = (t * 60) % (rows.length * rh + 60);
        rows.forEach((words, r) => {
          const y = 56 + r * rh; const active = Math.abs(scan - (r * rh + rh / 2)) < rh / 2;
          words.forEach((wd) => {
            ctx.fillStyle = A(active ? (wd.hot ? 0.95 : 0.5) : 0.25);
            ctx.fillRect(wd.x, y, wd.w, 5);
            if (active && wd.hot) { ctx.strokeStyle = A(0.8); ctx.lineWidth = 1; ctx.strokeRect(wd.x - 5, y - 7, wd.w + 10, 19); }
          });
        });
        ctx.strokeStyle = A(0.5); ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(28, 56 + scan - 8); ctx.lineTo(W - 28, 56 + scan - 8); ctx.stroke(); ctx.setLineDash([]);
      },
      /* vision — sweeping scan locks reticles onto targets with confidence */
      vision(t) {
        const sx = (t * 150) % (W + 200) - 100;
        ctx.strokeStyle = A(0.35); ctx.beginPath(); ctx.moveTo(sx, 20); ctx.lineTo(sx, H - 20); ctx.stroke();
        pts.forEach((p) => {
          const locked = sx > p.x; const s = 26;
          ctx.fillStyle = A(locked ? 0.9 : 0.3); ctx.beginPath(); ctx.arc(p.x, p.y, 2.4, 0, 7); ctx.fill();
          if (locked) {
            ctx.strokeStyle = A(0.7); ctx.lineWidth = 1.2; ctx.beginPath();
            ctx.moveTo(p.x - s / 2, p.y - s / 2 + 7); ctx.lineTo(p.x - s / 2, p.y - s / 2); ctx.lineTo(p.x - s / 2 + 7, p.y - s / 2);
            ctx.moveTo(p.x + s / 2 - 7, p.y - s / 2); ctx.lineTo(p.x + s / 2, p.y - s / 2); ctx.lineTo(p.x + s / 2, p.y - s / 2 + 7);
            ctx.moveTo(p.x + s / 2, p.y + s / 2 - 7); ctx.lineTo(p.x + s / 2, p.y + s / 2); ctx.lineTo(p.x + s / 2 - 7, p.y + s / 2);
            ctx.moveTo(p.x - s / 2 + 7, p.y + s / 2); ctx.lineTo(p.x - s / 2, p.y + s / 2); ctx.lineTo(p.x - s / 2, p.y + s / 2 - 7);
            ctx.stroke();
            ctx.fillStyle = A(0.6); mono(10); ctx.fillText(p.c, p.x + s / 2 + 6, p.y + 3);
          }
        });
      },
      /* data pipeline — packets flow through staged transforms */
      data(t) {
        const y = H * 0.52;
        ctx.strokeStyle = A(0.25); ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 40, y); ctx.stroke();
        stages.forEach((sx, i) => {
          ctx.strokeStyle = A(0.7); ctx.lineWidth = 1.3; ctx.strokeRect(sx - 26, y - 26, 52, 52);
          ctx.fillStyle = A(0.5); mono(10); ctx.fillText(['EXTRACT', 'TRANSFORM', 'LOAD'][i], sx - 24, y + 46);
          const fill = (Math.sin(t * 1.5 + i) + 1) / 2;
          ctx.fillStyle = A(0.25); ctx.fillRect(sx - 20, y + 14 - fill * 28, 40, fill * 28);
        });
        for (let k = 0; k < 7; k++) {
          const px = 40 + ((t * 110 + k * 150) % (W - 80));
          ctx.fillStyle = A(0.85); ctx.beginPath(); ctx.arc(px, y, 2.6, 0, 7); ctx.fill();
        }
      },
      /* default — signal + node web */
      signal(t) {
        for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]; const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 150) { ctx.globalAlpha = (1 - d / 150) * 0.16; ctx.strokeStyle = A(1); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
        }
        ctx.globalAlpha = 1;
        nodes.forEach((n) => { ctx.fillStyle = A(0.45 + 0.3 * Math.sin(t * 1.1 + n.ph)); ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 7); ctx.fill(); });
        const tip = Math.min(W, (t / 2.4) * W);
        ctx.strokeStyle = A(0.85); ctx.lineWidth = 2; ctx.beginPath();
        for (let x = 0; x <= tip; x += 4) { const y = yAt(x, t); x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      },
    };

    let raf = 0, t = reduced ? 8 : 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1.2;
      grid();
      R[theme](t);
      ctx.fillStyle = A(0.5); mono(13); ctx.fillText(label, 28, H - 26);
      if (Math.floor(t * 2) % 2 === 0) { ctx.fillStyle = A(0.8); ctx.fillRect(34 + ctx.measureText(label).width, H - 37, 8, 13); }
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [slug, tags]);

  return <canvas ref={ref} aria-hidden="true" />;
}
