"use client"

import { useState, useEffect } from "react";
import { Copy, Check, ExternalLink, Play, Loader2 } from "lucide-react";

export default function WidgetsPage() {
  const [copied, setCopied] = useState(false);
  const [streamKey, setStreamKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.streamKey) {
          setStreamKey(data.streamKey);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  const handleGenerateKey = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.streamKey) {
        setStreamKey(data.streamKey);
      }
    } catch (error) {
      console.error('Failed to generate key:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const widgetUrl = streamKey ? `http://localhost:3000/widget/queue/default?key=${streamKey}` : "";

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(widgetUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Widgets</h1>
        <p className="text-muted-foreground mt-1">Configure and manage your streaming widgets</p>
      </div>

      <div className="grid gap-6">
        {/* Main Queue Widget */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                Main Queue Overlay
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/20 text-primary uppercase tracking-wider">
                  Active
                </span>
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Display the currently playing song and upcoming VIP requests on your stream.
              </p>
            </div>
            
            {streamKey ? (
              <a 
                href={widgetUrl} 
                target="_blank" 
                rel="noreferrer"
                className="p-2 bg-secondary text-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                title="Open Widget in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            ) : null}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : !streamKey ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>You haven't generated a stream key yet.</p>
              <button
                onClick={handleGenerateKey}
                className="mt-4 px-6 py-2.5 bg-primary text-background rounded-lg font-bold hover:bg-primary/90 transition-colors"
              >
                Generate Stream Key
              </button>
            </div>
          ) : (

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">OBS Browser Source URL</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 font-mono text-sm text-muted-foreground overflow-x-auto whitespace-nowrap">
                    {widgetUrl}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-primary text-background rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="bg-secondary/50 rounded-lg p-4 text-sm text-muted-foreground border border-border/50">
                <p className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Play className="w-4 h-4 text-primary" />
                  OBS Configuration
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Width: <span className="text-foreground font-mono">1920</span> (or match your canvas)</li>
                  <li>Height: <span className="text-foreground font-mono">1080</span></li>
                  <li>Check <span className="text-foreground">"Shutdown source when not visible"</span> to save resources</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
