import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  // Guard rail: never seed a non-local database by accident.
  const url = process.env.DATABASE_URL ?? '';
  const isLocal = /localhost|127\.0\.0\.1/.test(url);
  if (!isLocal && process.env.FORCE_SEED !== '1') {
    console.error('✋ Refusing to seed: DATABASE_URL does not point to localhost.');
    console.error('   Set FORCE_SEED=1 to override (only if you really mean it).');
    process.exit(1);
  }

  const colabContent = fs.readFileSync(
    path.join(__dirname, 'seed-content', 'colab-survival-guide.md'),
    'utf8'
  );
  const mcpContent = fs.readFileSync(
    path.join(__dirname, 'seed-content', 'from-fyp-to-enterprise-mcp.md'),
    'utf8'
  );

  // Idempotent upserts — safe to run any number of times, never wipes data.
  const user = await prisma.user.upsert({
    where: { email: 'sajid@example.com' },
    update: { name: 'Sajid' },
    create: { email: 'sajid@example.com', name: 'Sajid' },
  });

  const title = 'The Google Colab Survival Guide';
  const slug = slugify(title);
  const blog = await prisma.blog.upsert({
    where: { slug },
    update: { content: colabContent, published: true },
    create: {
      title,
      slug,
      description:
        'Tips, tricks, and battle-tested patterns for surviving long training runs and keeping your GPU sessions alive.',
      image: '/images/checkpoints.png',
      tags: ['Machine Learning', 'Python', 'Colab'],
      readTime: 8,
      published: true,
      content: colabContent,
    },
  });

  // ── Blog 2: MCP — from final-year project to enterprise ─────────────
  const mcpTitle = 'From an Award-Winning Final-Year Project to Enterprise MCP';
  const mcpSlug = 'from-fyp-to-enterprise-mcp';
  await prisma.blog.upsert({
    where: { slug: mcpSlug },
    update: { title: mcpTitle, content: mcpContent, published: true },
    create: {
      title: mcpTitle,
      slug: mcpSlug,
      description:
        'The same idea, three years apart: an award-winning, soon-to-be-published research assistant (MCP Deep Researcher) and the enterprise Zendesk MCP I built at AppZen — and everything guardrails, rate limiters and a firewall against derailment taught me about shipping MCP for real.',
      image: null,
      tags: ['MCP', 'AI Engineering', 'Enterprise'],
      readTime: 11,
      published: true,
      content: mcpContent,
    },
  });
  console.log('✅ Seeded blog: ' + mcpSlug);

  const existingComment = await prisma.comment.findFirst({
    where: { blogId: blog.id, userId: user.id },
  });
  if (!existingComment) {
    await prisma.comment.create({
      data: { content: 'First Blog!', userId: user.id, blogId: blog.id },
    });
  }

  await prisma.vote.upsert({
    where: { userId_blogId: { userId: user.id, blogId: blog.id } },
    update: {},
    create: { blogId: blog.id, userId: user.id, type: 'UPVOTE' },
  });

  console.log('✅ Seeded blog:', blog.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
