'use client';

import { useEffect, useState, useCallback } from 'react';
import { pixel, mono, grotesk } from '@/app/fonts';
import SpotifySignInButton from './SpotifySignInButton';

type Kind = 'MOVIE' | 'SONG';
type Rec = {
  id: string; type: Kind; title: string; subtitle: string | null; imageUrl: string | null;
  year: string | null; review: string; recommendedBy: string; upvotes: number; downvotes: number;
  mine: boolean; userVote: 'UPVOTE' | 'DOWNVOTE' | null;
};
type SearchItem = { id: string; title: string; subtitle: string; imageUrl: string | null; year: string };

const PALETTE = ['#3b4a6b', '#5a3b53', '#3b5a47', '#6b5a3b', '#4a3b6b', '#6b3b3b', '#3b6b66', '#5a5a3b'];
const col = (s: string) => PALETTE[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % PALETTE.length];
const net = (r: Rec) => r.upvotes - r.downvotes;

/* ---- motif icons (replace emojis) ---- */
function MovieMotif({ s = 16 }: { s?: number }) {
  return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M3 15h18M8 5v14M16 5v14" opacity=".5" />
  </svg>);
}
function SongMotif({ s = 16 }: { s?: number }) {
  return (<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
    <path d="M5 14V8M9 17V5M13 14V9M17 16V7M21 13v-2" />
  </svg>);
}
/* poster fallback = motif on a seeded gradient */
function PosterArt({ kind, seed }: { kind: Kind; seed: string }) {
  return (<div className="rec-art" style={{ background: `linear-gradient(160deg, ${col(seed)}, #0e0e12)` }} aria-hidden>
    {kind === 'MOVIE'
      ? <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.2"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 9h18M3 15h18M8 5v14M16 5v14" opacity=".55" /></svg>
      : <svg viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1.4" strokeLinecap="round"><path d="M5 14V8M9 18V5M13 15V9M17 17V7M21 13v-2" /></svg>}
  </div>);
}
function Poster({ r, cls }: { r: { imageUrl?: string | null; title: string; type?: Kind }; cls: string; }) {
  if (r.imageUrl) return <div className={cls} style={{ backgroundImage: `url(${r.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />;
  return <div className={cls}><PosterArt kind={(r.type as Kind) || 'MOVIE'} seed={r.title} /></div>;
}

/* ============ Add modal (own local state → typing here never re-renders the page) ============ */
function AddModal({ type, onClose, onAdded }: { type: Kind; onClose: () => void; onAdded: (r: Rec) => void; }) {
  const kind = type === 'MOVIE' ? 'movie' : 'song';
  const [name, setName] = useState('');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [picked, setPicked] = useState<SearchItem | null>(null);
  const [review, setReview] = useState('');
  const [err, setErr] = useState('');
  const [searchErr, setSearchErr] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => { setName(localStorage.getItem('recName') || ''); }, []);
  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 2) { setResults([]); return; }
      try {
        const r = await fetch(`/api/search/${type === 'MOVIE' ? 'tmdb' : 'spotify'}?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        if (Array.isArray(d)) { setResults(d); setSearchErr(d.length ? '' : 'No matches.'); }
        else { setResults([]); setSearchErr(d?.detail || d?.error || 'Search unavailable.'); }
      } catch { setResults([]); setSearchErr('Network error.'); }
    }, 300);
    return () => clearTimeout(t);
  }, [q, type]);

  const submit = async () => {
    setErr('');
    if (!name.trim()) { setErr('Add your name (below) first.'); return; }
    if (!picked) { setErr('Search and pick one.'); return; }
    if (!review.trim()) { setErr('Add a one-line review.'); return; }
    setPosting(true);
    localStorage.setItem('recName', name.trim());
    try {
      const r = await fetch('/api/recommendations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
        body: JSON.stringify({ type, externalId: picked.id, title: picked.title, subtitle: picked.subtitle, imageUrl: picked.imageUrl, year: picked.year, review: review.trim(), recommendedBy: name.trim() }) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || 'Failed.'); setPosting(false); return; }
      onAdded(d); onClose();
    } catch { setErr('Network error.'); setPosting(false); }
  };

  return (
    <div className="rec-ov" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rec-ovblur" aria-hidden="true"></div>
      <div className="rec-modal">
        <h3>Add a {kind}</h3><div className="rec-mh">name · search · pick · review</div>
        <input className="rec-inp" value={name} maxLength={40} placeholder="Your name (required)" onChange={(e) => setName(e.target.value)} />
        <input className="rec-inp" autoFocus value={q} placeholder={`Search a ${kind}…`} onChange={(e) => setQ(e.target.value)} />
        <div className="rec-results">
          {results.map((it) => (<div key={it.id} className={`rec-res${picked?.id === it.id ? ' sel' : ''}`} onClick={() => setPicked(it)}>
            {it.imageUrl ? <div className="rec-rth" style={{ backgroundImage: `url(${it.imageUrl})`, backgroundSize: 'cover' }} /> : <div className="rec-rth"><PosterArt kind={type} seed={it.title} /></div>}
            <div><div className="rec-rn">{it.title}</div><div className="rec-rs">{it.subtitle}{it.year ? ` · ${it.year}` : ''}</div></div></div>))}
          {q.trim().length >= 2 && results.length === 0 && searchErr && (
            <div className="rec-empty space-y-3">
              <div>{searchErr}</div>
              {type === 'SONG' && searchErr.toLowerCase().includes('spotify') && (
                <SpotifySignInButton callbackUrl="/recommendations" label="Connect Spotify" className="rec-go" />
              )}
            </div>
          )}
        </div>
        {picked && (<><input className="rec-inp" value={review} maxLength={50} placeholder="One-line review" onChange={(e) => setReview(e.target.value)} /><div className="rec-cc">{review.length}/50</div></>)}
        <div className="rec-mfoot"><button className="rec-go" disabled={posting} onClick={submit}>{posting ? 'Adding…' : 'Add to board →'}</button>
          <button className="rec-x" onClick={onClose}>Cancel</button><span className="rec-err">{err}</span></div>
      </div>
    </div>
  );
}

/* ============ Edit modal: change the review AND/OR swap the pick ============ */
function EditModal({ rec, type, onClose, onSaved }: { rec: Rec; type: Kind; onClose: () => void; onSaved: (r: Rec) => void; }) {
  const kind = type === 'MOVIE' ? 'movie' : 'song';
  const [review, setReview] = useState(rec.review);
  const [changing, setChanging] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searchErr, setSearchErr] = useState('');
  const [picked, setPicked] = useState<SearchItem | null>(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!changing) return;
    const t = setTimeout(async () => {
      if (q.trim().length < 2) { setResults([]); setSearchErr(''); return; }
      try {
        const r = await fetch(`/api/search/${type === 'MOVIE' ? 'tmdb' : 'spotify'}?q=${encodeURIComponent(q)}`);
        const d = await r.json();
        if (Array.isArray(d)) { setResults(d); setSearchErr(d.length ? '' : 'No matches.'); }
        else { setResults([]); setSearchErr(d?.detail || d?.error || 'Search unavailable.'); }
      } catch { setResults([]); setSearchErr('Network error.'); }
    }, 300);
    return () => clearTimeout(t);
  }, [q, changing, type]);

  const cur = picked
    ? { title: picked.title, subtitle: picked.subtitle, year: picked.year, imageUrl: picked.imageUrl }
    : { title: rec.title, subtitle: rec.subtitle, year: rec.year, imageUrl: rec.imageUrl };

  const save = async () => {
    setErr('');
    if (!review.trim()) { setErr('Add a one-line review.'); return; }
    setSaving(true);
    const body: Record<string, unknown> = { review: review.trim() };
    if (picked) { body.title = picked.title; body.externalId = picked.id; body.subtitle = picked.subtitle; body.imageUrl = picked.imageUrl; body.year = picked.year; }
    try {
      const r = await fetch(`/api/recommendations/${rec.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setErr(d.error || 'Failed.'); setSaving(false); return; }
      onSaved({ ...rec, review: d.review ?? review.trim(), title: d.title ?? rec.title, subtitle: d.subtitle ?? rec.subtitle, imageUrl: d.imageUrl ?? rec.imageUrl, year: d.year ?? rec.year });
      onClose();
    } catch { setErr('Network error.'); setSaving(false); }
  };

  return (
    <div className="rec-ov" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rec-ovblur" aria-hidden="true"></div>
      <div className="rec-modal">
        <h3>Edit your {kind}</h3><div className="rec-mh">change the review · or swap the {kind}</div>

        <div className="rec-editcard">
          {cur.imageUrl ? <div className="rec-ethumb" style={{ backgroundImage: `url(${cur.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} /> : <div className="rec-ethumb"><PosterArt kind={type} seed={cur.title} /></div>}
          <div className="rec-emain">
            <div className="rec-rt">{cur.title} {cur.year && <span className="rec-yr">{cur.year}</span>}{picked && <span className="rec-mine">new pick</span>}</div>
            {cur.subtitle && <div className="rec-rs">{cur.subtitle}</div>}
            <button className="rec-mini" onClick={() => { setChanging((v) => !v); setQ(''); setResults([]); }}>{changing ? 'Cancel change' : `↻ Change ${kind}`}</button>
            {picked && <button className="rec-mini" onClick={() => { setPicked(null); setChanging(false); }}>Keep original</button>}
          </div>
        </div>

        {changing && (<>
          <input className="rec-inp" autoFocus value={q} placeholder={`Search a different ${kind}…`} onChange={(e) => setQ(e.target.value)} />
          <div className="rec-results">
            {results.map((it) => (<div key={it.id} className={`rec-res${picked?.id === it.id ? ' sel' : ''}`} onClick={() => { setPicked(it); setChanging(false); }}>
              {it.imageUrl ? <div className="rec-rth" style={{ backgroundImage: `url(${it.imageUrl})`, backgroundSize: 'cover' }} /> : <div className="rec-rth"><PosterArt kind={type} seed={it.title} /></div>}
              <div><div className="rec-rn">{it.title}</div><div className="rec-rs">{it.subtitle}{it.year ? ` · ${it.year}` : ''}</div></div></div>))}
            {q.trim().length >= 2 && results.length === 0 && searchErr && (
              <div className="rec-empty space-y-3">
                <div>{searchErr}</div>
                {type === 'SONG' && searchErr.toLowerCase().includes('spotify') && (
                  <SpotifySignInButton callbackUrl="/recommendations" label="Connect Spotify" className="rec-go" />
                )}
              </div>
            )}
          </div>
        </>)}

        <input className="rec-inp" value={review} maxLength={50} placeholder="One-line review" onChange={(e) => setReview(e.target.value)} />
        <div className="rec-cc">{review.length}/50</div>
        <div className="rec-mfoot"><button className="rec-go" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save changes →'}</button>
          <button className="rec-x" onClick={onClose}>Cancel</button><span className="rec-err">{err}</span></div>
      </div>
    </div>
  );
}

/* ================================ Page ================================ */
export default function RecommendationsClient() {
  const [items, setItems] = useState<Rec[]>([]);
  const [type, setType] = useState<Kind>('MOVIE');
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<Rec | null>(null);
  const [confirming, setConfirming] = useState<Rec | null>(null);

  const load = useCallback(async () => {
    try { const r = await fetch('/api/recommendations', { credentials: 'include' }); if (r.ok) setItems(await r.json()); }
    catch {} finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const ofType = items.filter((i) => i.type === type);
  const ranked = [...ofType].sort((a, b) => net(b) - net(a) || b.upvotes - a.upvotes);
  const mine = ofType.filter((i) => i.mine);
  const kind = type === 'MOVIE' ? 'movie' : 'song';
  const picks = items.length;
  const votesCast = items.reduce((a, i) => a + i.upvotes + i.downvotes, 0);
  const players = new Set(items.map((i) => i.recommendedBy)).size;
  const leader = [...items].sort((a, b) => net(b) - net(a))[0];

  const vote = async (rec: Rec, dir: 'UPVOTE' | 'DOWNVOTE') => {
    setItems((xs) => xs.map((x) => {
      if (x.id !== rec.id) return x;
      let { upvotes, downvotes } = x; const was = x.userVote;
      if (was === 'UPVOTE') upvotes--; if (was === 'DOWNVOTE') downvotes--;
      const nx = was === dir ? null : dir;
      if (nx === 'UPVOTE') upvotes++; if (nx === 'DOWNVOTE') downvotes++;
      return { ...x, upvotes, downvotes, userVote: nx };
    }));
    try {
      const r = await fetch('/api/recommendations/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ recommendationId: rec.id, voteType: dir }) });
      const d = await r.json().catch(() => ({}));
      if (r.ok) setItems((xs) => xs.map((x) => (x.id === rec.id ? { ...x, upvotes: d.upvotes, downvotes: d.downvotes, userVote: d.userVote } : x)));
      else load();
    } catch { load(); }
  };
  const editPick = (rec: Rec) => setEditing(rec);
  const removePick = (rec: Rec) => setConfirming(rec);
  const doRemove = async (rec: Rec) => {
    setConfirming(null);
    setItems((xs) => xs.filter((x) => x.id !== rec.id));
    await fetch(`/api/recommendations/${rec.id}`, { method: 'DELETE', credentials: 'include' });
  };

  const top = ranked.slice(0, 3); const order = [1, 0, 2];

  return (
    <main className={`${pixel.variable} ${mono.variable} ${grotesk.variable} rec-root`}>
      <nav className="rec-nav" aria-label="Primary"><a href="/"><b>Sajid Tamboli</b> · AI / ML Engineer</a><span><a href="/">About</a> · <a href="/projects">Work</a> · <a href="/blogs">Writing</a> · <a href="/toolkit">Toolkit</a> · <a href="/recommendations" className="on">Recs</a></span></nav>
      <div className="rec-wrap">
        <div className="rec-eyebrow"><span className="rec-pulse" />Recommend me · the leaderboard game</div>
        <h1 className="rec-h1">ON ROTATION</h1>
        <p className="rec-lede">Think you&apos;ve got taste? <b>Prove it.</b> Drop your favourite movies &amp; songs, rally votes, and climb the board. The most-loved pick takes <b>pole position</b> — with your name on it. Everyone plays · three slots each · make them count.</p>

        <div className="rec-stats">
          <span><b>{picks}</b> picks in play</span><i />
          <span><b>{votesCast}</b> votes cast</span><i />
          <span><b>{players}</b> {players === 1 ? 'player' : 'players'} in the game</span>
          {leader && <span className="rec-lead">· P1 right now: <b>{leader.title}</b> — {leader.recommendedBy}</span>}
        </div>

        <div className="rec-headrow">
          <div className="rec-toggle">
            <button className={`rec-tg${type === 'MOVIE' ? ' on' : ''}`} onClick={() => setType('MOVIE')}><MovieMotif />Movies</button>
            <button className={`rec-tg${type === 'SONG' ? ' on' : ''}`} onClick={() => setType('SONG')}><SongMotif />Songs</button>
          </div>
          <button className="rec-cta" disabled={type === 'SONG'} onClick={() => { if (type !== 'SONG') setAdding(true); }}>+ Add your pick</button>
        </div>

        {type === 'SONG' && (
          <div className="rec-soon">
            <div className="rec-sooneyebrow"><span className="rec-pulse" />Songs</div>
            <h2>Coming Soon</h2>
            <p>The songs lane is paused for now. I’m keeping the same visual language and atmosphere, but the entry flow is intentionally hidden until the music experience is ready.</p>
          </div>
        )}

        {type === 'SONG' ? null : (loading ? <p className="rec-empty">Loading…</p> : (<>
          <div className="rec-sec"><b>Pole position</b><span>top 3 by net votes</span></div>
          {top.length === 0 ? <p className="rec-empty">No {kind}s on the board yet — be the first.</p> : (
            <div className="rec-pole">{order.map((idx) => { const r = top[idx]; if (!r) return <div key={idx} />; const pos = idx + 1;
              return (<div key={r.id} className={`rec-pcard p${pos}`}><div className="rec-pos">P{pos}</div><Poster r={r} cls="rec-poster" />
                <div className="rec-ptitle">{r.title}</div><div className="rec-psub">{r.subtitle}{r.year ? ` · ${r.year}` : ''}</div>
                {r.review && <div className="rec-prev">&ldquo;{r.review}&rdquo;</div>}<div className="rec-pby">— {r.recommendedBy}</div>
                <div className="rec-pscore">{net(r) >= 0 ? '+' : ''}{net(r)} net</div></div>); })}</div>)}

          <div className="rec-sec"><b>Leaderboard</b><span>{ranked.length} picks</span></div>
          <div>{ranked.map((r, i) => (<div key={r.id} className="rec-row">
            <div className="rec-rank">{String(i + 1).padStart(2, '0')}</div>
            <Poster r={r} cls="rec-thumb" />
            <div className="rec-rmain"><div className="rec-rt">{r.title} {r.year && <span className="rec-yr">{r.year}</span>}{r.mine && <span className="rec-mine">yours</span>}</div>
              {r.review && <div className="rec-rrev">&ldquo;{r.review}&rdquo;</div>}<div className="rec-rby">— <b>{r.recommendedBy}</b></div></div>
            <div className="rec-votes">
              <button className={`rec-v up${r.userVote === 'UPVOTE' ? ' on' : ''}`} onClick={() => vote(r, 'UPVOTE')} aria-label="Like">▲</button>
              <span className="rec-net">{net(r) > 0 ? '+' : ''}{net(r)}</span>
              <button className={`rec-v down${r.userVote === 'DOWNVOTE' ? ' on' : ''}`} onClick={() => vote(r, 'DOWNVOTE')} aria-label="Dislike">▼</button>
            </div></div>))}
            {ranked.length === 0 && <p className="rec-empty">Nothing here yet.</p>}
          </div>

          <div className="rec-sec"><b>Your picks</b><span>{mine.length}/3 {kind}s</span></div>
          <div className="rec-you">
            {mine.length === 0 ? <div className="rec-empty">No {kind}s yet — add up to 3.</div> :
              mine.map((r) => (<div key={r.id} className="rec-slot"><Poster r={r} cls="rec-thumb" />
                <div className="rec-rmain"><div className="rec-rt">{r.title} {r.year && <span className="rec-yr">{r.year}</span>}</div><div className="rec-rrev">&ldquo;{r.review}&rdquo;</div></div>
                <button className="rec-mini" onClick={() => editPick(r)}>Edit</button><button className="rec-mini del" onClick={() => removePick(r)}>Remove</button></div>))}
            <button className="rec-add" disabled={mine.length >= 3} onClick={() => setAdding(true)}>+ Add a {kind}</button>
            {mine.length >= 3 && <span className="rec-cap">3/3 — remove one to swap</span>}
          </div>
        </>))}
      </div>

      {adding && <AddModal type={type} onClose={() => setAdding(false)} onAdded={(r) => setItems((xs) => [...xs, r])} />}
      {editing && <EditModal rec={editing} type={editing.type} onClose={() => setEditing(null)} onSaved={(u) => setItems((xs) => xs.map((x) => (x.id === u.id ? u : x)))} />}
      {confirming && (
        <div className="rec-ov" onClick={(e) => { if (e.target === e.currentTarget) setConfirming(null); }}>
          <div className="rec-ovblur" aria-hidden="true"></div>
          <div className="rec-modal rec-confirm">
            <h3>Remove this {confirming.type === 'MOVIE' ? 'movie' : 'song'}?</h3>
            <div className="rec-mh">it drops off the board for everyone — this can&apos;t be undone</div>
            <div className="rec-editcard">
              {confirming.imageUrl ? <div className="rec-ethumb" style={{ backgroundImage: `url(${confirming.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} /> : <div className="rec-ethumb"><PosterArt kind={confirming.type} seed={confirming.title} /></div>}
              <div className="rec-emain"><div className="rec-rt">{confirming.title} {confirming.year && <span className="rec-yr">{confirming.year}</span>}</div>{confirming.review && <div className="rec-rrev">&ldquo;{confirming.review}&rdquo;</div>}<div className="rec-rby">{confirming.upvotes - confirming.downvotes >= 0 ? '+' : ''}{confirming.upvotes - confirming.downvotes} net · {confirming.upvotes} up / {confirming.downvotes} down</div></div>
            </div>
            <div className="rec-mfoot"><button className="rec-danger" onClick={() => doRemove(confirming)}>Remove it</button><button className="rec-x" onClick={() => setConfirming(null)}>Keep it</button></div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .rec-root{min-height:100vh;background:#0a0a0a;color:#ece9e1;font-family:var(--font-grotesk),sans-serif}
        .rec-nav{display:flex;justify-content:space-between;align-items:center;padding:20px 5vw;font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82}
        .rec-nav a{color:inherit;text-decoration:none}.rec-nav b{color:#ece9e1}.rec-nav .on{color:#ece9e1}
        .rec-wrap{max-width:1080px;margin:0 auto;padding:10px 5vw 90px}
        .rec-eyebrow{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8a8a82;display:flex;align-items:center;gap:10px;margin-bottom:16px}
        .rec-pulse{width:7px;height:7px;background:#3ad17a;border-radius:50%;box-shadow:0 0 10px #3ad17a;animation:recpl 1.8s infinite}@keyframes recpl{50%{opacity:.3}}
        .rec-h1{font-family:var(--font-pixel),monospace;font-size:clamp(2.4rem,6vw,4.2rem);line-height:.95}
        .rec-lede{max-width:560px;margin:18px 0 0;font-weight:300;font-size:15px;line-height:1.7;color:#c2c2b9}.rec-lede b{color:#ece9e1;font-weight:500}
        .rec-stats{display:flex;align-items:center;gap:13px;margin-top:20px;font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.06em;color:#8a8a82;flex-wrap:wrap}
        .rec-stats b{color:#ece9e1;font-weight:500}
        .rec-stats i{width:3px;height:3px;border-radius:50%;background:#55554f;display:inline-block}
        .rec-lead{color:#9ec8ff}.rec-lead b{color:#9ec8ff;font-weight:500}
        .rec-headrow{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;margin-top:26px}
        .rec-cta{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#0a0a0a;background:#ece9e1;border:0;border-radius:7px;padding:11px 18px;cursor:pointer;transition:.2s}
        .rec-cta:hover{opacity:.85}.rec-cta:disabled{opacity:.35;cursor:not-allowed}
        .rec-toggle{display:flex;gap:8px}
        .rec-tg{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8a8a82;border:1px solid rgba(236,233,225,.16);background:none;border-radius:22px;padding:9px 16px;cursor:pointer;transition:.2s}
        .rec-tg:hover{color:#ece9e1}.rec-tg.on{color:#0a0a0a;background:#ece9e1;border-color:#ece9e1}
        .rec-soon{margin:18px 0 10px;border:1px solid rgba(236,233,225,.12);background:linear-gradient(180deg, rgba(236,233,225,.04), rgba(10,10,10,.2));border-radius:16px;padding:26px 22px;position:relative;overflow:hidden}
        .rec-soon:before{content:'';position:absolute;inset:auto -40px -60px auto;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle, rgba(158,200,255,.18), transparent 65%);pointer-events:none}
        .rec-sooneyebrow{display:flex;align-items:center;gap:10px;font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#8a8a82}
        .rec-soon h2{margin:12px 0 10px;font-family:var(--font-pixel),monospace;font-size:clamp(2.2rem,4vw,3.6rem);line-height:.92;color:#ece9e1}
        .rec-soon p{max-width:720px;color:#a7a79e;line-height:1.8;font-size:14px}
        .rec-sec{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#8a8a82;display:flex;align-items:baseline;gap:10px;margin:34px 0 16px;border-bottom:1px solid rgba(236,233,225,.1);padding-bottom:10px}
        .rec-sec b{color:#ece9e1;font-weight:500;font-family:var(--font-grotesk),sans-serif;font-size:18px;letter-spacing:0;text-transform:none}
        .rec-empty{font-family:var(--font-mono),monospace;font-size:11px;color:#55554f;letter-spacing:.04em;padding:8px 0}
        .rec-art{width:100%;height:100%;display:flex;align-items:center;justify-content:center}
        .rec-art svg{width:42%;height:42%}
        .rec-pole{display:grid;grid-template-columns:1fr 1.35fr 1fr;gap:14px;align-items:end}
        @media(max-width:680px){.rec-pole{grid-template-columns:1fr;gap:10px}.rec-pole .p1 .rec-poster{aspect-ratio:2/3}.rec-headrow{align-items:stretch}.rec-cta{width:100%}}
        @media(max-width:680px){.rec-v{width:40px;height:38px;font-size:15px}.rec-modal{padding:18px}.rec-row{gap:11px}}
        .rec-pcard{position:relative;border:1px solid rgba(236,233,225,.12);border-radius:14px;padding:16px;background:linear-gradient(170deg,#15161b,#0d0e12);overflow:hidden}
        .rec-pcard.p1{border-color:rgba(255,224,138,.4);box-shadow:0 30px 60px -34px rgba(255,224,138,.25)}
        .rec-pos{position:absolute;top:12px;right:14px;font-family:var(--font-pixel),monospace;font-size:22px}
        .p1 .rec-pos{color:#ffe08a}.p2 .rec-pos{color:#cfd2d6}.p3 .rec-pos{color:#d49a6a}
        .rec-poster{width:100%;aspect-ratio:2/3;border-radius:9px;overflow:hidden;border:1px solid rgba(236,233,225,.1)}
        .p1 .rec-poster{aspect-ratio:3/4}
        .rec-ptitle{font-size:15px;margin-top:12px;font-weight:500;line-height:1.2}
        .rec-psub{font-family:var(--font-mono),monospace;font-size:10px;color:#8a8a82;margin-top:4px;letter-spacing:.04em}
        .rec-pby{font-family:var(--font-mono),monospace;font-size:10px;color:#9ec8ff;margin-top:9px;letter-spacing:.04em}
        .rec-pscore{font-family:var(--font-mono),monospace;font-size:12px;color:#9ec88a;margin-top:6px}
        .rec-prev{font-size:13px;color:#cfcfc6;font-style:italic;margin-top:8px}
        .rec-row{display:flex;align-items:center;gap:14px;padding:13px 4px;border-bottom:1px solid rgba(236,233,225,.07)}
        .rec-rank{font-family:var(--font-mono),monospace;font-size:13px;color:#8a8a82;width:30px;text-align:center}
        .rec-thumb{width:40px;height:56px;border-radius:5px;flex:none;overflow:hidden}
        .rec-rmain{flex:1;min-width:0}
        .rec-rt{font-size:14px;display:flex;align-items:center;gap:8px}.rec-yr{font-family:var(--font-mono),monospace;font-size:10px;color:#8a8a82}
        .rec-rrev{font-size:12.5px;color:#b6b6ac;font-style:italic;margin-top:2px}
        .rec-rby{font-family:var(--font-mono),monospace;font-size:10px;color:#8a8a82;margin-top:3px}.rec-rby b{color:#9ec8ff;font-weight:400}
        .rec-mine{font-family:var(--font-mono),monospace;font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:#9ec8ff;border:1px solid rgba(158,200,255,.4);border-radius:4px;padding:2px 5px}
        .rec-votes{display:flex;align-items:center;gap:9px;flex:none}
        .rec-v{font-family:var(--font-mono),monospace;font-size:14px;color:#8a8a82;background:none;border:1px solid rgba(236,233,225,.14);border-radius:6px;width:32px;height:30px;cursor:pointer;transition:.15s}
        .rec-v:hover{border-color:rgba(236,233,225,.4);color:#ece9e1}
        .rec-v.up.on{color:#0a0a0a;background:#9ec88a;border-color:#9ec88a}
        .rec-v.down.on{color:#0a0a0a;background:#ff8a83;border-color:#ff8a83}
        .rec-net{font-family:var(--font-mono),monospace;font-size:14px;min-width:30px;text-align:center}
        .rec-you{background:rgba(255,255,255,.02);border:1px solid rgba(236,233,225,.1);border-radius:14px;padding:18px;margin-top:8px}
        .rec-slot{display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(236,233,225,.06)}
        .rec-mini{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#8a8a82;background:none;border:0;cursor:pointer}.rec-mini:hover{color:#ece9e1}.rec-mini.del:hover{color:#ff8a83}
        .rec-add{margin-top:14px;font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#0a0a0a;background:#ece9e1;border:0;border-radius:7px;padding:10px 16px;cursor:pointer}
        .rec-add:disabled{opacity:.3;cursor:not-allowed}
        .rec-cap{font-family:var(--font-mono),monospace;font-size:10px;color:#55554f;letter-spacing:.06em;margin-left:10px}
        .rec-ov{position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;padding:20px}
        .rec-ovblur{position:absolute;inset:0;background:rgba(5,5,5,.7);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);pointer-events:none}
        .rec-modal{position:relative;z-index:1;width:100%;max-width:520px;background:#101116;border:1px solid rgba(236,233,225,.16);border-radius:14px;padding:22px;max-height:88vh;overflow:auto}
        .rec-modal h3{font-size:18px;margin-bottom:4px}.rec-mh{font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:#8a8a82;margin-bottom:16px}
        .rec-inp{width:100%;background:#0c0c0c;border:1px solid rgba(236,233,225,.14);border-radius:7px;padding:10px 12px;color:#ece9e1;font-size:14px;outline:none;margin-bottom:10px}.rec-inp:focus{border-color:rgba(236,233,225,.5)}
        .rec-results{max-height:240px;overflow:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:6px}
        .rec-res{display:flex;gap:11px;align-items:center;padding:7px;border-radius:8px;cursor:pointer;border:1px solid transparent}
        .rec-res:hover,.rec-res.sel{background:rgba(236,233,225,.05);border-color:rgba(236,233,225,.14)}
        .rec-rth{width:34px;height:48px;border-radius:4px;flex:none;overflow:hidden}
        .rec-rn{font-size:13px}.rec-rs{font-family:var(--font-mono),monospace;font-size:10px;color:#8a8a82}
        .rec-mfoot{display:flex;gap:10px;align-items:center;margin-top:8px}
        .rec-go{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#0a0a0a;background:#ece9e1;border:0;border-radius:7px;padding:10px 16px;cursor:pointer}.rec-go:disabled{opacity:.3}
        .rec-danger{font-family:var(--font-mono),monospace;font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#0a0a0a;background:#ff8a83;border:0;border-radius:7px;padding:10px 16px;cursor:pointer}.rec-danger:hover{opacity:.85}
        .rec-confirm{max-width:420px}
        .rec-x{background:none;border:0;color:#8a8a82;font-size:11px;font-family:var(--font-mono),monospace;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
        .rec-err{color:#ff8a83;font-family:var(--font-mono),monospace;font-size:10px;letter-spacing:.08em;text-transform:uppercase}
        .rec-cc{font-family:var(--font-mono),monospace;font-size:10px;color:#55554f;text-align:right;margin-top:-4px;margin-bottom:8px}
        .rec-editcard{display:flex;gap:13px;align-items:flex-start;padding:12px;border:1px solid rgba(236,233,225,.12);border-radius:10px;background:rgba(255,255,255,.02);margin-bottom:14px}
        .rec-ethumb{width:46px;height:64px;border-radius:6px;flex:none;overflow:hidden}
        .rec-emain{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
        .rec-emain .rec-mini{margin-top:6px;margin-right:14px;text-align:left}
      `}</style>
    </main>
  );
}
