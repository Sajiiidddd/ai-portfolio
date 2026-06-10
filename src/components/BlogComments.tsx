'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Turnstile from './Turnstile';

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user?: { id?: string; name?: string | null; image?: string | null } | null;
  likeCount?: number;
  likedByMe?: boolean;
  authorLikedPost?: boolean;
  pending?: boolean;
}

interface Props {
  blogId: string;
  initialComments?: Comment[];
}

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(date).toLocaleDateString();
}

function getClientUserId(): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)user_id=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

const MONO = { fontFamily: 'var(--font-mono), monospace' } as const;

function Avatar({ name }: { name: string }) {
  const letter = name.trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className="w-7 h-7 rounded-[4px] bg-[#0c0c0c] border border-white/15 flex items-center justify-center shrink-0 text-[11px] text-[#b3b3a9] select-none"
      style={MONO}
    >
      {letter}
    </div>
  );
}

export default function BlogComments({ blogId, initialComments = [] }: Props) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [open, setOpen] = useState(true);
  const [author, setAuthor] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — humans never see or fill this
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [tsToken, setTsToken] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, { credentials: 'include' });
      if (!res.ok) return;
      const data: Comment[] = await res.json();
      setComments(data.map((c) => ({ ...c, likeCount: c.likeCount ?? 0, likedByMe: c.likedByMe ?? false, authorLikedPost: c.authorLikedPost ?? false, user: { ...c.user, name: c.user?.name?.trim() || 'Anonymous' } })));
    } catch {}
  };

  useEffect(() => {
    if (initialComments.length === 0) fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogId]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  useEffect(() => { setCurrentUserId(getClientUserId()); }, []);

  const reset = () => {
    setEditing(null); setAuthor(''); setContent(''); setError(null);
  };

  // Optimistic submit: the comment appears instantly; the server result
  // replaces it in the background (rollback + restore draft on failure).
  const handleSubmit = async () => {
    if (!content.trim()) { setError('Write something first.'); return; }
    if (submitting) return;
    setSubmitting(true); setError(null);
    const body = JSON.stringify({ author, content, website, turnstileToken: tsToken });
    const snapshot = comments;

    if (editing) {
      const id = editing;
      const newName = author.trim();
      setComments((cs) => cs.map((c) => (c.id === id ? { ...c, content, user: { ...c.user, name: newName || c.user?.name || 'Anonymous' } } : c)));
      reset();
      try {
        const res = await fetch(`/api/blogs/${blogId}/comments/${id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body,
        });
        if (!res.ok) throw new Error();
      } catch {
        setComments(snapshot);
        setError('Failed to update. Try again.');
      } finally { setSubmitting(false); }
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const draft = { author, content };
    setComments((cs) => [{
      id: tempId, content, userId: currentUserId ?? 'me',
      createdAt: new Date().toISOString(),
      user: { id: currentUserId ?? undefined, name: author.trim() || 'Anonymous' },
      likeCount: 0, likedByMe: false,
      pending: true,
    }, ...cs]);
    reset();
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body,
      });
      if (!res.ok) throw new Error();
      const saved: Comment = await res.json();
      setCurrentUserId(getClientUserId());
      setComments((cs) => cs.map((c) => (c.id === tempId
        ? { ...saved, likeCount: 0, likedByMe: false, user: { ...saved.user, name: saved.user?.name?.trim() || 'Anonymous' } }
        : c)));
    } catch {
      setComments((cs) => cs.filter((c) => c.id !== tempId));
      setAuthor(draft.author); setContent(draft.content);
      setError('Failed to post. Try again.');
    } finally { setSubmitting(false); }
  };

  // Optimistic heart toggle with rollback. One heart per visitor; can't like your own.
  const toggleLike = async (c: Comment) => {
    if (c.pending || isOwner(c)) return;
    const liked = !c.likedByMe;
    const delta = liked ? 1 : -1;
    setComments((cs) => cs.map((x) => (x.id === c.id ? { ...x, likedByMe: liked, likeCount: Math.max(0, (x.likeCount ?? 0) + delta) } : x)));
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments/${c.id}/like`, { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error();
      const data: { liked: boolean; likeCount: number } = await res.json();
      setComments((cs) => cs.map((x) => (x.id === c.id ? { ...x, likedByMe: data.liked, likeCount: data.likeCount } : x)));
    } catch {
      setComments((cs) => cs.map((x) => (x.id === c.id ? { ...x, likedByMe: !liked, likeCount: Math.max(0, (x.likeCount ?? 0) - delta) } : x)));
    }
  };

  // Optimistic delete with rollback.
  const handleDelete = async (id: string) => {
    const snapshot = comments;
    setDeleteConfirm(null);
    setComments((cs) => cs.filter((c) => c.id !== id));
    try {
      const res = await fetch(`/api/blogs/${blogId}/comments/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
    } catch {
      setComments(snapshot);
      setError('Failed to delete.');
    }
  };

  const handleEdit = (c: Comment) => {
    setEditing(c.id); setAuthor(c.user?.name || ''); setContent(c.content);
    setOpen(true); setError(null);
  };

  const isOwner = (c: Comment) =>
    currentUserId != null && (c.user?.id === currentUserId || c.userId === currentUserId);

  const inputCls =
    'w-full bg-[#0c0c0c] border border-white/[0.12] rounded-[4px] px-3.5 py-3 text-sm text-[#ece9e1] placeholder-[#55554f] focus:border-white/50 focus:outline-none transition-colors duration-300';

  return (
    <section className="space-y-6">
      {/* Toggle row */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={MONO}
        className="flex items-center gap-3 text-[11px] tracking-[0.16em] uppercase text-[#8a8a82] hover:text-[#ece9e1] transition-colors duration-300"
      >
        <span className="inline-block w-2 text-center">{open ? '▾' : '▸'}</span>
        <span>
          {open
            ? 'Hide comments'
            : comments.length > 0
            ? `${String(comments.length).padStart(2, '0')} comment${comments.length !== 1 ? 's' : ''}`
            : 'Leave a comment'}
        </span>
        <span className="flex-1 h-px bg-white/[0.08] min-w-[60px]" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-7"
          >
            {/* ── Form ── */}
            <div className="space-y-3">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Name (optional)"
                className={inputCls}
              />
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                placeholder="Website"
                style={{ position: 'absolute', left: '-9999px', height: 0, width: 0, opacity: 0 }}
              />
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => { setContent(e.target.value); setError(null); }}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
                placeholder="Write a comment…"
                rows={2}
                className={`${inputCls} resize-none overflow-hidden min-h-[72px]`}
              />
              {error && <p style={MONO} className="text-[10px] tracking-[0.12em] uppercase text-[#ece9e1] bg-white/[0.06] border border-white/[0.12] rounded-[4px] px-3 py-2 inline-block">{error}</p>}
              <Turnstile onToken={setTsToken} />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !content.trim()}
                  style={MONO}
                  className="text-[11px] tracking-[0.14em] uppercase px-5 py-2.5 rounded-[4px] bg-[#ece9e1] text-[#0a0a0a] hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {submitting ? 'Posting…' : editing ? 'Update →' : 'Post →'}
                </button>
                {editing && (
                  <button onClick={reset} style={MONO} className="text-[11px] tracking-[0.14em] uppercase px-4 py-2.5 rounded-[4px] border border-white/[0.12] text-[#8a8a82] hover:text-[#ece9e1] hover:border-white/40 transition-all duration-300">
                    Cancel
                  </button>
                )}
                <span style={MONO} className="ml-auto text-[10px] tracking-[0.1em] text-[#3a3a36]">⌘↵ TO POST</span>
              </div>
            </div>

            {/* ── Comment list ── */}
            {comments.length > 0 && (
              <div className="space-y-0">
                <AnimatePresence initial={false}>
                {comments.map((c) => {
                  const name = c.user?.name?.trim() || 'Anonymous';
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: c.pending ? 0.55 : 1, y: 0 }}
                      exit={{ opacity: 0, height: 0, overflow: 'hidden', marginTop: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      key={c.id}
                      className="group flex gap-3.5 py-5 border-b border-white/[0.07] last:border-0">
                      <Avatar name={name} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-3 mb-1.5" style={MONO}>
                          <span className="text-[#ece9e1] text-[11px] tracking-[0.12em] uppercase">{name}</span>
                          <span className="text-[#8a8a82] text-[10px] tracking-[0.08em] uppercase">{timeAgo(c.createdAt)}</span>
                          {c.authorLikedPost && (
                            <span title="Also liked this post" className="flex items-center gap-1 text-[#ed93b1] text-[9px] tracking-[0.14em] uppercase">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="#ed93b1" stroke="#ed93b1" strokeWidth="2"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1.1-1a5.5 5.5 0 1 0-7.8 7.8l1.1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                              liked
                            </span>
                          )}
                        </div>
                        <p className="text-[#c9c9bf] text-sm leading-relaxed font-light">{c.content}</p>

                        {/* Heart / like */}
                        <button
                          onClick={() => toggleLike(c)}
                          disabled={c.pending || isOwner(c)}
                          aria-label={c.likedByMe ? 'Remove like' : 'Like comment'}
                          className={`group/like mt-2.5 flex items-center gap-1.5 ${c.pending || isOwner(c) ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <svg width="13" height="13" viewBox="0 0 24 24"
                            fill={c.likedByMe ? '#ed93b1' : 'none'}
                            stroke={c.likedByMe ? '#ed93b1' : '#8a8a82'}
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                            className={c.pending || isOwner(c) ? '' : 'transition-colors duration-200 group-hover/like:stroke-[#ed93b1]'}>
                            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1.1-1a5.5 5.5 0 1 0-7.8 7.8l1.1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                          </svg>
                          {(c.likeCount ?? 0) > 0 && (
                            <span style={MONO} className={`text-[10px] tracking-[0.08em] ${c.likedByMe ? 'text-[#ed93b1]' : 'text-[#8a8a82]'}`}>{c.likeCount}</span>
                          )}
                        </button>

                        {/* Owner actions */}
                        {isOwner(c) && (
                          <div className="mt-2.5 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={MONO}>
                            {deleteConfirm === c.id ? (
                              <span className="flex items-center gap-3 text-[10px] tracking-[0.12em] uppercase text-[#8a8a82]">
                                <span className="text-[#ff6259]">Delete?</span>
                                <button onClick={() => handleDelete(c.id)} className="text-[#ff6259] underline underline-offset-2 hover:text-[#ff8a83] transition">Yes</button>
                                <button onClick={() => setDeleteConfirm(null)} className="hover:text-[#ece9e1] transition">No</button>
                              </span>
                            ) : (
                              <>
                                <button onClick={() => handleEdit(c)} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ece9e1] transition">Edit</button>
                                <button onClick={() => setDeleteConfirm(c.id)} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ff6259] transition">Delete</button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
                </AnimatePresence>
              </div>
            )}

            {comments.length === 0 && (
              <p style={MONO} className="text-[#8a8a82] text-[10px] tracking-[0.16em] uppercase py-2">No comments yet — be the first.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
