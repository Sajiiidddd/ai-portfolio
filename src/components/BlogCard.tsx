'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface BlogCardProps {
  slug: string;
  title: string;
  description?: string | null;
  image?: string | null;
  createdAt: string;
}

export default function BlogCard({
  slug,
  title,
  description,
  image,
  createdAt,
}: BlogCardProps) {
  const router = useRouter();

  return (
    <motion.div
      onClick={() => router.push(`/blogs/${slug}`)}
      whileHover={{ scale: 1.02, opacity: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="cursor-pointer bg-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all duration-300"
    >
      {image && (
        <div className="w-full md:w-[300px] shrink-0">
          <Image
            src={image}
            alt={title}
            width={300}
            height={200}
            className="object-cover rounded-lg shadow-md w-full"
          />
        </div>
      )}

      <div className="flex flex-col justify-between flex-1">
        <div>
          <h3 className="text-white/80 text-2xl font-semibold mb-2">{title}</h3>
          {description && (
            <p className="text-white/60 text-sm leading-relaxed">{description}</p>
          )}
        </div>
        <span className="text-white/40 text-xs mt-4">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}



