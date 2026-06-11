"use client";

import { useEffect, useRef } from "react";
import SubscribeForm from "@/components/SubscribeForm";
import { pixel, mono, grotesk } from "@/app/fonts";

type Blog = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  tags: string[];
  readTime: number | null;
  createdAt: string;
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function WritingClient({ blogs }: { blogs: Blog[] }) {
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

  const [featured, ...rest] = blogs;

  return (
    <main className={`${pixel.variable} ${mono.variable} ${grotesk.variable} root`}>
      <div className="vig" />
      <div ref={dotRef} className="dot" aria-hidden="true" />
      <div ref={ringRef} className="ring" aria-hidden="true" />

      <nav aria-label="Primary">
        <a href="/" className="mono l" onMouseEnter={hot} onMouseLeave={cold}><span>Sajid Tamboli</span><span className="dim">AI / ML Engineer</span></a>
        <div className="links mono">
          <a href="/" onMouseEnter={hot} onMouseLeave={cold}>About</a>
          <a href="/projects" onMouseEnter={hot} onMouseLeave={cold}>Work</a>
          <a href="/blogs" className="on" onMouseEnter={hot} onMouseLeave={cold}>Writing</a>
          <a href="/toolkit" onMouseEnter={hot} onMouseLeave={cold}>Toolkit</a>
          <a href="/contact" onMouseEnter={hot} onMouseLeave={cold}>Contact</a>
          <a href="/recommendations" onMouseEnter={hot} onMouseLeave={cold}>Recs</a>
        </div>
        <div className="clock mono"><span className="dim">Pune, IN</span><br /><span ref={clockRef}>--:--:--</span></div>
      </nav>

      <div className="wrap">
        <header>
          <div className="eyebrow"><span className="pulse" />Field notes · build logs · lessons learned</div>
          <h1>WRITING</h1>
          <p className="lede">Notes from the trenches — training runs that melted, retrieval pipelines that didn&apos;t, and everything I wish someone had told me first.</p>
        </header>

        {blogs.length === 0 ? (
          <div className="empty">
            <span className="mono dim">00 POSTS</span>
            <p>The terminal is warming up — nothing published here yet.</p>
          </div>
        ) : (
          <>
            <div className="sechead"><h2>Latest</h2><span className="c">{String(blogs.length).padStart(2, "0")} posts</span></div>
            <a className="featured" href={`/blogs/${featured.slug}`} onMouseEnter={hot} onMouseLeave={cold}>
              <div className="ftag mono">◢ NEWEST TRANSMISSION</div>
              <div className="ftitle">{featured.title}</div>
              {featured.description && <p className="fdesc">{featured.description}</p>}
              <div className="fmeta">
                <span className="chips">{featured.tags.slice(0, 3).map((tg) => <span key={tg} className="chip">{tg}</span>)}</span>
                <span className="mono dim">{fmt(featured.createdAt)}{featured.readTime ? ` · ${featured.readTime} min read` : ""}</span>
              </div>
              <span className="fread mono">Read →</span>
            </a>

            {rest.length > 0 && (
              <>
                <div className="sechead"><h2>All posts</h2><span className="c" /></div>
                <div className="list">
                  {rest.map((b, i) => (
                    <a key={b.id} className="row" href={`/blogs/${b.slug}`} onMouseEnter={hot} onMouseLeave={cold}>
                      <span className="idx mono">{String(i + 2).padStart(2, "0")}</span>
                      <span className="title">{b.title}</span>
                      <span className="meta mono"><span className="y">{fmt(b.createdAt)}</span>{b.readTime ? ` · ${b.readTime} min` : ""}<br />{b.tags.slice(0, 2).join(" · ")}</span>
                      <span className="view mono">Read →</span>
                    </a>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <SubscribeForm />
        <footer><span>© 2026 Sajid Tamboli</span><span className="wink">trust the model — verify with a confusion matrix.</span><span>Pune, India</span></footer>
      </div>

      <style jsx>{`
        .root{position:relative;min-height:100vh;background:#0a0a0a;color:#ece9e1;font-family:var(--font-grotesk),sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;cursor:none;
          --ink:#ece9e1;--muted:#8a8a82;--faint:#3a3a36;--line:rgba(236,233,225,.12);--pixel:var(--font-pixel),monospace;--mono:var(--font-mono),monospace;--ease:cubic-bezier(.16,1,.3,1)}
        .mono{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}.dim{color:var(--muted)}
        .vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 95% at 60% 16%,transparent 55%,rgba(0,0,0,.6) 100%)}
        .dot,.ring{position:fixed;top:0;left:0;z-index:9999;pointer-events:none;border-radius:50%;will-change:transform}
        .dot{width:5px;height:5px;background:var(--ink);transform:translate(-50%,-50%)}
        .ring{width:32px;height:32px;border:1px solid rgba(236,233,225,.35);transform:translate(-50%,-50%);transition:width .25s var(--ease),height .25s var(--ease)}
        .ring.hot{width:56px;height:56px;border-color:rgba(236,233,225,.85)}
        nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:18px 34px;mix-blend-mode:difference}
        nav .l{display:flex;flex-direction:column;line-height:1.5}
        nav .links{display:flex;gap:24px}nav .links a{color:var(--muted);transition:color .3s}nav .links a:hover,nav .links a.on{color:var(--ink)}
        nav .clock{text-align:right;line-height:1.5}
        .wrap{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:0 34px}
        header{padding:140px 0 26px}
        .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:var(--muted);margin-bottom:16px;display:flex;gap:10px;align-items:center}
        .pulse{width:6px;height:6px;border-radius:50%;background:var(--ink);animation:pp 2.6s infinite}@keyframes pp{0%,100%{opacity:1}50%{opacity:.3}}
        h1{font-family:var(--pixel);font-size:clamp(3.4rem,12vw,9rem);line-height:.9;margin:0}
        .lede{margin-top:20px;max-width:540px;font-size:15px;line-height:1.8;color:#a7a79e;font-weight:300}
        .sechead{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--line);padding:54px 0 14px}
        .sechead h2{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);font-weight:500;margin:0}
        .sechead .c{font-family:var(--mono);font-size:12px;color:var(--ink)}
        .empty{border:1px solid var(--line);border-radius:6px;margin-top:46px;padding:60px 30px;text-align:center}
        .empty p{margin-top:14px;color:#a7a79e;font-weight:300}
        .featured{display:block;position:relative;border:1px solid var(--line);border-radius:6px;margin-top:24px;padding:30px 32px 26px;transition:background .3s,border-color .3s}
        .featured:hover{background:rgba(236,233,225,.03);border-color:rgba(236,233,225,.35)}
        .featured::before{content:"";position:absolute;left:0;top:0;height:100%;width:3px;background:var(--ink)}
        .ftag{font-size:10px;letter-spacing:.2em;color:var(--muted)}
        .ftitle{font-family:var(--pixel);font-size:clamp(1.8rem,5vw,3.2rem);line-height:1.02;margin:12px 0 4px;transition:color .3s}
        .featured:hover .ftitle{color:#fff}
        .fdesc{max-width:620px;color:#a7a79e;font-size:14.5px;line-height:1.75;font-weight:300;margin-top:8px}
        .fmeta{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-top:20px}
        .chips{display:flex;gap:8px;flex-wrap:wrap}
        .chip{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#b3b3a9;border:1px solid var(--line);border-radius:4px;padding:5px 11px}
        .fread{position:absolute;top:28px;right:28px;font-size:11px;letter-spacing:.14em;color:var(--muted);opacity:0;transform:translateX(-8px);transition:.4s var(--ease)}
        .featured:hover .fread{opacity:1;transform:none;color:var(--ink)}
        .row{display:grid;grid-template-columns:54px 1fr auto 64px;gap:22px;align-items:center;padding:28px 6px;border-bottom:1px solid var(--line);transition:padding .55s var(--ease),opacity .4s}
        .list:hover .row{opacity:.35}.list .row:hover{opacity:1;padding-left:24px}
        .idx{font-size:12px;color:var(--muted)}
        .title{font-family:var(--pixel);font-size:clamp(1.3rem,3.4vw,2.2rem);line-height:1.05;transition:transform .55s var(--ease)}
        .row:hover .title{transform:translateX(3px)}
        .meta{font-size:11px;letter-spacing:.1em;color:var(--muted);text-align:right;line-height:1.9}
        .meta .y{color:var(--ink)}
        .view{justify-self:end;font-size:11px;letter-spacing:.12em;color:var(--muted);opacity:0;transform:translateX(-10px);transition:.55s var(--ease)}
        .row:hover .view{opacity:1;transform:none}
        footer{padding:80px 0 30px;border-top:1px solid var(--line);margin-top:80px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
        .wink{font-family:var(--font-grotesk),sans-serif;font-style:italic;font-size:13px;color:var(--muted);text-transform:none;letter-spacing:0}
        .footnav{position:relative;z-index:2}
        @media(max-width:860px){
          nav{padding:14px 18px}nav .links{display:none}.wrap{padding:0 18px}
          .row{grid-template-columns:30px 1fr}.meta{grid-column:2;text-align:left;margin-top:6px}.view{display:none}
          .fread{display:none}
          .root{cursor:auto}.dot,.ring{display:none}
        }
      `}</style>
    </main>
  );
}
