'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Comment {
  id: string;
  author: string;
  content: string;
  userId: string;
  createdAt: string;
}

interface Props {
  blogId: string;
  initialComments?: Comment[];
}

const CURRENT_USER_ID = 'anonymous-temp';

function timeAgo(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return then.toLocaleDateString();
}

export default function BlogComments({ blogId, initialComments = [] }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [show, setShow] = useState(false);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = async () => {
    const res = await fetch(`/api/blogs/${blogId}/comments`);
    if (res.ok) setComments(await res.json());
  };

  useEffect(() => {
    if (initialComments.length === 0) fetchComments();
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  const handleSubmit = async () => {
    const method = editing ? 'PATCH' : 'POST';
    const url = editing
      ? `/api/blogs/${blogId}/comments/${editing}`
      : `/api/blogs/${blogId}/comments`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content }),
    });

    if (res.ok) {
      setAuthor('');
      setContent('');
      setEditing(null);
      fetchComments();
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/blogs/${blogId}/comments/${id}`, { method: 'DELETE' });
    fetchComments();
  };

  const handleEdit = (c: Comment) => {
    setEditing(c.id);
    setAuthor(c.author);
    setContent(c.content);
    setShow(true);
  };

  return (
    <section className="mt-20">

      {/* Toggle Button */}
      <button
        onClick={() => setShow((s) => !s)}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors"
      >
        {/* SVG Icon (bubble icon) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-white/40"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.6}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 8h10M7 12h5m-1 8c-1.1 0-2.2-.2-3.1-.5L4 20l1.5-3.5A9 9 0 1 1 12 21z"
          />
        </svg>
        <span>{show ? 'Hide' : 'Drop a comment or see what others said'}</span>
      </button>

      {/* Animated Comment Panel */}
      <AnimatePresence>
        {show && (
          <motion.div
            className="mt-8 space-y-8"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {/* Comment Form */}
            <motion.div
              className="bg-white/5 p-4 rounded-xl backdrop-blur-md max-w-xl w-full space-y-3 transition"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <input
                type="text"
                placeholder="Your name"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="bg-transparent border-b border-white/10 text-white placeholder-white/40 py-1 w-full focus:outline-none"
              />
              <textarea
                ref={textareaRef}
                placeholder="Write a comment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={1}
                className="bg-transparent border-b border-white/10 text-white placeholder-white/40 w-full resize-none overflow-hidden focus:outline-none"
              />
              <button
                onClick={handleSubmit}
                className="text-xs px-4 py-1.5 rounded-md text-white bg-white/10 hover:bg-white/20 transition"
              >
                {editing ? 'Update' : 'Post'}
              </button>
            </motion.div>

            {/* Comment List */}
            <div className="space-y-5">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="group px-1 py-1 rounded-md hover:bg-white/5 transition"
                >
                  <div className="flex justify-between items-center text-white/60 text-sm">
                    <span className="font-medium">{c.author}</span>
                    <span className="text-xs text-white/30">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="text-white/80 text-sm mt-1">{c.content}</p>

                  {c.userId === CURRENT_USER_ID && (
                    <div className="flex gap-4 mt-1 text-xs text-white/40 group-hover:opacity-100 opacity-0 transition">
                      <button onClick={() => handleEdit(c)} className="hover:text-white">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-rose-400 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}






