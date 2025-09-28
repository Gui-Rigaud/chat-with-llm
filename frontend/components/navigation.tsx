"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { MessageCircle, Search, Activity } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">RigaudChat</h1>
          </div>

          <div className="flex items-center gap-4">
            <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            </Button>

            <Button variant={pathname === "/summary" ? "default" : "ghost"} size="sm" asChild>
              <Link href="/summary" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Sumários
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
