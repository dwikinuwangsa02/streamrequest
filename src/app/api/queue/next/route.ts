import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // For widget, it might not have auth context, so we expect userId in body or rely on streamKey
    // Wait, the widget only has the NEXT_PUBLIC_STREAM_KEY.
    // Let's find the user by streamKey in Settings
    const body = await req.json();
    const { streamKey } = body;

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

    // 1. Find currently playing
    const playing = await prisma.songRequest.findFirst({
      where: { userId, status: 'playing' }
    });

    if (playing) {
      // Mark as played
      await prisma.songRequest.update({
        where: { id: playing.id },
        data: { status: 'played' }
      });
    }

    // 2. Find next in queue
    const nextInQueue = await prisma.songRequest.findFirst({
      where: { userId, status: 'queued' },
      orderBy: [
        { isPriority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    if (nextInQueue) {
       await prisma.songRequest.update({
         where: { id: nextInQueue.id },
         data: { status: 'playing' }
       });
       return NextResponse.json(nextInQueue);
    }

    return NextResponse.json({ message: 'Queue is empty' });
  } catch (error) {
    console.error('Error in /api/queue/next:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
