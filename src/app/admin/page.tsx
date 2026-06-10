import { redirect } from 'next/navigation';
import { isAdmin, adminConfigured } from '@/lib/admin';
import { prisma } from '@/lib/prisma';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  if (!adminConfigured()) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-[#9b9b91] px-6 text-center text-sm">
        Admin is not configured. Set <code className="text-[#ece9e1] mx-1">ADMIN_PASSWORD</code> in your environment and reload.
      </main>
    );
  }
  if (!(await isAdmin())) redirect('/admin/login');

  const posts = await prisma.blog.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, title: true, slug: true, description: true, content: true, tags: true, readTime: true, published: true, createdAt: true, updatedAt: true },
  });
  const initialPosts = posts.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }));

  let subscriberCount = 0;
  try { subscriberCount = await prisma.subscriber.count({ where: { confirmed: true } }); } catch {}

  return <AdminDashboard initialPosts={initialPosts} subscriberCount={subscriberCount} />;
}
