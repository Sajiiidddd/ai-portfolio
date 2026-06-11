"use client";

import { useEffect, useRef, useState } from "react";
import { pixel, mono, grotesk } from "@/app/fonts";
import HeroPassAgent from "@/components/HeroPassAgent";

type Project = {
  id: string;
  name: string;
  year: string;
  code: string;
  patent?: boolean;
  cover: string;
  video?: string;
  line: string;
  stack: string[];
  desc: string;
  input: string;
  output: string;
  tech: string;
  links: { label: string; url: string; ghost?: boolean }[];
};

const projects: Project[] = [
  {
    id: "f1", name: "F1 Strategy OS", year: "2026", code: "ML · LIVE",
    cover: "/images/f1_png.png",
    line: "Real-time F1 race-strategy prediction engine",
    stack: ["Transformer · PyTorch", "FastF1", "Optuna", "HF Spaces", "Next.js", "Gemini 1.5 Pro"],
    desc: "A real-time AI prediction engine that translates complex Formula 1 telemetry into actionable race strategy — forecasting the finishing grid lap-by-lap and visualizing how strategy reshapes the result.",
    input: "Select a race session (e.g. 2021 Abu Dhabi), a lap number, and optional simulation parameters like rain or track-temperature overrides.",
    output: "A live leaderboard predicting every driver's final position (92% podium accuracy), a 'Delta' metric vs. actual results, and an AI strategy debrief explaining the anomalies.",
    tech: "A decoupled full-stack build. A 64-dimension Transformer (PyTorch) trained on 5 years of FastF1 telemetry, Optuna-optimized to <45ms CPU inference and hosted on Hugging Face Spaces. A Next.js dashboard on Vercel consumes it via the Gradio Client API using a 10-lap sliding window, with Gemini 1.5 Pro reading 'Chaos Factors' like Safety Cars.",
    links: [
      { label: "View live ↗", url: "https://f1-strategy-dashboard.vercel.app" },
      { label: "Source", url: "https://github.com/Sajiiidddd/F1-Prediction", ghost: true },
      { label: "Model", url: "https://huggingface.co/spaces/Susjid/F1-Neural-Strategist-API", ghost: true },
    ],
  },
  {
    id: "zmcp", name: "Zendesk MCP Server", year: "2026", code: "MCP · OPEN SOURCE",
    cover: "",
    line: "60+ tool Zendesk MCP — no official one exists",
    stack: ["Python", "MCP", "httpx · asyncio", "Zendesk API", "Guard-rails"],
    desc: "There is no official Zendesk MCP connector — so I built one. An open-source MCP server connecting Claude to any Zendesk instance with 60+ tools, engineered with production guard-rails throughout. MIT-licensed, installable in one command — uvx zendesk-mcp.",
    input: "Natural-language requests from Claude — list, search, create and update across tickets, users, macros, triggers, SLAs and Help Center.",
    output: "Structured tool results with a _meta block ({ total, api_calls }) — fully paginated, rate-limit-safe, never a crashed tool call.",
    tech: "One pooled httpx.AsyncClient, pre-computed auth header, 429-aware retry honouring Retry-After, a proactive sleep cycle every ~100 calls, concurrent auto-pagination in batches of 8, a 1-hour TTL schema cache, and composite tools via asyncio.gather. Ships with stdio + SSE transports and a raw_api_call escape hatch.",
    links: [{ label: "Source ↗", url: "https://github.com/Sajiiidddd/zendesk-mcp" }, { label: "Docs server", url: "https://github.com/Sajiiidddd/zendesk-mcp-docs", ghost: true }],
  },
  {
    id: "bom", name: "BOM Comparator", year: "2025", code: "NLP · PATENTED", patent: true,
    cover: "/images/TML.jpg",
    line: "NLP engine live across 5 plants · patented",
    stack: ["NLP", "Azure", "SAP", "Production"],
    desc: "SAMIKSHA (IP: CIP 20251027 TML 15884) — a patented NLP-powered comparator that diffs vehicle BOM spreadsheets at Tata Motors, in production across five CVBU departments.",
    input: "Vehicle BOM Excel sheets across variants — 60,000–70,000-part TPL files of components, quantities and revisions.",
    output: "Part-level difference detection between vehicle BOMs — hours/days cut to 1–2 minutes at 100% accuracy across 20+ vehicle configurations.",
    tech: "An optimised tree-traversal pipeline (~10¹⁵ raw ops reduced to ~2–3 lakh per pair) integrated with SAP, deployed on Azure via FastAPI — projected to save 10,40,000 SMH/year. Three sibling tools in active ECM/Finance use.",
    links: [{ label: "Patented build", url: "", ghost: true }],
  },
  {
    id: "picasso", name: "Picasso — Inner Echoes", year: "2025", code: "GENERATIVE",
    cover: "/images/image2.jpg", video: "/videos/Picasso.mp4",
    line: "Emotions → generative art (multi-modal)",
    stack: ["Sentence-BERT", "NRC-VAD", "Stable Diffusion XL", "PyTorch"],
    desc: "A multi-modal AI that translates human emotions — from text, voice and facial cues — into personalized generative art, fusing NLP, computer vision and generative modeling.",
    input: "Your emotions as text, voice or facial cues — as raw and expressive as you like.",
    output: "Predicts your emotions, computes VAD scores, generates a unique piece of art reflecting your state, and writes an interpretive description of it.",
    tech: "Python on Colab GPU. Fine-tuned BERT on GoEmotions with SBERT (all-MiniLM-L6-v2) for multi-label emotion classification, trained on GoEmotions + EmpatheticDialogues + DailyDialog and enriched with the NRC-VAD lexicon. Emotion prompts feed Stable Diffusion XL via diffusers; LLM-generated poetic interpretations cap each generated piece.",
    links: [{ label: "Source ↗", url: "https://github.com/Sajiiidddd/emotion-to-art", ghost: true }],
  },
  {
    id: "fashion", name: "Fashion Visual Search", year: "2025", code: "VISION",
    cover: "/images/fashion_visual_upscaled.jpg", video: "/videos/fashion_visual.mp4",
    line: "Content-based image similarity search",
    stack: ["CNN features", "PCA", "FAISS"],
    desc: "A content-based fashion similarity engine that finds visually similar products from an uploaded image or URL, in real time.",
    input: "Upload an image of a garment, or simply provide an image URL.",
    output: "A ranked list of visually similar fashion products with images and details.",
    tech: "Deep-learning feature extraction, PCA for dimensionality reduction, and FAISS for efficient similarity search — built to scale across large fashion datasets with real-time retrieval.",
    links: [{ label: "Source ↗", url: "https://github.com/Sajiiidddd/fashion-visual-search", ghost: true }],
  },
];

const stats = [
  { n: "01", l: "Patent — SAMIKSHA" },
  { n: "01", l: "Springer paper" },
  { n: "77+", l: "MCP tools shipped" },
  { n: "−90%", l: "Token cost (caching)" },
  { n: "150+", l: "Students mentored" },
  { n: "09", l: "Builds shipped" },
];

type ResearchItem = { status: "published" | "patent" | "archived"; badge: string; title: string; venue: string; year: string; body: string; link?: string };
const research: ResearchItem[] = [
  { status: "published", badge: "Published", title: "MCP Deep Researcher: Smart Search, Reliable Research, Strong Collaboration", venue: "Accepted · ICT4SD 2026 · Springer LNNS · Oral presentation", year: "2026",
    body: "Peer-reviewed paper on an MCP-based academic research assistant — Retrieval-Augmented Generation with adaptive similarity thresholding and modular retrieval, storage, indexing and inference components.", link: "https://drive.google.com/file/d/1w342xDIS8TA1plpcMys6CfAS76Y7Wj38/view?usp=sharing" },
  { status: "patent", badge: "Patent", title: "SAMIKSHA — AI-powered BOM Comparator", venue: "Tata Motors · IP: CIP 20251027 TML 15884 · In production across 5 CVBU departments", year: "2025",
    body: "Optimised tree-traversal comparison of vehicle BOM spreadsheets — hours/days cut to 1–2 minutes at 100% accuracy across 20+ vehicle configurations; ~10¹⁵ raw operations reduced to ~2–3 lakh per pair; projected savings of 10,40,000 SMH/year." },
  { status: "archived", badge: "Archived", title: "Picasso: A Multi-Label Emotion-to-Art Framework", venue: "Using SBERT, VAD features, and diffusion models", year: "—",
    body: "Picasso maps emotion to art with SBERT, interpretable VAD features, Stable Diffusion XL, and LLM-generated narratives. It combines DailyDialog, EmpatheticDialogues, and GoEmotions into a 45-label emotion dataset.", link: "https://drive.google.com/file/d/1iAJuH6f21keznF0YTyLzMTmY0tBVuEuf/view?usp=drive_link" },
];

type ExpItem = { org: string; role: string; range: string; now?: boolean; body: string; stats: { v: string; k: string }[] };
const experience: ExpItem[] = [
  { org: "AppZen", role: "Automation Intern \u00b7 Global Support", range: "Feb 2026 \u2014 Present", now: true,
    body: "Shipping an AI support chatbot to pre-production on an OpenAI \u2192 AWS Bedrock migration (Claude Sonnet 4.6) \u2014 hybrid GraphRAG retrieval (FAISS + BM25 + NetworkX, fused via Reciprocal Rank Fusion) across 150+ KB articles. Prompt caching cut token costs ~90%; fabrication driven 28.4% \u2192 \u226415%. Two open-source Zendesk MCP servers (77+ tools), an 8-schema Postgres backend with Row-Level Security \u2014 Docker \u2192 AWS ECR, deployed on Kubernetes (EKS) via Argo CD.",
    stats: [{ v: "77+", k: "MCP tools" }, { v: "\u221290%", k: "Token cost" }] },
  { org: "Tata Motors", role: "AIML Intern \u00b7 ECM", range: "Jul 2025 \u2014 Jan 2026",
    body: "Developed and patented SAMIKSHA (IP: CIP 20251027 TML 15884) \u2014 an AI-powered BOM Comparator adopted by ECM across CVBU, cutting comparison time from hours/days to 1\u20132 minutes at 100% accuracy across 20+ vehicle configurations. An optimised tree-traversal algorithm reduces ~10\u00b9\u2075 raw operations to ~2\u20133 lakh per BOM pair \u2014 projected to save 10,40,000 SMH/year across 5 departments.",
    stats: [{ v: "1\u20132 min", k: "Compare time" }, { v: "100%", k: "Accuracy" }] },
  { org: "GDGoC \u00b7 ADYPU", role: "AI / ML Lead", range: "Dec 2024 \u2014 Dec 2025",
    body: "Founded a 150+ member AI/ML club and walked 100+ students through CNN fundamentals and PyTorch from scratch across 7+ workshops \u2014 including an AlexNet session with 100+ RSVPs. The fastest way to master something is to teach it.",
    stats: [{ v: "150+", k: "Members" }, { v: "7+", k: "Workshops" }] },
  { org: "ADYPU", role: "B.Tech \u00b7 AI & Data Science (Minor: Robotics)", range: "2023 \u2014 2026",
    body: "B.Tech in Artificial Intelligence & Data Science with a Minor in Robotics — CGPA 8.3 (Semester 8: 9.90), graduated May 2026. Coursework across DSA, DBMS, OS, Deep Learning, NLP, Computer Vision, Robotics and LLMs.",
    stats: [{ v: "8.3", k: "CGPA" }, { v: "2026", k: "Class of" }] },
];

type Post = { slug: string; title: string; tags: string[]; readTime: number | null; createdAt: string };

const INK='rgba(236,233,225,';
function motifEngine(canvas: HTMLCanvasElement){
  const ctx=canvas.getContext('2d')!;let raf=0,t=0,id='f1',W=canvas.width,H=canvas.height;let s:Record<string,any>={};
  function sprite(pat:string[],ox:number,oy:number,px:number,a:number){ctx.fillStyle=INK+a+')';pat.forEach((row,r)=>{for(let c=0;c<row.length;c++)if(row[c]==='1')ctx.fillRect(ox+c*px,oy+r*px,px,px);});}
  function grid(){ctx.fillStyle=INK+'0.05)';for(let x=10;x<W;x+=15)for(let y=10;y<H;y+=15)ctx.fillRect(x,y,1.4,1.4);}
  const A=(x:number)=>INK+x+')';
  const CAR=['0011111000','0111111110','1111111111','0010000100'];
  function carIcon(x:number,y:number){sprite(CAR,x,y,2,0.7);}
  const SHIRT=['1100011','1111111','0111110','0111110','0111110','0011100'];
  function shirt(x:number,y:number,px:number,a:number,v?:number){ctx.fillStyle=A(a);for(let r=0;r<SHIRT.length;r++){const row=SHIRT[r];for(let c=0;c<row.length;c++){if(row[c]==='1'){if(v!==undefined&&(r+c+v)%4===0)continue;ctx.fillRect(x+c*px,y+r*px,px,px);}}}}

  const R:Record<string,()=>void>={
    f1(){
      if(!s.f){const wp=[[.12,.52],[.15,.30],[.28,.20],[.40,.30],[.50,.22],[.63,.18],[.78,.26],[.86,.42],[.80,.58],[.66,.54],[.56,.66],[.42,.72],[.30,.68],[.18,.62]];
        const pts=wp.map(p=>[p[0]*W,p[1]*H]);const segs=[];let tot=0;
        for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];const len=Math.hypot(b[0]-a[0],b[1]-a[1]);segs.push({a,b,len,acc:tot});tot+=len;}
        s.f={pts,segs,tot};}
      const {pts,segs,tot}=s.f;
      const at=(d:number)=>{d=((d%tot)+tot)%tot;for(const g of segs){if(d<=g.acc+g.len){const f=(d-g.acc)/g.len;return[g.a[0]+(g.b[0]-g.a[0])*f,g.a[1]+(g.b[1]-g.a[1])*f];}}return pts[0];};
      ctx.strokeStyle=A(0.16);ctx.lineWidth=8;ctx.lineJoin='round';ctx.beginPath();pts.forEach((p:number[],i:number)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.stroke();
      ctx.strokeStyle=A(0.5);ctx.lineWidth=1.4;ctx.setLineDash([5,7]);ctx.beginPath();pts.forEach((p:number[],i:number)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.stroke();ctx.setLineDash([]);ctx.lineWidth=1.2;
      const cars=[[170,0],[150,tot*0.16],[132,tot*0.36]];
      cars.forEach((c,i)=>{const d=t*c[0]+c[1];
        for(let k=6;k>=1;k--){const p=at(d-k*5);ctx.fillStyle=A((0.08+(6-k)/6*0.32)*(i===0?1:0.6));ctx.beginPath();ctx.arc(p[0],p[1],2.3,0,7);ctx.fill();}
        const p=at(d);ctx.fillStyle=A(i===0?1:0.62);ctx.beginPath();ctx.arc(p[0],p[1],i===0?4.2:3,0,7);ctx.fill();});
      ctx.fillStyle=A(0.55);ctx.font='10px monospace';ctx.fillText('LAP '+(40+Math.floor(t)%19)+' / 58',16,22);
      ctx.fillStyle=A(0.85);ctx.fillText('P1  VER  +0.000',16,H-28);ctx.fillStyle=A(0.45);ctx.fillText('P2  HAM  +0.182',16,H-15);
    },
    zmcp(){
      const cy=H/2,lx=W*0.10,sx=W*0.42,sw=44,sh=54,tx=W*0.70;
      ctx.fillStyle=A(0.9);ctx.beginPath();ctx.arc(lx,cy,5,0,7);ctx.fill();
      ctx.fillStyle=A(0.45);ctx.font='9px monospace';ctx.fillText('CLAUDE',lx-18,cy+22);
      ctx.strokeStyle=A(0.85);ctx.lineWidth=1.2;ctx.strokeRect(sx-sw/2,cy-sh/2,sw,sh);
      ctx.fillStyle=A(0.85);ctx.fillRect(sx-sw/2-6,cy-8,6,4);ctx.fillRect(sx-sw/2-6,cy+4,6,4);
      ctx.fillStyle=A(0.45);ctx.fillText('MCP',sx-10,cy+sh/2+14);
      for(let i=0;i<6;i++){ctx.fillStyle=A(0.4);ctx.fillRect(tx,cy-30+i*12,W*0.2,3);}
      ctx.fillStyle=A(0.45);ctx.fillText('60+ TOOLS',tx,cy+46);
      ctx.strokeStyle=A(0.22);ctx.beginPath();ctx.moveTo(lx+6,cy);ctx.lineTo(sx-sw/2-6,cy);ctx.stroke();
      ctx.beginPath();ctx.moveTo(sx+sw/2,cy);ctx.lineTo(tx-8,cy);ctx.stroke();
      const cyc=(t*0.5)%1,paused=cyc>0.78&&cyc<0.92;
      if(!paused){const off=t*120,seg1=sx-sw/2-6-(lx+6),seg2=tx-8-(sx+sw/2);
        for(let k=0;k<4;k++){const px=(off+k*26)%seg1;ctx.fillStyle=A(0.9);ctx.beginPath();ctx.arc(lx+6+px,cy,2,0,7);ctx.fill();}
        for(let k=0;k<8;k++){const px=(off*1.2+k*14)%seg2;ctx.fillStyle=A(0.7);ctx.beginPath();ctx.arc(sx+sw/2+px,cy+((k%3)-1)*8,1.8,0,7);ctx.fill();}
      }else{ctx.fillStyle=A(0.95);ctx.font='10px monospace';ctx.fillText('429 · retry-after…',sx-30,cy-sh/2-8);}
      ctx.fillStyle=A(0.4);ctx.font='9px monospace';ctx.fillText('_meta { total: 847 · api_calls: 9 }',W*0.30,H-12);
    },
    bom(){
      const cols=3,rows=6,cw=W*0.115,ch=Math.min(13,(H*0.52)/rows),top=H*0.30,lx=W*0.09,rxx=W*0.55,mism=[1,4];
      carIcon(lx,top-30);carIcon(rxx,top-30);
      ctx.fillStyle=A(0.5);ctx.font='9px monospace';ctx.fillText('VEHICLE A.xlsx',lx+24,top-22);ctx.fillText('VEHICLE B.xlsx',rxx+24,top-22);
      ctx.fillStyle=A(0.4);ctx.font='8px monospace';ctx.fillText('PART   QTY  REV',lx,top-6);ctx.fillText('PART   QTY  REV',rxx,top-6);
      const scan=Math.floor(t*1.3)%rows;
      [lx,rxx].forEach((gx,gi)=>{for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
        const x=gx+c*cw,y=top+r*ch,isScan=r===scan,isMis=mism.includes(r);
        ctx.strokeStyle=A(0.16);ctx.lineWidth=1;ctx.strokeRect(x,y,cw,ch);
        const w2=(Math.sin(r*1.7+c*0.9+gi)+1)/2;const short=isMis&&gi===1&&c===2;
        ctx.fillStyle=A(isScan?0.8:(isMis?0.6:0.32));ctx.fillRect(x+2,y+ch/2-1.5,(cw-5)*(0.4+w2*0.5)*(short?0.4:1),3);}});
      mism.forEach(r=>{const y=top+r*ch;ctx.fillStyle=A(0.95);ctx.font='12px monospace';ctx.fillText('≠',lx+cols*cw+ (rxx-lx-cols*cw)/2-4,y+ch-1);});
      const sy=top+scan*ch+ch/2;ctx.strokeStyle=A(0.65);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(lx,sy);ctx.lineTo(rxx+cols*cw,sy);ctx.stroke();ctx.setLineDash([]);
    },
    picasso(){
      const words=['JOY','CALM','AWE','RAGE','HOPE'],wi=Math.floor(t*0.4)%words.length,w=words[wi],k=Math.floor((t*5)%(w.length+5));
      ctx.fillStyle=A(0.5);ctx.font='10px monospace';ctx.fillText('EMOTION',W*0.05,H*0.40);
      ctx.fillStyle=A(0.95);ctx.font='17px monospace';ctx.fillText(w.slice(0,k),W*0.05,H*0.53);
      ctx.fillStyle=A(0.4);ctx.font='9px monospace';ctx.fillText('V '+(0.4+0.5*Math.abs(Math.sin(t))).toFixed(2),W*0.05,H*0.67);ctx.fillText('A '+(0.3+0.5*Math.abs(Math.cos(t))).toFixed(2),W*0.05,H*0.75);
      ctx.strokeStyle=A(0.45);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(W*0.30,H/2);ctx.lineTo(W*0.41,H/2);ctx.stroke();ctx.beginPath();ctx.moveTo(W*0.41,H/2);ctx.lineTo(W*0.38,H/2-3);ctx.moveTo(W*0.41,H/2);ctx.lineTo(W*0.38,H/2+3);ctx.stroke();
      const fx=W*0.46,fy=H*0.15,fw=W*0.48,fh=H*0.70;
      ctx.strokeStyle=A(0.4);ctx.strokeRect(fx,fy,fw,fh);
      if(!s.str){s.str=[];let sd=42;const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280;};for(let i=0;i<26;i++)s.str.push({x:fx+rnd()*fw,y:fy+rnd()*fh,cx:fx+rnd()*fw,cy:fy+rnd()*fh,ex:fx+rnd()*fw,ey:fy+rnd()*fh,a:0.25+rnd()*0.55});}
      ctx.save();ctx.beginPath();ctx.rect(fx,fy,fw,fh);ctx.clip();
      const cnt=Math.floor(((t*0.25)%1)*s.str.length);
      for(let i=0;i<cnt;i++){const o=s.str[i];ctx.strokeStyle=A(o.a);ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.quadraticCurveTo(o.cx,o.cy,o.ex,o.ey);ctx.stroke();}
      ctx.restore();ctx.lineWidth=1.2;
    },
    fashion(){
      const cy=H/2,qx=W*0.06,qs=Math.min(46,H*0.42);
      ctx.strokeStyle=A(0.88);ctx.lineWidth=1;ctx.strokeRect(qx,cy-qs/2,qs,qs);
      shirt(qx+qs/2-10,cy-qs/2+10,3,0.92);
      ctx.fillStyle=A(0.45);ctx.font='9px monospace';ctx.fillText('QUERY',qx,cy+qs/2+14);
      const ax=qx+qs+6;ctx.strokeStyle=A(0.4);ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ax,cy);ctx.lineTo(ax+16,cy);ctx.stroke();ctx.beginPath();ctx.moveTo(ax+16,cy);ctx.lineTo(ax+12,cy-3);ctx.moveTo(ax+16,cy);ctx.lineTo(ax+12,cy+3);ctx.stroke();
      const gx=ax+26,cols=3,rows=2,gw=(W-gx-14)/cols,gh=Math.min(42,(H*0.72)/rows),best=Math.floor(t*0.8)%(cols*rows);
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const i=r*cols+c,x=gx+c*gw,y=cy-(gh*rows+8)/2+r*(gh+8),lit=i===best;
        if(lit){ctx.fillStyle=A(0.12);ctx.fillRect(x,y,gw-8,gh);}
        ctx.strokeStyle=A(lit?0.9:0.32);ctx.lineWidth=lit?1.5:1;ctx.strokeRect(x,y,gw-8,gh);
        shirt(x+(gw-8)/2-8,y+6,2.4,lit?0.95:0.5,i+1);
        ctx.fillStyle=A(lit?0.9:0.4);ctx.font='8px monospace';ctx.fillText((0.98-i*0.06).toFixed(2),x+3,y+gh-3);}
      ctx.fillStyle=A(0.45);ctx.font='9px monospace';ctx.fillText('SIMILAR ITEMS · FAISS',gx,H-12);
    },
    sentiment(){
      if(!s.l){s.l=[];let sd=7;const rnd=()=>{sd=(sd*9301+49297)%233280;return sd/233280;};for(let i=0;i<7;i++)s.l.push({w:0.3+rnd()*0.55,s:rnd()<0.55?1:-1});}
      const lines=s.l,top=H*0.18,lh=Math.min(15,(H*0.6)/lines.length),dx=W*0.1,dw=W*0.46;
      ctx.strokeStyle=A(0.3);ctx.lineWidth=1;ctx.strokeRect(dx-6,top-8,dw+34,lines.length*lh+12);
      const scanned=Math.floor((t*0.9)%(lines.length+3));let pos=0,neg=0;
      lines.forEach((ln:{w:number;s:number},i:number)=>{const y=top+i*lh,done=i<scanned,cur=i===scanned;
        ctx.fillStyle=A(cur?0.9:(done?0.6:0.3));ctx.fillRect(dx,y,dw*ln.w,3);
        if(done){ctx.fillStyle=A(0.85);ctx.font='11px monospace';ctx.fillText(ln.s>0?'+':'−',dx+dw*ln.w+8,y+4);ln.s>0?pos++:neg++;}});
      if(scanned<lines.length){const y=top+scanned*lh;ctx.strokeStyle=A(0.65);ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(dx-6,y+1.5);ctx.lineTo(dx+dw+28,y+1.5);ctx.stroke();ctx.setLineDash([]);}
      const tx=W*0.70,mn=lines.length;ctx.fillStyle=A(0.5);ctx.font='9px monospace';ctx.fillText('POS',tx,top+8);ctx.fillText('NEG',tx,top+34);
      ctx.fillStyle=A(0.85);ctx.fillRect(tx+30,top+1,(W*0.2)*(pos/mn),8);ctx.fillStyle=A(0.45);ctx.fillRect(tx+30,top+27,(W*0.2)*(neg/mn),8);
    },
    lipnet(){
      const cy=H/2,phase=(t*0.4)%1,stage=Math.floor(phase*5);
      const ix=W*0.06,isz=Math.min(42,H*0.42);
      ctx.strokeStyle=A(stage===0?0.9:0.4);ctx.lineWidth=1;ctx.strokeRect(ix,cy-isz/2,isz,isz);
      const lcx=ix+isz/2,lcy=cy,ap=Math.abs(Math.sin(t*3))*11+2;
      ctx.strokeStyle=A(0.92);ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(lcx-13,lcy);ctx.quadraticCurveTo(lcx,lcy-ap,lcx+13,lcy);ctx.quadraticCurveTo(lcx,lcy+ap,lcx-13,lcy);ctx.stroke();ctx.lineWidth=1.2;
      ctx.fillStyle=A(0.45);ctx.font='9px monospace';ctx.fillText('LIP FRAMES',ix,cy+isz/2+14);
      ctx.strokeStyle=A(0.22);ctx.beginPath();ctx.moveTo(ix+isz,cy);ctx.lineTo(W*0.70,cy);ctx.stroke();
      const blocks=[[W*0.34,26,3],[W*0.50,19,5]];
      blocks.forEach((b,bi)=>{const bx=b[0],sz=b[1],pl=b[2],act=stage===bi+1;for(let p=pl-1;p>=0;p--){const off=p*3;ctx.strokeStyle=A(act?0.9:0.4);ctx.lineWidth=1;ctx.strokeRect(bx-sz/2+off,cy-sz/2-off,sz,sz);}});
      ctx.fillStyle=A(0.45);ctx.font='9px monospace';ctx.fillText('Conv3D · Bi-GRU · CTC',W*0.30,H-12);
      const ox=W*0.74,words=['BIN','BLUE','AT','F','TWO','NOW'],wi=Math.floor(t*0.5)%words.length,w=words[wi],k=Math.floor((t*5)%(w.length+4));
      ctx.fillStyle=A(0.4);ctx.font='9px monospace';ctx.fillText('WORD',ox,cy-18);
      ctx.fillStyle=A(0.95);ctx.font='19px monospace';ctx.fillText(w.slice(0,k),ox,cy+8);
    },
    stock(){if(!s.pts){s.pts=[];let v=H*0.5;for(let i=0;i<64;i++){v+=(Math.random()-0.5)*H*0.07;v=Math.max(H*0.22,Math.min(H*0.78,v));s.pts.push(v);}}
      const n=s.pts.length,dx=W/n,nowI=Math.floor(n*0.62),nowX=nowI*dx;
      ctx.strokeStyle=INK+'0.88)';ctx.lineWidth=1.4;ctx.beginPath();
      for(let i=0;i<=nowI;i++){const x=i*dx,y=s.pts[i];i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();ctx.lineWidth=1.2;
      ctx.strokeStyle=INK+'0.3)';ctx.setLineDash([3,4]);ctx.beginPath();ctx.moveTo(nowX,12);ctx.lineTo(nowX,H-12);ctx.stroke();
      const sy=s.pts[nowI],w=Math.sin(t)*5;
      ctx.strokeStyle=INK+'0.65)';ctx.beginPath();ctx.moveTo(nowX,sy);ctx.lineTo(W,sy-H*0.14+w);ctx.stroke();
      ctx.beginPath();ctx.moveTo(nowX,sy);ctx.lineTo(W,sy+H*0.1+w);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=INK+'0.5)';ctx.font='9px monospace';ctx.fillText('NOW',nowX+4,H-14);},
    hms(){const mid=H*0.5,scroll=t*100;ctx.strokeStyle=INK+'0.9)';ctx.lineWidth=1.6;ctx.beginPath();
      for(let x=0;x<=W;x+=2){const m=((x+scroll)%120);let y=mid;
        if(m>=22&&m<30)y=mid-Math.sin((m-22)/8*Math.PI)*H*0.05;
        else if(m>=46&&m<50)y=mid-(m-46)/4*H*0.34;
        else if(m>=50&&m<54)y=mid-H*0.34+(m-50)/4*H*0.46;
        else if(m>=54&&m<58)y=mid+H*0.12-(m-54)/4*H*0.12;
        else if(m>=70&&m<86)y=mid-Math.sin((m-70)/16*Math.PI)*H*0.08;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();ctx.lineWidth=1.2;
      ctx.fillStyle=INK+'0.55)';ctx.fillRect(W-30,16,14,4);ctx.fillRect(W-25,11,4,14);},
    space(){const INV=['00100000100','00010001000','00111111100','01101110110','11111111111','10111111101','10100000101','00011011000'];
      const px=2,aw=11*px,cols=4,rows=2,leg=Math.floor(t*3)%2?px:0;
      const gx=W*0.5-(cols*(aw+14))/2+Math.sin(t*0.8)*W*0.06,gy=24+(Math.floor(t*0.6)%3)*8;
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)sprite(INV,gx+c*(aw+14)+leg,gy+r*(8*px+10),px,0.9);
      const SHIP=['00010000','00111000','01111100','11111110'],sx=W*0.5+Math.sin(t*1.4)*W*0.26;
      sprite(SHIP,sx-8,H-22,2,1);
      const by=H-24-((t*130)%(H*0.55));ctx.fillStyle=INK+'0.95)';ctx.fillRect(sx,by,2,9);}
  };

  function frame(){t+=0.016;ctx.clearRect(0,0,W,H);grid();(R[id]||R.f1)();raf=requestAnimationFrame(frame);}
  return{
    start(pid:string){if(pid!==id||W!==canvas.width||H!==canvas.height){id=pid;W=canvas.width;H=canvas.height;s={};}if(!raf)raf=requestAnimationFrame(frame);},
    stop(){if(raf)cancelAnimationFrame(raf);raf=0;ctx.clearRect(0,0,W,H);}
  };
}

type Engine = ReturnType<typeof motifEngine>;

export default function IndexPage() {
  const [passHidden, setPassHidden] = useState(false);
  const [resFilter, setResFilter] = useState<string>("all");
  const [openRes, setOpenRes] = useState<number | null>(0);
  const [openExp, setOpenExp] = useState<number | null>(0);
  const [active, setActive] = useState<Project | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const tiltRef = useRef<HTMLDivElement | null>(null);
  const passRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const clockRef = useRef<HTMLSpanElement | null>(null);
  const expTitleRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const pvRef = useRef<HTMLDivElement | null>(null);
  const pvCanvas = useRef<HTMLCanvasElement | null>(null);
  const pvEngine = useRef<Engine | null>(null);
  const drawerCanvas = useRef<HTMLCanvasElement | null>(null);
  const pvCap = useRef<HTMLDivElement | null>(null);
  const pvOn = useRef(false);

  // cursor + clock + preview-follow
  useEffect(() => {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      if (pvOn.current && pvRef.current) { pvRef.current.style.left = e.clientX + 30 + "px"; pvRef.current.style.top = e.clientY - 20 + "px"; }
    };
    const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; if (ringRef.current) ringRef.current.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; raf = requestAnimationFrame(loop); };
    addEventListener("mousemove", move); loop();
    if (pvCanvas.current) pvEngine.current = motifEngine(pvCanvas.current);
    const tick = () => { const d = new Date(); const p = (n: number) => String(n).padStart(2, "0"); if (clockRef.current) clockRef.current.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
    tick(); const iv = setInterval(tick, 1000);
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setActive(null); };
    addEventListener("keydown", key);
    return () => { removeEventListener("mousemove", move); removeEventListener("keydown", key); cancelAnimationFrame(raf); clearInterval(iv); pvEngine.current?.stop(); };
  }, []);

  // latest writing
  useEffect(() => {
    let on = true;
    fetch("/api/blogs").then((r) => (r.ok ? r.json() : [])).then((d) => { if (on && Array.isArray(d)) setPosts(d.slice(0, 2)); }).catch(() => {});
    return () => { on = false; };
  }, []);

  // experience titles: scramble-decode EVERY time they scroll into view (replays on each reveal)
  useEffect(() => {
    const els = expTitleRefs.current.filter(Boolean) as HTMLSpanElement[];
    if (!els.length) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const visible = new WeakSet<HTMLElement>();
    const timers = new Map<HTMLElement, ReturnType<typeof setInterval>>();
    const run = (el: HTMLElement) => {
      const final = el.dataset.final || el.textContent || "";
      const existing = timers.get(el);
      if (existing) clearInterval(existing);
      if (reduce) { el.textContent = final; return; }
      const ch = "\u259a\u259e\u2591\u2592/\\<>=+*"; let f = 0;
      const iv = setInterval(() => {
        el.textContent = final.split("").map((c, k) => (k < f ? c : c === " " ? " " : ch[Math.floor(Math.random() * ch.length)])).join("");
        f += 0.6; if (f > final.length) { clearInterval(iv); timers.delete(el); el.textContent = final; }
      }, 28);
      timers.set(el, iv);
    };
    const io = new IntersectionObserver((ents) => {
      ents.forEach((e) => {
        const t = e.target as HTMLElement;
        if (e.isIntersecting && !visible.has(t)) { visible.add(t); run(t); }
        else if (!e.isIntersecting && visible.has(t)) { visible.delete(t); }
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
    return () => { io.disconnect(); timers.forEach((iv) => clearInterval(iv)); };
  }, []);

  // 3D pass tilt — only runs the rAF while the pointer is over the stage
  useEffect(() => {
    if (passHidden) return;
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, alive = false;
    const stage = passRef.current?.parentElement;
    const step = () => {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      if (tiltRef.current) tiltRef.current.style.transform = `rotateY(${cx * 16}deg) rotateX(${-cy * 16}deg)`;
      if (Math.abs(tx - cx) < 0.001 && Math.abs(ty - cy) < 0.001 && tx === 0 && ty === 0) { alive = false; return; }
      raf = requestAnimationFrame(step);
    };
    const kick = () => { if (!alive) { alive = true; raf = requestAnimationFrame(step); } };
    const onMove = (e: MouseEvent) => {
      const el = passRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      const py = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      tx = Math.max(-1, Math.min(1, px)); ty = Math.max(-1, Math.min(1, py));
      el.style.setProperty("--gx", `${50 + px * 30}%`);
      el.style.setProperty("--gy", `${40 + py * 30}%`);
      kick();
    };
    const onLeave = () => { tx = 0; ty = 0; kick(); };
    stage?.addEventListener("mousemove", onMove); stage?.addEventListener("mouseleave", onLeave);
    return () => { stage?.removeEventListener("mousemove", onMove); stage?.removeEventListener("mouseleave", onLeave); cancelAnimationFrame(raf); };
  }, [passHidden]);

  useEffect(() => {
    if (!active || !drawerCanvas.current) return;
    const cv = drawerCanvas.current; cv.width = Math.min(560, innerWidth); cv.height = 200;
    const eng = motifEngine(cv); eng.start(active.id);
    return () => eng.stop();
  }, [active]);

  const enterProj = (p: Project) => {
    pvOn.current = true;
    if (pvCap.current) pvCap.current.textContent = `${p.name} — ${p.code}`;
    pvEngine.current?.start(p.id);
    pvRef.current?.classList.add("on");
  };
  const leaveProj = () => { pvOn.current = false; pvRef.current?.classList.remove("on"); pvEngine.current?.stop(); };

  return (
    <main className={`${pixel.variable} ${mono.variable} ${grotesk.variable} ab-root`}>
      <div className="ab-grain" />
      <div className="ab-vig" />
      <div ref={dotRef} className="ab-dot" aria-hidden="true" />
      <div ref={ringRef} className="ab-ring" aria-hidden="true" />

      <nav className="ab-nav" aria-label="Primary">
        <a href="/" className="ab-navleft"><span>Sajid Tamboli</span><span className="ab-dim">AI / ML Engineer</span></a>
        <div className="ab-navlinks">
          <a href="/" className="on">About</a><a href="/projects">Work</a><a href="/blogs">Writing</a><a href="/toolkit">Toolkit</a><a href="/contact">Contact</a><a href="/recommendations">Recs</a>
        </div>
        <div className="ab-clock"><span className="ab-dim">Pune, IN</span><br /><span ref={clockRef}>--:--:--</span></div>
      </nav>


      <section className="ab-wrap ab-hero">
        <div className="ab-hleft">
          <div className="ab-eyebrow"><span className="ab-pulse" />About · Strong with the Source</div>
          <h1 className="ab-display ab-h1">SAJID<br />TAMBOLI</h1>
          <p className="ab-bio">I&apos;m an AI/ML engineer based in Pune. I don&apos;t just train models — I ship them. From a <b>patented NLP system</b> running across five factory floors to production <b>GraphRAG</b> agents serving 150+ knowledge bases, I build intelligence that holds up under real load. I also founded and taught a 150+ member AI/ML club. Strong with the Source — both the Force and open source.</p>
          <div className="ab-cta">
            <a className="ab-btn solid" href="https://drive.google.com/file/d/1dsQ68O5jGJnARZ-Iyz-LewcEGRuH9JER/view?usp=sharing" target="_blank" rel="noopener">Download résumé ↓</a>
            <button className="ab-btn ghost" onClick={() => setPassHidden(h => !h)}>{passHidden ? "Show pass ▸" : "Hide pass ✕"}</button>
          </div>
        </div>

        <div className="ab-stage">
          {!passHidden && (
            <HeroPassAgent />
          )}
        </div>
      </section>

      {/* EXPERIENCE — reverse-chronological accordion (storyboard reverted) */}
      <section className="ab-wrap ab-block">
        <div className="ab-sechead"><h2 className="ab-display">Experience</h2><span className="ab-dim ab-monoLabel">2023 → now</span></div>
        <div className="ab-explist">
          {experience.map((e, i) => (
            <div key={e.org} className={`ab-exp ${e.now ? "now" : ""} ${openExp === i ? "open" : ""}`}>
              <button className="ab-exprow" onClick={() => setOpenExp(openExp === i ? null : i)}>
                <span className="ab-exporg ab-display" data-final={e.org} ref={(el) => { expTitleRefs.current[i] = el; }}>{e.org}</span>
                <span className="ab-expmeta">{e.now && <em>● Now · </em>}<em>{e.role}</em> · {e.range}</span>
                <span className="ab-expplus">{openExp === i ? "\u2013" : "+"}</span>
              </button>
              <div className="ab-expbody"><div className="ab-expinner">
                <div className="ab-exprole">{e.role}</div>
                <p>{e.body}</p>
                <div className="ab-expstats">
                  {e.stats.map((s) => (<div key={s.k}><span className="ab-statv ab-display">{s.v}</span><span className="ab-k ab-monoLabel">{s.k}</span></div>))}
                </div>
              </div></div>
            </div>
          ))}
        </div>
      </section>

      {/* SELECTED WORK — hover shows a light static image, click opens drawer */}
      <section className="ab-wrap ab-block">
        <div className="ab-sechead"><h2 className="ab-display">Selected Work</h2><a className="ab-dim ab-monoLabel ab-link" href="/projects">All projects →</a></div>
        <div className="ab-projlist">
          {projects.map((p, i) => (
            <button key={p.id} className="ab-prow" onMouseEnter={() => enterProj(p)} onMouseLeave={leaveProj} onClick={() => setActive(p)}>
              <span className="ab-pidx">{p.patent ? "★" : String(i).padStart(2, "0")}</span>
              <span className="ab-display ab-pname2">{p.name}</span>
              <span className="ab-ptags"><span className="ab-v">{p.year}</span> · {p.code}<br />{p.stack.slice(0, 2).join(" · ")}</span>
              <span className="ab-pview">View →</span>
            </button>
          ))}
        </div>
      </section>

      {/* RESEARCH & IP */}
      <section className="ab-wrap ab-block">
        <div className="ab-sechead">
          <h2 className="ab-display">Research &amp; IP</h2>
          <div className="ab-rfilters">
            {["all", "published", "patent", "archived"].map((f) => (
              <button key={f} className={`ab-rfilter ${resFilter === f ? "on" : ""}`} onClick={() => { setResFilter(f); setOpenRes(0); }}>{f}</button>
            ))}
          </div>
        </div>
        <div className="ab-reslist">
          {research.filter((r) => resFilter === "all" || r.status === resFilter).length === 0 ? (
            <div className="ab-resempty">Nothing in the {resFilter} pile — yet.</div>
          ) : (
            research.filter((r) => resFilter === "all" || r.status === resFilter).map((r, i) => (
              <div key={r.title} className={`ab-res ${openRes === i ? "open" : ""}`}>
                <button className="ab-resrow" onClick={() => setOpenRes(openRes === i ? null : i)}>
                  <span className={`ab-rbadge ${r.status}`}>{r.badge}</span>
                  <span className="ab-display ab-restitle">{r.title}</span>
                  <span className="ab-resmeta">{r.year}</span>
                  <span className="ab-expplus">{openRes === i ? "–" : "+"}</span>
                </button>
                <div className="ab-resbody"><div className="ab-resinner">
                  <div className="ab-exprole">{r.venue}</div>
                  <p>{r.body}</p>
                  {r.link && (<a className="ab-reslink" href={r.link} target="_blank" rel="noopener">View paper ↗</a>)}
                </div></div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Impact + Now */}
      <section className="ab-wrap ab-block">
        <div className="ab-sechead"><h2 className="ab-display">Impact</h2><span className="ab-dim ab-monoLabel">by the numbers</span></div>
        <div className="ab-stats">
          {stats.map((s) => (
            <div key={s.l} className="ab-stat"><div className="ab-display ab-statn">{s.n}</div><div className="ab-statl">{s.l}</div></div>
          ))}
        </div>
        <div className="ab-now">
          <span className="ab-nowlabel"><span className="ab-pulse" />Now</span>
          <p>Shipping a production AI support agent with hybrid GraphRAG retrieval at <b>AppZen</b> — two Zendesk MCP servers, 77 tools, Docker to AWS ECR, and analytics on every citation.</p>
        </div>
      </section>

      {/* Latest writing */}
      <section className="ab-wrap ab-block">
        <div className="ab-sechead"><h2 className="ab-display">Writing</h2><a className="ab-dim ab-monoLabel ab-link" href="/blogs">All posts →</a></div>
        <div className="ab-posts">
          {posts.length === 0 ? (
            <a className="ab-postrow" href="/blogs"><span className="ab-display ab-posttitle">Read the blog →</span></a>
          ) : posts.map((b) => (
            <a key={b.slug} className="ab-postrow" href={`/blogs/${b.slug}`}>
              <span className="ab-display ab-posttitle">{b.title}</span>
              <span className="ab-postmeta">{new Date(b.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}{b.readTime ? ` · ${b.readTime} min` : ""}<br />{b.tags.slice(0, 3).join(" · ")}</span>
            </a>
          ))}
        </div>
      </section>

      {/* hover preview — static image only (no video on hover) */}
      <div ref={pvRef} className="ab-preview">
        <canvas ref={pvCanvas} width={380} height={240} />
        <div ref={pvCap} className="ab-pvcap" />
      </div>

      {/* drawer */}
      <div className={`ab-drawer ${active ? "open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }}>
        <div className="ab-panel">
          {active && (
            <>
              <button className="ab-dx" onClick={() => setActive(null)}>Close ✕</button>
              <canvas ref={drawerCanvas} className="ab-cover" />
              <div className="ab-pbody">
                <div className="ab-pcode">{active.code}</div>
                <div className="ab-display ab-ptitle">{active.name}</div>
                <div className="ab-pyr">{active.year} · {active.line}</div>
                <p className="ab-pdesc">{active.desc}</p>
                <div className="ab-seg"><div className="ab-k">Input</div><p>{active.input}</p></div>
                <div className="ab-seg"><div className="ab-k">Output</div><p>{active.output}</p></div>
                <div className="ab-seg"><div className="ab-k">Technical overview</div><p>{active.tech}</p></div>
                <div className="ab-chips">{active.stack.map(s => <span key={s} className="ab-chip">{s}</span>)}</div>
                <div className="ab-plinks">
                  {active.video && (<a className="ab-plink" href={active.video} target="_blank" rel="noopener">Watch demo ↗</a>)}
                  {active.links.map(l => l.url
                    ? (<a key={l.label} className={`ab-plink ${l.ghost ? "ghost" : ""}`} href={l.url} target="_blank" rel="noopener">{l.label}</a>)
                    : (<span key={l.label} className="ab-plink ghost" style={{ opacity: 0.8 }}>{l.label}</span>))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx global>{`
        .ab-root{position:relative;min-height:100vh;background:#0a0a0a;color:#ece9e1;overflow-x:hidden;cursor:none;
          font-family:var(--font-grotesk),sans-serif}
        .ab-display{font-family:var(--font-pixel),monospace;font-weight:400;letter-spacing:.01em}
        .ab-monoLabel,.ab-eyebrow,.ab-clock,.ab-navlinks a,.ab-navleft,.ab-expmeta,.ab-ptags,.ab-pview,.ab-pidx,.ab-k,.ab-pno,.ab-ptop,.ab-prole,.ab-pcode,.ab-pyr,.ab-chip,.ab-plink,.ab-dx{font-family:var(--font-mono),monospace}
        .ab-dim{color:#8a8a82}
        .ab-grain{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.04;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
        .ab-vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 95% at 60% 25%,transparent 55%,rgba(0,0,0,.6) 100%)}
        .ab-dot,.ab-ring{position:fixed;top:0;left:0;z-index:9999;pointer-events:none;border-radius:50%;will-change:transform}
        .ab-dot{width:5px;height:5px;background:#ece9e1;transform:translate(-50%,-50%)}
        .ab-ring{width:32px;height:32px;border:1px solid rgba(236,233,225,.35);transform:translate(-50%,-50%)}

        .ab-nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:18px 34px;mix-blend-mode:difference}
        .ab-navleft{display:flex;flex-direction:column;line-height:1.5;font-size:11px;letter-spacing:.14em;text-transform:uppercase}
        .ab-navlinks{display:flex;gap:24px}
        .ab-navlinks a{font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#8a8a82;transition:color .3s}
        .ab-navlinks a:hover,.ab-navlinks a.on{color:#ece9e1}
        .ab-clock{text-align:right;line-height:1.5;font-size:11px;letter-spacing:.14em;text-transform:uppercase}

        .ab-wrap{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:0 34px}
        .ab-bot{position:absolute;z-index:1;color:#1c1c1a;width:34px;pointer-events:none}
        .ab-bot1{top:16vh;right:14%}.ab-bot2{top:42vh;right:30%}.ab-bot3{top:30vh;left:8%}

        .ab-hero{min-height:100vh;display:grid;grid-template-columns:1fr 360px;align-items:center;gap:50px;padding-top:90px}
        .ab-eyebrow{font-size:12px;letter-spacing:.26em;text-transform:uppercase;color:#8a8a82;display:flex;align-items:center;gap:10px;margin-bottom:26px}
        .ab-pulse{width:6px;height:6px;border-radius:50%;background:#ece9e1;animation:abp 2.6s infinite}
        @keyframes abp{0%,100%{opacity:1}50%{opacity:.3}}
        .ab-h1{font-size:clamp(3rem,8vw,6.5rem);line-height:.92;margin:0}
        .ab-bio{margin-top:28px;max-width:480px;font-size:15px;line-height:1.85;color:#a7a79e;font-weight:300}
        .ab-bio b{color:#ece9e1;font-weight:500}
        .ab-cta{display:flex;gap:12px;margin-top:34px;flex-wrap:wrap}
        .ab-btn{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;padding:12px 20px;border-radius:5px;cursor:none;transition:.3s;background:none;color:#ece9e1}
        .ab-btn.solid{background:#ece9e1;color:#0a0a0a}.ab-btn.solid:hover{opacity:.82}
        .ab-btn.ghost{border:1px solid rgba(236,233,225,.18)}.ab-btn.ghost:hover{border-color:#ece9e1}

        .ab-stage{display:flex;align-items:center;justify-content:center;perspective:1300px;min-height:520px}
        .ab-tilt{transition:transform .25s cubic-bezier(.16,1,.3,1);transform-style:preserve-3d}
        .ab-float{animation:abf 6s ease-in-out infinite;transform-style:preserve-3d}
        @keyframes abf{0%,100%{transform:translateY(-8px)}50%{transform:translateY(8px)}}
        .ab-pass{position:relative;width:330px;height:520px;border-radius:18px;overflow:hidden;
          background:linear-gradient(160deg,#1a1a1e 0%,#0e0e11 55%,#08080a 100%);
          border:1px solid rgba(236,233,225,.16);box-shadow:0 40px 80px -30px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.07);transform-style:preserve-3d}
        .ab-foil{position:absolute;top:0;left:0;right:0;height:5px;background:linear-gradient(90deg,#7d7d75,#ece9e1,#9aa0a6,#ece9e1,#7d7d75);opacity:.7}
        .ab-glare{position:absolute;inset:0;pointer-events:none;mix-blend-mode:screen;opacity:.5;background:radial-gradient(380px 380px at var(--gx,30%) var(--gy,20%),rgba(255,255,255,.3),transparent 60%)}
        .ab-pad{position:relative;z-index:2;height:100%;display:flex;flex-direction:column;padding:20px 22px 18px}
        .ab-ptop{display:flex;justify-content:space-between;align-items:flex-start;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82}
        .ab-ptop b{color:#ece9e1;font-weight:500}.ab-ptop .ab-r{text-align:right}
        .ab-photo{margin-top:16px;width:100%;height:206px;border-radius:10px;object-fit:cover;filter:grayscale(1) contrast(1.05);border:1px solid rgba(236,233,225,.12)}
        .ab-pname{font-size:26px;margin-top:16px;line-height:1}
        .ab-prole{font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:#8a8a82;margin-top:8px}
        .ab-pgrid{display:grid;grid-template-columns:1fr 1fr;gap:10px 14px;margin-top:16px}
        .ab-k{color:#8a8a82;font-size:9px;letter-spacing:.14em;text-transform:uppercase}
        .ab-v{color:#ece9e1;font-size:11px;letter-spacing:.06em}
        .ab-barcode{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:14px;padding-top:16px}
        .ab-bars{height:38px;flex:1;background:repeating-linear-gradient(90deg,#ece9e1 0 1px,transparent 1px 3px,#ece9e1 3px 5px,transparent 5px 6px,#ece9e1 6px 9px,transparent 9px 11px);opacity:.85}
        .ab-pno{font-size:10px;letter-spacing:.1em;color:#8a8a82;white-space:nowrap}
        .ab-perf{position:absolute;left:0;right:0;bottom:78px;height:1px;border-top:1px dashed rgba(236,233,225,.18)}
        .ab-perf::before,.ab-perf::after{content:"";position:absolute;top:-8px;width:16px;height:16px;border-radius:50%;background:#0a0a0a}
        .ab-perf::before{left:-8px}.ab-perf::after{right:-8px}

        .ab-block{padding:90px 0 10px}
        .ab-sechead{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid rgba(236,233,225,.12);padding-bottom:16px}
        .ab-sechead h2{font-size:clamp(2rem,5vw,3.4rem);margin:0}
        .ab-monoLabel{font-size:12px;letter-spacing:.2em;text-transform:uppercase}
        .ab-link{transition:color .3s}.ab-link:hover{color:#ece9e1}

        .ab-explist{margin-top:6px}
        .ab-exp{border-bottom:1px solid rgba(236,233,225,.12)}
        .ab-exprow{width:100%;background:none;border:0;cursor:none;display:grid;grid-template-columns:1fr auto 40px;align-items:center;gap:18px;padding:26px 6px;text-align:left;color:#ece9e1;opacity:.34;transition:opacity .4s,padding .5s cubic-bezier(.16,1,.3,1)}
        .ab-exp.now .ab-exprow,.ab-exp.open .ab-exprow{opacity:1}
        .ab-exprow:hover{opacity:1;padding-left:18px}
        .ab-exporg{font-size:clamp(1.6rem,4.4vw,3rem);line-height:1}
        .ab-expmeta{font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a82}
        .ab-expmeta em{color:#ece9e1;font-style:normal}
        .ab-expplus{font-family:var(--font-mono),monospace;font-size:20px;color:#8a8a82;text-align:right}
        .ab-expbody{max-height:0;overflow:hidden;transition:max-height .55s cubic-bezier(.16,1,.3,1)}
        .ab-exp.open .ab-expbody{max-height:360px}
        .ab-expinner{padding:0 6px 30px;max-width:620px}
        .ab-exprole{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a82;margin-bottom:12px}
        .ab-expinner p{font-size:14.5px;line-height:1.8;color:#bdbdb3;font-weight:300}
        .ab-expstats{display:flex;gap:40px;margin-top:22px}
        .ab-statv{font-size:2rem;display:block}
        .ab-expstats .ab-k{margin-top:4px}

        .ab-projlist{margin-top:6px}
        .ab-prow{width:100%;text-align:left;background:none;border:0;border-bottom:1px solid rgba(236,233,225,.12);cursor:none;display:grid;grid-template-columns:44px 1fr auto 60px;gap:20px;align-items:center;padding:24px 6px;color:#ece9e1;transition:padding .5s cubic-bezier(.16,1,.3,1),opacity .4s}
        .ab-projlist:hover .ab-prow{opacity:.34}
        .ab-projlist .ab-prow:hover{opacity:1;padding-left:18px}
        .ab-pidx{font-size:11px;color:#8a8a82}
        .ab-pname2{font-size:clamp(1.3rem,3.2vw,2.2rem);line-height:1;transition:transform .5s cubic-bezier(.16,1,.3,1)}
        .ab-prow:hover .ab-pname2{transform:translateX(2px)}
        .ab-ptags{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8a8a82;text-align:right;line-height:1.9}
        .ab-pview{justify-self:end;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a8a82;opacity:0;transform:translateX(-10px);transition:.5s cubic-bezier(.16,1,.3,1)}
        .ab-prow:hover .ab-pview{opacity:1;transform:none}

        .ab-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:22px 30px;margin-top:30px}
        .ab-stat{border-top:1px solid rgba(236,233,225,.12);padding-top:14px}
        .ab-statn{font-size:clamp(2.2rem,5vw,3.4rem);line-height:1}
        .ab-statl{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82;margin-top:8px}
        .ab-now{display:flex;gap:22px;align-items:flex-start;margin-top:46px;border-top:1px solid rgba(236,233,225,.12);padding-top:22px}
        .ab-nowlabel{display:flex;align-items:center;gap:8px;font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#ece9e1;white-space:nowrap;padding-top:3px}
        .ab-now p{color:#a7a79e;font-size:15px;line-height:1.75;font-weight:300;max-width:620px;margin:0}
        .ab-now p b{color:#ece9e1;font-weight:500}
        .ab-posts{margin-top:8px}
        .ab-postrow{display:grid;grid-template-columns:1fr auto;gap:20px;align-items:center;padding:24px 6px;border-bottom:1px solid rgba(236,233,225,.12);transition:padding .5s cubic-bezier(.16,1,.3,1)}
        .ab-postrow:hover{padding-left:18px}
        .ab-posttitle{font-size:clamp(1.3rem,3vw,2rem);line-height:1.05;transition:color .3s}
        .ab-postrow:hover .ab-posttitle{color:#fff}
        .ab-postmeta{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8a8a82;text-align:right;line-height:1.8}
        .ab-rfilters{display:flex;gap:8px}
        .ab-rfilter{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a82;background:none;border:1px solid rgba(236,233,225,.12);border-radius:4px;padding:6px 10px;cursor:none;transition:.3s}
        .ab-rfilter:hover{color:#ece9e1}
        .ab-rfilter.on{color:#0a0a0a;background:#ece9e1;border-color:#ece9e1}
        .ab-reslist{margin-top:6px}
        .ab-res{border-bottom:1px solid rgba(236,233,225,.12)}
        .ab-resrow{width:100%;background:none;border:0;cursor:none;display:grid;grid-template-columns:auto 1fr auto 40px;align-items:center;gap:18px;padding:24px 6px;text-align:left;color:#ece9e1;transition:padding .5s cubic-bezier(.16,1,.3,1)}
        .ab-resrow:hover{padding-left:18px}
        .ab-rbadge{font-family:var(--font-mono),monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;border:1px solid rgba(236,233,225,.25);border-radius:3px;padding:5px 9px;white-space:nowrap}
        .ab-rbadge.published{color:#0a0a0a;background:#ece9e1;border-color:#ece9e1}
        .ab-rbadge.patent{color:#ece9e1}
        .ab-rbadge.archived{color:#8a8a82}
        .ab-restitle{font-size:clamp(1rem,2.4vw,1.5rem);line-height:1.25}
        .ab-resmeta{font-family:var(--font-mono),monospace;font-size:11px;color:#8a8a82}
        .ab-resbody{max-height:0;overflow:hidden;transition:max-height .5s cubic-bezier(.16,1,.3,1)}
        .ab-res.open .ab-resbody{max-height:280px}
        .ab-resinner{padding:0 6px 24px;max-width:640px}
        .ab-resinner p{font-size:14px;line-height:1.75;color:#bdbdb3;font-weight:300}
        .ab-resempty{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8a8a82;padding:28px 6px}
        .ab-reslink{display:inline-block;margin-top:14px;font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#ece9e1;border:1px solid rgba(236,233,225,.25);border-radius:4px;padding:8px 13px;transition:.3s}
        .ab-reslink:hover{background:#ece9e1;color:#0a0a0a;border-color:#ece9e1}

        .ab-preview{position:fixed;z-index:40;width:360px;height:230px;border-radius:6px;overflow:hidden;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.92);transition:opacity .35s,transform .35s;border:1px solid rgba(236,233,225,.12);background:#111}
        .ab-preview.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
        .ab-preview canvas{width:100%;height:100%;display:block}
        
        @keyframes abzoom{from{transform:scale(1)}to{transform:scale(1.07)}}
        .ab-pvcap{position:absolute;left:0;right:0;bottom:0;padding:14px 16px;font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.7))}

        .ab-drawer{position:fixed;inset:0;z-index:8000;display:flex;justify-content:flex-end;background:rgba(8,8,8,.62);opacity:0;pointer-events:none;transition:opacity .4s}
        .ab-drawer.open{opacity:1;pointer-events:auto}
        .ab-panel{width:min(640px,100%);height:100%;overflow-y:auto;background:#0c0c0b;border-left:1px solid rgba(236,233,225,.12);transform:translateX(60px);transition:transform .45s cubic-bezier(.16,1,.3,1)}
        .ab-drawer.open .ab-panel{transform:none}
        .ab-cover{width:100%;height:200px;display:block;background:#0c0c0c;border-bottom:1px solid rgba(236,233,225,.12)}
        .ab-dx{position:absolute;top:22px;right:24px;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.2);border-radius:4px;padding:8px 13px;cursor:none}
        .ab-dx:hover{background:#fff;color:#000}
        .ab-pbody{padding:34px 50px 80px}
        .ab-pcode{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8a8a82}
        .ab-ptitle{font-size:clamp(1.8rem,5vw,2.6rem);margin:8px 0 4px;line-height:1.04}
        .ab-pyr{font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:#8a8a82}
        .ab-pdesc{margin:20px 0 4px;color:#d2d2c8;font-size:16px;line-height:1.7;font-weight:300}
        .ab-seg{margin-top:26px;border-top:1px solid rgba(236,233,225,.12);padding-top:16px}
        .ab-seg .ab-k{margin-bottom:8px;font-size:11px;letter-spacing:.18em}
        .ab-seg p{color:#bdbdb3;font-size:14px;line-height:1.75;font-weight:300}
        .ab-chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
        .ab-chip{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#b3b3a9;border:1px solid rgba(236,233,225,.12);border-radius:4px;padding:5px 11px}
        .ab-plinks{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}
        .ab-plink{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#0a0a0a;background:#ece9e1;border-radius:4px;padding:11px 18px;cursor:none;transition:opacity .3s}
        .ab-plink.ghost{background:none;color:#ece9e1;border:1px solid rgba(236,233,225,.12)}
        .ab-plink:hover{opacity:.82}

        @media(max-width:900px){
          .ab-nav{padding:12px 18px;flex-wrap:wrap;gap:4px 14px}.ab-navlinks{display:flex;flex-wrap:wrap;gap:14px;width:100%;order:3}.ab-clock{display:none}.ab-wrap{padding:0 18px}
          .ab-hero{grid-template-columns:1fr;gap:46px;padding-top:120px}.ab-stage{order:-1;min-height:430px}
          .ab-pass{width:300px;height:474px}
          .ab-stats{grid-template-columns:repeat(2,1fr)}.ab-now{flex-direction:column;gap:10px}.ab-postmeta{display:none}
          .ab-resrow{grid-template-columns:auto 1fr 30px}.ab-resmeta{display:none}
          .ab-prow{grid-template-columns:30px 1fr}.ab-ptags{grid-column:2;text-align:left;margin-top:6px}.ab-pview{display:none}
          .ab-preview{display:none}.ab-pbody{padding:28px 24px 70px}
          .ab-root{cursor:auto}.ab-dot,.ab-ring{display:none}
        }
      `}</style>
    </main>
  );
}
