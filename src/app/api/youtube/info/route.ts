import { NextResponse } from 'next/server';
import ytSearch from 'yt-search';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return new NextResponse('Missing URL or Query', { status: 400 });
    }

    let videoId = '';
    let isUrl = false;

    // Check if it's a URL
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname.includes('youtube.com')) {
        videoId = parsedUrl.searchParams.get('v') || '';
        isUrl = true;
      } else if (parsedUrl.hostname.includes('youtu.be')) {
        videoId = parsedUrl.pathname.slice(1);
        isUrl = true;
      }
    } catch (e) {
      isUrl = false;
    }

    // If it's a valid URL with video ID, fetch directly via OEmbed
    if (isUrl && videoId) {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);

      if (!response.ok) {
        return new NextResponse('Failed to fetch video info', { status: 404 });
      }

      const data = await response.json();

      return NextResponse.json({
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url,
        sourceId: videoId,
        source: 'youtube'
      });
    } else {
      // We just pass the exact query. We don't append "audio" as it often favors covers.
      const searchResult = await ytSearch(url);
      
      let topVideo = null;
      
      // Filter out Official Music Videos, Live, and MVs
      for (const video of searchResult.videos) {
        const titleLower = video.title.toLowerCase();
        if (
          !titleLower.includes("live") &&
          !titleLower.includes("performance") &&
          !titleLower.includes("karaoke") &&
          !titleLower.includes("cover")
        ) {
          topVideo = video;
          break;
        }
      }
      
      // Fallback if all videos are filtered out
      if (!topVideo) {
        topVideo = searchResult.videos[0];
      }
      
      if (!topVideo) {
        return new NextResponse('No video found', { status: 404 });
      }

      return NextResponse.json({
        title: topVideo.title,
        author: topVideo.author.name,
        thumbnail: topVideo.thumbnail,
        sourceId: topVideo.videoId,
        source: 'youtube'
      });
    }

  } catch (error) {
    console.error('Error in /api/youtube/info:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
