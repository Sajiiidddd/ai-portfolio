import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toolkit',
  description: 'The stack I build with — languages, ML frameworks, infra, and the certifications behind them.',
  alternates: { canonical: '/toolkit' },
  openGraph: { title: 'Toolkit · Sajid Tamboli', description: 'The stack I build with — languages, ML frameworks, infra, and the certifications behind them.', type: 'website', url: '/toolkit' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
