'use client';

import { useEffect, useState } from 'react';

const MONO = { fontFamily: 'var(--font-mono), monospace' } as const;

type Post = {
  id: string; title: string; slug: string; description: string | null; content: string;
  tags: string[]; readTime: number | null; published: boolean; createdAt: string; updatedAt: string;
};
type Draft = {
  id?: string; title: string; slug: string; description: string; content: string;
  tags: string; readTime: string; published: boolean;
};
type Sub = { id: string; email: string; name: string | null; confirmed: boolean; createdAt: string; confirmedAt: string | null };
type Cmt = { id: string; content: string; hidden: boolean; createdAt: string; user: { name: string | null } | null; blog: { title: string; slug: string }; _count: { likes: number } };

const blankDraft: Draft = { title: '', slug: '', description: '', content: '', tags: '', readTime: '', published: false };
const toDraft = (p: Post): Draft => ({
  id: p.id, title: p.title, slug: p.slug, description: p.description ?? '', content: p.content,
  tags: p.tags.join(', '), readTime: p.readTime?.toString() ?? '', published: p.published,
});

const inputCls = 'w-full bg-[#0c0c0c] border border-white/[0.12] rounded-[5px] px-3.5 py-2.5 text-sm text-[#ece9e1] placeholder-[#6f6f68] focus:border-white/50 focus:outline-none transition-colors';
const labelCls = 'block text-[10px] tracking-[0.16em] uppercase text-[#8a8a82] mb-1.5';
const tab = (on: boolean) => `text-[11px] tracking-[0.14em] uppercase pb-1.5 border-b-2 transition ${on ? 'text-[#ece9e1] border-[#ece9e1]' : 'text-[#8a8a82] border-transparent hover:text-[#ece9e1]'}`;

type View = 'overview' | 'posts' | 'subscribers' | 'comments' | 'questions';
type Overview = {
  posts: { published: number; drafts: number };
  comments: { total: number; hidden: number };
  likes: number;
  votes: { up: number; down: number };
  subscribers: { confirmed: number; pending: number; growth: { label: string; n: number }[] };
  recs: { total: number; votes: number; players: number; top: { title: string; by: string; net: number } | null };
  agent: { total: number; gemini: number; fallback: number; top: { question: string; count: number }[] };
  topPosts: { title: string; slug: string; comments: number; votes: number }[];
  recent: { kind: string; label: string; at: string }[];
};
type AQ = { id: string; question: string; answer: string | null; source: string | null; createdAt: string };
type ConfirmCfg = { title: string; body: string; label: string; danger?: boolean; onYes: () => void | Promise<void> };

export default function AdminDashboard({ initialPosts, subscriberCount = 0 }: { initialPosts: Post[]; subscriberCount?: number }) {
  const [view, setView] = useState<View>('overview');
  const [overview, setOverview] = useState<Overview | null>(null);
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [subs, setSubs] = useState<Sub[] | null>(null);
  const [cmts, setCmts] = useState<Cmt[] | null>(null);
  const [queries, setQueries] = useState<AQ[] | null>(null);
  const [confirmCfg, setConfirmCfg] = useState<ConfirmCfg | null>(null);

  useEffect(() => { fetch('/api/admin/overview').then((r) => (r.ok ? r.json() : null)).then((d) => d && setOverview(d)).catch(() => {}); }, []);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const note = (m: string) => { setMsg(m); setErr(''); setTimeout(() => setMsg(''), 4000); };
  const fail = (m: string) => { setErr(m); setMsg(''); };

  // ---------- posts ----------
  const save = async () => {
    if (!editing || busy) return;
    if (!editing.title.trim() || !editing.content.trim()) { fail('Title and content are required.'); return; }
    setBusy(true); setErr('');
    const isNew = !editing.id;
    try {
      const r = await fetch(isNew ? '/api/admin/blogs' : `/api/admin/blogs/${editing.id}`, {
        method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editing.title, slug: editing.slug, description: editing.description, content: editing.content, tags: editing.tags, readTime: editing.readTime, published: editing.published }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || 'Save failed.');
      setPosts((ps) => (isNew ? [data as Post, ...ps] : ps.map((p) => (p.id === data.id ? (data as Post) : p))));
      setEditing(null); note(isNew ? 'Post created.' : 'Post updated.');
    } catch (e) { fail(e instanceof Error ? e.message : 'Save failed.'); } finally { setBusy(false); }
  };
  const togglePublish = async (p: Post) => {
    try {
      const r = await fetch(`/api/admin/blogs/${p.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ published: !p.published }) });
      const data = await r.json().catch(() => ({})); if (!r.ok) throw new Error(data?.error || 'Failed.');
      setPosts((ps) => ps.map((x) => (x.id === p.id ? { ...x, published: data.published } : x))); note(data.published ? 'Published.' : 'Moved to draft.');
    } catch (e) { fail(e instanceof Error ? e.message : 'Failed.'); }
  };
  const removePost = (p: Post) => setConfirmCfg({ title: `Delete "${p.title}"?`, body: 'This also removes its comments and likes — permanent.', label: 'Delete post', danger: true, onYes: async () => {
    try { const r = await fetch(`/api/admin/blogs/${p.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error('Delete failed.'); setPosts((ps) => ps.filter((x) => x.id !== p.id)); note('Post deleted.'); }
    catch (e) { fail(e instanceof Error ? e.message : 'Delete failed.'); }
  } });
  const notify = (p: Post) => {
    if (!p.published) { fail('Publish the post before notifying subscribers.'); return; }
    setConfirmCfg({ title: 'Notify subscribers?', body: `Email all confirmed subscribers about "${p.title}".`, label: 'Send emails', onYes: async () => {
      try {
        const r = await fetch('/api/admin/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: p.slug }) });
        const data = await r.json().catch(() => ({})); if (!r.ok) throw new Error(data?.error || 'Notify failed.');
        note(`Sent to ${data.sent}/${data.subscribers} subscriber(s).`);
      } catch (e) { fail(e instanceof Error ? e.message : 'Notify failed.'); }
    } });
  };

  // ---------- subscribers ----------
  const loadSubs = async () => {
    setView('subscribers'); if (subs) return;
    try { const r = await fetch('/api/admin/subscribers'); if (!r.ok) throw new Error('Failed to load.'); setSubs(await r.json()); }
    catch (e) { fail(e instanceof Error ? e.message : 'Failed.'); }
  };
  const delSub = (s: Sub) => setConfirmCfg({ title: 'Remove subscriber?', body: s.email, label: 'Remove', danger: true, onYes: async () => {
    try { const r = await fetch(`/api/admin/subscribers/${s.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error('Failed.'); setSubs((xs) => (xs ?? []).filter((x) => x.id !== s.id)); note('Subscriber removed.'); }
    catch (e) { fail(e instanceof Error ? e.message : 'Failed.'); }
  } });
  const exportCsv = () => {
    const rows = [['email', 'name', 'confirmed', 'created_at'], ...(subs ?? []).map((s) => [s.email, s.name ?? '', String(s.confirmed), s.createdAt])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a'); a.href = url; a.download = `subscribers-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------- comments ----------
  const loadCmts = async () => {
    setView('comments'); if (cmts) return;
    try { const r = await fetch('/api/admin/comments'); if (!r.ok) throw new Error('Failed to load.'); setCmts(await r.json()); }
    catch (e) { fail(e instanceof Error ? e.message : 'Failed.'); }
  };
  const loadQueries = async () => {
    setView('questions'); if (queries) return;
    try { const r = await fetch('/api/admin/agent-queries'); if (!r.ok) throw new Error('Failed to load.'); setQueries(await r.json()); }
    catch (e) { fail(e instanceof Error ? e.message : 'Failed.'); }
  };
  const toggleHide = async (c: Cmt) => {
    try {
      const r = await fetch(`/api/admin/comments/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hidden: !c.hidden }) });
      const data = await r.json().catch(() => ({})); if (!r.ok) throw new Error('Failed.');
      setCmts((xs) => (xs ?? []).map((x) => (x.id === c.id ? { ...x, hidden: data.hidden } : x))); note(data.hidden ? 'Comment hidden.' : 'Comment shown.');
    } catch (e) { fail(e instanceof Error ? e.message : 'Failed.'); }
  };
  const delCmt = (c: Cmt) => setConfirmCfg({ title: 'Delete comment?', body: `"${c.content.slice(0, 80)}" — permanent.`, label: 'Delete', danger: true, onYes: async () => {
    try { const r = await fetch(`/api/admin/comments/${c.id}`, { method: 'DELETE' }); if (!r.ok) throw new Error('Failed.'); setCmts((xs) => (xs ?? []).filter((x) => x.id !== c.id)); note('Comment deleted.'); }
    catch (e) { fail(e instanceof Error ? e.message : 'Failed.'); }
  } });

  const logout = async () => { await fetch('/api/admin/logout', { method: 'POST' }); window.location.href = '/admin/login'; };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#ece9e1] px-5 sm:px-8 py-10 max-w-5xl mx-auto">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div style={MONO} className="text-[11px] tracking-[0.2em] uppercase text-[#8a8a82]">◢ Admin</div>
          <div style={MONO} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] mt-1">{subscriberCount} confirmed subscriber{subscriberCount === 1 ? '' : 's'}</div>
        </div>
        <button onClick={logout} style={MONO} className="text-[10px] tracking-[0.14em] uppercase text-[#8a8a82] hover:text-[#ece9e1] transition">Log out</button>
      </div>

      {!editing && (
        <div className="flex items-center gap-6 mb-7 border-b border-white/[0.08]" style={MONO}>
          <button className={tab(view === 'overview')} onClick={() => setView('overview')}>Overview</button>
          <button className={tab(view === 'posts')} onClick={() => setView('posts')}>Posts</button>
          <button className={tab(view === 'subscribers')} onClick={loadSubs}>Subscribers</button>
          <button className={tab(view === 'comments')} onClick={loadCmts}>Comments</button>
          <button className={tab(view === 'questions')} onClick={loadQueries}>Questions</button>
          {view === 'posts' && <button onClick={() => setEditing({ ...blankDraft })} className="ml-auto text-[11px] tracking-[0.14em] uppercase px-4 py-2 rounded-[5px] bg-[#ece9e1] text-[#0a0a0a] hover:opacity-80 transition mb-2">New post →</button>}
          {view === 'subscribers' && subs && subs.length > 0 && <button onClick={exportCsv} className="ml-auto text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ece9e1] transition mb-2">Export CSV ↓</button>}
        </div>
      )}

      {msg && <p style={MONO} className="mb-5 text-[10px] tracking-[0.12em] uppercase text-[#9ec88a] bg-white/[0.04] border border-white/[0.1] rounded-[5px] px-4 py-2.5 inline-block">{msg}</p>}
      {err && <p style={MONO} className="mb-5 text-[10px] tracking-[0.12em] uppercase text-[#ff8a83] bg-white/[0.04] border border-white/[0.1] rounded-[5px] px-4 py-2.5 inline-block">{err}</p>}

      {/* ---------- editor ---------- */}
      {view === 'overview' && !editing ? (
        overview ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {([['Published', overview.posts.published, `${overview.posts.drafts} draft`], ['Comments', overview.comments.total, `${overview.comments.hidden} hidden`], ['Comment likes', overview.likes, ''], ['Blog votes', `${overview.votes.up}/${overview.votes.down}`, 'up / down'], ['Subscribers', overview.subscribers.confirmed, `${overview.subscribers.pending} pending`], ['Agent Qs', overview.agent.total, `${overview.agent.gemini} live`]] as [string, number | string, string][]).map(([l, v, sub]) => (
                <div key={l} className="border border-white/[0.08] rounded-xl p-4 bg-white/[0.02]"><div style={MONO} className="text-[9px] tracking-[0.16em] uppercase text-[#8a8a82]">{l}</div><div className="text-2xl mt-1.5">{v}</div>{sub && <div style={MONO} className="text-[10px] text-[#8a8a82] mt-0.5">{sub}</div>}</div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="border border-white/[0.08] rounded-xl p-5">
                <div style={MONO} className="text-[10px] tracking-[0.16em] uppercase text-[#8a8a82] mb-4">New subscribers · 14 days</div>
                <div className="flex items-end gap-1.5 h-24">
                  {overview.subscribers.growth.map((d, i) => { const max = Math.max(1, ...overview.subscribers.growth.map((x) => x.n)); return <div key={i} title={`${d.label}: ${d.n}`} className="flex-1 bg-[#9ec8ff]/70 rounded-sm" style={{ height: `${Math.max(3, (d.n / max) * 100)}%` }} />; })}
                </div>
                <div style={MONO} className="flex justify-between text-[9px] text-[#55554f] mt-2"><span>{overview.subscribers.growth[0]?.label}</span><span>{overview.subscribers.growth[overview.subscribers.growth.length - 1]?.label}</span></div>
              </div>
              <div className="border border-white/[0.08] rounded-xl p-5">
                <div style={MONO} className="text-[10px] tracking-[0.16em] uppercase text-[#8a8a82] mb-4">Agent · {overview.agent.total} questions</div>
                <div className="h-2 rounded-full overflow-hidden bg-white/10 flex mb-2"><div className="bg-[#9ec88a]" style={{ width: `${overview.agent.total ? (overview.agent.gemini / overview.agent.total) * 100 : 0}%` }} /><div className="bg-[#ffb86b]" style={{ width: `${overview.agent.total ? (overview.agent.fallback / overview.agent.total) * 100 : 0}%` }} /></div>
                <div style={MONO} className="text-[10px] text-[#8a8a82] mb-4">{overview.agent.gemini} live · {overview.agent.fallback} fallback</div>
                <div style={MONO} className="text-[9px] tracking-[0.14em] uppercase text-[#8a8a82] mb-2">Most asked</div>
                {overview.agent.top.length ? overview.agent.top.map((q, i) => (<div key={i} className="flex justify-between gap-3 text-[12px] py-1 border-b border-white/[0.05]"><span className="truncate text-[#c9c9bf]">{q.question}</span><span style={MONO} className="text-[#8a8a82] shrink-0">{q.count}</span></div>)) : <div style={MONO} className="text-[10px] text-[#55554f]">No questions yet.</div>}
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="border border-white/[0.08] rounded-xl p-5">
                <div style={MONO} className="text-[10px] tracking-[0.16em] uppercase text-[#8a8a82] mb-3">Top posts</div>
                {overview.topPosts.length ? overview.topPosts.map((p) => (<div key={p.slug} className="flex items-center justify-between gap-3 py-2 border-b border-white/[0.05]"><a href={`/blogs/${p.slug}`} target="_blank" rel="noopener" className="text-[13px] truncate hover:text-[#9ec8ff]">{p.title}</a><span style={MONO} className="text-[10px] text-[#8a8a82] shrink-0">{p.comments} comments · {p.votes} votes</span></div>)) : <div style={MONO} className="text-[10px] text-[#55554f]">No posts yet.</div>}
              </div>
              <div className="border border-white/[0.08] rounded-xl p-5">
                <div style={MONO} className="text-[10px] tracking-[0.16em] uppercase text-[#8a8a82] mb-3">Recent activity</div>
                {overview.recent.length ? overview.recent.map((r, i) => (<div key={i} className="flex items-baseline gap-2.5 py-1.5 text-[12px]"><span style={MONO} className={`text-[8px] uppercase tracking-[0.1em] w-[62px] shrink-0 ${r.kind === 'comment' ? 'text-[#9ec8ff]' : r.kind === 'subscriber' ? 'text-[#9ec88a]' : r.kind === 'question' ? 'text-[#ffb86b]' : 'text-[#ed93b1]'}`}>{r.kind}</span><span className="text-[#c9c9bf] truncate">{r.label}</span></div>)) : <div style={MONO} className="text-[10px] text-[#55554f]">Nothing yet.</div>}
              </div>
            </div>
            {overview.recs.top && <div style={MONO} className="text-[11px] text-[#8a8a82]">◢ Recs P1: <span className="text-[#ece9e1]">{overview.recs.top.title}</span> — {overview.recs.top.by} (+{overview.recs.top.net}) · {overview.recs.players} players · {overview.recs.votes} votes</div>}
          </div>
        ) : <p style={MONO} className="text-[#8a8a82] text-[11px] tracking-[0.14em] uppercase py-8">Loading…</p>
      ) : editing ? (
        <div className="space-y-4">
          <div><label className={labelCls}>Title</label><input className={inputCls} value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Post title" /></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className={labelCls}>Slug <span className="text-[#55554f]">(blank = from title)</span></label><input className={inputCls} value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="auto" /></div>
            <div><label className={labelCls}>Read time <span className="text-[#55554f]">(blank = auto)</span></label><input className={inputCls} value={editing.readTime} onChange={(e) => setEditing({ ...editing, readTime: e.target.value })} placeholder="auto" inputMode="numeric" /></div>
          </div>
          <div><label className={labelCls}>Description</label><input className={inputCls} value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="One-line summary for cards + SEO" /></div>
          <div><label className={labelCls}>Tags <span className="text-[#55554f]">(comma-separated)</span></label><input className={inputCls} value={editing.tags} onChange={(e) => setEditing({ ...editing, tags: e.target.value })} placeholder="MCP, AI Engineering" /></div>
          <div><label className={labelCls}>Content <span className="text-[#55554f]">(Markdown)</span></label>
            <textarea className={`${inputCls} font-mono min-h-[420px] resize-y leading-relaxed`} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} placeholder="# Title&#10;&#10;Write in Markdown — ## headings build the table of contents." /></div>
          <label className="flex items-center gap-2.5 cursor-pointer" style={MONO}><input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} className="accent-[#ece9e1]" /><span className="text-[11px] tracking-[0.14em] uppercase text-[#9b9b91]">Published</span></label>
          <div className="flex items-center gap-3 pt-2" style={MONO}>
            <button onClick={save} disabled={busy} className="text-[11px] tracking-[0.14em] uppercase px-5 py-2.5 rounded-[5px] bg-[#ece9e1] text-[#0a0a0a] hover:opacity-80 disabled:opacity-30 transition">{busy ? 'Saving…' : editing.id ? 'Update →' : 'Create →'}</button>
            <button onClick={() => { setEditing(null); setErr(''); }} className="text-[11px] tracking-[0.14em] uppercase px-4 py-2.5 rounded-[5px] border border-white/[0.12] text-[#8a8a82] hover:text-[#ece9e1] hover:border-white/40 transition">Cancel</button>
            {editing.slug && <a href={`/blogs/${editing.slug}`} target="_blank" rel="noopener" className="ml-auto text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ece9e1] transition">Preview ↗</a>}
          </div>
        </div>
      ) : view === 'posts' ? (
        <div className="border-t border-white/[0.08]">
          {posts.length === 0 && <p style={MONO} className="text-[#8a8a82] text-[11px] tracking-[0.14em] uppercase py-8">No posts yet — create one.</p>}
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 py-4 border-b border-white/[0.07]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#ece9e1] text-sm truncate">{p.title}</span>
                  <span style={MONO} className={`text-[9px] tracking-[0.14em] uppercase px-1.5 py-0.5 rounded ${p.published ? 'text-[#9ec88a] border border-[#9ec88a]/40' : 'text-[#8a8a82] border border-white/15'}`}>{p.published ? 'Live' : 'Draft'}</span>
                </div>
                <div style={MONO} className="text-[10px] tracking-[0.08em] text-[#8a8a82] mt-1 truncate">/{p.slug}{p.readTime ? ` · ${p.readTime} min` : ''}{p.tags.length ? ` · ${p.tags.slice(0, 3).join(', ')}` : ''}</div>
              </div>
              <div className="flex items-center gap-3 shrink-0" style={MONO}>
                <button onClick={() => setEditing(toDraft(p))} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ece9e1] transition">Edit</button>
                <button onClick={() => togglePublish(p)} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ece9e1] transition">{p.published ? 'Unpublish' : 'Publish'}</button>
                <button onClick={() => notify(p)} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#9ec8ff] transition">Notify</button>
                <button onClick={() => removePost(p)} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ff6259] transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : view === 'subscribers' ? (
        <div className="border-t border-white/[0.08]">
          {!subs && <p style={MONO} className="text-[#8a8a82] text-[11px] tracking-[0.14em] uppercase py-8">Loading…</p>}
          {subs && subs.length === 0 && <p style={MONO} className="text-[#8a8a82] text-[11px] tracking-[0.14em] uppercase py-8">No subscribers yet.</p>}
          {subs && subs.map((s) => (
            <div key={s.id} className="flex items-center gap-4 py-3.5 border-b border-white/[0.07]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-[#ece9e1] text-sm truncate">{s.email}</span>
                  <span style={MONO} className={`text-[9px] tracking-[0.14em] uppercase px-1.5 py-0.5 rounded ${s.confirmed ? 'text-[#9ec88a] border border-[#9ec88a]/40' : 'text-[#ffb86b] border border-[#ffb86b]/40'}`}>{s.confirmed ? 'Confirmed' : 'Pending'}</span>
                </div>
                <div style={MONO} className="text-[10px] tracking-[0.08em] text-[#8a8a82] mt-1 truncate">{s.name || '—'} · {new Date(s.createdAt).toLocaleDateString()}</div>
              </div>
              <button onClick={() => delSub(s)} style={MONO} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ff6259] transition shrink-0">Remove</button>
            </div>
          ))}
        </div>
      ) : view === 'comments' ? (
        <div className="border-t border-white/[0.08]">
          {!cmts && <p style={MONO} className="text-[#8a8a82] text-[11px] tracking-[0.14em] uppercase py-8">Loading…</p>}
          {cmts && cmts.length === 0 && <p style={MONO} className="text-[#8a8a82] text-[11px] tracking-[0.14em] uppercase py-8">No comments yet.</p>}
          {cmts && cmts.map((c) => (
            <div key={c.id} className={`py-4 border-b border-white/[0.07] ${c.hidden ? 'opacity-50' : ''}`}>
              <div className="flex items-center gap-2.5 mb-1.5" style={MONO}>
                <span className="text-[#ece9e1] text-[11px] tracking-[0.1em] uppercase">{c.user?.name?.trim() || 'Anonymous'}</span>
                <span className="text-[#8a8a82] text-[10px]">on</span>
                <a href={`/blogs/${c.blog.slug}#comments`} target="_blank" rel="noopener" className="text-[#9ec8ff] text-[10px] truncate max-w-[200px] hover:underline">{c.blog.title}</a>
                {c.hidden && <span className="text-[9px] tracking-[0.14em] uppercase text-[#ffb86b]">Hidden</span>}
                {c._count.likes > 0 && <span className="text-[#ed93b1] text-[10px]">♥ {c._count.likes}</span>}
              </div>
              <p className="text-[#c9c9bf] text-sm font-light">{c.content}</p>
              <div className="mt-2 flex items-center gap-4" style={MONO}>
                <button onClick={() => toggleHide(c)} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ece9e1] transition">{c.hidden ? 'Unhide' : 'Hide'}</button>
                <button onClick={() => delCmt(c)} className="text-[10px] tracking-[0.12em] uppercase text-[#8a8a82] hover:text-[#ff6259] transition">Delete</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-t border-white/[0.08]">
          {!queries && <p style={MONO} className="text-[#8a8a82] text-[11px] tracking-[0.14em] uppercase py-8">Loading…</p>}
          {queries && queries.length === 0 && <p style={MONO} className="text-[#8a8a82] text-[11px] tracking-[0.14em] uppercase py-8">No one has asked the agent yet.</p>}
          {queries && queries.map((qq) => (
            <div key={qq.id} className="py-4 border-b border-white/[0.07]">
              <div className="flex items-center gap-2.5 mb-1.5" style={MONO}>
                <span className={`text-[9px] tracking-[0.14em] uppercase px-1.5 py-0.5 rounded border ${qq.source === 'gemini' ? 'text-[#9ec88a] border-[#9ec88a]/40' : 'text-[#ffb86b] border-[#ffb86b]/40'}`}>{qq.source || 'fallback'}</span>
                <span className="text-[#8a8a82] text-[10px]">{new Date(qq.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-[#ece9e1] text-sm">{qq.question}</p>
              {qq.answer && <p className="text-[#9b9b91] text-[13px] font-light mt-1.5 leading-relaxed">{qq.answer}</p>}
            </div>
          ))}
        </div>
      )}

      {confirmCfg && (
        <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4" onClick={(e) => { if (e.target === e.currentTarget) setConfirmCfg(null); }}>
          <div className="w-full max-w-sm bg-[#101116] border border-white/[0.16] rounded-[12px] p-6">
            <h3 className="text-[#ece9e1] text-lg mb-1.5">{confirmCfg.title}</h3>
            <p className="text-[#9b9b91] text-sm mb-5 leading-relaxed">{confirmCfg.body}</p>
            <div className="flex gap-3" style={MONO}>
              <button onClick={() => { const fn = confirmCfg.onYes; setConfirmCfg(null); fn(); }} className={`text-[11px] tracking-[0.14em] uppercase px-5 py-2.5 rounded-[6px] text-[#0a0a0a] hover:opacity-85 transition ${confirmCfg.danger ? 'bg-[#ff6259]' : 'bg-[#ece9e1]'}`}>{confirmCfg.label}</button>
              <button onClick={() => setConfirmCfg(null)} className="text-[11px] tracking-[0.14em] uppercase px-4 py-2.5 rounded-[6px] border border-white/[0.14] text-[#8a8a82] hover:text-[#ece9e1] hover:border-white/40 transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
