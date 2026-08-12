import { create } from 'zustand'

export type Track = {
  id: string;
  title: string;
  artist?: string;
  coverUrl?: string;
  requestedBy: string;
  isVip: boolean;
  donationAmount?: number;
  source: 'youtube' | 'spotify';
  sourceId?: string;
  status?: string;
}

interface QueueState {
  queue: Track[];
  history: Track[];
  nowPlaying: Track | null;
  isLoading: boolean;
  fetchQueue: () => Promise<void>;
  addTrack: (track: Omit<Track, 'id'>) => Promise<void>;
  removeTrack: (id: string) => Promise<void>;
  playNext: () => Promise<void>;
  playPrevious: () => Promise<void>;
  clearHistory: () => void;
  clearQueue: () => Promise<void>;
  initSync: () => void;
}

export const useQueueStore = create<QueueState>((set, get) => ({
  queue: [],
  history: [],
  nowPlaying: null,
  isLoading: true,
  fetchQueue: async () => {
    try {
      const res = await fetch('/api/queue');
      if (res.ok) {
        const data = await res.json();
        set({ 
          queue: data.queue.map(mapDbToTrack), 
          history: data.history.map(mapDbToTrack),
          nowPlaying: data.nowPlaying ? mapDbToTrack(data.nowPlaying) : null,
          isLoading: false
        });
      }
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },
  addTrack: async (track) => {
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: track.title,
          url: track.sourceId || '',
          thumbnail: track.coverUrl,
          source: track.source,
          requestedBy: track.requestedBy,
          isPriority: track.isVip,
          donationAmount: track.donationAmount,
          sourceId: track.sourceId,
        })
      });
      if (res.ok) {
        const newTrackDb = await res.json();
        const newTrack = mapDbToTrack(newTrackDb);
        set((state) => ({ 
          queue: newTrack.isVip ? [newTrack, ...state.queue] : [...state.queue, newTrack] 
        }));
      }
    } catch (err) {
      console.error(err);
    }
  },
  removeTrack: async (id) => {
    try {
      await fetch(`/api/queue/${id}`, { method: 'DELETE' });
      set((state) => ({ queue: state.queue.filter(t => t.id !== id) }));
    } catch (err) {
      console.error(err);
    }
  },
  playNext: async () => {
    const state = get();
    const previousTrack = state.nowPlaying;
    
    if (state.queue.length === 0) {
      if (previousTrack) {
         await fetch(`/api/queue/${previousTrack.id}`, { 
           method: 'PUT', body: JSON.stringify({ status: 'played' }) 
         });
      }
      set({ 
        nowPlaying: null,
        history: previousTrack ? [previousTrack, ...state.history] : state.history
      });
      return;
    }
    
    const next = state.queue[0];
    try {
      await fetch(`/api/queue/${next.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'playing' })
      });
      set({
        nowPlaying: next,
        queue: state.queue.slice(1),
        history: previousTrack ? [previousTrack, ...state.history] : state.history
      });
    } catch (err) {
      console.error(err);
    }
  },
  playPrevious: async () => {
    const state = get();
    if (state.history.length === 0) return;
    
    const prev = state.history[0];
    const current = state.nowPlaying;
    
    try {
      if (current) {
        await fetch(`/api/queue/${current.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'queued' })
        });
      }
      await fetch(`/api/queue/${prev.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'playing' })
      });
      
      set({
        nowPlaying: prev,
        history: state.history.slice(1),
        queue: current ? [current, ...state.queue] : state.queue
      });
    } catch (err) {
      console.error(err);
    }
  },
  clearHistory: () => set({ history: [] }),
  clearQueue: async () => {
    try {
      await fetch('/api/queue', { method: 'DELETE' });
      set({ queue: [] });
    } catch (err) {
      console.error(err);
    }
  },
  initSync: () => {
    // Initial fetch
    get().fetchQueue();

    // Poll API to check if widget triggered a 'playNext' via database
    // For now we'll just re-fetch the queue state every 5 seconds to stay in sync
    setInterval(async () => {
       get().fetchQueue();
    }, 5000);
  }
}))

function mapDbToTrack(db: any): Track {
  return {
    id: db.id,
    title: db.title,
    artist: db.requestedBy, // map as artist if needed, or update DB to have artist
    coverUrl: db.thumbnail || "https://images.unsplash.com/photo-1515630278258-407f66498911?q=80&w=2098&auto=format&fit=crop",
    requestedBy: db.requestedBy,
    isVip: db.isPriority,
    donationAmount: db.donationAmount,
    source: db.source,
    sourceId: db.url,
    status: db.status
  }
}
