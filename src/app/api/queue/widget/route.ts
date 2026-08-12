import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const streamKey = searchParams.get('key');

    if (!streamKey) {
      return new NextResponse('Missing streamKey', { status: 400 });
    }

    const settings = await prisma.settings.findUnique({
      where: { streamKey },
      include: { user: true }
    });

    if (!settings) {
      return new NextResponse('Invalid streamKey', { status: 403 });
    }

    const userId = settings.user.id;

    const requests = await prisma.songRequest.findMany({
      where: { userId },
      orderBy: [
        { isPriority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    const queue = requests.filter(r => r.status === 'queued');
    const nowPlaying = requests.find(r => r.status === 'playing') || null;

    return NextResponse.json({ 
      queue, 
      nowPlaying,
      spotifyToken: settings.spotifyToken 
    });
  } catch (error) {
    console.error('Error fetching widget queue:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
