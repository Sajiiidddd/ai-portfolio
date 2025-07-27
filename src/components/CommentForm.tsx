'use client';
import { useState } from 'react';

export default function CommentForm({ blogId, onComment }: { blogId: string; onComment: () => void }) {
  const [name, setName] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/blogs/${blogId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ name, content }),
    });
    setName('');
    setContent('');
    onComment(); // Refresh comments
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Your name"
        className="w-full px-4 py-2 bg-white/10 text-white rounded border border-cyan-300/20"
        required
      />
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Your comment"
        className="w-full px-4 py-2 bg-white/10 text-white rounded border border-cyan-300/20"
        rows={4}
        required
      />
      <button type="submit" className="bg-cyan-500 px-4 py-2 rounded text-white hover:bg-cyan-600">
        Post Comment
      </button>
    </form>
  );
}
