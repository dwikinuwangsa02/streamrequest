import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    
    let dbUser = await prisma.user.findUnique({ 
      where: { clerkId: userId },
      include: { settings: true }
    });
    
    if (!dbUser) {
        dbUser = await prisma.user.create({ 
          data: { clerkId: userId },
          include: { settings: true }
        });
    }

    if (!dbUser.settings) {
      const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY || crypto.randomUUID();
      try {
        await prisma.settings.create({
          data: { userId: dbUser.id, streamKey: streamKey }
        });
      } catch (err) {}
    }

    const requests = await prisma.songRequest.findMany({
      where: { userId: dbUser.id },
      orderBy: [
        { isPriority: 'desc' },
        { createdAt: 'asc' }
      ]
    });

    const queue = requests.filter(r => r.status === 'queued');
    const history = requests.filter(r => r.status === 'played').sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    const nowPlaying = requests.find(r => r.status === 'playing') || null;

    return NextResponse.json({ queue, history, nowPlaying });
  } catch (error) {
    console.error('Error fetching queue:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({ 
      where: { clerkId: userId },
      include: { settings: true }
    });
    
    if (!dbUser) {
        dbUser = await prisma.user.create({ 
          data: { clerkId: userId },
          include: { settings: true } 
        });
    }

    if (!dbUser.settings) {
      const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY || crypto.randomUUID();
      try {
        await prisma.settings.create({
          data: {
            userId: dbUser.id,
            streamKey: streamKey
          }
        });
      } catch (err) {
        // If unique constraint fails, it might be created by another request
      }
    }

    const body = await req.json();
    const { title, url, thumbnail, source, requestedBy, isPriority, donationAmount, sourceId } = body;

    const existingPlaying = await prisma.songRequest.findFirst({
      where: { userId: dbUser.id, status: 'playing' }
    });
    const queuedCount = await prisma.songRequest.count({
      where: { userId: dbUser.id, status: 'queued' }
    });
    
    const newStatus = (!existingPlaying && queuedCount === 0) ? 'playing' : 'queued';

    const request = await prisma.songRequest.create({
      data: {
        userId: dbUser.id,
        title,
        url,
        thumbnail,
        source,
        requestedBy,
        isPriority: isPriority || false,
        donationAmount: donationAmount || 0,
        status: newStatus,
      }
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error('Error adding to queue:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ 
      where: { clerkId: userId }
    });
    
    if (!dbUser) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Delete all queued items (or mark as played)
    // Deleting them is cleaner for "Clear Queue" so they don't clutter history
    await prisma.songRequest.deleteMany({
      where: { 
        userId: dbUser.id,
        status: 'queued'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error clearing queue:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
