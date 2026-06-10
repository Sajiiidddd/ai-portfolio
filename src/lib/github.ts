// src/lib/github.ts
// Fetches public-repo READMEs for the configured GitHub user, cached in-process with a
// TTL so the agent's knowledge auto-updates without hammering the API. Optional
// GITHUB_TOKEN raises the rate limit (60/hr → 5000/hr).
const USER = process.env.GITHUB_USERNAME || 'Sajiiidddd';
const MAX_REPOS = Number(process.env.GITHUB_MAX_REPOS || 12);
const PER_README = 4000; // chars kept per README
const TTL = 1000 * 60 * 60 * 6; // 6h

type Cache = { at: number; text: string };
let cache: Cache | null = null;

function headers(): HeadersInit {
  const h: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'portfolio-agent' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function getGithubReadmes(): Promise<string> {
  if (cache && Date.now() - cache.at < TTL) return cache.text;
  try {
    const reposRes = await fetch(
      `https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed&type=owner`,
      { headers: headers(), next: { revalidate: 21600 } },
    );
    if (!reposRes.ok) throw new Error(`repos ${reposRes.status}`);
    const repos = (await reposRes.json()) as Array<{ name: string; description: string | null; fork: boolean; archived: boolean; language: string | null }>;
    const picked = repos.filter((r) => !r.fork && !r.archived).slice(0, MAX_REPOS);

    const parts = await Promise.all(
      picked.map(async (r) => {
        try {
          const rd = await fetch(`https://api.github.com/repos/${USER}/${r.name}/readme`, {
            headers: { ...headers(), Accept: 'application/vnd.github.raw' },
            next: { revalidate: 21600 },
          });
          const body = rd.ok ? (await rd.text()).slice(0, PER_README) : (r.description ?? '');
          return `## GitHub repo: ${r.name}${r.language ? ` (${r.language})` : ''}\n${r.description ? r.description + '\n' : ''}${body}`;
        } catch {
          return `## GitHub repo: ${r.name}\n${r.description ?? ''}`;
        }
      }),
    );
    const text = parts.join('\n\n---\n\n');
    cache = { at: Date.now(), text };
    return text;
  } catch (e) {
    console.warn('[github] readme fetch failed:', e);
    return cache?.text ?? '';
  }
}
