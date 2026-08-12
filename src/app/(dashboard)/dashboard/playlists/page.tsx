"use client"

import { useState, useEffect, useRef } from "react";
import { Link2, Music2, ListVideo, MonitorPlay, Plus, Trash2, Shuffle, X } from "lucide-react";
import { useQueueStore } from "@/store/useQueueStore";

interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
}

interface SavedPlaylist {
  id: string;
  name: string;
  url: string;
  image: string;
  tracksCount: number;
  tracks: SpotifyTrack[];
}

export default function PlaylistsPage() {
  const [savedPlaylists, setSavedPlaylists] = useState<SavedPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SavedPlaylist | null>(null);
  const [inputUrl, setInputUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [importProgress, setImportProgress] = useState("");
  const isMounted = useRef(true);
  const isImportingRef = useRef(false);
  
  const { addTrack } = useQueueStore();

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    // Load saved playlists from localStorage on mount
    const saved = localStorage.getItem("streamrequest_saved_playlists");
    if (saved) {
      try {
        setSavedPlaylists(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved playlists");
      }
    }
  }, []);

  const savePlaylistsToStorage = (playlists: SavedPlaylist[]) => {
    setSavedPlaylists(playlists);
    localStorage.setItem("streamrequest_saved_playlists", JSON.stringify(playlists));
  };

  const handleFetchPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.includes('spotify.com')) {
      alert("Please enter a valid Spotify URL.");
      return;
    }
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/spotify/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: inputUrl })
      });
      
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
      
      const data: SavedPlaylist = await res.json();
      
      // Check if already exists
      if (!savedPlaylists.find(p => p.id === data.id)) {
        savePlaylistsToStorage([data, ...savedPlaylists]);
      }
      
      setSelectedPlaylist(data);
      setInputUrl("");
    } catch (err: any) {
      alert(err.message || "Failed to fetch playlist. Ensure it is public.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePlaylist = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = savedPlaylists.filter(p => p.id !== id);
    savePlaylistsToStorage(updated);
  };

  const importTracksToQueue = async (shuffle: boolean = false) => {
    if (isImportingRef.current) {
      isImportingRef.current = false;
      return;
    }

    if (!selectedPlaylist || selectedPlaylist.tracks.length === 0) return;
    setIsLoading(true);
    isImportingRef.current = true;
    let successCount = 0;
    
    // Create a copy of tracks and shuffle if requested
    let tracksToImport = [...selectedPlaylist.tracks];
    if (shuffle) {
      for (let i = tracksToImport.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tracksToImport[i], tracksToImport[j]] = [tracksToImport[j], tracksToImport[i]];
      }
    }
    
    for (let i = 0; i < tracksToImport.length; i++) {
      if (!isMounted.current || !isImportingRef.current) break;
      const track = tracksToImport[i];
      setImportProgress(`Searching YouTube: ${i + 1} of ${tracksToImport.length}...`);
      try {
        const searchRes = await fetch('/api/youtube/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: `${track.title} ${track.artist} audio` })
        });
        
        if (searchRes.ok) {
          const ytData = await searchRes.json();
          await addTrack({
            title: ytData.title,
            artist: ytData.author,
            coverUrl: ytData.thumbnail,
            requestedBy: 'Host (Spotify Import)',
            isVip: false,
            source: 'youtube',
            sourceId: ytData.sourceId,
          });
          successCount++;
        }
        
        // Add a 1.5-second delay to prevent YouTube IP bans / 302 redirects
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.error("Failed to import track", track, err);
      }
    }
    
    if (isMounted.current) {
      setImportProgress("");
      setIsLoading(false);
      isImportingRef.current = false;
      if (successCount > 0) {
        alert(`Successfully imported ${successCount} tracks to Queue!`);
      }
    }
  };

  const importSingleTrack = async (track: SpotifyTrack, index: number) => {
    setIsLoading(true);
    setImportProgress(`Importing: ${track.title}...`);
    try {
      const searchRes = await fetch('/api/youtube/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `${track.title} ${track.artist}` })
      });
      
      if (searchRes.ok) {
        const ytData = await searchRes.json();
        await addTrack({
          title: ytData.title,
          artist: ytData.author,
          coverUrl: ytData.thumbnail,
          requestedBy: 'Host (Spotify Import)',
          isVip: false,
          source: 'youtube',
          sourceId: ytData.sourceId,
        });
        if (isMounted.current) alert(`Added ${track.title} to Queue!`);
      } else {
        if (isMounted.current) alert(`Failed to find ${track.title} on YouTube`);
      }
    } catch (err) {
      console.error("Failed to import single track", err);
      if (isMounted.current) alert(`Error importing ${track.title}`);
    } finally {
      if (isMounted.current) {
        setImportProgress("");
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Spotify Importer</h1>
        <p className="text-muted-foreground mt-1">Paste a Spotify Playlist URL to import tracks instantly</p>
      </div>

      <form onSubmit={handleFetchPlaylist} className="flex gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Link2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://open.spotify.com/playlist/..."
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !inputUrl}
          className="px-8 py-4 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-[#1DB954]/20"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
          Fetch Playlist
        </button>
      </form>

      {selectedPlaylist ? (
        <div className="space-y-6 mt-8">
          <button 
            onClick={() => setSelectedPlaylist(null)}
            className="text-sm text-primary hover:underline font-medium"
          >
            &larr; Back to all saved playlists
          </button>
          
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6 bg-card border border-border rounded-xl p-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden shrink-0 shadow-xl">
              <img 
                src={selectedPlaylist.image} 
                alt="Cover"
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Playlist</div>
              <h2 className="text-2xl md:text-3xl font-black mb-2 truncate">{selectedPlaylist.name}</h2>
              <p className="text-muted-foreground">{selectedPlaylist.tracksCount} tracks</p>
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto shrink-0 mt-4 md:mt-0">
              <button
                onClick={() => {
                  if (isLoading) isImportingRef.current = false;
                  else importTracksToQueue(false);
                }}
                disabled={isLoading && !importProgress.includes('Searching')}
                className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 ${isLoading && importProgress.includes('Searching') ? 'bg-destructive text-destructive-foreground hover:bg-destructive/80' : 'bg-primary text-background'}`}
              >
                {isLoading && importProgress.includes('Searching') ? (
                  <><X className="w-5 h-5" /> Stop Import</>
                ) : (
                  <><ListVideo className="w-5 h-5" /> Import All to Queue</>
                )}
              </button>
              <button
                onClick={() => importTracksToQueue(true)}
                disabled={isLoading || selectedPlaylist.tracks.length === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg font-bold transition-colors disabled:opacity-50 border border-border"
              >
                <Shuffle className="w-5 h-5" />
                Shuffle to Queue
              </button>
            </div>
          </div>

          {importProgress && (
            <div className="text-sm font-medium text-primary animate-pulse flex items-center gap-2 p-4 bg-primary/10 rounded-lg">
              <MonitorPlay className="w-5 h-5" />
              {importProgress}
            </div>
          )}

          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="divide-y divide-border">
              {selectedPlaylist.tracks.map((track, i) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors">
                  <div className="text-muted-foreground w-6 text-center text-sm">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">{track.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{track.artist}</div>
                  </div>
                  <button
                    onClick={() => importSingleTrack(track, i)}
                    disabled={isLoading}
                    className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                    Queue
                  </button>
                </div>
              ))}
              {selectedPlaylist.tracks.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">No tracks found.</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Saved Playlists</h2>
          {savedPlaylists.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {savedPlaylists.map((pl) => (
                <div 
                  key={pl.id} 
                  onClick={() => setSelectedPlaylist(pl)}
                  className="bg-card border border-border rounded-xl p-4 hover:bg-secondary/50 transition-colors cursor-pointer group relative"
                >
                  <button 
                    onClick={(e) => handleDeletePlaylist(e, pl.id)}
                    className="absolute top-2 right-2 p-2 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive text-white z-10"
                    title="Remove saved playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 shadow-md relative">
                    <img 
                      src={pl.image} 
                      alt={pl.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Music2 className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="font-bold text-sm truncate pr-6">{pl.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{pl.tracksCount} tracks</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-card border border-border rounded-xl border-dashed">
              <Music2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">No saved playlists yet.</p>
              <p className="text-sm text-muted-foreground mt-1">Paste a Spotify URL above to add one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
