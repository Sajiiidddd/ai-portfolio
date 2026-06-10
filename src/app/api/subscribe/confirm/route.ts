import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySubToken, siteUrl } from '@/lib/mailer';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = (url.searchParams.get('email') || '').toLowerCase();
  const token = url.searchParams.get('token') || '';
  if (!verifySubToken(email, 'confirm', token)) {
    return NextResponse.redirect(`${siteUrl()}/blogs?subscribe=invalid`);
  }
  await prisma.subscriber.updateMany({
    where: { email },
    data: { confirmed: true, confirmedAt: new Date() },
  });
  return NextResponse.redirect(`${siteUrl()}/blogs?subscribe=confirmed`);
}
