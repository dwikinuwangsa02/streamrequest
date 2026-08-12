import { MonitorPlay, Webhook } from "lucide-react";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import { clsx } from "clsx";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export function Topbar() {
  return (
    <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-6">
        <StatusIndicator icon={YoutubeIcon} label="YouTube" connected={true} color="text-red-500" />
        <StatusIndicator icon={MonitorPlay} label="Spotify" connected={true} color="text-green-500" />
        <StatusIndicator icon={Webhook} label="Saweria" connected={true} color="text-purple-500" />
      </div>
    </header>
  );
}

function StatusIndicator({ 
  icon: Icon, 
  label, 
  connected, 
  color 
}: { 
  icon: any, 
  label: string, 
  connected: boolean,
  color: string
}) {
  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      <Icon className={clsx("w-4 h-4", color)} />
      <span className="hidden sm:inline-block text-muted-foreground">{label}</span>
      <span className="relative flex h-2.5 w-2.5">
        {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
        <span className={clsx("relative inline-flex rounded-full h-2.5 w-2.5", connected ? "bg-green-500" : "bg-red-500")}></span>
      </span>
    </div>
  )
}
