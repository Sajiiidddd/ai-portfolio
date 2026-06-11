"use client";

import { useEffect, useRef, useState } from "react";
import { pixel, mono, grotesk } from "@/app/fonts";

type Link = { label: string; url: string; ghost?: boolean };
type Project = { id:string; name:string; year:string; code:string; star?:boolean; video?:string; line:string; stack:string[]; desc:string; input:string; output:string; tech:string; links:Link[] };

const projects: Project[] = [
  { id:"f1", name:"F1 Strategy OS", year:"2026", code:"ML · LIVE",
    line:"Real-time F1 race-strategy prediction engine", stack:["Transformer · PyTorch","FastF1","Optuna","Next.js","Gemini 1.5 Pro"],
    desc:"A real-time AI prediction engine that translates complex Formula 1 telemetry into actionable race strategy — forecasting the finishing grid lap-by-lap.",
    input:"A race session (e.g. 2021 Abu Dhabi), a lap number, and optional sim params like rain or track-temp overrides.",
    output:"A live leaderboard predicting every driver's final position (92% podium accuracy), a 'Delta' vs. actual, and an AI strategy debrief.",
    tech:"A 64-dimension Transformer (PyTorch) trained on 5 years of FastF1 telemetry, Optuna-tuned to <45ms CPU inference on HF Spaces. A Next.js dashboard consumes it via the Gradio Client API with Gemini reading 'Chaos Factors' like Safety Cars.",
    links:[{label:"View live ↗",url:"https://f1-strategy-dashboard.vercel.app"},{label:"Source",url:"https://github.com/Sajiiidddd/F1-Prediction",ghost:true},{label:"Model",url:"https://huggingface.co/spaces/Susjid/F1-Neural-Strategist-API",ghost:true}] },
  { id:"zmcp", name:"Zendesk MCP Server", year:"2026", code:"MCP · OPEN SOURCE",
    line:"60+ tool Zendesk MCP — no official one exists",
    stack:["Python","MCP","httpx · asyncio","Zendesk API","Guard-rails"],
    desc:"There is no official Zendesk MCP connector — so I built one. An open-source MCP server connecting Claude to any Zendesk instance with 60+ tools (tickets, users, macros, triggers, SLAs, Help Center), engineered with production guard-rails throughout. MIT-licensed and installable in one command — uvx zendesk-mcp. A 17-tool docs-team sibling server ships alongside it.",
    input:"Natural-language requests from Claude — list, search, create and update across tickets, users, macros, triggers, SLAs and Help Center.",
    output:"Structured tool results with a _meta block ({ total, api_calls }) — fully paginated, rate-limit-safe, never a crashed tool call.",
    tech:"Production guard-rails by design: one pooled httpx.AsyncClient reused for the process lifetime (no per-request TCP/TLS), a pre-computed auth header, 429-aware retry honouring Retry-After (up to ×5), and a proactive sleep cycle every ~100 calls that protects the shared rate-limit budget across concurrent agents. Auto-pagination fires remaining pages concurrently in batches of 8; a 1-hour TTL cache holds the field schema; composite tools like get_ticket_full gather ticket + comments + metrics via asyncio.gather — one response, two round trips saved. Ships with stdio + SSE transports, human-readable custom-field decoding, and a raw_api_call escape hatch.",
    links:[{label:"Source ↗",url:"https://github.com/Sajiiidddd/zendesk-mcp"},{label:"Docs server",url:"https://github.com/Sajiiidddd/zendesk-mcp-docs",ghost:true}] },
  { id:"bom", name:"BOM Comparator", year:"2025", code:"NLP · PATENTED", star:true,
    line:"Diffs vehicle BOM spreadsheets · patented", stack:["NLP","Azure","SAP","Excel"],
    desc:"SAMIKSHA (IP: CIP 20251027 TML 15884) — a patented NLP-powered comparator that diffs vehicle BOM spreadsheets at Tata Motors, in production across five CVBU departments. Classroom models to the factory floor.",
    input:"Vehicle BOM Excel sheets across variants — 60,000–70,000-part TPL files of components, quantities and revisions.",
    output:"Part-level difference detection between vehicle BOMs — hours/days cut to 1–2 minutes at 100% accuracy across 20+ vehicle configurations.",
    tech:"An optimised tree-traversal pipeline (~10¹⁵ raw ops reduced to ~2–3 lakh per pair) integrated with SAP, deployed on Azure via FastAPI — projected to save 10,40,000 SMH/year. Three sibling tools in active ECM/Finance use.",
    links:[{label:"Patented build",url:""}] },
  { id:"picasso", name:"Picasso — Inner Echoes", year:"2025", code:"GENERATIVE", video:"/videos/Picasso.mp4",
    line:"Emotions → generative art (multi-modal)", stack:["Sentence-BERT","NRC-VAD","Stable Diffusion XL","PyTorch"],
    desc:"A multi-modal AI that translates human emotions — from text, voice and facial cues — into personalized generative art.",
    input:"Your emotions as text, voice or facial cues — as raw and expressive as you like.",
    output:"Predicts your emotions, computes VAD scores, generates a unique piece of art, and writes an interpretive description.",
    tech:"Fine-tuned BERT on GoEmotions with SBERT (all-MiniLM-L6-v2) for multi-label emotion classification on GoEmotions + EmpatheticDialogues + DailyDialog + NRC-VAD; prompts feed Stable Diffusion XL; LLM-generated poetic interpretations cap each piece.",
    links:[{label:"Source ↗",url:"https://github.com/Sajiiidddd/emotion-to-art",ghost:true}] },
  { id:"fashion", name:"Fashion Visual Search", year:"2025", code:"VISION", video:"/videos/fashion_visual.mp4",
    line:"Content-based image similarity search", stack:["CNN features","PCA","FAISS"],
    desc:"A content-based fashion similarity engine that finds visually similar products from an uploaded image or URL, in real time.",
    input:"Upload an image of a garment, or provide an image URL.", output:"A ranked list of visually similar fashion products with images and details.",
    tech:"Deep-learning feature extraction, PCA for dimensionality reduction, and FAISS for similarity search — built to scale across large datasets with real-time retrieval.",
    links:[{label:"Source ↗",url:"https://github.com/Sajiiidddd/fashion-visual-search",ghost:true}] },
  { id:"lipnet", name:"LipNet — Lip Reading", year:"2024", code:"DEEP LEARNING", video:"/videos/lipnet.mp4",
    line:"End-to-end sentence-level lip reading", stack:["Conv3D","Bi-GRU","CTC","TensorFlow"],
    desc:"A replication and enhancement of the LipNet architecture — reading lips at the sentence level with spatiotemporal convolutions, Bi-GRU layers and CTC loss.",
    input:"Grayscale lip-region frames (100×50), augmented with flipping, frame deletion and word segmentation from the GRID Corpus.",
    output:"Predicted sentences from lip movement — 90% accuracy across 1,001 clips — plus saliency maps and confusion matrices over visemes.",
    tech:"TensorFlow + OpenCV. Conv3D for spatio-temporal features, Bi-GRUs for sequence, CTC decoding — with augmentation, dropout, saliency viz and viseme clustering.",
    links:[{label:"Source ↗",url:"https://github.com/Sajiiidddd",ghost:true}] },
  { id:"sentiment", name:"Sentiment Analysis", year:"2024", code:"NLP PIPELINE", video:"/videos/sent_analysis.mp4",
    line:"Web-article sentiment & readability", stack:["BeautifulSoup","NLTK","TextBlob","openpyxl"],
    desc:"A pipeline that scrapes web articles and scores sentiment, subjectivity, readability (Fog Index) and word complexity into a structured Excel report.",
    input:"An Excel file of article URLs and optional word lists for customizing the scoring.", output:"An Excel report with polarity, subjectivity, word counts, Fog Index and complex-word ratios.",
    tech:"Python with BeautifulSoup, NLTK, TextBlob and openpyxl — supported by word lists and stopword filtering.",
    links:[{label:"Source ↗",url:"https://github.com/Sajiiidddd/Sentimental-Analysis",ghost:true}] },
  { id:"stock", name:"Stock Forecasting", year:"2024", code:"TIME SERIES", video:"/videos/stock_market.mp4",
    line:"ARIMA vs XGBoost on Indian equities", stack:["ARIMA","XGBoost","Dask","statsmodels"],
    desc:"Forecasting stock prices with ARIMA and XGBoost — comparing classical time-series modeling against gradient boosting on major Indian stocks.",
    input:"Historical OHLC + volume via the Yahoo Finance API — specify symbols and a time range.", output:"RMSE / MAE / MAPE metrics and predictive plots per stock, showing XGBoost outperforming ARIMA.",
    tech:"yfinance, pandas, Dask, statsmodels, xgboost, scikit-learn. ARIMA tuned via ACF/PACF; XGBoost fed engineered lag and rolling features.",
    links:[{label:"Source ↗",url:"https://github.com/Sajiiidddd/-Stock-Analysis-using-ARIMA-and-XGBOOST",ghost:true}] },
  { id:"hms", name:"MedLink — HMS", year:"2024", code:"FULL-STACK", video:"/videos/hms.mp4",
    line:"Centralized hospital management system", stack:["PHP 8","MySQL","DOMPDF"],
    desc:"A centralized Hospital Management System built for the Smart India Hackathon — digitizing healthcare workflows, connecting patients, doctors and departments through one secure, role-based platform.",
    input:"Patient information, appointment schedules, diagnostic details and staff entries under role-based access.",
    output:"Auto-generated PDF medical reports, patient-history views, appointment tracking, departmental analytics.",
    tech:"PHP 8 + MySQL + DOMPDF, modular with role-based access. Cut record-retrieval time 40%, lowered data errors 30%, improved trend-analysis 25%.",
    links:[{label:"Source ↗",url:"https://github.com/Sajiiidddd",ghost:true}] },
  { id:"space", name:"Space Invaders", year:"2023", code:"WHERE IT BEGAN", video:"/videos/space_invaders.mp4",
    line:"The first project — Python · Pygame", stack:["Python","Pygame","OOP"],
    desc:"The first-ever project that sparked the whole journey — a Space Invaders clone in Python and Pygame.",
    input:"Furious arrow-key presses to move the ship and aggressive spacebar hits to fire lasers.",
    output:"Exploding enemy ships, flashing lasers, rising scores, and the occasional 'Game Over'. Chaos — and fun.",
    tech:"Python with Pygame around a main loop. OOP for player, enemy and laser classes, real-time rendering, keyboard events and collision detection.",
    links:[{label:"Source ↗",url:"https://github.com/Sajiiidddd",ghost:true}] },
];

const BOT_PATH = "M3 1h10v2h-2v2h2v7H3V5h2V3H3zM5 7h2v2H5zm4 0h2v2H9zM2 13h2v3H2zm10 0h2v3h-2zM6 13h4v1H6z";

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

export default function ProjectsPage() {
  const [hovered, setHovered] = useState<Project | null>(null);
  const [active, setActive] = useState<Project | null>(null);

  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const clockRef = useRef<HTMLSpanElement | null>(null);
  const pvRef = useRef<HTMLDivElement | null>(null);
  const pvCanvas = useRef<HTMLCanvasElement | null>(null);
  const pvEngine = useRef<Engine | null>(null);
  const drawerCanvas = useRef<HTMLCanvasElement | null>(null);
  const hoveredRef = useRef<Project | null>(null);

  const hot = () => ringRef.current?.classList.add("hot");
  const cold = () => ringRef.current?.classList.remove("hot");

  useEffect(() => {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my, raf = 0;
    const move = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
      const p = pvRef.current;
      if (p && hoveredRef.current) { p.style.left = (e.clientX + 30) + "px"; p.style.top = (e.clientY - 20) + "px"; }
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

  useEffect(() => {
    hoveredRef.current = hovered;
    if (hovered) { pvEngine.current?.start(hovered.id); pvRef.current?.classList.add("on"); }
    else { pvRef.current?.classList.remove("on"); pvEngine.current?.stop(); }
  }, [hovered]);

  useEffect(() => {
    if (!active || !drawerCanvas.current) return;
    const cv = drawerCanvas.current; cv.width = Math.min(640, innerWidth); cv.height = 220;
    const eng = motifEngine(cv); eng.start(active.id);
    return () => eng.stop();
  }, [active]);

  return (
    <main className={`${pixel.variable} ${mono.variable} ${grotesk.variable} root`}>
      <div className="vig" />
      <div ref={dotRef} className="dot" />
      <div ref={ringRef} className="ring" />

      <nav>
        <a href="/" className="mono l" onMouseEnter={hot} onMouseLeave={cold}><span>Sajid Tamboli</span><span className="dim">AI / ML Engineer</span></a>
        <div className="links mono">
          <a href="/" onMouseEnter={hot} onMouseLeave={cold}>About</a>
          <a href="/projects" className="on" onMouseEnter={hot} onMouseLeave={cold}>Work</a>
          <a href="/blogs" onMouseEnter={hot} onMouseLeave={cold}>Writing</a>
          <a href="/toolkit" onMouseEnter={hot} onMouseLeave={cold}>Toolkit</a>
          <a href="/contact" onMouseEnter={hot} onMouseLeave={cold}>Contact</a>
          <a href="/recommendations" onMouseEnter={hot} onMouseLeave={cold}>Recs</a>
        </div>
        <div className="clock mono"><span className="dim">Pune, IN</span><br /><span ref={clockRef}>--:--:--</span></div>
      </nav>

      <div className="wrap">
        <header>
          <svg className="bot bot1" viewBox="0 0 16 18" shapeRendering="crispEdges"><path fill="currentColor" d={BOT_PATH} /></svg>
          <svg className="bot bot2" viewBox="0 0 16 18" shapeRendering="crispEdges"><path fill="currentColor" d={BOT_PATH} /></svg>
          <div className="eyebrow"><span className="pulse" />Build logs · 2023 → 2026</div>
          <h1>PROJECTS</h1>
          <p className="lede">Nine builds across machine learning, NLP and full-stack systems — from a patented production engine to a first lone game of Space Invaders. Hover a row for a live readout, click to open the full case study.</p>
        </header>

        <div className="sechead"><h2>The Index</h2><span className="c">{String(projects.length).padStart(2, "0")}</span></div>
        <div className="list">
          {projects.map((p, i) => (
            <button key={p.id} className={`row ${p.star ? "star" : ""}`}
              onMouseEnter={() => { setHovered(p); hot(); }}
              onMouseLeave={() => { setHovered(null); cold(); }}
              onClick={() => setActive(p)}>
              <span className="idx">{p.star ? "★" : String(i).padStart(2, "0")}</span>
              <span className="name">{p.name}</span>
              <span className="meta"><span className="y">{p.year}</span> · {p.code}<br />{p.stack.slice(0, 2).join(" · ")}</span>
              <span className="view">Open →</span>
            </button>
          ))}
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
          <div className="foot-base"><span>© 2026 Sajid Tamboli</span><span className="wink">trust the model — verify with a confusion matrix.</span><span>Pune, India</span></div>
        </footer>

      </div>

      <div ref={pvRef} className="preview">
        <canvas ref={pvCanvas} width={380} height={240} />
        <svg className="pbot" viewBox="0 0 16 18" shapeRendering="crispEdges"><path fill="currentColor" d={BOT_PATH} /></svg>
        <div className="cap"><b>{hovered?.name}</b><span>{hovered?.code}</span></div>
      </div>

      <div className={`drawer ${active ? "open" : ""}`} onClick={(e) => { if (e.target === e.currentTarget) setActive(null); }}>
        <div className="panel">
          {active && (
            <>
              <div className="cover"><button className="dx" onClick={() => setActive(null)} onMouseEnter={hot} onMouseLeave={cold}>Close ✕</button><canvas ref={drawerCanvas} /></div>
              <div className="pbody">
                <div className="pcode">{active.code}</div>
                <div className="ptitle">{active.name}</div>
                <div className="pyr">{active.year} · {active.line}</div>
                <p className="pdesc">{active.desc}</p>
                <div className="seg"><div className="k">Input</div><p>{active.input}</p></div>
                <div className="seg"><div className="k">Output</div><p>{active.output}</p></div>
                <div className="seg"><div className="k">Technical overview</div><p>{active.tech}</p></div>
                <div className="chips">{active.stack.map((sx) => <span key={sx} className="chip">{sx}</span>)}</div>
                <div className="plinks">
                  {active.video && <a className="plink" href={active.video} target="_blank" rel="noopener" onMouseEnter={hot} onMouseLeave={cold}>Watch demo ↗</a>}
                  {active.links.map((l) => l.url
                    ? <a key={l.label} className={`plink ${l.ghost ? "ghost" : ""}`} href={l.url} target="_blank" rel="noopener" onMouseEnter={hot} onMouseLeave={cold}>{l.label}</a>
                    : <span key={l.label} className="plink ghost" style={{ opacity: 0.8 }}>{l.label}</span>)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .root{position:relative;min-height:100vh;background:#0a0a0a;color:#ece9e1;font-family:var(--font-grotesk),sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden;cursor:none;
          --ink:#ece9e1;--muted:#8a8a82;--faint:#3a3a36;--line:rgba(236,233,225,.12);--pixel:var(--font-pixel),monospace;--mono:var(--font-mono),monospace;--ease:cubic-bezier(.16,1,.3,1)}
        .mono{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase}.dim{color:var(--muted)}
        .vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 95% at 60% 20%,transparent 55%,rgba(0,0,0,.6) 100%)}
        .dot,.ring{position:fixed;top:0;left:0;z-index:9999;pointer-events:none;border-radius:50%;will-change:transform}
        .dot{width:5px;height:5px;background:var(--ink);transform:translate(-50%,-50%)}
        .ring{width:32px;height:32px;border:1px solid rgba(236,233,225,.35);transform:translate(-50%,-50%);transition:width .25s var(--ease),height .25s var(--ease)}
        .ring.hot{width:56px;height:56px;border-color:rgba(236,233,225,.85)}
        nav{position:fixed;top:0;left:0;right:0;z-index:50;display:flex;align-items:center;justify-content:space-between;padding:18px 34px;mix-blend-mode:difference}
        nav .l{display:flex;flex-direction:column;line-height:1.5}
        nav .links{display:flex;gap:24px}nav .links a{color:var(--muted);transition:color .3s}nav .links a:hover,nav .links a.on{color:var(--ink)}
        nav .clock{text-align:right;line-height:1.5}
        .wrap{position:relative;z-index:2;max-width:1180px;margin:0 auto;padding:0 34px}
        .bot{position:absolute;z-index:1;color:#1f1f1c;width:30px;pointer-events:none}
        .bot1{top:14vh;right:8%}.bot2{top:30vh;right:22%}
        header{padding:150px 0 26px;position:relative}
        .eyebrow{font-family:var(--mono);font-size:12px;letter-spacing:.28em;text-transform:uppercase;color:var(--muted);margin-bottom:18px;display:flex;gap:10px;align-items:center}
        .pulse{width:6px;height:6px;border-radius:50%;background:var(--ink);animation:pp 2.6s infinite}@keyframes pp{0%,100%{opacity:1}50%{opacity:.3}}
        h1{font-family:var(--pixel);font-size:clamp(3.4rem,12vw,9rem);line-height:.9;letter-spacing:.01em;margin:0}
        .lede{margin-top:22px;max-width:520px;font-size:15px;line-height:1.8;color:#a7a79e;font-weight:300}
        .sechead{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--line);padding:60px 0 14px}
        .sechead h2{font-family:var(--mono);font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:var(--muted);font-weight:500;margin:0}
        .sechead .c{font-family:var(--mono);font-size:12px;color:var(--ink)}
        .row{width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);cursor:none;display:grid;grid-template-columns:54px 1fr auto 64px;gap:22px;align-items:center;padding:30px 6px;color:var(--ink);transition:padding .55s var(--ease),opacity .4s}
        .list:hover .row{opacity:.3}.list .row:hover{opacity:1;padding-left:24px}
        .row .idx{font-family:var(--mono);font-size:12px;color:var(--muted)}
        .row .name{font-family:var(--pixel);font-size:clamp(1.5rem,4vw,2.9rem);line-height:1;transition:transform .55s var(--ease)}
        .row:hover .name{transform:translateX(3px)}
        .row .meta{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);text-align:right;line-height:1.9}
        .row .meta .y{color:var(--ink)}
        .row .view{justify-self:end;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);opacity:0;transform:translateX(-10px);transition:.55s var(--ease)}
        .row:hover .view{opacity:1;transform:none}
        .row.star .name{color:var(--ink)}
        .preview{position:fixed;z-index:40;width:380px;height:240px;border-radius:6px;overflow:hidden;pointer-events:none;opacity:0;transform:translate(-50%,-50%) scale(.92);transition:opacity .35s var(--ease),transform .35s var(--ease);border:1px solid var(--line);background:#0c0c0c}
        .preview.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
        .preview canvas{display:block;width:100%;height:100%}
        .preview .cap{position:absolute;left:0;right:0;bottom:0;display:flex;justify-content:space-between;align-items:flex-end;padding:12px 14px;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.55))}
        .preview .cap b{font-family:var(--pixel);font-size:15px;letter-spacing:0;text-transform:none}
        .preview .pbot{position:absolute;top:12px;right:12px;width:22px;color:rgba(236,233,225,.6)}
        footer{padding:90px 0 30px;border-top:1px solid var(--line);margin-top:80px}
        .cta{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:24px}
        .ctabtn{background:var(--ink);color:#0a0a0a;font-family:var(--pixel);font-size:clamp(1.4rem,3.4vw,2.4rem);padding:18px 34px;display:inline-flex;align-items:center;gap:14px;cursor:none;transition:transform .25s var(--ease)}
        .ctabtn:hover{transform:translate(-2px,-2px)}
        .socials{display:flex;gap:20px}.socials a{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);transition:color .3s}.socials a:hover{color:var(--ink)}
        .foot-base{display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;margin-top:54px;font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--faint)}
        .wink{font-family:var(--font-grotesk),sans-serif;font-style:italic;font-size:13px;color:var(--muted);text-transform:none;letter-spacing:0}
        .footnav{position:relative;z-index:2}
        .drawer{position:fixed;inset:0;z-index:8000;display:flex;justify-content:flex-end;background:rgba(8,8,8,.62);opacity:0;pointer-events:none;transition:opacity .4s}
        .drawer.open{opacity:1;pointer-events:auto}
        .panel{width:min(640px,100%);height:100%;overflow-y:auto;background:#0c0c0b;border-left:1px solid var(--line);transform:translateX(60px);transition:transform .45s var(--ease)}
        .drawer.open .panel{transform:none}
        .cover{position:relative;width:100%;height:220px;background:#0c0c0c;border-bottom:1px solid var(--line)}
        .cover canvas{display:block;width:100%;height:100%}
        .dx{position:absolute;top:18px;right:18px;font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#fff;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.2);border-radius:4px;padding:8px 13px;cursor:none;z-index:2}
        .dx:hover{background:#fff;color:#000}
        .pbody{padding:32px 50px 80px}
        .pcode{font-family:var(--mono);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted)}
        .ptitle{font-family:var(--pixel);font-size:clamp(1.9rem,5vw,2.8rem);margin:10px 0 4px;line-height:1}
        .pyr{font-family:var(--mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
        .pdesc{margin:20px 0 4px;color:#d2d2c8;font-size:16px;line-height:1.7;font-weight:300}
        .seg{margin-top:26px;border-top:1px solid var(--line);padding-top:16px}
        .seg .k{font-family:var(--mono);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-bottom:8px}
        .seg p{color:#bdbdb3;font-size:14px;line-height:1.75;font-weight:300}
        .chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
        .chip{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#b3b3a9;border:1px solid var(--line);border-radius:4px;padding:5px 11px}
        .plinks{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}
        .plink{font-family:var(--mono);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#0a0a0a;background:var(--ink);border-radius:4px;padding:11px 18px;cursor:none;transition:opacity .3s;text-decoration:none}
        .plink.ghost{background:none;color:var(--ink);border:1px solid var(--line)}.plink:hover{opacity:.82}
        @media(max-width:860px){
          nav{padding:14px 18px}nav .links{display:none}.wrap{padding:0 18px}.preview{display:none}
          .row{grid-template-columns:30px 1fr}.row .meta{grid-column:2;text-align:left;margin-top:6px}.row .view{display:none}
          .pbody{padding:26px 22px 70px}.cta{flex-direction:column;align-items:flex-start}
          .root{cursor:auto}.dot,.ring{display:none}
        }
      `}</style>
    </main>
  );
}
