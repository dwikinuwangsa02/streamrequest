"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListMusic, Settings, LayoutTemplate, History, Puzzle, Mic2, User } from "lucide-react";
import { clsx } from "clsx";
import { useUser, UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const navItems = [
  { name: "Queue", href: "/dashboard", icon: ListMusic },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "My Playlists", href: "/dashboard/playlists", icon: ListMusic },
  { name: "Widgets", href: "/dashboard/widgets", icon: LayoutTemplate },
  { name: "Integrations", href: "/dashboard/integrations", icon: Puzzle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const dicebearUrl = user?.publicMetadata?.dicebearUrl as string | undefined;
  const avatarUrl = dicebearUrl || user?.imageUrl;

  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <div className="flex items-center gap-2 text-primary">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Mic2 className="text-background w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">StreamRequest</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all",
                isActive 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className={clsx("w-5 h-5", isActive ? "text-primary" : "")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      {/* Mini Profile Space */}
      <div className="p-4 border-t border-border">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="shrink-0 flex items-center justify-center">
              <UserButton 
                appearance={{
                  // @ts-expect-error
                  baseTheme: dark,
                  elements: { avatarBox: "w-10 h-10" }
                }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.fullName || user.username || "Streamer"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center text-xs text-muted-foreground">v1.0.0</div>
        )}
      </div>
    </aside>
  );
}
