import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { settings: true }
    });

    if (!user || !user.settings) {
      return NextResponse.json({ chatCommand: '!sr', streamKey: null });
    }

    return NextResponse.json({ 
      chatCommand: user.settings.chatCommand,
      streamKey: user.settings.streamKey
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse('Unauthorized', { status: 401 });

    const body = await req.json();
    const { chatCommand } = body;

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return new NextResponse('User not found', { status: 404 });

    const settings = await prisma.settings.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        streamKey: crypto.randomUUID(),
        chatCommand: chatCommand || '!sr',
      },
      update: {
        chatCommand: chatCommand || '!sr',
      }
    });

    return NextResponse.json({ 
      chatCommand: settings.chatCommand,
      streamKey: settings.streamKey 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
