"use client";

import { useEffect, useRef, useState } from "react";
import { pixel, mono, grotesk } from "@/app/fonts";

type Tier = { key: string; label: string; items: [string, string][] };
const tiers: Tier[] = [
  { key: "adv", label: "Advanced", items: [["Python", "python.svg"], ["TensorFlow", "tensorflow.svg"], ["PyTorch", "pytorch.svg"], ["HuggingFace", "huggingface.svg"], ["Keras", "Keras.svg"], ["OpenCV", "opencv.svg"], ["NumPy", "numpy.svg"], ["Scikit-learn", "scikit-learn.svg"], ["Matplotlib", "matplotlib.svg"], ["MySQL", "mysql.svg"], ["PostgreSQL", "postgres.svg"], ["Pandas", "pandas.svg"], ["NLTK", "https://www.google.com/s2/favicons?domain=nltk.org&sz=64"], ["XGBoost", "https://www.google.com/s2/favicons?domain=xgboost.ai&sz=64"], ["Sentence-BERT", "https://www.google.com/s2/favicons?domain=sbert.net&sz=64"]] },
  { key: "int", label: "Intermediate", items: [["C++", "c++.svg"], ["Django", "django.svg"], ["Google Cloud", "gcp.svg"], ["Git", "git.svg"], ["FastAPI", "fastapi.svg"], ["Node.js", "Node.js.svg"], ["MongoDB", "mongodb.svg"], ["HDFS", "hdfs.svg"], ["TypeScript", "https://www.google.com/s2/favicons?domain=typescriptlang.org&sz=64"], ["JavaScript", "javascript.svg"], ["React", "https://www.google.com/s2/favicons?domain=react.dev&sz=64"], ["Tailwind CSS", "https://www.google.com/s2/favicons?domain=tailwindcss.com&sz=64"], ["Java", "https://www.google.com/s2/favicons?domain=java.com&sz=64"], ["C", "c-programming.svg"], ["Flask", "https://www.google.com/s2/favicons?domain=flask.palletsprojects.com&sz=64"], ["Gradio", "https://www.google.com/s2/favicons?domain=gradio.app&sz=64"], ["ARIMA", "https://www.google.com/s2/favicons?domain=statsmodels.org&sz=64"]] },
  { key: "rok", label: "Rookie", items: [["R", "r-project.svg"], ["Next.js", "next.js.svg"], ["HTML5", "html-5.svg"], ["CSS", "css.svg"]] },
  { key: "tools", label: "Tools & Platforms", items: [["Docker", "https://www.google.com/s2/favicons?domain=docker.com&sz=64"], ["AWS ECR", "https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64"], ["MCP", "pat:mcp"], ["Zendesk AI", "https://www.google.com/s2/favicons?domain=zendesk.com&sz=64"], ["Slack API", "https://www.google.com/s2/favicons?domain=slack.com&sz=64"], ["Claude", "https://www.google.com/s2/favicons?domain=claude.ai&sz=64"], ["OpenAI", "https://www.google.com/s2/favicons?domain=openai.com&sz=64"], ["DeBERTa", "pat:deberta"], ["RoBERTa", "pat:roberta"], ["ETL", "pat:etl"], ["Kubernetes · EKS", "https://www.google.com/s2/favicons?domain=kubernetes.io&sz=64"], ["Argo CD", "https://www.google.com/s2/favicons?domain=argoproj.github.io&sz=64"], ["AWS Bedrock", "https://www.google.com/s2/favicons?domain=aws.amazon.com&sz=64"], ["Azure AI", "https://www.google.com/s2/favicons?domain=azure.microsoft.com&sz=64"], ["Jira", "https://www.google.com/s2/favicons?domain=atlassian.com&sz=64"], ["Postman", "https://www.google.com/s2/favicons?domain=postman.com&sz=64"]] },
];

type Cert = { t: string; i: string; y: string; img?: string; drive?: string; url: string };
const certs: Cert[] = [
  { t: "Best Project Award", i: "Ajeenkya D Y Patil University", y: "2026", drive: "1yTRpe7PMqP2iGGm1BRpsO5CQp-i80vg1", url: "https://drive.google.com/file/d/1yTRpe7PMqP2iGGm1BRpsO5CQp-i80vg1/view?usp=sharing" },
  { t: "AI ML Deployment in ECM", i: "TATA Motors Ltd. (Internship)", y: "2026", drive: "1YVi1W5QjhipCZYsePPAFIJOKVV_bsKIl", img: "/images/TML.jpg", url: "https://drive.google.com/file/d/1YVi1W5QjhipCZYsePPAFIJOKVV_bsKIl/view?usp=drive_link" },
  { t: "MCP Deep Researcher Copyright", i: "Copyright Office, India", y: "2025", drive: "14X3GgGR-M2S9L_bZa6pvInhv9OtNQsUc", url: "https://drive.google.com/file/d/14X3GgGR-M2S9L_bZa6pvInhv9OtNQsUc/view?usp=drive_link" },
  { t: "C for Everyone: Structured Programming", i: "Coursera · UC Santa Cruz", y: "2023", img: "/images/Coursera%20C.jpg", url: "https://www.coursera.org/account/accomplishments/verify/FH42HNHEG9XG" },
  { t: "C++ For C Programmers, Part A", i: "Coursera · UC Santa Cruz", y: "2023", img: "/images/Coursera%20C++.jpg", url: "https://www.coursera.org/account/accomplishments/verify/5TZTB3DGD9RC" },
  { t: "J.P. Morgan Software Engineering", i: "Forage Virtual Experience", y: "2024", img: "/images/Forage%20Certificate.jpg", url: "https://forage-uploads-prod.s3.amazonaws.com/completion-certificates/J.P.%20Morgan/R5iK7HMxJGBgaSbvk_J.P.%20Morgan_ohdxxYhFy7YFhFY9n_1716726541894_completion_certificate.pdf" },
  { t: "Google Cloud Computing Foundations", i: "Google Cloud · Credly", y: "2025", img: "/images/gcsb1.png", url: "https://www.credly.com/badges/a332adad-f3eb-4b8a-90ce-c137c6484548/public_url" },
  { t: "Google Cloud Skills Boost", i: "Google Cloud · Skills Boost", y: "2024–Present", img: "/images/gcsb1.png", url: "" },
];

function driveId(u: string): string | null {
  const m = u.match(/\/file\/d\/([^/]+)/) || u.match(/[?&]id=([^&]+)/);
  return m ? m[1] : null;
}
function previewSrc(c: Cert): string | null {
  const id = (c.drive && (driveId(c.drive) || c.drive)) || driveId(c.url || "");
  if (id) return `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
  return c.img || null;
}

const SKILLS = "/skills/";

const PATS: Record<string, string[]> = {
  mcp: ["0100010", "0100010", "1111111", "1111111", "0111110", "0001000", "0001000"],
  deberta: ["111111111", "000000000", "011111110", "000000000", "001111100"],
  roberta: ["111111111", "000000000", "111101111", "000000000", "111111111"],
  etl: ["111111111", "011111110", "001111100", "000111000", "000010000", "000010000"],
};

const PixGlyph = ({ pat }: { pat: string[] }) => (
  <svg className="pix" viewBox={`0 0 ${pat[0].length} ${pat.length}`} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
    {pat.flatMap((row, y) => [...row].map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)))}
  </svg>
);

export default function ToolkitPage() {
  const [activeCert, setActiveCert] = useState(0);
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
    <main className={`${pixel.variable} ${mono.variable} ${grotesk.variable} root`}>
      <div className="vig" />
      <div ref={dotRef} className="dot" />
      <div ref={ringRef} className="ring" />

      <nav>
        <a href="/" className="mono l" onMouseEnter={hot} onMouseLeave={cold}><span>Sajid Tamboli</span><span className="dim">AI / ML Engineer</span></a>
        <div className="links mono">
          <a href="/" onMouseEnter={hot} onMouseLeave={cold}>About</a>
          <a href="/projects" onMouseEnter={hot} onMouseLeave={cold}>Work</a>
          <a href="/blogs" onMouseEnter={hot} onMouseLeave={cold}>Writing</a>
          <a href="/toolkit" className="on" onMouseEnter={hot} onMouseLeave={cold}>Toolkit</a>
          <a href="/contact" onMouseEnter={hot} onMouseLeave={cold}>Contact</a>
        </div>
        <div className="clock mono"><span className="dim">Pune, IN</span><br /><span ref={clockRef}>--:--:--</span></div>
      </nav>

      <div className="wrap">
        <header>
          <div className="eyebrow"><span className="pulse" />Skills &amp; Credentials</div>
          <h1>TOOLKIT</h1>
          <p className="lede">The stack I build production intelligence with — and the credentials that back it. Hover a skill to bring it to life; pick a certificate to verify it at the source.</p>
        </header>

        <div className="sechead"><h2>Stack</h2><span className="r">44 tools · 4 tiers</span></div>
        <div className="skills">
          {tiers.map((tr) => (
            <div key={tr.key} className="tier">
              <div className="tierhead"><span>{tr.label}</span><span>{tr.items.length} tools</span></div>
              <div className={`grid ${tr.key}`}>
                {tr.items.map(([n, f]) => (
                  <div key={n} className="skill" onMouseEnter={hot} onMouseLeave={cold}>
                    {f.startsWith("pat:") ? (
                      <PixGlyph pat={PATS[f.slice(4)]} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.startsWith("http") ? f : SKILLS + f} alt={n} />
                    )}
                    <span>{n}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sechead"><h2>Certifications</h2><span className="r">{certs.length.toString().padStart(2, "0")} credentials</span></div>
        <div className="certs">
          <div className="certlist">
            {certs.map((c, idx) => (
              <div key={c.t} className={`certrow ${idx === activeCert ? "on" : ""}`} onMouseEnter={() => { setActiveCert(idx); hot(); }} onMouseLeave={cold}>
                <div><div className="ct">{c.t}</div><div className="ci">{c.i}</div></div>
                {c.url ? (<a className="verify" href={c.url} target="_blank" rel="noopener" onClick={(e) => e.stopPropagation()}>Verify ↗</a>) : (<span className="verify">In progress</span>)}
              </div>
            ))}
          </div>
          <div className="certimg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {(() => {
              const src = previewSrc(certs[activeCert]);
              return src
                ? <img src={src} alt={certs[activeCert].t} referrerPolicy="no-referrer" />
                : <div className="certph">Verify ↗ at source</div>;
            })()}
            <span className="yr">{certs[activeCert].y}</span>
          </div>
        </div>

        <footer>
          <div className="cta">
            <a className="ctabtn" href="mailto:tambolisajid65@gmail.com" onMouseEnter={hot} onMouseLeave={cold}>Let&apos;s build →</a>
            <div className="socials">
              <a href="https://github.com/Sajiiidddd" target="_blank" rel="noopener" onMouseEnter={hot} onMouseLeave={cold}>GitHub</a>
              <a href="https://www.linkedin.com/in/sajid-tamboli-b505022a8/" target="_blank" rel="noopener" onMouseEnter={hot} onMouseLeave={cold}>LinkedIn</a>
              <a href="mailto:tambolisajid65@gmail.com" onMouseEnter={hot} onMouseLeave={cold}>Email</a>
            </div>
          </div>
          <div className="foot-base"><span>© 2026 Sajid Tamboli</span><span>Pune, India</span></div>
        </footer>

      </div>

      <style jsx>{`
        .root{position:relative;min-height:100vh;background:#0a0a0a;color:#ece9e1;font-family:var(--font-grotesk),sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;cursor:none;
          --ink:#ece9e1;--muted:#8a8a82;--faint:#3a3a36;--line:rgba(236,233,225,.12);--pixel:var(--font-pixel),monospace;--mono:var(--font-mono),monospace;--ease:cubic-bezier(.16,1,.3,1)}
        .mono{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}.dim{color:var(--muted)}
        .vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 95% at 60% 18%,transparent 55%,rgba(0,0,0,.6) 100%)}
        .dot,.ring{position:fixed;top:0;left:0;z-index:9999;pointer-events:none;border-radius:50%;will-change:transform}
        .dot{width:5px;height:5px;background:var(--ink);transform:translate(-50%,-50%)}
        .ring{width:32px;height:32px;border:1px solid rgba(236,233,225,.35);transform:translate(-50%,-50%);transition:width .25s var(--ease),height .25s var(--ease)}
        .ring.hot{width:56px;height:56px;border-color:rgba(236,233,225,.85)}
        nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:18px 34px;mix-blend-mode:difference}
        nav .l{display:flex;flex-direction:column;line-height:1.5}
        nav .links{display:flex;gap:24px}nav .links a{color:var(--muted);transition:color .3s}nav .links a:hover,nav .links a.on{color:var(--ink)}
        nav .clock{text-align:right;line-height:1.5}
        .wrap{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:0 34px}
        header{padding:140px 0 10px}
        .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:var(--muted);margin-bottom:18px;display:flex;gap:10px;align-items:center}
        .pulse{width:6px;height:6px;border-radius:50%;background:var(--ink);animation:pp 2.6s infinite}@keyframes pp{0%,100%{opacity:1}50%{opacity:.3}}
        h1{font-family:var(--pixel);font-size:clamp(3.4rem,12vw,9rem);line-height:.9;margin:0}
        .lede{margin-top:22px;max-width:520px;font-size:15px;line-height:1.8;color:#a7a79e;font-weight:300}
        .sechead{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--line);padding:70px 0 14px;margin-bottom:24px}
        .sechead h2{font-family:var(--pixel);font-size:clamp(2rem,5vw,3.2rem);line-height:1;margin:0}
        .sechead .r{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
        .tier{border:1px solid var(--line);border-bottom:0}
        .tier:last-of-type{border-bottom:1px solid var(--line)}
        .tierhead{font-family:var(--mono);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);padding:14px 16px;border-bottom:1px solid var(--line);display:flex;justify-content:space-between}
        .grid{display:grid}
        .grid.adv{grid-template-columns:repeat(5,1fr)}
        .grid.int{grid-template-columns:repeat(4,1fr)}
        .grid.rok{grid-template-columns:repeat(5,1fr)}
        .grid.tools{grid-template-columns:repeat(5,1fr)}
        .skill{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:30px 12px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);cursor:none;transition:background .3s}
        .skill:hover{background:rgba(236,233,225,.04)}
        .skill img{width:42px;height:42px;object-fit:contain;filter:grayscale(1) brightness(1.4);opacity:.65;transition:.35s}
        .skill:hover img{filter:none;opacity:1;transform:scale(1.12)}
        .skill span{font-family:var(--mono);font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);transition:color .3s}
        .skill:hover span{color:var(--ink)}
        .skill :global(.pix){height:30px;width:auto;display:block;color:#ece9e1;opacity:.55;transition:.35s}
        .skill:hover :global(.pix){opacity:1;transform:scale(1.12)}
        .certs{display:grid;grid-template-columns:1fr 420px;border:1px solid var(--line)}
        .certlist{display:flex;flex-direction:column}
        .certrow{display:flex;justify-content:space-between;align-items:center;gap:16px;padding:26px 24px;border-bottom:1px solid var(--line);cursor:none;transition:background .3s,opacity .3s;opacity:.5}
        .certrow:last-child{border-bottom:0}
        .certrow.on{opacity:1;background:rgba(236,233,225,.04)}
        .certrow .ct{font-family:var(--mono);font-size:14px;letter-spacing:.02em;text-transform:uppercase;color:var(--ink);line-height:1.5}
        .certrow .ci{font-family:var(--mono);font-size:11px;letter-spacing:.04em;text-transform:uppercase;color:var(--muted);margin-top:4px}
        .certrow .verify{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);opacity:0;white-space:nowrap;transition:.3s;border:1px solid var(--line);padding:7px 11px;border-radius:4px;text-decoration:none}
        .certrow.on .verify{opacity:1;color:var(--ink)}.certrow .verify:hover{background:var(--ink);color:#0a0a0a}
        .certimg{position:relative;border-left:1px solid var(--line);background:#0c0c0c;overflow:hidden;min-height:340px}
        .certimg img{width:100%;height:100%;object-fit:contain;padding:18px;filter:grayscale(1) contrast(1.05);transition:opacity .4s}
        .certph{display:flex;align-items:center;justify-content:center;height:100%;font-family:var(--mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#55554f}
        .certimg .yr{position:absolute;top:14px;right:14px;font-family:var(--mono);font-size:10px;letter-spacing:.14em;color:#fff;background:rgba(0,0,0,.55);padding:5px 10px;border-radius:3px}
        footer{padding:90px 0 30px;border-top:1px solid var(--line);margin-top:90px}
        .cta{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px}
        .ctabtn{background:var(--ink);color:#0a0a0a;font-family:var(--pixel);font-size:clamp(1.4rem,3.4vw,2.4rem);padding:18px 34px;display:inline-flex;align-items:center;gap:14px;cursor:none;transition:transform .25s var(--ease);text-decoration:none}
        .ctabtn:hover{transform:translate(-2px,-2px)}
        .socials{display:flex;gap:20px}.socials a{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);transition:color .3s}.socials a:hover{color:var(--ink)}
        .foot-base{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:54px;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
        .footnav{position:relative;z-index:2}
        @media(max-width:860px){
          nav{padding:14px 18px}nav .links{display:none}.wrap{padding:0 18px}
          .grid.adv,.grid.int,.grid.rok,.grid.tools{grid-template-columns:repeat(3,1fr)}
          .certs{grid-template-columns:1fr}.certimg{height:300px;border-left:0;border-top:1px solid var(--line)}
          .root{cursor:auto}.dot,.ring{display:none}
        }
      `}</style>
    </main>
  );
}
