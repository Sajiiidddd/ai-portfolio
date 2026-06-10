import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Sajid Tamboli — AI/ML engineering, collaborations, and speaking.',
  alternates: { canonical: '/contact' },
  openGraph: { title: 'Contact · Sajid Tamboli', description: 'Get in touch with Sajid Tamboli — AI/ML engineering, collaborations, and speaking.', type: 'website', url: '/contact' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
