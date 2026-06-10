// Canonical site identity used by SEO surfaces (metadata, sitemap, RSS, OG images).
// SITE_URL prefers NEXT_PUBLIC_BASE_URL, then Vercel's production/deploy URL, then localhost.
function resolveUrl(): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export const SITE_URL = resolveUrl();
export const SITE_NAME = 'Sajid Tamboli';
export const SITE_TAGLINE = 'AI / ML Engineer';
export const SITE_DESCRIPTION =
  'AI/ML engineer in Pune — I ship models, not just train them. Patented NLP across factory floors, production GraphRAG, and enterprise-grade MCP.';
export const SITE_AUTHOR = 'Sajid Tamboli';
export const SITE_HANDLE = '@Sajiiidddd';
export const GITHUB_URL = 'https://github.com/Sajiiidddd';
