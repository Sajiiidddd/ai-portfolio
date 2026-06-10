import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Work',
  description: 'Selected work — F1 Strategy OS, a patented NLP BOM comparator, an open-source Zendesk MCP, and production GraphRAG agents.',
  alternates: { canonical: '/projects' },
  openGraph: { title: 'Work · Sajid Tamboli', description: 'Selected work — F1 Strategy OS, a patented NLP BOM comparator, an open-source Zendesk MCP, and production GraphRAG agents.', type: 'website', url: '/projects' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
