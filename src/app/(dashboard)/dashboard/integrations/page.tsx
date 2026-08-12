"use client"

import { useState, useEffect, useRef } from "react";
import { Webhook, KeyRound, Copy, Check, Info, MessageSquare } from "lucide-react";
import { clsx } from "clsx";

export default function IntegrationsPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const streamKey = process.env.NEXT_PUBLIC_STREAM_KEY || "missing_key";
  const saweriaUrl = "http://localhost:3000/api/webhooks/saweria";
  const bagibagiUrl = "http://localhost:3000/api/webhooks/bagibagi";
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [isTiktokConnected, setIsTiktokConnected] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Custom Command
  const [chatCommand, setChatCommand] = useState("!sr");
  const [isSavingCommand, setIsSavingCommand] = useState(false);
  
  // Chat Feed State
  const [chats, setChats] = useState<any[]>([]);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Load local storage
    const savedUser = localStorage.getItem("tiktokUsername");
    const savedConnected = localStorage.getItem("isTiktokConnected");
    if (savedUser) setTiktokUsername(savedUser);
    
    // Fetch custom command from db
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
         if (data.chatCommand) setChatCommand(data.chatCommand);
      })
      .finally(() => {
         setIsLoaded(true);
         if (savedConnected === "true" && savedUser) {
           connectTiktok(savedUser);
         }
      });
      
    // Cleanup SSE on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const connectTiktok = (username: string) => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }
    setIsTiktokConnected(true);
    localStorage.setItem("tiktokUsername", username);
    localStorage.setItem("isTiktokConnected", "true");
    setChats([{ type: 'system', message: `Connecting to @${username}...` }]);
    
    const eventSource = new EventSource(`/api/tiktok/chat?username=${encodeURIComponent(username)}`);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('connected', (e) => {
      const data = JSON.parse(e.data);
      setChats(prev => [{ type: 'system', message: data.message }, ...prev]);
    });

    eventSource.addEventListener('chat', (e) => {
      const data = JSON.parse(e.data);
      setChats(prev => [{ type: 'chat', ...data }, ...prev].slice(0, 50));
    });

    eventSource.addEventListener('system', (e) => {
      const data = JSON.parse(e.data);
      setChats(prev => [{ type: 'system', message: data.message }, ...prev]);
    });

    eventSource.addEventListener('connectionError', (e) => {
      const data = JSON.parse(e.data);
      let errMsg = data.message || 'Failed to connect.';
      if (errMsg.toLowerCase().includes('not live') || errMsg.toLowerCase().includes('room id')) {
        errMsg = `Warning: @${username} is currently NOT LIVE.`;
      }
      setChats(prev => [{ type: 'error', message: errMsg }, ...prev]);
      eventSource.close();
      setIsTiktokConnected(false);
      localStorage.setItem("isTiktokConnected", "false");
    });

    eventSource.addEventListener('error', (e) => {
      setChats(prev => [{ type: 'error', message: 'Connection lost or network error.' }, ...prev]);
      eventSource.close();
      setIsTiktokConnected(false);
      localStorage.setItem("isTiktokConnected", "false");
    });
  };

  const saveCommand = async () => {
    setIsSavingCommand(true);
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatCommand })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingCommand(false);
    }
  };

  const handleTiktokToggle = () => {
    if (isTiktokConnected) {
      // Disconnect
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      setIsTiktokConnected(false);
      localStorage.setItem("isTiktokConnected", "false");
      setChats(prev => [{ type: 'system', message: 'Disconnected.' }, ...prev]);
    } else {
      // Connect
      if (!tiktokUsername) return;
      connectTiktok(tiktokUsername);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1">Connect donation platforms via Webhooks</p>
      </div>

      {/* Stream Key Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
          <KeyRound className="w-5 h-5 text-primary" />
          Stream Key / Secret
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your stream key acts as the Secret Key (HMAC-SHA256) to validate signatures from Webhooks. 
          Keep this secret!
        </p>
        <div className="flex items-center gap-2">
          <input 
            type="password" 
            value={streamKey} 
            readOnly
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 font-mono text-sm text-foreground focus:outline-none"
          />
          <button
            onClick={() => copyToClipboard(streamKey, "streamkey")}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-secondary text-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
          >
            {copiedId === "streamkey" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedId === "streamkey" ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Saweria */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Webhook className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Saweria</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-500/20 text-green-500">Supported</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Webhook URL</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={saweriaUrl} 
                  readOnly
                  className="flex-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground"
                />
                <button
                  onClick={() => copyToClipboard(saweriaUrl, "saweria")}
                  className="shrink-0 p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  {copiedId === "saweria" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3 flex gap-3 text-sm text-muted-foreground">
              <Info className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <p>Paste this URL into the Saweria Overlay Settings. We use HMAC-SHA256 signature to prevent fake transactions.</p>
            </div>
          </div>
        </div>

        {/* Bagibagi */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Webhook className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Bagibagi.co</h2>
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-500/20 text-green-500">Supported</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Custom Webhook URL</label>
              <div className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={bagibagiUrl} 
                  readOnly
                  className="flex-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground"
                />
                <button
                  onClick={() => copyToClipboard(bagibagiUrl, "bagibagi")}
                  className="shrink-0 p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                >
                  {copiedId === "bagibagi" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex gap-3 text-sm text-muted-foreground">
              <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <p>Paste into Integration Page in Bagibagi Overlay. Validated using X-Bagibagi-Signature header.</p>
            </div>
          </div>
        </div>

        {/* TikTok Live */}
        <div className="bg-card border border-border rounded-xl p-6 md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-[#00f2fe]/10 flex items-center justify-center border border-[#00f2fe]/20">
              <span className="font-bold text-[#00f2fe] text-lg">🎵</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">TikTok Live Chat</h2>
              <span className={clsx("text-xs font-medium px-2 py-0.5 rounded mt-1 inline-block", isTiktokConnected ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500")}>
                {isTiktokConnected ? "Listening..." : "Disconnected"}
              </span>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Automatically read chat from your TikTok Live. Viewers can type <code>{chatCommand} [judul penyanyi]</code> to request a song.
            </p>
            
            <div className="bg-secondary/50 p-4 rounded-lg border border-border mb-4">
               <label className="block text-sm font-medium text-foreground mb-1.5">Custom Request Command</label>
               <div className="flex items-center gap-2 max-w-sm">
                 <input 
                   type="text" 
                   value={chatCommand}
                   onChange={(e) => setChatCommand(e.target.value)}
                   placeholder="e.g. !sr or !lagu"
                   className="flex-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
                 />
                 <button
                   onClick={saveCommand}
                   disabled={isSavingCommand || !chatCommand}
                   className="shrink-0 px-4 py-2 bg-[#00f2fe] text-black rounded-lg font-bold text-sm hover:bg-[#00f2fe]/90 transition-colors disabled:opacity-50"
                 >
                   {isSavingCommand ? "Saving..." : "Save"}
                 </button>
               </div>
               <p className="text-xs text-muted-foreground mt-2">Change what viewers need to type to request a song.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">TikTok Username (without @)</label>
              <div className="flex items-center gap-2 max-w-md">
                <input 
                  type="text" 
                  placeholder="e.g. jungkook"
                  value={tiktokUsername}
                  onChange={(e) => setTiktokUsername(e.target.value)}
                  disabled={isTiktokConnected}
                  className="flex-1 w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-[#00f2fe]"
                />
                <button
                  onClick={handleTiktokToggle}
                  disabled={!tiktokUsername && !isTiktokConnected}
                  className={clsx("shrink-0 px-4 py-2 rounded-lg font-bold text-sm transition-colors", 
                    isTiktokConnected ? "bg-destructive text-destructive-foreground hover:bg-destructive/80" : "bg-[#00f2fe] text-black hover:bg-[#00f2fe]/90 disabled:opacity-50"
                  )}
                >
                  {isTiktokConnected ? "Disconnect" : "Connect"}
                </button>
              </div>
            </div>
            {isTiktokConnected && (
              <>
                <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 flex gap-3 text-sm text-muted-foreground">
                  <Info className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  <p>Successfully connected to @{tiktokUsername}'s live stream. Listening for `{chatCommand}` commands...</p>
                </div>
                
                {/* Live Chat Feed */}
                <div className="mt-4 border border-border rounded-lg bg-background overflow-hidden flex flex-col h-[300px]">
                  <div className="bg-secondary/50 px-4 py-2 border-b border-border flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#00f2fe]" />
                    <span className="font-bold text-sm">Live Chat Feed</span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-3">
                    {chats.map((chat, i) => (
                      <div key={i} className="text-sm">
                        {chat.type === 'chat' ? (
                          <div className="flex gap-2">
                            {chat.profilePictureUrl && (
                              <img src={chat.profilePictureUrl} alt="" className="w-6 h-6 rounded-full mt-0.5 shrink-0" />
                            )}
                            <div>
                              <span className="font-bold text-foreground">{chat.nickname}: </span>
                              <span className="text-muted-foreground">{chat.comment}</span>
                            </div>
                          </div>
                        ) : (
                          <div className={clsx("italic text-xs", chat.type === 'error' ? "text-destructive" : "text-[#00f2fe]")}>
                            {chat.message}
                          </div>
                        )}
                      </div>
                    ))}
                    {chats.length === 0 && (
                      <div className="text-center text-muted-foreground text-sm italic my-auto">
                        Waiting for messages...
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
