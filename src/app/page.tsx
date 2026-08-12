"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, PlayCircle, Sparkles, Mic2 } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Navbar */}
      <header className="container mx-auto px-6 py-6 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Mic2 className="text-background w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">StreamRequest</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          <Link href="#integrations" className="hover:text-foreground transition-colors">Integrations</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm font-medium hover:text-primary transition-colors">
            Sign In
          </Link>
          <Link 
            href="/sign-up" 
            className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium hover:bg-primary transition-colors flex items-center gap-2"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative z-10 mt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>The ultimate tool for live streamers</span>
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-tight"
        >
          Manage your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300">Song Requests</span> flawlessly.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl"
        >
          Integrate YouTube, TikTok, and Donations into one beautiful queue. Let your VIP viewers skip the line while you focus on streaming.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <Link 
            href="/sign-up"
            className="px-8 py-4 rounded-full bg-primary text-background font-semibold text-lg hover:bg-green-400 transition-colors flex items-center gap-2 shadow-[0_0_30px_rgba(29,185,84,0.3)] hover:shadow-[0_0_40px_rgba(29,185,84,0.5)]"
          >
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link 
            href="#demo"
            className="px-8 py-4 rounded-full bg-secondary/50 backdrop-blur-sm text-foreground font-semibold text-lg hover:bg-secondary transition-colors border border-border flex items-center gap-2"
          >
            <PlayCircle className="w-5 h-5" /> Watch Demo
          </Link>
        </motion.div>

        {/* Mockup Showcase */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 w-full max-w-5xl relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
          <div className="rounded-xl overflow-hidden border border-border bg-card/50 backdrop-blur-xl shadow-2xl relative p-2">
            <div className="rounded-lg overflow-hidden bg-background border border-border/50 aspect-video flex flex-col">
              {/* Fake Window Header */}
              <div className="h-10 bg-secondary flex items-center px-4 gap-2 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-auto bg-background/50 rounded-md px-24 py-1 text-xs text-muted-foreground border border-border/50">
                  dashboard.streamrequest.app
                </div>
              </div>
              {/* Fake Dashboard Content */}
              <div className="flex-1 p-6 flex gap-6 bg-[#09090b]">
                <div className="w-64 space-y-4">
                  <div className="h-8 bg-secondary rounded-md w-full" />
                  <div className="h-8 bg-secondary rounded-md w-3/4" />
                  <div className="h-8 bg-secondary rounded-md w-5/6" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="h-32 bg-primary/10 border border-primary/20 rounded-xl flex items-center p-6 gap-6">
                     <div className="w-20 h-20 rounded-md bg-secondary animate-pulse" />
                     <div className="space-y-2 flex-1">
                        <div className="h-6 bg-secondary rounded w-1/3" />
                        <div className="h-4 bg-secondary rounded w-1/4" />
                     </div>
                  </div>
                  <div className="flex-1 bg-card rounded-xl border border-border flex flex-col p-4 gap-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-16 bg-secondary/50 rounded-lg flex items-center px-4 gap-4">
                        <div className="w-10 h-10 rounded bg-background" />
                        <div className="space-y-2 flex-1">
                          <div className="h-3 bg-background rounded w-1/4" />
                          <div className="h-2 bg-background rounded w-1/6" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
