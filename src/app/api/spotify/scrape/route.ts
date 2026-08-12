import { NextResponse } from 'next/server';
// Polyfill fetch for spotify-url-info
const fetchPolyfill = (url: RequestInfo | URL, options?: RequestInit) => fetch(url, options);
const spotifyUrlInfo = require('spotify-url-info');
const { getData, getTracks } = (spotifyUrlInfo.default || spotifyUrlInfo)(fetchPolyfill);

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url || !url.includes('spotify.com')) {
      return new NextResponse('Invalid Spotify URL', { status: 400 });
    }

    // Scrape data
    const data = await getData(url);
    const tracks = await getTracks(url);

    if (!data || !tracks || tracks.length === 0) {
      return new NextResponse('Playlist is empty or invalid', { status: 400 });
    }

    // Format the response
    const playlist = {
      id: data.id || new URL(url).pathname.split('/').pop(),
      name: data.name || data.title || 'Unknown Playlist',
      url: url,
      image: data.coverArt?.sources?.[0]?.url || data.visualIdentity?.image?.[0]?.url || "https://images.unsplash.com/photo-1614113489855-66422ad300a4?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
      tracksCount: tracks.length,
      tracks: tracks.map((t: any) => ({
        id: t.uri || t.id,
        title: t.name || t.title,
        artist: t.artist || t.subtitle || (t.artists && t.artists.length > 0 ? t.artists[0].name : "Unknown Artist")
      }))
    };

    return NextResponse.json(playlist);

  } catch (error) {
    console.error('Scrape Error:', error);
    return new NextResponse('Failed to scrape Spotify URL. Make sure it is public.', { status: 500 });
  }
}
