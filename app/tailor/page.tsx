'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScoreBadges } from '@/components/score-badges'

// ─── Types ────────────────────────────────────────────────────────────────────

type Track = 'ops-lead' | 'product-owner' | 'technical-pm'

interface GapItem {
  requirement: string
  status: 'match' | 'partial' | 'gap'
  evidence: string
  noteForCoverLetter: string
}

interface DiffViolation {
  field: string
  value: string
  reason: string
}

interface TailorResponse {
  selection: {
    selectedTrack: Track
    reasoning: string
    warningIfBelow60Percent?: string
  }
  gapAnalysis: GapItem[]
  preScores: { cvMatchScore: number; atsScore: number }
  postScores: { cvMatchScore: number; atsScore: number }
  tailoringNotes: string[]
  hardGaps: GapItem[]
  diffViolations: DiffViolation[]
  pdfBase64: string
  filename: string
  tailoredTrack: string
}

// ─── Progress steps ───────────────────────────────────────────────────────────

const PROGRESS_STEPS = [
  'Selecting CV template…',
  'Running gap analysis…',
  'Tailoring content…',
  'Scoring ATS compatibility…',
  'Generating PDF…',
]

// ─── Track badge colours ──────────────────────────────────────────────────────

function trackBadgeClass(track: Track): string {
  switch (track) {
    case 'ops-lead':
      return 'bg-teal-100 text-teal-800 border-teal-300'
    case 'product-owner':
      return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'technical-pm':
      return 'bg-purple-100 text-purple-800 border-purple-300'
  }
}

function trackLabel(track: Track): string {
  switch (track) {
    case 'ops-lead':
      return 'Ops Lead'
    case 'product-owner':
      return 'Product Owner'
    case 'technical-pm':
      return 'Technical PM'
  }
}

// ─── Gap status helpers ───────────────────────────────────────────────────────

function statusIcon(status: GapItem['status']): string {
  switch (status) {
    case 'match':
      return '✅'
    case 'partial':
      return '⚠️'
    case 'gap':
      return '❌'
  }
}

function statusRowClass(status: GapItem['status']): string {
  switch (status) {
    case 'match':
      return 'bg-green-50'
    case 'partial':
      return 'bg-amber-50'
    case 'gap':
      return 'bg-red-50'
  }
}

function statusCellClass(status: GapItem['status']): string {
  switch (status) {
    case 'match':
      return 'text-green-700 font-semibold'
    case 'partial':
      return 'text-amber-700 font-semibold'
    case 'gap':
      return 'text-red-700 font-semibold'
  }
}

// ─── PDF download helper ──────────────────────────────────────────────────────

function downloadPdf(base64: string, filename: string) {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TailorPage() {
  const [jd, setJd] = useState('')
  const [company, setCompany] = useState('')
  const [location, setLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [result, setResult] = useState<TailorResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [coverLetterLoading, setCoverLetterLoading] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Cycle progress steps while loading
  useEffect(() => {
    if (loading) {
      setStepIndex(0)
      intervalRef.current = setInterval(() => {
        setStepIndex((prev) => (prev + 1) % PROGRESS_STEPS.length)
      }, 3000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [loading])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!jd.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jd, action: 'tailor', company, location }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Server error: ${res.status}`)
      }

      const data: TailorResponse = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCoverLetter() {
    if (!result) return
    setCoverLetterLoading(true)
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jd,
          action: 'cover-letter',
          track: result.tailoredTrack,
          company,
          location,
        }),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Server error: ${res.status}`)
      }

      // Expect PDF blob back
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cover-letter-${result.tailoredTrack}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate cover letter.')
    } finally {
      setCoverLetterLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* ── Left panel: input ── */}
        <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-border bg-muted/30 p-6 flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">CV Tailor</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Paste a job description and get a tailored CV instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="company">
                Company
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium" htmlFor="location">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. London, UK"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm font-medium" htmlFor="jd">
                Job Description
              </label>
              <Textarea
                id="jd"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
                placeholder="Paste the full job description here…"
                className="flex-1 min-h-[280px] resize-none text-sm"
                required
              />
            </div>

            <Button type="submit" disabled={loading || !jd.trim()} className="w-full">
              {loading ? 'Tailoring…' : 'Tailor my CV'}
            </Button>
          </form>

          {/* Loading progress */}
          {loading && (
            <div className="mt-2 rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Progress
              </p>
              <ul className="space-y-2">
                {PROGRESS_STEPS.map((step, i) => (
                  <li
                    key={step}
                    className={`flex items-center gap-2 text-sm transition-opacity duration-300 ${
                      i < stepIndex
                        ? 'text-muted-foreground line-through opacity-50'
                        : i === stepIndex
                        ? 'text-foreground font-medium'
                        : 'text-muted-foreground opacity-40'
                    }`}
                  >
                    <span
                      className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${
                        i < stepIndex
                          ? 'bg-green-500'
                          : i === stepIndex
                          ? 'bg-primary animate-pulse'
                          : 'bg-muted-foreground/30'
                      }`}
                    />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        {/* ── Right panel: results ── */}
        <div className="w-full md:w-3/5 p-6 overflow-y-auto">
          {!result && !loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-3 text-muted-foreground">
              <svg
                className="h-12 w-12 opacity-20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-sm font-medium">Your tailored CV results will appear here.</p>
              <p className="text-xs">Paste a job description and click &ldquo;Tailor my CV&rdquo; to get started.</p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4 text-muted-foreground">
              <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              <p className="text-sm font-medium">{PROGRESS_STEPS[stepIndex]}</p>
            </div>
          )}

          {result && !loading && (
            <div className="flex flex-col gap-6">
              {/* ── Track selection ── */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <CardTitle className="text-base">Selected Template</CardTitle>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${trackBadgeClass(
                        result.selection.selectedTrack
                      )}`}
                    >
                      {trackLabel(result.selection.selectedTrack)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {result.selection.reasoning}
                  </p>
                </CardContent>
              </Card>

              {/* ── Below-60% warning ── */}
              {result.selection.warningIfBelow60Percent && (
                <div className="rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
                  <strong>Warning:</strong> {result.selection.warningIfBelow60Percent}
                </div>
              )}

              {/* ── Score cards ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-5">
                    <ScoreBadges
                      label="Before tailoring"
                      cvMatchScore={result.preScores.cvMatchScore}
                      atsScore={result.preScores.atsScore}
                    />
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-5">
                    <ScoreBadges
                      label="After tailoring"
                      cvMatchScore={result.postScores.cvMatchScore}
                      atsScore={result.postScores.atsScore}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* ── Gap map (collapsible) ── */}
              {result.gapAnalysis.length > 0 && (
                <Card>
                  <CardContent className="pt-4 pb-2">
                    <Accordion multiple={false}>
                      <AccordionItem value="gap-map" className="border-none">
                        <AccordionTrigger className="text-sm font-semibold py-2 hover:no-underline">
                          Gap Analysis ({result.gapAnalysis.length} items)
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="overflow-x-auto mt-2">
                            <table className="w-full text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-border">
                                  <th className="text-left py-2 pr-3 font-semibold text-muted-foreground w-2/5">
                                    Requirement
                                  </th>
                                  <th className="text-center py-2 px-2 font-semibold text-muted-foreground w-1/12">
                                    Status
                                  </th>
                                  <th className="text-left py-2 pl-3 font-semibold text-muted-foreground">
                                    Evidence
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {result.gapAnalysis.map((item, idx) => (
                                  <tr
                                    key={idx}
                                    className={`border-b border-border/50 last:border-0 ${statusRowClass(
                                      item.status
                                    )}`}
                                  >
                                    <td className="py-2 pr-3 align-top leading-relaxed">
                                      {item.requirement}
                                    </td>
                                    <td
                                      className={`py-2 px-2 text-center align-top ${statusCellClass(
                                        item.status
                                      )}`}
                                    >
                                      {statusIcon(item.status)}
                                    </td>
                                    <td className="py-2 pl-3 align-top text-muted-foreground leading-relaxed">
                                      {item.evidence}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              )}

              {/* ── Tailoring notes ── */}
              {result.tailoringNotes.length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Tailoring Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1.5">
                      {result.tailoringNotes.map((note, idx) => (
                        <li key={idx} className="flex gap-2 text-sm">
                          <span className="text-muted-foreground flex-shrink-0 mt-0.5">•</span>
                          <span className="text-muted-foreground leading-relaxed">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* ── Hard gap warnings ── */}
              {result.hardGaps.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-orange-700">Hard Gaps</p>
                  {result.hardGaps.map((gap, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-orange-300 bg-orange-50 px-4 py-3 text-sm text-orange-800"
                    >
                      <strong>{gap.requirement}</strong>
                      {gap.evidence && (
                        <span className="text-orange-700 font-normal"> — {gap.evidence}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Diff violations ── */}
              {result.diffViolations.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold text-red-700">Diff Violations</p>
                  {result.diffViolations.map((v, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800"
                    >
                      <strong>{v.field}:</strong> <span className="font-mono">{v.value}</span>
                      {v.reason && <span className="text-red-700"> — {v.reason}</span>}
                    </div>
                  ))}
                </div>
              )}

              {/* ── Action buttons ── */}
              <div className="flex flex-wrap gap-3 pt-2 pb-6">
                <Button
                  onClick={() => downloadPdf(result.pdfBase64, result.filename)}
                  className="gap-2"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  Download CV PDF
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCoverLetter}
                  disabled={coverLetterLoading}
                  className="gap-2"
                >
                  {coverLetterLoading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Generate Cover Letter
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
