"use client"

import { useQueueStore } from "@/store/useQueueStore";
import { MonitorPlay, Trash2, Crown } from "lucide-react";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import { clsx } from "clsx";

export default function HistoryPage() {
  const { history, clearHistory } = useQueueStore();

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">History</h1>
          <p className="text-muted-foreground mt-1">Recently played tracks</p>
        </div>
        
        {history.length > 0 && (
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive rounded-lg font-medium hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <p>No tracks have been played yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {history.map((track, idx) => (
              <div 
                key={`${track.id}-${idx}`}
                className={clsx(
                  "p-4 flex items-center gap-4 transition-colors hover:bg-white/5",
                  track.isVip ? "border-l-4 border-l-yellow-500 bg-yellow-500/5" : ""
                )}
              >
                {/* Thumbnail */}
                <div className="w-16 h-12 rounded overflow-hidden shrink-0 bg-secondary relative">
                  {track.coverUrl && (
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover opacity-75" />
                  )}
                  {track.isVip && (
                    <div className="absolute top-1 right-1 text-yellow-500">
                      <Crown className="w-3 h-3 fill-current" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-muted-foreground truncate line-through decoration-muted-foreground/50">{track.title}</span>
                    {track.source === 'youtube' ? (
                      <YoutubeIcon className="w-3.5 h-3.5 text-red-500 shrink-0 opacity-50" />
                    ) : (
                      <MonitorPlay className="w-3.5 h-3.5 text-green-500 shrink-0 opacity-50" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="truncate">{track.artist}</span>
                    <span>•</span>
                    <span className="truncate">Req by: <span className="text-foreground">{track.requestedBy}</span></span>
                  </div>
                </div>

                {/* Donation Amount */}
                {track.donationAmount && (
                  <div className="shrink-0 text-right">
                    <div className="text-yellow-500 font-bold">
                      Rp {track.donationAmount.toLocaleString("id-ID")}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
