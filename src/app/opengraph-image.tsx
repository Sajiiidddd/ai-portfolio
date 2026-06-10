import { ogCard, OG_SIZE, OG_CONTENT_TYPE } from '@/lib/og';
import { SITE_NAME, SITE_TAGLINE } from '@/lib/site';

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = `${SITE_NAME} — ${SITE_TAGLINE}`;

export default function Image() {
  return ogCard({
    eyebrow: 'Portfolio',
    title: 'Sajid Tamboli',
    footerLeft: 'AI / ML Engineer · Pune, IN',
    footerRight: 'strong with the source',
  });
}
