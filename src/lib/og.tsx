import { ImageResponse } from 'next/og';

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

type Card = { eyebrow: string; title: string; footerLeft: string; footerRight?: string; accent?: string };

export function ogCard({ eyebrow, title, footerLeft, footerRight, accent = '#9ec8ff' }: Card) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', background: '#0a0a0a', color: '#ece9e1',
          padding: '72px 80px', position: 'relative', fontFamily: 'sans-serif',
        }}
      >
        {/* accent glow */}
        <div style={{ position: 'absolute', top: -120, right: -120, width: 560, height: 560, background: `radial-gradient(closest-side, ${accent}33, transparent)`, display: 'flex' }} />
        {/* foil bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: 'linear-gradient(90deg,#7d7d75,#ece9e1,#9aa0a6,#ece9e1,#7d7d75)', display: 'flex' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 12, height: 12, borderRadius: 99, background: accent, display: 'flex' }} />
          <div style={{ fontSize: 22, letterSpacing: 6, textTransform: 'uppercase', color: '#8a8a82' }}>{eyebrow}</div>
        </div>

        <div style={{ display: 'flex', fontSize: 76, fontWeight: 700, lineHeight: 1.04, maxWidth: 1000 }}>{title}</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 24 }}>
          <div style={{ display: 'flex', color: '#ece9e1' }}>{footerLeft}</div>
          {footerRight ? <div style={{ display: 'flex', letterSpacing: 3, textTransform: 'uppercase', fontSize: 20, color: '#8a8a82' }}>{footerRight}</div> : <div style={{ display: 'flex' }} />}
        </div>
      </div>
    ),
    { ...OG_SIZE },
  );
}
