import spotifyUrlInfo from 'spotify-url-info';

const fetchPolyfill = (url, options) => fetch(url, options);
const { getTracks, getData } = spotifyUrlInfo(fetchPolyfill);

async function test() {
  try {
    const data = await getData('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
    console.log("Data title:", data.name);
    
    const tracks = await getTracks('https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M');
    console.log("Tracks count:", tracks.length);
    if (tracks.length > 0) {
      console.log("First track:", tracks[0].name, "by", tracks[0].artists[0].name);
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
