"use client"

import { useQueueStore, Track } from "@/store/useQueueStore";
import { Crown, Play, Trash2, MonitorPlay, GripVertical } from "lucide-react";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import { clsx } from "clsx";
import { useState } from "react";

export default function DashboardPage() {
  const { queue, nowPlaying, removeTrack, clearQueue, addTrack } = useQueueStore();
  const [ytLink, setYtLink] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const [importProgress, setImportProgress] = useState("");

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ytLink) return;

    // Generic search or standard YouTube URL
    setIsAdding(true);
    try {
      const res = await fetch('/api/youtube/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: ytLink })
      });
      if (res.ok) {
        const data = await res.json();
        await addTrack({
          title: data.title,
          artist: data.author,
          coverUrl: data.thumbnail,
          requestedBy: 'Host (Manual)',
          isVip: false,
          source: 'youtube',
          sourceId: data.sourceId,
        });
        setYtLink("");
      } else {
        alert("Gagal menambahkan lagu. Pastikan link valid.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const simulateVipDonation = () => {
    addTrack({
      title: "Rick Astley - Never Gonna Give You Up",
      artist: "Rick Astley",
      coverUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
      requestedBy: "Anonymous Sultan",
      isVip: true,
      donationAmount: 100000,
      source: "youtube",
      sourceId: "dQw4w9WgXcQ",
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Queue</h1>
        <p className="text-muted-foreground mt-1">Manage your song requests from viewers and donations.</p>
      </div>

      <form onSubmit={handleAddUrl} className="flex gap-2">
        <input 
          type="text" 
          placeholder="Paste YouTube Link or type a song title & artist..."
          value={ytLink}
          onChange={(e) => setYtLink(e.target.value)}
          className="flex-1 bg-card border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          disabled={isAdding}
        />
        <button 
          type="submit" 
          disabled={isAdding || !ytLink}
          className="px-6 py-3 bg-primary text-background font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 min-w-[140px]"
        >
          {isAdding ? "Adding..." : "Add to Queue"}
        </button>
      </form>
      
      {importProgress && (
         <div className="text-sm font-medium text-primary animate-pulse flex items-center gap-2">
            <MonitorPlay className="w-4 h-4" />
            {importProgress}
         </div>
      )}

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Play className="w-5 h-5 text-primary fill-primary" />
          Now Playing
        </h2>
        
        {nowPlaying ? (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex items-center gap-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 shadow-xl shadow-primary/20">
              <img src={nowPlaying.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {nowPlaying.isVip && <Crown className="w-4 h-4 text-yellow-500" />}
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Requested by <span className="text-foreground">{nowPlaying.requestedBy}</span>
                  {nowPlaying.donationAmount && (
                    <span className="text-primary font-bold ml-1">
                      (Rp {(nowPlaying.donationAmount).toLocaleString('id-ID')})
                    </span>
                  )}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground truncate">{nowPlaying.title}</h3>
              <p className="text-muted-foreground truncate">{nowPlaying.artist}</p>
            </div>
            <div className="shrink-0">
              {nowPlaying.source === 'youtube' ? (
                <YoutubeIcon className="w-8 h-8 text-red-500" />
              ) : (
                <MonitorPlay className="w-8 h-8 text-green-500" />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
            No track currently playing
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">Up Next ({queue.length})</h2>
            <button 
              onClick={simulateVipDonation}
              className="text-xs bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-full font-bold hover:bg-yellow-500/30 transition-colors"
            >
              + Simulate VIP Req
            </button>
          </div>
          <button 
            onClick={clearQueue}
            className="text-sm text-primary hover:underline font-medium"
          >
            Clear Queue
          </button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {queue.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Queue is empty. Wait for viewers to request songs!
            </div>
          ) : (
            <div className="divide-y divide-border">
              {queue.map((track, index) => (
                <QueueItem 
                  key={track.id} 
                  track={track} 
                  index={index + 1} 
                  onRemove={() => removeTrack(track.id)} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QueueItem({ track, index, onRemove }: { track: Track, index: number, onRemove: () => void }) {
  return (
    <div className={clsx(
      "p-4 flex items-center gap-4 hover:bg-secondary/50 transition-colors group",
      track.isVip && "bg-yellow-500/5 hover:bg-yellow-500/10"
    )}>
      <div className="text-muted-foreground w-6 text-center cursor-grab active:cursor-grabbing">
        <span className="group-hover:hidden">{index}</span>
        <GripVertical className="w-4 h-4 hidden group-hover:block mx-auto" />
      </div>
      
      <div className="w-12 h-12 rounded shrink-0 overflow-hidden bg-background">
        <img src={track.coverUrl} alt="Cover" className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground truncate">{track.title}</span>
          {track.source === 'youtube' ? (
             <YoutubeIcon className="w-3.5 h-3.5 text-red-500 shrink-0" />
          ) : (
             <MonitorPlay className="w-3.5 h-3.5 text-green-500 shrink-0" />
          )}
        </div>
        <div className="text-xs text-muted-foreground truncate">{track.artist}</div>
      </div>
      
      <div className="hidden sm:flex items-center gap-2 w-48 shrink-0">
        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
          {track.requestedBy.charAt(0).toUpperCase()}
        </div>
        <div className="text-sm truncate">
          <span className="text-muted-foreground">req by</span> {track.requestedBy}
        </div>
      </div>
      
      <div className="w-24 shrink-0 text-right">
        {track.isVip && (
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-500">
            <Crown className="w-3 h-3" />
            VIP
          </div>
        )}
      </div>
      
      <div className="shrink-0 flex items-center">
        <button 
          onClick={onRemove}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md opacity-0 group-hover:opacity-100 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
