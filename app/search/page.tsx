'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TailorSheet } from '@/components/tailor-sheet';

type Track = 'ops-lead' | 'product-owner' | 'technical-pm';

interface GapItem {
  requirement: string;
  status: 'match' | 'partial' | 'gap';
  evidence: string;
  noteForCoverLetter: string;
}

export interface JobResult {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  source: string;
  postedDate?: string;
  applyUrl: string;
  fullJD: string;
  selectedTrack: Track;
  cvMatchScore: number;
  atsScore: number;
  gapAnalysis: GapItem[];
  hardGaps: string[];
  sponsorStatus?: 'confirmed' | 'likely' | 'unverified';
  salaryFlag?: boolean;
}

const TRACK_LABELS: Record<Track, string> = {
  'ops-lead': 'Operations Lead',
  'product-owner': 'Product Owner',
  'technical-pm': 'Technical PM',
};

const TRACK_COLOURS: Record<Track, string> = {
  'ops-lead': 'bg-teal-100 text-teal-800 border-teal-300',
  'product-owner': 'bg-blue-100 text-blue-800 border-blue-300',
  'technical-pm': 'bg-purple-100 text-purple-800 border-purple-300',
};

function scoreClass(score: number) {
  if (score >= 70) return 'bg-green-100 text-green-800 border-green-300';
  if (score >= 60) return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function sponsorClass(status: string) {
  if (status === 'confirmed') return 'bg-green-100 text-green-800 border-green-300';
  if (status === 'likely') return 'bg-amber-100 text-amber-800 border-amber-300';
  return 'bg-red-100 text-red-800 border-red-300';
}

function sponsorLabel(status: string) {
  if (status === 'confirmed') return 'Sponsor Confirmed ✓';
  if (status === 'likely') return 'Likely sponsor — verify';
  return 'Sponsor Unverified ⚠';
}

type Market = 'uk' | 'latvia' | 'both';
type Seniority = 'mid-level' | 'senior' | 'both';
type ResultCount = 3 | 5 | 10;

function ToggleBtn<T extends string | number>({
  value,
  selected,
  onToggle,
  label,
  multi,
}: {
  value: T;
  selected: T | T[];
  onToggle: (v: T) => void;
  label: string;
  multi?: boolean;
}) {
  const isActive = multi
    ? (selected as T[]).includes(value)
    : selected === value;
  return (
    <button
      type="button"
      onClick={() => onToggle(value)}
      className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors ${
        isActive
          ? 'bg-indigo-600 text-white border-indigo-600'
          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}

function JobCard({ job, onTailor }: { job: JobResult; onTailor: (j: JobResult) => void }) {
  const isUK =
    job.location.toLowerCase().includes('london') ||
    job.location.toLowerCase().includes('uk') ||
    job.location.toLowerCase().includes('england');

  return (
    <Card className="border">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap gap-2 items-start justify-between">
          <div>
            <CardTitle className="text-base">
              <a
                href={job.applyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-indigo-600 underline"
              >
                {job.title}
              </a>
            </CardTitle>
            <p className="text-gray-600 font-medium mt-0.5">{job.company}</p>
          </div>
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className={TRACK_COLOURS[job.selectedTrack]}>
              {TRACK_LABELS[job.selectedTrack]}
            </Badge>
            <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300">
              {job.source}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
          <span>{job.location}</span>
          <span>{job.salary ?? 'Salary not stated'}</span>
          {job.postedDate && <span>{job.postedDate}</span>}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Score badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={scoreClass(job.cvMatchScore)}>
            CV Match: {job.cvMatchScore}%
          </Badge>
          <Badge variant="outline" className={scoreClass(job.atsScore)}>
            ATS: {job.atsScore}%
          </Badge>
          {isUK && job.sponsorStatus && (
            <Badge variant="outline" className={sponsorClass(job.sponsorStatus)}>
              {sponsorLabel(job.sponsorStatus)}
            </Badge>
          )}
        </div>

        {/* Salary warning */}
        {job.salaryFlag && (
          <div className="rounded-md bg-orange-50 border border-orange-200 px-3 py-2 text-sm text-orange-800">
            ⚠ Salary may be below £41,700 Skilled Worker visa threshold
          </div>
        )}

        {/* Gap map */}
        {job.gapAnalysis.length > 0 && (
          <Accordion multiple={false}>
            <AccordionItem value="gaps" className="border rounded-md">
              <AccordionTrigger className="px-3 py-2 text-sm font-medium hover:no-underline">
                Gap Map ({job.gapAnalysis.length} requirements)
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b text-gray-500">
                        <th className="text-left py-1 font-medium w-2/5">Requirement</th>
                        <th className="text-center py-1 font-medium w-12">Status</th>
                        <th className="text-left py-1 font-medium">Evidence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {job.gapAnalysis.map((g, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="py-1 pr-2 align-top">{g.requirement}</td>
                          <td className="py-1 text-center align-top">
                            {g.status === 'match' ? '✅' : g.status === 'partial' ? '⚠️' : '❌'}
                          </td>
                          <td
                            className={`py-1 align-top text-gray-600 ${
                              g.status === 'gap' ? 'text-red-600' : ''
                            }`}
                          >
                            {g.evidence}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Hard gaps */}
        {job.hardGaps.length > 0 && (
          <div className="space-y-1">
            {job.hardGaps.map((gap, i) => (
              <div
                key={i}
                className="rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs text-red-800"
              >
                ❌ Gap: {gap}
              </div>
            ))}
          </div>
        )}

        <Button size="sm" onClick={() => onTailor(job)} className="mt-1">
          Tailor CV + Cover Letter →
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SearchPage() {
  const [markets, setMarkets] = useState<Market[]>(['uk']);
  const [tracks, setTracks] = useState<Track[]>(['ops-lead', 'product-owner', 'technical-pm']);
  const [seniority, setSeniority] = useState<Seniority>('both');
  const [resultsPerTrack, setResultsPerTrack] = useState<ResultCount>(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<JobResult[]>([]);
  const [tailorJob, setTailorJob] = useState<JobResult | null>(null);

  function toggleMarket(m: Market) {
    setMarkets((prev) =>
      prev.includes(m) ? (prev.length > 1 ? prev.filter((x) => x !== m) : prev) : [...prev, m]
    );
  }

  function toggleTrack(t: Track) {
    setTracks((prev) =>
      prev.includes(t) ? (prev.length > 1 ? prev.filter((x) => x !== t) : prev) : [...prev, t]
    );
  }

  async function handleSearch() {
    setLoading(true);
    setError('');
    setJobs([]);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markets, tracks, seniority, resultsPerTrack }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? 'Search failed');
      }
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  const strongJobs = jobs.filter((j) => j.cvMatchScore >= 70);
  const amberJobs = jobs.filter((j) => j.cvMatchScore >= 60 && j.cvMatchScore < 70);
  const weakJobs = jobs.filter((j) => j.cvMatchScore < 60);
  const lowerJobs = [...amberJobs, ...weakJobs];

  return (
    <div className="space-y-6">
      {/* Search controls */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Search Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Market */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Market</p>
              <div className="flex flex-wrap gap-1">
                {(['uk', 'latvia', 'both'] as Market[]).map((m) => (
                  <ToggleBtn
                    key={m}
                    value={m}
                    selected={markets}
                    onToggle={toggleMarket}
                    label={m === 'uk' ? 'UK (London)' : m === 'latvia' ? 'Latvia (Riga)' : 'Both'}
                    multi
                  />
                ))}
              </div>
            </div>

            {/* CV Tracks */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">CV Tracks</p>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ['ops-lead', 'Operations Lead'],
                    ['product-owner', 'Product Owner'],
                    ['technical-pm', 'Technical PM'],
                  ] as [Track, string][]
                ).map(([t, label]) => (
                  <ToggleBtn
                    key={t}
                    value={t}
                    selected={tracks}
                    onToggle={toggleTrack}
                    label={label}
                    multi
                  />
                ))}
              </div>
            </div>

            {/* Seniority */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Seniority</p>
              <div className="flex flex-wrap gap-1">
                {(['mid-level', 'senior', 'both'] as Seniority[]).map((s) => (
                  <ToggleBtn
                    key={s}
                    value={s}
                    selected={seniority}
                    onToggle={(v) => setSeniority(v)}
                    label={s === 'mid-level' ? 'Mid-level' : s === 'senior' ? 'Senior' : 'Both'}
                  />
                ))}
              </div>
            </div>

            {/* Results per track */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Results / Track
              </p>
              <div className="flex flex-wrap gap-1">
                {([3, 5, 10] as ResultCount[]).map((n) => (
                  <ToggleBtn<ResultCount>
                    key={n}
                    value={n}
                    selected={resultsPerTrack}
                    onToggle={(v) => setResultsPerTrack(v as ResultCount)}
                    label={String(n)}
                  />
                ))}
              </div>
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700"
            size="lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Searching…
              </span>
            ) : (
              '🔍 Search now'
            )}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Job board */}
      {jobs.length > 0 && (
        <div className="space-y-6">
          {/* Strong matches */}
          {strongJobs.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Strong Matches (≥70%) —{' '}
                <span className="text-green-700">{strongJobs.length} results</span>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {strongJobs.map((job) => (
                  <JobCard key={job.id} job={job} onTailor={setTailorJob} />
                ))}
              </div>
            </section>
          )}

          {/* Lower matches */}
          {lowerJobs.length > 0 && (
            <Accordion multiple={false}>
              <AccordionItem value="lower" className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 font-medium text-sm hover:no-underline">
                  Lower Matches (&lt;70%) — {lowerJobs.length} results
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {lowerJobs.map((job) => (
                      <JobCard key={job.id} job={job} onTailor={setTailorJob} />
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {jobs.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-12">No jobs found. Try different filters.</p>
          )}
        </div>
      )}

      {jobs.length === 0 && !loading && !error && (
        <div className="text-center text-gray-400 py-16">
          <p className="text-4xl mb-4">🔍</p>
          <p className="text-lg font-medium text-gray-500">Configure your search and click Search now</p>
          <p className="text-sm mt-1">Results will appear here, ranked by CV match score</p>
        </div>
      )}

      {/* Tailor slide-over */}
      {tailorJob && (
        <TailorSheet
          job={tailorJob}
          open={!!tailorJob}
          onClose={() => setTailorJob(null)}
        />
      )}
    </div>
  );
}
