'use client'

import { Badge } from '@/components/ui/badge'

interface ScoreBadgesProps {
  cvMatchScore: number
  atsScore: number
  label: string
}

function scoreVariant(score: number): string {
  if (score >= 70) return 'bg-green-100 text-green-800 border-green-300'
  if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-300'
  return 'bg-red-100 text-red-800 border-red-300'
}

export function ScoreBadges({ cvMatchScore, atsScore, label }: ScoreBadgesProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {label}
      </p>
      <div className="flex gap-2 flex-wrap">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${scoreVariant(cvMatchScore)}`}
        >
          CV Match&nbsp;{cvMatchScore}%
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${scoreVariant(atsScore)}`}
        >
          ATS&nbsp;{atsScore}%
        </span>
      </div>
    </div>
  )
}
