import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  // Clear existing data (dev-only)
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.user.deleteMany();

  // Read blog markdown file
  const colabContent = fs.readFileSync(
    path.join(__dirname, 'seed-content', 'colab-survival-guide.md'),
    'utf8'
  );

  // Create test user
  const user = await prisma.user.create({
    data: {
      email: 'sajid@example.com',
      name: 'Sajid',
    },
  });

  // Create blog
  const colabBlog = await prisma.blog.create({
    data: {
      title: 'The Google Colab Survival Guide',
      slug: slugify('The Google Colab Survival Guide'),
      image: '/images/checkpoints.png',
      content: colabContent, // Directly from markdown file
    },
  });

  // Create comment
  await prisma.comment.create({
    data: {
      content: 'First Blog!',
      userId: user.id,
      blogId: colabBlog.id,
    },
  });

  // Create vote
  await prisma.vote.create({
    data: {
      blogId: colabBlog.id,
      userId: user.id,
      type: 'UPVOTE',
    },
  });

  console.log('✅ Seeded blog:', colabBlog.slug);
  console.log('👤 With user:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());







