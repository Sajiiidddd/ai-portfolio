import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import BlogVotes from '@/components/BlogVotes';
import BlogComments from '@/components/BlogComments';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface BlogPageProps {
  params: { slug: string };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const blog = await prisma.blog.findUnique({
    where: { slug: params.slug },
    include: {
      comments: { orderBy: { createdAt: 'desc' } },
      votes: true,
    },
  });

  if (!blog) return notFound();

  const upvotes = blog.votes.filter((v) => v.type === 'UPVOTE').length;
  const downvotes = blog.votes.filter((v) => v.type === 'DOWNVOTE').length;

  const titleColor = 'text-white/80';
  const descriptionColor = 'text-white/60';

  return (
    <main className="w-full min-h-screen bg-black text-white px-6 py-20">
      <div className="max-w-3xl mx-auto space-y-10">
        {/* Title */}
        <h1 className={`text-4xl md:text-5xl font-extrabold leading-tight ${titleColor}`}>
          {blog.title}
        </h1>

        {/* Description */}
        <p className={`text-lg ${descriptionColor}`}>{blog.description}</p>

        {/* Image */}
        <Image
          src={blog.image}
          alt={blog.title}
          width={800}
          height={400}
          className="rounded-xl object-cover w-full shadow-xl"
        />

        {/* Markdown Content */}
        <article className="prose prose-invert max-w-none prose-p:leading-relaxed prose-p:text-white/90 prose-headings:text-white prose-a:text-blue-400 hover:prose-a:underline">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ node, children }) => <p className="mb-4">{children}</p>,
              ul: ({ node, children }) => <ul className="list-disc pl-5 mb-4">{children}</ul>,
              ol: ({ node, children }) => <ol className="list-decimal pl-5 mb-4">{children}</ol>,
              li: ({ node, children }) => <li className="mb-1">{children}</li>,
              h2: ({ node, children }) => <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>,
              h3: ({ node, children }) => <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>,
              a: ({ node, ...props }) => <a className="text-blue-400 hover:underline" {...props} />,
              strong: ({ node, children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ node, children }) => <em className="italic">{children}</em>,
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </article>

        {/* Votes & Comments */}
        <BlogVotes blogId={blog.id} upvotes={upvotes} downvotes={downvotes} />
        <BlogComments blogId={blog.id} initialComments={blog.comments} />
      </div>
    </main>
  );
}






