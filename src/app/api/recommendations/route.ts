import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      type,
      externalId,
      title,
      subtitle,
      imageUrl,
      year,
      review,
      recommendedBy,
      userId,
    } = body;

    // ✅ Validate required fields
    if (!type || !externalId || !title || !review || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (review.length > 50) {
      return NextResponse.json({ error: 'Review must be 50 characters or fewer' }, { status: 400 });
    }

    // ✅ Enforce 5-recommendation limit per user per type
    const count = await prisma.recommendation.count({
      where: {
        type,
        userId,
      },
    });

    if (count >= 5) {
      return NextResponse.json({ error: 'Recommendation limit reached (5 max)' }, { status: 403 });
    }

    // ✅ Create the recommendation
    const rec = await prisma.recommendation.create({
      data: {
        type,
        externalId: String(externalId),
        title,
        subtitle,
        imageUrl,
        year,
        review,
        recommendedBy: recommendedBy || 'Anonymous',
        userId,
        timestamp: BigInt(Date.now()),
      },
    });

    // ✅ Return safely (convert BigInt)
    return NextResponse.json({
      ...rec,
      timestamp: Number(rec.timestamp),
    });

  } catch (err) {
    console.error('POST /recommendation error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') as 'MOVIE' | 'SONG' | null;
    const sort = searchParams.get('sort') || 'latest';

    const whereClause = type ? { type } : {};

    // ✅ Use correct array syntax for orderBy
    const recommendations = await prisma.recommendation.findMany({
      where: whereClause,
      orderBy: sort === 'top'
        ? [{ upvotes: 'desc' }]
        : [{ createdAt: 'desc' }],
    });

    // ✅ Convert BigInt before returning
    return NextResponse.json(
      recommendations.map((rec) => ({
        ...rec,
        timestamp: Number(rec.timestamp),
      }))
    );

  } catch (err) {
    console.error('GET /recommendation error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


