# Projects

## F1 Strategy OS (2026)
A real-time Formula 1 race-strategy prediction engine. A 64-dimension Transformer
(PyTorch) trained on 5 years of FastF1 telemetry, Optuna-optimised to <45ms CPU
inference on Hugging Face Spaces. A Next.js dashboard (Vercel) consumes it via the
Gradio Client API on a 10-lap sliding window, with Gemini 1.5 Pro reading "chaos
factors" like safety cars. ~92% podium accuracy. Live: f1-strategy-dashboard.vercel.app.

## Zendesk MCP Server (2026, open source)
There is no official Zendesk MCP connector — so Sajid built one. An open-source MCP
server connecting Claude to any Zendesk instance with 60+ tools (77+ across two
servers), with production guard-rails: one pooled httpx.AsyncClient, 429-aware retry
honouring Retry-After, proactive sleep cycle, concurrent auto-pagination, a 1-hour TTL
schema cache, composite tools via asyncio.gather, stdio + SSE transports, and a
raw_api_call escape hatch. MIT-licensed; installable via `uvx zendesk-mcp`.

## BOM Comparator — SAMIKSHA (2025, patented)
A patented NLP-powered comparator (IP: CIP 20251027 TML 15884) that diffs vehicle BOM
spreadsheets at Tata Motors, in production across five CVBU departments. Part-level
diff between 60,000–70,000-part files in 1–2 minutes at 100% accuracy. Integrated with
SAP, deployed on Azure via FastAPI.

## MCP Deep Researcher (2026, published)
An MCP-based academic research assistant — Retrieval-Augmented Generation with adaptive
similarity thresholding and modular retrieval/storage/indexing/inference components.
Accepted at ICT4SD 2026 (Springer LNNS, oral presentation) and won Sajid's university's
Best Final-Year Project award.
