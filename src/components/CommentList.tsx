'use client';
import { useEffect, useState } from 'react';

interface Comment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
}

export default function CommentList({ blogId }: { blogId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [trigger, setTrigger] = useState(false);

  const fetchComments = async () => {
    const res = await fetch(`/api/blogs/${blogId}`);
    const blog = await res.json();
    setComments(blog.comments || []);
  };

  useEffect(() => {
    fetchComments();
  }, [trigger]);

  const deleteComment = async (commentId: string) => {
    await fetch(`/api/blogs/${blogId}/comments/${commentId}`, { method: 'DELETE' });
    setTrigger(prev => !prev);
  };

  return (
    <div className="mt-6">
      <h3 className="text-cyan-300 font-bold mb-2">💬 Comments</h3>
      {comments.length === 0 && <p className="text-white/50 text-sm">No comments yet.</p>}
      <ul className="space-y-4">
        {comments.map(c => (
          <li key={c.id} className="border border-cyan-300/10 p-4 rounded bg-white/5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-cyan-300 font-medium">{c.name}</span>
              <span className="text-xs text-white/50">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-white/90 text-sm">{c.content}</p>
            <button
              onClick={() => deleteComment(c.id)}
              className="text-red-400 text-xs mt-2 hover:underline"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
