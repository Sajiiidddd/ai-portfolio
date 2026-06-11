# Sajid Tamboli — Résumé (authoritative source of truth)

Contact: Pune 411016, India · +91 9922123867 · tambolisajid65@gmail.com · GitHub @Sajiiidddd · LinkedIn sajid-tamboli.

## Education
Ajeenkya DY Patil School of Engineering, Lohegaon, Pune. B.Tech in Artificial Intelligence & Data Science, Minor in Robotics. Graduated June 2026. CGPA 8.26; Semester 8 GPA 9.90. Coursework: DSA, DBMS (SQL), OS, Deep Learning, NLP, Computer Vision, Robotics, Data Science, LLMs.

## Experience

### AppZen — Automation Intern, Global Support (Feb 2026 – Present), Pune
- Shipped an AI support chatbot to pre-production (RCST; production go-live in progress) as part of an OpenAI → AWS Bedrock migration (Claude Sonnet 4.6) for legal/governance compliance.
- Hybrid GraphRAG retrieval: FAISS vector + BM25 keyword + NetworkX graph BFS fused via Reciprocal Rank Fusion (RRF) across 150+ KB articles. SSE token streaming; prompt caching for ~90% token-cost reduction; a citation contract drove bot fabrication from 28.4% toward ≤15% on a 219-pair real-ticket benchmark.
- Built and deployed two Zendesk MCP servers: a 17-tool docs-team server (ticket reads + Help Center draft/publish) and a 60+ tool full-power server (tickets, users, macros, triggers, SLAs, CSAT, webhooks + raw API escape hatch). Auto-pagination, rate-limit handling, HMAC webhook verification, and an incremental KB pipeline that hot-reloads the graph without a service restart.
- Designed an 8-schema PostgreSQL backend: range-partitioned messages, 15 pg_cron-refreshed materialized views, pg_trgm GIN indexes, multi-tenant RESTRICTIVE Row-Level Security + a BYPASSRLS admin pool for org isolation. Resolved 20 code-level security vulnerabilities (helmet CSP/HSTS, DOMPurify, timing-safe comparisons, SHA-256 pickle integrity, CORS suffix allowlist). Containerised Node.js + Python FastAPI via Docker Compose, shipped to AWS ECR, deployed on Kubernetes (EKS) via Argo CD GitOps.

### Tata Motors Limited — AIML Intern, Engineering Change Management (Jul 2025 – Jan 2026), Pune
- Developed and patented SAMIKSHA (IP: CIP 20251027 TML 15884), an AI-powered BOM Comparator adopted by the ECM team across CVBU, Pune — reducing BOM comparison from hours/days to 1–2 minutes, validated to 100% accuracy across 20+ vehicle configurations.
- Optimised tree-traversal algorithm reducing ~10^15 raw operations to ~2–3 lakh comparisons per BOM pair; handles 60,000–70,000-part TPL files; projected to save 10,40,000 SMH/year across 5 departments and 5,200 annual VCs.
- Deployed on Azure (Docker, AI Studio, Blob Storage) via FastAPI. Built 3 more automation tools in active ECM/Finance use: a Hex-to-Tri compliance report, a BOM restructuring tool, and a costing report generator.

## Leadership
Google Developers Group on Campus – ADYPU, AIML Lead (Dec 2024 – Dec 2025), Pune. Founded and led a 150+ member ML club bridging academic ML papers with hands-on coding. AlexNet session (100+ RSVPs): CNN fundamentals, GPU usage, ReLU, hands-on PyTorch image-classification lab. Regression vs Neural Networks workshop: 2-day session on preprocessing, EDA, gradient descent, house-price prediction.

## Publications
"MCP Deep Researcher: Smart Search, Reliable Research, Strong Collaboration" — accepted at ICT4SD 2026 (oral presentation + Springer LNNS publication). MCP-based academic research assistant using Retrieval-Augmented Generation, adaptive similarity thresholding, and modular retrieval/storage/indexing/inference components.

## Projects
- StrategyOS — Real-Time F1 Race Strategy Engine (PyTorch, Optuna, Next.js, FastAPI), Jan 2026. 10-lap sliding-window Transformer, 92% podium-prediction accuracy; Optuna-tuned to a 64-dim model with <45ms CPU inference. Headless FastAPI backend on HuggingFace Spaces + Next.js dashboard on Vercel; Gemini 1.5 Pro detects "Chaos Factors" (e.g., Safety Cars), flagging 100% of physics-model anomalies.
- Picasso — Emotion-to-Art Generator (PyTorch, BERT, SBERT, Stable Diffusion), Apr 2025. Multimodal pipeline detecting emotion from text/voice/facial cues to generate art via Stable Diffusion. Fine-tuned BERT on GoEmotions; SBERT on EmpatheticDialogues + NRC VAD Lexicon; adaptive feedback loops; GPT-based poetic interpretations.
- Lip Reading Deep Learning Model (Python, TensorFlow, OpenCV, NumPy), Apr 2024. Custom 3D-CNN + Bi-GRU inspired by LipNet; 1,001 clips (4–8s), 90% accuracy on a 50:50 split; modular Colab pipeline.

## Technical skills
- Languages: Python, Java, C++, TypeScript, JavaScript, SQL, HTML/CSS, R.
- AI & ML: GenAI, LLM orchestration, AI agents, GraphRAG, Hybrid RAG, RRF, vector search, BM25, embeddings (Titan v2), prompt engineering, prompt caching, streaming inference, NLP, computer vision, Transformers, CNN, RNN.
- Frameworks/libraries: PyTorch, TensorFlow, FastAPI, Flask, Node.js, Express.js, Socket.IO, React, Next.js, Tailwind, FAISS, NetworkX, rank-bm25, SBERT, scikit-learn, XGBoost, OpenCV, DOMPurify, Mermaid.js.
- Cloud/DevOps: AWS Bedrock, AWS ECR, Kubernetes (EKS), Argo CD, kubectl, Azure AI Studio, GCP, Docker, Docker Compose, Git/GitHub, CI/CD, Linux, helmet, HMAC.
- Databases: PostgreSQL (partitioning, materialized views, pg_cron, pg_trgm, Row-Level Security).
- APIs/tools: OpenAI API, Anthropic Claude API, MCP protocol, Zendesk REST API, ZAF, JWT SSO, Slack API, Jira, Postman.
