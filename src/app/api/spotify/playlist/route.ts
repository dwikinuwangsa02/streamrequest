import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return new NextResponse('Missing URL', { status: 400 });

    // Extract Playlist ID from URL
    // e.g. https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=...
    const match = url.match(/playlist\/([a-zA-Z0-9]+)/);
    if (!match) return new NextResponse('Invalid Spotify Playlist URL', { status: 400 });
    const playlistId = match[1];

    const clientId = process.env.SPOTIFY_CLIENT_ID || process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return new NextResponse('Spotify credentials missing in server environment', { status: 500 });
    }

    // 1. Get Spotify App Access Token (Client Credentials Flow)
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      const err = await tokenResponse.text();
      console.error('Spotify Token Error:', err);
      return new NextResponse('Failed to authenticate with Spotify', { status: 500 });
    }

    const { access_token } = await tokenResponse.json();

    // 2. Fetch Playlist Tracks
    let tracks: any[] = [];
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50&fields=items(track(name,artists(name))),next`;

    while (nextUrl && tracks.length < 200) { // limit to 200 tracks to prevent abuse
      const playlistRes = await fetch(nextUrl, {
        headers: { 'Authorization': `Bearer ${access_token}` }
      });

      if (!playlistRes.ok) {
        break;
      }

      const data = await playlistRes.json();
      for (const item of data.items) {
        if (item.track) {
          const artistNames = item.track.artists.map((a: any) => a.name).join(', ');
          tracks.push({
            title: item.track.name,
            artist: artistNames
          });
        }
      }
      nextUrl = data.next;
    }

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error('Error fetching Spotify playlist:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
