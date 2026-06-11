"use client";

import { useEffect, useRef } from "react";
import { pixel, mono, grotesk } from "@/app/fonts";

export default function ArticleShell({ children }: { children: React.ReactNode }) {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const clockRef = useRef<HTMLSpanElement | null>(null);

  const hot = () => ringRef.current?.classList.add("hot");
  const cold = () => ringRef.current?.classList.remove("hot");

  useEffect(() => {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
    const move = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; if (dotRef.current) dotRef.current.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; };
    const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; raf = requestAnimationFrame(loop); };
    addEventListener("mousemove", move); loop();
    const tick = () => { const d = new Date(); const p = (n: number) => String(n).padStart(2, "0"); if (clockRef.current) clockRef.current.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
    tick(); const iv = setInterval(tick, 1000);
    return () => { removeEventListener("mousemove", move); cancelAnimationFrame(raf); clearInterval(iv); };
  }, []);

  return (
    <div className={`${pixel.variable} ${mono.variable} ${grotesk.variable} as-root`}>
      <div className="as-vig" />
      <div ref={dotRef} className="as-dot" />
      <div ref={ringRef} className="as-ring" />

      <nav className="as-nav">
        <a href="/" className="as-mono as-l" onMouseEnter={hot} onMouseLeave={cold}><span>Sajid Tamboli</span><span className="as-dim">AI / ML Engineer</span></a>
        <div className="as-links as-mono">
          <a href="/" onMouseEnter={hot} onMouseLeave={cold}>About</a>
          <a href="/projects" onMouseEnter={hot} onMouseLeave={cold}>Work</a>
          <a href="/blogs" className="on" onMouseEnter={hot} onMouseLeave={cold}>Writing</a>
          <a href="/toolkit" onMouseEnter={hot} onMouseLeave={cold}>Toolkit</a>
          <a href="/contact" onMouseEnter={hot} onMouseLeave={cold}>Contact</a>
          <a href="/recommendations" onMouseEnter={hot} onMouseLeave={cold}>Recs</a>
        </div>
        <div className="as-clock as-mono"><span className="as-dim">Pune, IN</span><br /><span ref={clockRef}>--:--:--</span></div>
      </nav>

      {children}

      <div className="as-foot">
        <footer><span>© 2026 Sajid Tamboli</span><span className="as-wink">trust the model — verify with a confusion matrix.</span><span>Pune, India</span></footer>
      </div>

      <style jsx global>{`
        .as-root{position:relative;min-height:100vh;background:#0a0a0a;color:#ece9e1;font-family:var(--font-grotesk),sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;cursor:none}
        .as-mono{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase}
        .as-dim{color:#8a8a82}
        .as-vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 95% at 60% 14%,transparent 55%,rgba(0,0,0,.55) 100%)}
        .as-dot,.as-ring{position:fixed;top:0;left:0;z-index:9999;pointer-events:none;border-radius:50%;will-change:transform}
        .as-dot{width:5px;height:5px;background:#ece9e1;transform:translate(-50%,-50%)}
        .as-ring{width:32px;height:32px;border:1px solid rgba(236,233,225,.35);transform:translate(-50%,-50%);transition:width .25s cubic-bezier(.16,1,.3,1),height .25s cubic-bezier(.16,1,.3,1)}
        .as-ring.hot{width:56px;height:56px;border-color:rgba(236,233,225,.85)}
        .as-nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:18px 34px;mix-blend-mode:difference}
        .as-l{display:flex;flex-direction:column;line-height:1.5}
        .as-links{display:flex;gap:24px}
        .as-links a{color:#8a8a82;transition:color .3s}
        .as-links a:hover,.as-links a.on{color:#ece9e1}
        .as-clock{text-align:right;line-height:1.5}
        .as-col{position:relative;z-index:2;max-width:860px;margin:0 auto;padding:130px 26px 60px}
        .as-back{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82;transition:color .3s,transform .3s;margin-bottom:34px}
        .as-back:hover{color:#ece9e1;transform:translateX(-3px)}
        .as-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px}
        .as-chip{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#b3b3a9;border:1px solid rgba(236,233,225,.14);border-radius:4px;padding:5px 11px}
        .as-title{font-family:var(--font-grotesk),sans-serif;font-weight:500;font-size:clamp(2rem,5.4vw,3.2rem);line-height:1.12;letter-spacing:-.02em;color:#ece9e1;margin:0 0 18px}
        .as-meta{display:flex;align-items:center;gap:14px;font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a82;margin-bottom:26px}
        .as-meta b{color:#ece9e1;font-weight:500}
        .as-hero{position:relative;width:100%;aspect-ratio:2/1;}
        .as-hero--motif{aspect-ratio:1200/340}
        .as-hero canvas{width:100%;height:100%;display:block}
        .as-hero,.as-hero--motif{overflow:hidden;border-radius:8px;border:1px solid rgba(236,233,225,.12);margin-bottom:42px;background:#0c0c0c}
        .as-divider{display:flex;align-items:center;gap:14px;margin:64px 0 34px;font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#8a8a82}
        .as-divider::before,.as-divider::after{content:"";flex:1;height:1px;background:rgba(236,233,225,.12)}
        html{scroll-behavior:smooth}
        .as-col h2,.as-col h3{scroll-margin-top:100px}
        .as-toc{border:1px solid rgba(236,233,225,.12);border-radius:6px;margin:0 0 44px;overflow:hidden}
        .as-tochead{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid rgba(236,233,225,.12)}
        .as-tochead .tab{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;background:#ece9e1;color:#0a0a0a;padding:6px 12px;border-radius:3px}
        .as-tochead .count{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82}
        .as-tocrow{display:grid;grid-template-columns:40px 1fr auto;gap:14px;align-items:center;padding:13px 16px;border-bottom:1px solid rgba(236,233,225,.07);transition:background .25s,padding .3s cubic-bezier(.16,1,.3,1)}
        .as-tocrow:last-child{border-bottom:0}
        .as-tocrow:hover{background:rgba(236,233,225,.05);padding-left:24px}
        .as-tocrow .n{font-family:var(--font-mono),monospace;font-size:10px;color:#8a8a82}
        .as-tocrow .t{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#d2d2c8}
        .as-tocrow.sub .t{color:#8a8a82;padding-left:16px}
        .as-tocrow .ar{font-family:var(--font-mono),monospace;font-size:11px;color:#8a8a82;opacity:0;transform:translateY(-3px);transition:.3s}
        .as-tocrow:hover .ar{opacity:1;transform:none}
        .as-tablewrap{overflow-x:auto;margin:30px 0;border:1px solid rgba(236,233,225,.12);border-radius:6px}
        .as-tablewrap table{width:100%;border-collapse:collapse;font-size:13.5px;margin:0}
        .as-tablewrap thead th{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82;font-weight:500;text-align:left;padding:13px 16px;border-bottom:1px solid rgba(236,233,225,.12)}
        .as-tablewrap tbody td{padding:13px 16px;border-bottom:1px solid rgba(236,233,225,.07);color:#c9c9bf;font-weight:300}
        .as-tablewrap tbody tr:last-child td{border-bottom:0}
        .as-tablewrap tbody tr{transition:background .25s}
        .as-tablewrap tbody tr:hover{background:rgba(236,233,225,.04)}
        .as-tablewrap tbody td{font-family:var(--font-mono),monospace;font-size:12px;letter-spacing:.02em}
        .as-col .prose{counter-reset:sec}
        .as-col .prose h2{counter-increment:sec;font-family:var(--font-mono),monospace;font-size:15px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;color:#ece9e1;margin:3.6rem 0 1.2rem}
        .as-col .prose h2::before{content:counter(sec,decimal-leading-zero) "  ·  ";color:#8a8a82}
        .as-col .prose h3{font-family:var(--font-mono),monospace;font-size:12px;letter-spacing:.16em;text-transform:uppercase;font-weight:500;color:#b3b3a9;margin:2.6rem 0 .9rem}
        .as-col .prose p{font-size:15px;line-height:1.9}
        .as-col .prose img{display:block;max-width:min(460px,100%);height:auto;margin:24px auto;border-radius:8px}
        .as-foot{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:0 34px}
        .as-foot footer{padding:70px 0 26px;border-top:1px solid rgba(236,233,225,.12);display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#3a3a36}
        .as-wink{font-family:var(--font-grotesk),sans-serif;font-style:italic;font-size:13px;color:#8a8a82;text-transform:none;letter-spacing:0}
        .as-progress{position:fixed;top:0;left:0;right:0;z-index:60;height:2px;background:rgba(236,233,225,.06)}
        .as-progress i{display:block;height:100%;background:rgba(236,233,225,.7);transition:width .08s linear}
        .as-hud{position:fixed;left:28px;bottom:22px;z-index:55;display:flex;align-items:center;gap:12px;font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8a8a82}
        .as-hud .bar{width:64px;height:2px;background:rgba(236,233,225,.12);position:relative;overflow:hidden}
        .as-hud .bar i{position:absolute;left:0;top:0;bottom:0;background:#ece9e1}
        .as-copy{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a82;border:1px solid rgba(236,233,225,.14);border-radius:4px;padding:5px 11px;background:none;transition:.3s;cursor:none}
        .as-copy:hover{color:#ece9e1;border-color:rgba(236,233,225,.5)}
        .as-pn{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:60px}
        .as-pncard{display:block;border:1px solid rgba(236,233,225,.12);border-radius:6px;padding:18px 20px;transition:background .3s,border-color .3s}
        .as-pncard:hover{background:rgba(236,233,225,.04);border-color:rgba(236,233,225,.4)}
        .as-pncard.empty{opacity:.3;pointer-events:none}
        .as-pncard.next{text-align:right}
        .as-pncard .k{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8a8a82}
        .as-pncard .t{display:block;margin-top:8px;font-size:15px;color:#ece9e1;line-height:1.4}
        @keyframes asIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}
        .as-back{animation:asIn .6s cubic-bezier(.16,1,.3,1) backwards}
        .as-chips{animation:asIn .6s cubic-bezier(.16,1,.3,1) .06s backwards}
        .as-title{animation:asIn .7s cubic-bezier(.16,1,.3,1) .12s backwards}
        .as-meta{animation:asIn .7s cubic-bezier(.16,1,.3,1) .18s backwards}
        .as-hero{animation:asIn .8s cubic-bezier(.16,1,.3,1) .26s backwards}
        .sp-i{opacity:0;transform:translateY(16px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
        .sp-in{opacity:1;transform:none}
        @media (prefers-reduced-motion: reduce){
          .as-back,.as-chips,.as-title,.as-meta,.as-hero{animation:none}
          .sp-i{opacity:1;transform:none;transition:none}
        }
        @media(max-width:860px){
          .as-nav{padding:12px 18px;flex-wrap:wrap;gap:4px 14px}.as-links{display:flex;flex-wrap:wrap;gap:14px;width:100%;order:3}.as-clock{display:none}
          .as-col{padding:110px 18px 40px}.as-foot{padding:0 18px}
          .as-hud{display:none}
          .as-pn{grid-template-columns:1fr}
          .as-root{cursor:auto}.as-dot,.as-ring{display:none}
        }
      `}</style>
    </div>
  );
}
