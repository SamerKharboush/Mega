'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import {
  Microscope,
  LayoutDashboard,
  FolderOpen,
  Activity,
  FileText,
  Key,
  Settings,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Slides', href: '/slides', icon: FolderOpen },
  { name: 'Analyses', href: '/analyses', icon: Activity },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'API Keys', href: '/api-keys', icon: Key },
]

const settingsNav = [
  { name: 'General', href: '/settings', icon: Settings },
  { name: 'Billing', href: '/settings/billing', icon: CreditCard },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-charcoal flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-charcoal-50 border-r border-border transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center shrink-0">
              <Microscope className="w-5 h-5 text-charcoal" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-serif text-lg">Mega</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                  isActive
                    ? 'bg-teal/10 text-teal'
                    : 'text-cream/70 hover:bg-charcoal hover:text-cream'
                )}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-border">
            <p className={cn(
              'px-3 text-xs font-medium text-cream/40 uppercase tracking-wider',
              sidebarCollapsed && 'sr-only'
            )}>
              Settings
            </p>
            <div className="mt-2 space-y-1">
              {settingsNav.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-teal/10 text-teal'
                        : 'text-cream/70 hover:bg-charcoal hover:text-cream'
                    )}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className={cn(
            'flex items-center gap-3',
            sidebarCollapsed && 'justify-center'
          )}>
            <div className="w-8 h-8 rounded-full bg-teal/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-teal" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Dr. Smith</p>
                <p className="text-xs text-cream/40 truncate">Pro Plan</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="w-full mt-3 text-cream/60 hover:text-cream"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          )}
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-20 -right-3 w-6 h-6 rounded-full bg-charcoal border border-border flex items-center justify-center text-cream/60 hover:text-cream transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </button>
      </aside>

      {/* Main content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          sidebarCollapsed ? 'ml-16' : 'ml-64'
        )}
      >
        {/* Top bar */}
        <header className="h-16 border-b border-border bg-charcoal/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="h-full px-6 flex items-center justify-between">
            <h1 className="font-serif text-xl">
              {navigation.find(n => pathname.startsWith(n.href))?.name || 'Mega'}
            </h1>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-cream/60" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-teal" />
              </Button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}