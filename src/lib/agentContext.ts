// src/lib/agentContext.ts
// Assembles the agent's grounding context: curated markdown (content/agent/*.md)
// + public GitHub READMEs + recent published blog posts. Cached with a TTL.
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getGithubReadmes } from '@/lib/github';

const TTL = 1000 * 60 * 30; // 30 min
const MAX_CHARS = 60_000;
let cache: { at: number; text: string } | null = null;

function readMarkdown(): string {
  try {
    const dir = path.join(process.cwd(), 'content', 'agent');
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    return files.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n\n');
  } catch {
    return '';
  }
}

async function recentPosts(): Promise<string> {
  try {
    const posts = await prisma.blog.findMany({
      where: { published: true }, orderBy: { createdAt: 'desc' }, take: 20,
      select: { title: true, description: true, tags: true },
    });
    if (!posts.length) return '';
    return '# Blog posts\n' + posts.map((p) => `- ${p.title}${p.description ? ` — ${p.description}` : ''} [${p.tags.join(', ')}]`).join('\n');
  } catch {
    return '';
  }
}

export async function getAgentContext(): Promise<string> {
  if (cache && Date.now() - cache.at < TTL) return cache.text;
  const [gh, posts] = await Promise.all([getGithubReadmes(), recentPosts()]);
  const text = [
    '# CURATED PROFILE', readMarkdown(),
    posts && '\n\n# RECENT WRITING\n' + posts,
    gh && '\n\n# GITHUB REPOSITORIES\n' + gh,
  ].filter(Boolean).join('\n').slice(0, MAX_CHARS);
  cache = { at: Date.now(), text };
  return text;
}
