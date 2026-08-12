import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body; // 'queued' | 'playing' | 'played'

    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return new NextResponse('User Not Found', { status: 404 });

    // If setting a track to playing, we should set current playing to played
    if (status === 'playing') {
      await prisma.songRequest.updateMany({
        where: { userId: dbUser.id, status: 'playing' },
        data: { status: 'played' }
      });
    }

    const updated = await prisma.songRequest.update({
      where: { id, userId: dbUser.id },
      data: { status }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating queue:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;
    
    const dbUser = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!dbUser) return new NextResponse('User Not Found', { status: 404 });

    await prisma.songRequest.delete({
      where: { id, userId: dbUser.id }
    });

    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Error deleting from queue:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
