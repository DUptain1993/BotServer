"use client"

import { Terminal } from "lucide-react"
import { useAuth } from "./auth/auth-provider"
import { UserProfile } from "./user-profile"

export function AppHeader() {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center red-glow border border-accent/30">
            <Terminal className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-accent">TeleBot Server</h1>
            <p className="text-xs text-muted-foreground">// Unleash Your Code</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user && <UserProfile />}
        </div>
      </div>
    </header>
  )
}
