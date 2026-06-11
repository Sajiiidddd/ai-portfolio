"use client";

import { useEffect, useRef, useState } from "react";
import { pixel, mono, grotesk } from "@/app/fonts";

const EMAIL = "tambolisajid65@gmail.com";

type Field = { id: string; label: string; ph: string; half?: boolean };
type Intent = { label: string; blurb: string; extra: Field[]; subj: (f: Record<string, string>) => string; tpl: string };

const intents: Record<string, Intent> = {
  hire: {
    label: "Hire / Role", blurb: "Full-time or contract",
    extra: [
      { id: "company", label: "Company", ph: "Company name", half: true },
      { id: "role", label: "Role / Title", ph: "e.g. ML Engineer", half: true },
    ],
    subj: (f) => "Role opportunity" + (f.company ? ` — ${f.company}` : ""),
    tpl: "Hi Sajid,\n\nWe're hiring and your production AI/ML work stood out. Quick context on the role:\n\n• \n\nWould love to talk.\n",
  },
  project: {
    label: "Start a project", blurb: "Freelance / collaboration",
    extra: [
      { id: "ptype", label: "Project type", ph: "e.g. RAG agent, CV model", half: true },
      { id: "budget", label: "Budget / timeline", ph: "Optional", half: true },
    ],
    subj: (f) => "Project inquiry" + (f.ptype ? ` — ${f.ptype}` : ""),
    tpl: "Hi Sajid,\n\nI've got a project in mind:\n\n• What it is: \n• Rough scope / timeline: \n\nAre you open to it?\n",
  },
  speaking: {
    label: "Speaking / Mentoring", blurb: "Talks, workshops, mentoring",
    extra: [
      { id: "event", label: "Event / Org", ph: "Event or community", half: true },
      { id: "date", label: "Date", ph: "Approx date", half: true },
    ],
    subj: (f) => "Speaking / mentoring" + (f.event ? ` — ${f.event}` : ""),
    tpl: "Hi Sajid,\n\nWe'd love to have you speak / mentor.\n\n• Event: \n• Audience & format: \n• Topic ideas: \n",
  },
  hi: {
    label: "Just say hi", blurb: "A hello, a question, anything",
    extra: [],
    subj: () => "Hello from your site",
    tpl: "Hey Sajid,\n\n",
  },
};

const PAT: Record<string, string[]> = {
  email: ["1111111111", "1100000011", "1010000101", "1000110001", "1000000001", "1111111111"],
  linkedin: ["010000000", "000000000", "010011110", "010010001", "010010001", "010010001", "010010001"],
  github: ["110000011", "110000011", "010000010", "001000100", "000111000", "000010000", "000011000", "000011000"],
  x: ["1000001", "0100010", "0010100", "0001000", "0010100", "0100010", "1000001"],
  discord: ["0011111100", "0111111110", "1110110111", "1111111111", "0110000110"],
};

const CHANNELS: [string, string, string][] = [
  ["Email", `mailto:${EMAIL}`, "email"],
  ["LinkedIn", "https://www.linkedin.com/in/sajid-tamboli-b505022a8/", "linkedin"],
  ["GitHub", "https://github.com/Sajiiidddd", "github"],
  ["X / Twitter", "https://x.com/TamboliSaj12545", "x"],
  ["Discord", "https://discord.gg/TgjQmTVfQf", "discord"],
];

const PixGlyph = ({ pat }: { pat: string[] }) => (
  <svg viewBox={`0 0 ${pat[0].length} ${pat.length}`} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
    {pat.flatMap((row, y) => [...row].map((c, x) => (c === "1" ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} /> : null)))}
  </svg>
);

export default function ContactPage() {
  const [intent, setIntent] = useState<string>("hire");
  const [vals, setVals] = useState<Record<string, string>>({ msg: intents.hire.tpl });
  const [copied, setCopied] = useState(false);

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

  const pick = (k: string) => {
    setIntent(k);
    setVals((v) => ({ name: v.name || "", email: v.email || "", msg: intents[k].tpl }));
  };
  const set = (id: string, val: string) => setVals((v) => ({ ...v, [id]: val }));

  const cfg = intents[intent];
  const subject = cfg.subj(vals);
  const bodyPreview = (vals.msg || "").trim();

  const compose = () => {
    let body = vals.msg || "";
    const sig = vals.name ? `\n— ${vals.name}${vals.company ? `, ${vals.company}` : ""}` : "";
    body = body + sig + (vals.email ? `\n${vals.email}` : "");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };
  const copy = () => {
    navigator.clipboard?.writeText(vals.msg || "");
    setCopied(true); setTimeout(() => setCopied(false), 1400);
  };

  const baseFields: Field[] = [
    { id: "name", label: "Name", ph: "Your name", half: true },
    { id: "email", label: "Email", ph: "you@company.com", half: true },
  ];

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
          <a href="/toolkit" onMouseEnter={hot} onMouseLeave={cold}>Toolkit</a>
          <a href="/contact" className="on" onMouseEnter={hot} onMouseLeave={cold}>Contact</a>
          <a href="/recommendations" onMouseEnter={hot} onMouseLeave={cold}>Recs</a>
        </div>
        <div className="clock mono"><span className="dim">Pune, IN</span><br /><span ref={clockRef}>--:--:--</span></div>
      </nav>

      <div className="wrap">
        <header>
          <div className="eyebrow"><span className="pulse" />Open a channel · replies within ~24h</div>
          <h1>CONTACT</h1>
          <p className="lede">Hiring, a project, a talk, or just a hello — pick a lane and I&apos;ll draft the message for you. Hit compose and it opens in your mail app, ready to send.</p>
        </header>

        <div className="layout">
          <div className="main">
            <div className="step"><span className="stepn">1</span><span className="steph">What&apos;s this about?</span></div>
            <div className="intents">
              {Object.entries(intents).map(([k, v]) => (
                <button key={k} type="button" className={`intent ${k === intent ? "on" : ""}`} onClick={() => pick(k)} onMouseEnter={hot} onMouseLeave={cold}>
                  <div className="it">{v.label}<span className="chk" /></div>
                  <div className="ib">{v.blurb}</div>
                </button>
              ))}
            </div>

            <div className="step"><span className="stepn">2</span><span className="steph">Your details</span></div>
            <div className="fields">
              {[...baseFields, ...cfg.extra].map((f) => (
                <div key={intent + f.id} className={`field ${f.half ? "" : "full"}`}>
                  <label htmlFor={f.id}>{f.label}</label>
                  <input id={f.id} placeholder={f.ph} value={vals[f.id] || ""} onChange={(e) => set(f.id, e.target.value)} onMouseEnter={hot} onMouseLeave={cold} />
                </div>
              ))}
              <div key={intent + "msg"} className="field full">
                <label htmlFor="msg">Message</label>
                <textarea id="msg" rows={6} value={vals.msg || ""} onChange={(e) => set("msg", e.target.value)} onMouseEnter={hot} onMouseLeave={cold} />
              </div>
            </div>

            <div className="actions">
              <button type="button" className="send" onClick={compose} onMouseEnter={hot} onMouseLeave={cold}>Compose email →</button>
              <button type="button" className="copy" onClick={copy} onMouseEnter={hot} onMouseLeave={cold}>{copied ? "Copied ✓" : "Copy draft"}</button>
            </div>
          </div>

          <div className="side">
            <div className="sidehead">Transmission <span className="sig"><i /><i /><i /></span></div>
            <div className="dim mono" style={{ fontSize: 10, letterSpacing: ".14em" }}>Live preview of your email</div>
            <div className="mailcard">
              <div className="mailrow"><span className="k">To</span><span className="v">{EMAIL}</span></div>
              <div className="mailrow"><span className="k">Subj</span><span className="v">{subject || "—"}</span></div>
              <div className="mailbody">{bodyPreview ? bodyPreview.slice(0, 180) + (bodyPreview.length > 180 ? "…" : "") : "Your drafted message appears here…"}</div>
            </div>
            <div className="meta">
              <div className="m"><span className="k">Intent</span><span className="v">{cfg.label}</span></div>
              <div className="m"><span className="k">Response</span><span className="v">~24 hours</span></div>
              <div className="m"><span className="k">Based in</span><span className="v">Pune, India</span></div>
              <div className="m"><span className="k">Status</span><span className="avail"><span className="d" />Available 2026</span></div>
            </div>
            <div className="lines">
              <div className="lh">Or reach me directly</div>
              {CHANNELS.map(([n, href, k]) => (
                <a key={k} href={href} target={href.startsWith("mailto") ? undefined : "_blank"} rel="noopener" onMouseEnter={hot} onMouseLeave={cold}>
                  <span className="ln"><PixGlyph pat={PAT[k]} />{n}</span><span className="ar">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        <footer><span>© 2026 Sajid Tamboli</span><span>trust the model — verify with a confusion matrix.</span><span>Pune, India</span></footer>
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
        .layout{display:grid;grid-template-columns:1fr 360px;gap:0;border-top:1px solid var(--line);margin-top:46px}
        .main{padding:40px 44px 60px 0}
        .side{border-left:1px solid var(--line);padding:40px 0 40px 40px}
        .step{display:flex;align-items:center;gap:12px;margin:0 0 22px}
        .stepn{width:24px;height:24px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;background:rgba(236,233,225,.1);color:var(--ink)}
        .steph{font-family:var(--pixel);font-size:1.5rem}
        .intents{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:42px}
        .intent{border:1px solid var(--line);padding:16px;text-align:left;background:none;color:var(--ink);cursor:none;transition:.3s;border-radius:4px}
        .intent:hover{background:rgba(236,233,225,.03)}
        .intent.on{border-color:rgba(236,233,225,.7);background:rgba(236,233,225,.05)}
        .intent .it{font-family:var(--mono);font-size:13px;letter-spacing:.04em;text-transform:uppercase;display:flex;justify-content:space-between;align-items:center}
        .intent .it .chk{width:14px;height:14px;border:1px solid var(--line);border-radius:50%;transition:.3s}
        .intent.on .it .chk{background:var(--ink);border-color:var(--ink)}
        .intent .ib{font-size:12px;color:var(--muted);margin-top:6px;font-weight:300}
        .fields{display:grid;grid-template-columns:1fr 1fr;gap:18px 16px}
        .field{display:flex;flex-direction:column;gap:7px;animation:fadein .5s var(--ease)}
        .field.full{grid-column:1 / -1}
        @keyframes fadein{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .field label{font-family:var(--mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted)}
        .field input,.field textarea{background:#0c0c0c;border:1px solid var(--line);border-radius:4px;padding:12px 14px;color:var(--ink);font-family:var(--font-grotesk),sans-serif;font-size:14px;outline:none;transition:border-color .3s;resize:vertical;cursor:none}
        .field input:focus,.field textarea:focus{border-color:rgba(236,233,225,.6)}
        .field input::placeholder,.field textarea::placeholder{color:#55554f}
        .actions{display:flex;gap:12px;margin-top:30px;align-items:center}
        .send{background:var(--ink);color:#0a0a0a;font-family:var(--pixel);font-size:1.2rem;padding:14px 26px;display:inline-flex;align-items:center;gap:12px;cursor:none;border:0;transition:transform .25s var(--ease)}
        .send:hover{transform:translate(-2px,-2px)}
        .copy{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line);padding:13px 18px;border-radius:4px;cursor:none;background:none;transition:.3s}
        .copy:hover{color:var(--ink);border-color:var(--ink)}
        .sidehead{font-family:var(--pixel);font-size:1.6rem;display:flex;align-items:center;gap:14px;margin-bottom:6px}
        .sig{display:flex;gap:4px;align-items:center}
        .sig i{width:5px;height:5px;border-radius:50%;background:var(--ink);display:block;animation:sg 1.4s infinite}
        .sig i:nth-child(2){animation-delay:.2s}.sig i:nth-child(3){animation-delay:.4s}
        @keyframes sg{0%,100%{opacity:.25;transform:scale(.7)}50%{opacity:1;transform:scale(1)}}
        .mailcard{border:1px solid var(--line);border-radius:6px;margin-top:22px;overflow:hidden;background:#0c0c0c}
        .mailrow{display:flex;gap:10px;padding:12px 14px;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:11px}
        .mailrow .k{color:var(--muted);min-width:54px;text-transform:uppercase;letter-spacing:.1em}
        .mailrow .v{color:var(--ink);word-break:break-word}
        .mailbody{padding:14px;font-family:var(--mono);font-size:11px;line-height:1.7;color:#9a9a92;min-height:84px;white-space:pre-wrap}
        .meta{margin-top:24px;display:flex;flex-direction:column;gap:12px}
        .meta .m{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase}
        .meta .m .k{color:var(--muted)}.meta .m .v{color:var(--ink)}
        .avail{color:var(--ink);display:inline-flex;align-items:center;gap:7px}
        .avail .d{width:7px;height:7px;border-radius:50%;background:var(--ink);animation:av 2s infinite}
        @keyframes av{0%{box-shadow:0 0 0 0 rgba(236,233,225,.4)}70%{box-shadow:0 0 0 7px rgba(236,233,225,0)}100%{box-shadow:0 0 0 0 rgba(236,233,225,0)}}
        .lines{margin-top:26px;border-top:1px solid var(--line);padding-top:18px}
        .lines .lh{font-family:var(--mono);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:12px}
        .lines a{display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);padding:8px 0;transition:color .3s;border-bottom:1px solid rgba(236,233,225,.06)}
        .lines a:hover{color:var(--ink)}
        .lines a :global(.ar){opacity:0;transition:.3s}
        .lines a:hover :global(.ar){opacity:1}
        .lines a .ln{display:flex;align-items:center;gap:11px}
        .lines a .ln :global(svg){height:13px;width:auto;display:block;opacity:.55;transition:.3s}
        .lines a:hover .ln :global(svg){opacity:1;transform:scale(1.18)}
        footer{padding:70px 0 30px;border-top:1px solid var(--line);margin-top:60px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
        .footnav{position:relative;z-index:2}
        @media(max-width:900px){
          nav{padding:14px 18px}nav .links{display:none}.wrap{padding:0 18px}
          .layout{grid-template-columns:1fr}.main{padding:34px 0 40px}.side{border-left:0;border-top:1px solid var(--line);padding:34px 0}
          .intents{grid-template-columns:1fr}.fields{grid-template-columns:1fr}
          .root{cursor:auto}.dot,.ring{display:none}
        }
      `}</style>
    </main>
  );
}
