import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Certifications',
  description: 'Verified certifications and credentials behind the toolkit.',
  alternates: { canonical: '/certifications' },
};


export default function Page() {
  redirect('/toolkit');
}
