import { NextResponse } from 'next/server';
import { TikTokLiveConnection } from 'tiktok-live-connector';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import ytSearch from 'yt-search';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return new NextResponse('Username required', { status: 400 });
  }

  const { userId } = await auth();
  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { settings: true }
  });
  
  if (!user || !user.settings) {
    return new NextResponse('User settings not found', { status: 404 });
  }

  const chatCommand = user.settings.chatCommand || '!sr';
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let tiktokConnection: any = null;
      let isClosed = false;
      
      const sendEvent = (type: string, data: any) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch (e) {
          isClosed = true;
        }
      };

      return new Promise<void>(async (resolve) => {
        const cleanup = () => {
          if (isClosed) return;
          isClosed = true;
          try { controller.close(); } catch (e) {}
          if (tiktokConnection) {
            try { tiktokConnection.disconnect(); } catch(e) {}
          }
          resolve();
        };

        try {
          tiktokConnection = new TikTokLiveConnection(username, {});
          
          await tiktokConnection.connect();
          sendEvent('connected', { message: `Connected to @${username}` });

          tiktokConnection.on('chat', async (data: any) => {
            const commentText = data.content || data.comment;
            if (!commentText || typeof commentText !== 'string') return;
            
            const nickname = data.user?.nickname || data.nickname || 'Unknown User';
            const profilePictureUrl = data.user?.avatarThumb?.urlList?.[0] || data.profilePictureUrl;
            
            sendEvent('chat', {
              uniqueId: data.user?.displayId || data.uniqueId,
              nickname: nickname,
              comment: commentText,
              profilePictureUrl: profilePictureUrl
            });

            // Check for command
            const cmd = chatCommand.trim().toLowerCase();
            const textLower = commentText.trim().toLowerCase();

            if (textLower.startsWith(cmd)) {
               const query = commentText.trim().slice(cmd.length).trim();
               if (query) {
                  try {
                    const searchResult = await ytSearch(query + " audio");
                    let topVideo = null;
                    for (const video of searchResult.videos) {
                      const titleLower = video.title.toLowerCase();
                      if (!titleLower.includes("official video") && !titleLower.includes("official music video") && !titleLower.includes("music video") && !titleLower.includes("mv") && !titleLower.includes("live") && !titleLower.includes("performance")) {
                        topVideo = video;
                        break;
                      }
                    }
                    if (!topVideo) topVideo = searchResult.videos[0];
                    
                    if (topVideo) {
                      const existingPlaying = await prisma.songRequest.findFirst({
                        where: { userId: user.id, status: 'playing' }
                      });
                      
                      const queuedCount = await prisma.songRequest.count({
                        where: { userId: user.id, status: 'queued' }
                      });

                      const newStatus = (!existingPlaying && queuedCount === 0) ? 'playing' : 'queued';

                      await prisma.songRequest.create({
                        data: {
                          userId: user.id,
                          title: topVideo.title,
                          url: topVideo.videoId,
                          thumbnail: topVideo.thumbnail,
                          source: 'youtube',
                          requestedBy: nickname,
                          isPriority: false,
                          donationAmount: 0,
                          status: newStatus,
                        }
                      });
                      
                      sendEvent('system', { message: `Added ${topVideo.title} to queue by ${nickname}` });
                    }
                  } catch (err) {
                    console.error("Failed to add from chat", err);
                  }
               }
            }
          });

          tiktokConnection.on('disconnected', () => {
            sendEvent('system', { message: 'Disconnected from TikTok' });
            cleanup();
          });
          
          tiktokConnection.on('error', (err: any) => {
            sendEvent('connectionError', { message: err.message || 'Connection error' });
            cleanup();
          });

        } catch (err: any) {
          sendEvent('connectionError', { message: err.message || 'Failed to connect' });
          cleanup();
        }

        req.signal.addEventListener('abort', () => {
          cleanup();
        });
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
