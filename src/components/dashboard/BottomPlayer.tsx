"use client"

import { SkipForward, Maximize2, Radio } from "lucide-react";
import { useQueueStore } from "@/store/useQueueStore";
import { useEffect, useRef } from "react";

export function BottomPlayer() {
  const { nowPlaying, playNext, initSync } = useQueueStore();
  const initRef = useRef(false);

  useEffect(() => {
    if (!initRef.current) {
      initRef.current = true;
      initSync();
    }
  }, [initSync]);

  return (
    <div className="h-24 bg-card border-t border-border flex items-center px-6 justify-between shrink-0 gap-6 relative overflow-hidden">
      
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50" />

      {/* Current Track Info (Left) */}
      <div className="flex items-center gap-4 w-1/3 relative z-10">
        {nowPlaying ? (
          <>
            <div className="w-14 h-14 bg-secondary rounded-md overflow-hidden relative group shrink-0">
               <img 
                  src={nowPlaying.coverUrl || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop"} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer">
                  <Maximize2 className="w-5 h-5 text-white" />
               </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground hover:underline cursor-pointer truncate">
                {nowPlaying.title}
              </div>
              <div className="text-xs text-muted-foreground hover:underline cursor-pointer truncate flex items-center gap-2">
                {nowPlaying.artist} 
                <span className="text-[10px] bg-secondary px-1 rounded text-muted-foreground uppercase">
                  {nowPlaying.source}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No track currently playing</div>
        )}
      </div>

      {/* Remote Control Info (Center) */}
      <div className="flex-1 flex justify-center items-center h-full relative z-10">
        <div className="flex flex-col items-center justify-center gap-1">
           <div className="flex items-center gap-2 text-primary">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="text-sm font-bold tracking-wide">Broadcasting to OBS</span>
           </div>
           <span className="text-xs text-muted-foreground">Audio playback is handled by your Widget</span>
        </div>
      </div>

      {/* Controls (Right) */}
      <div className="flex items-center justify-end w-1/3 relative z-10 gap-3">
        <button 
          onClick={() => useQueueStore.getState().playPrevious()}
          className="p-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-colors"
          title="Play Previous"
        >
          <SkipForward className="w-5 h-5 rotate-180" />
        </button>

        <button 
          onClick={() => {
            if (!nowPlaying && useQueueStore.getState().queue.length > 0) {
              playNext();
            }
          }}
          disabled={!!nowPlaying || useQueueStore.getState().queue.length === 0}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-green-400 text-background rounded-full font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {nowPlaying ? "Playing in Widget" : "Start Queue"}
        </button>

        <button 
          onClick={() => playNext()}
          disabled={!nowPlaying && useQueueStore.getState().queue.length === 0}
          className="p-2 bg-secondary hover:bg-secondary/80 text-foreground rounded-full transition-colors disabled:opacity-50"
          title="Skip to Next"
        >
          <SkipForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
