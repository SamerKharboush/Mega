'use client'

import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  icon: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <Card className="card-hover">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <Icon className="w-5 h-5 text-teal" />
          {change && (
            <span className={cn(
              'text-xs',
              trend === 'up' && 'text-green-500',
              trend === 'down' && 'text-red-500',
              trend === 'neutral' && 'text-cream/40'
            )}>
              {change}
            </span>
          )}
        </div>
        <div className="mt-3">
          <div className="font-serif text-3xl">{value}</div>
          <p className="text-sm text-cream/60 mt-1">{title}</p>
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsCardsProps {
  stats: StatCardProps[]
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  )
}