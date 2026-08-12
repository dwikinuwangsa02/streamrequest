"use client"

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Music2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import YouTube, { YouTubeEvent } from "react-youtube";

export default function QueueWidget() {
  const searchParams = useSearchParams();
  const [isValid, setIsValid] = useState<boolean | null>(null);
  
  // Widget State from API
  const [nowPlaying, setNowPlaying] = useState<any>(null);
  const [queue, setQueue] = useState<any[]>([]);

  // Polling state from /api/queue/widget
  useEffect(() => {
    const key = searchParams.get("key");
    if (!key) {
      setIsValid(false);
      return;
    }

    const fetchState = async () => {
      try {
        const res = await fetch(`/api/queue/widget?key=${key}`);
        if (!res.ok) {
          if (res.status === 403 || res.status === 400) {
            setIsValid(false);
          }
          return;
        }
        
        if (isValid !== true) setIsValid(true);
        const data = await res.json();
        
        // Map db format to what UI expects
        if (data.nowPlaying) {
           setNowPlaying({
             id: data.nowPlaying.id,
             title: data.nowPlaying.title,
             artist: data.nowPlaying.requestedBy,
             coverUrl: data.nowPlaying.thumbnail || "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=2098&auto=format&fit=crop",
             requestedBy: data.nowPlaying.requestedBy,
             isVip: data.nowPlaying.isPriority,
             donationAmount: data.nowPlaying.donationAmount,
             source: data.nowPlaying.source,
             sourceId: data.nowPlaying.url,
           });
        } else {
           setNowPlaying(null);
        }

        setQueue(data.queue.map((t: any) => ({
             id: t.id,
             title: t.title,
             artist: t.requestedBy,
             coverUrl: t.thumbnail || "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=2098&auto=format&fit=crop",
             requestedBy: t.requestedBy,
             isVip: t.isPriority,
             donationAmount: t.donationAmount,
             source: t.source,
             sourceId: t.url,
        })));
      } catch (err) {}
    };

    fetchState();
    const interval = setInterval(fetchState, 3000); // 3s polling
    return () => clearInterval(interval);
  }, [isValid, searchParams]);

  // Trigger skip via db
  const triggerNextTrack = async () => {
    const key = searchParams.get("key");
    if (!key) return;
    try {
      await fetch('/api/queue/next', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamKey: key })
      });
    } catch (err) {}
  };

  const [isPlaying, setIsPlaying] = useState(false);

  // YouTube logic
  const onYouTubeStateChange = (event: YouTubeEvent) => {
    // 1 = playing, 0 = ended
    if (event.data === 1) {
      setIsPlaying(true);
    } else if (event.data === 0) {
      triggerNextTrack();
    }
  };

  // Skip stuck tracks
  useEffect(() => {
    if (nowPlaying?.source === 'youtube') {
      const timer = setTimeout(() => {
         if (!isPlaying) {
             console.log("Track stuck, skipping...");
             triggerNextTrack();
         }
      }, 10000); // 10 seconds timeout
      
      return () => clearTimeout(timer);
    }
  }, [nowPlaying, isPlaying]);

  // Reset isPlaying when track changes
  useEffect(() => {
    setIsPlaying(false);
  }, [nowPlaying?.id]);

  if (isValid === null) return null;

  if (isValid === false) {
    return (
      <div className="w-screen h-screen bg-transparent flex items-end justify-start p-8 font-sans">
        <div className="bg-destructive text-destructive-foreground px-4 py-2 rounded shadow-lg font-bold">
          Invalid API Key
        </div>
      </div>
    );
  }

  const upNext = queue.slice(0, 2);

  return (
    <div className="w-screen h-screen bg-transparent flex items-end justify-start p-8 font-sans overflow-hidden portrait:max-w-[1080px] portrait:max-h-[1920px] landscape:max-w-[1920px] landscape:max-h-[1080px] mx-auto">
      
      {/* Hidden Players for Audio */}
      {nowPlaying?.source === 'youtube' && nowPlaying?.sourceId && (
        <div className="absolute top-0 left-0 w-[1px] h-[1px] opacity-0 pointer-events-none overflow-hidden">
          <YouTube 
            videoId={nowPlaying.sourceId} 
            opts={{ height: '1', width: '1', playerVars: { autoplay: 1 } }} 
            onReady={(e) => {
               try { e.target.playVideo(); } catch(err) {}
            }}
            onStateChange={onYouTubeStateChange}
            onError={(e) => {
               console.error("YouTube Error", e.data);
               triggerNextTrack();
            }}
          />
        </div>
      )}

      {/* Container for the lower third widget */}
      <AnimatePresence>
        {nowPlaying && (
          <motion.div 
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="flex items-end gap-4 max-w-[800px]"
          >
            {/* Now Playing Card */}
            <div className="bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl p-4 flex items-center gap-4 shadow-2xl shadow-primary/10">
              <div className="relative w-20 h-20 shrink-0">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-full h-full rounded-full overflow-hidden border-2 border-primary/50 shadow-[0_0_15px_rgba(var(--color-primary),0.3)]"
                >
                  <img src={nowPlaying.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                </motion.div>
                {/* Center hole for vinyl look */}
                <div className="absolute inset-0 m-auto w-4 h-4 bg-background rounded-full border border-border/50" />
              </div>

              <div className="flex-1 min-w-[250px]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded">
                    Now Playing
                  </span>
                  {nowPlaying.isVip && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded flex items-center gap-1">
                      <Crown className="w-3 h-3" /> VIP
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl font-black text-foreground leading-tight truncate">
                  {nowPlaying.title}
                </h1>
                
                <div className="text-sm font-medium text-muted-foreground truncate">
                  {nowPlaying.artist}
                </div>
                
                <div className="mt-2 text-xs font-semibold text-foreground/80 flex items-center gap-2">
                  <span className="text-muted-foreground">Req by</span> 
                  <span className={nowPlaying.isVip ? "text-yellow-500" : ""}>{nowPlaying.requestedBy}</span>
                  {nowPlaying.donationAmount && (
                    <span className="text-green-400">Rp {nowPlaying.donationAmount.toLocaleString('id-ID')}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Up Next List */}
            <AnimatePresence>
              {upNext.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-background/80 backdrop-blur-md border border-border/30 rounded-xl p-3 flex flex-col gap-2 shadow-xl mb-2"
                >
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                    <Music2 className="w-3 h-3" /> Up Next
                  </div>
                  {upNext.map((track) => (
                    <motion.div 
                      key={track.id}
                      layout
                      className="flex items-center gap-3 w-[200px]"
                    >
                      <div className="w-8 h-8 rounded-sm overflow-hidden shrink-0">
                        <img src={track.coverUrl} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-foreground truncate flex items-center gap-1">
                          {track.isVip && <Crown className="w-3 h-3 text-yellow-500 shrink-0" />}
                          <span className="truncate">{track.title}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground truncate">{track.requestedBy}</div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
