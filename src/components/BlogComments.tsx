'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CommentIcon from '/logos/comment2.svg';

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user?: {
    id: string;
    name?: string | null;
    image?: string | null;
  };
}

interface Props {
  blogId: string;
  initialComments?: Comment[];
}

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

// Helper to read user_id cookie (non-HttpOnly)
function getCurrentUserId(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)user_id=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export default function BlogComments({ blogId, initialComments = [] }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [show, setShow] = useState(false);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = async () => {
  const res = await fetch(`/api/blogs/${blogId}/comments`, { credentials: 'include' });
  if (res.ok) {
    let data = await res.json();
    data = data.map(c => ({
      ...c,
      user: {
        ...c.user,
        name: c.user?.name && c.user.name.trim() !== "" ? c.user.name : "Anonymous",
      }
    }));
    setComments(data);
  }
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

  useEffect(() => {
    setCurrentUserId(getCurrentUserId());
  }, []);

  // For debugging ownership mismatch - remove or comment out in production
  useEffect(() => {
    console.log('Current User ID:', currentUserId);
    comments.forEach((c) => {
      console.log(
        `CommentID: ${c.id}, userId: ${c.userId}, userName: ${c.user?.name}`
      );
    });
  }, [comments, currentUserId]);

  const handleSubmit = async () => {
    if (!content.trim()) {
      alert("Comment content cannot be empty.");
      return;
    }

    const method = editing ? 'PATCH' : 'POST';
    const url = editing
      ? `/api/blogs/${blogId}/comments/${editing}`
      : `/api/blogs/${blogId}/comments`;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, content }),
      credentials: 'include', // send cookies
    });

    if (res.ok) {
      setAuthor('');
      setContent('');
      setEditing(null);
      await fetchComments();
    } else {
      alert('Failed to submit comment.');
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = confirm('Are you sure you want to delete this comment?');
    if (!confirmed) return;

    const res = await fetch(`/api/blogs/${blogId}/comments/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (res.ok) {
      fetchComments();
    } else {
      alert('Failed to delete comment.');
    }
  };

  const handleEdit = (c: Comment) => {
    setEditing(c.id);
    setAuthor(c.user?.name || '');
    setContent(c.content);
    setShow(true);
  };

  // Loose equality to avoid type mismatch (string vs number)
  function isCommentOwner(c: Comment) {
    return (
      currentUserId != null &&
      (c.user?.id == currentUserId || c.userId == currentUserId)
    );
  }

  return (
    <section className="mt-20">
  {/* Toggle Button */}
  <button
  onClick={() => setShow((s) => !s)}
  className="flex items-center gap-2 text-base text-white/60 hover:text-[#E85D04] transition-colors"
>
  <img
    src="/logos/comment2.svg"
    alt="Toggle comments"
    className="w-6 h-6"
    style={{
      filter: show
        ? 'invert(41%) sepia(78%) saturate(3600%) hue-rotate(1deg) brightness(94%) contrast(89%)'
        : 'brightness(0) invert(1)', // white by default
      transition: 'filter 0.3s ease-in-out',
    }}
  />
  <span
    className="italic"
    style={{ color: show ? '#E85D04' : undefined, transition: 'color 0.4s ease' }}
  >
    {show ? 'Hide' : 'Drop a comment or see what others have to say...'}
  </span>
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
            className="bg-transparent text-white placeholder-white/40 py-1 w-full focus:outline-none
              border-b border-transparent hover:border-white/20 transition-all duration-300 ease-in-out"
          />
          <textarea
            ref={textareaRef}
            placeholder="Write a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={1}
            className="bg-transparent text-white placeholder-white/40 w-full resize-none overflow-hidden focus:outline-none
              border-b border-transparent hover:border-white/20 transition-all duration-300 ease-in-out"
          />
          <button
            onClick={handleSubmit}
            className="text-xs px-4 py-1.5 rounded-md text-white bg-white/10 hover:bg-white/20 transition"
          >
            {editing ? 'Update' : 'Post'}
          </button>
        </motion.div>

        {/* Comment List */}
        <div className="space-y-5 max-w-xl">
          {comments.map((c) => (
            <div
              key={c.id}
              className="group px-1 py-1 rounded-md hover:bg-white/5 transition"
            >
              <div className="flex justify-between items-center text-white/60 text-sm">
                <span className="font-medium">
                  {(c.user?.name && c.user.name.trim() !== "") ? c.user.name : "Anonymous"}
                </span>
                <span className="text-xs text-white/30">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-white/80 text-sm mt-1">{c.content}</p>

              {/* Show edit/delete only if current user is the comment owner */}
              {isCommentOwner(c) && (
                <div className="flex gap-4 mt-1 text-xs text-white/40 group-hover:opacity-100 opacity-100 transition">
                  <button onClick={() => handleEdit(c)} className="hover:text-white">
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="text-white/40 hover:text-rose-400 transition duration-200"
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






