import Anthropic from '@anthropic-ai/sdk';
import type { CVTemplate, CVTrack } from './cv-templates';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-4-5';

export interface GapItem {
  requirement: string;
  status: 'match' | 'partial' | 'gap';
  evidence: string;
  noteForCoverLetter: string;
}

export interface CVSelectionResult {
  selectedTrack: CVTrack;
  reasoning: string;
  warningIfBelow60Percent?: string;
}

export interface TailoredCVResult {
  cv: CVTemplate;
  tailoringNotes: string[];
}

function extractJson<T>(text: string): T {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\s*/m, '').replace(/\s*```\s*$/m, '').trim();
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to find the first { or [ and parse from there
    const start = cleaned.search(/[\[{]/);
    if (start === -1) throw new Error('No JSON found in response');
    return JSON.parse(cleaned.slice(start)) as T;
  }
}

export async function selectBestTemplate(
  templateSummaries: { id: string; track: CVTrack; summary: string; competencies: string[] }[],
  jd: string
): Promise<CVSelectionResult> {
  const prompt = `You are a career coach. Given these three CV templates and this job description, identify the single best-matching template.

CV Templates:
${templateSummaries.map((t) => `Track: ${t.track}\nSummary: ${t.summary}\nCompetencies: ${t.competencies.join(', ')}`).join('\n\n---\n\n')}

Job Description:
${jd}

Return JSON only (no markdown, no explanation):
{
  "selectedTrack": "<ops-lead|product-owner|technical-pm>",
  "reasoning": "<2-3 sentence explanation>",
  "warningIfBelow60Percent": "<optional warning if match is likely below 60%>"
}`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
  return extractJson<CVSelectionResult>(text);
}

export async function runGapAnalysis(template: CVTemplate, jd: string): Promise<GapItem[]> {
  const prompt = `Map every stated requirement from this job description against the CV content provided.

CV Template (${template.track}):
${JSON.stringify(template, null, 2)}

Job Description:
${jd}

For each requirement return a JSON array item:
{
  "requirement": "<the stated requirement>",
  "status": "match" | "partial" | "gap",
  "evidence": "<verbatim or near-verbatim text from the CV, or 'No evidence found'>",
  "noteForCoverLetter": "<note about how to address this in the cover letter>"
}

Rules:
- A gap is a gap. Do not mark something as a match if the evidence does not exist verbatim or by clear equivalence in the CV template.
- Extract ALL requirements — mandatory, preferred, and nice-to-have.
- Return a JSON array only, no markdown, no explanation.`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '[]';
  return extractJson<GapItem[]>(text);
}

export async function tailorCV(
  template: CVTemplate,
  jd: string,
  gapAnalysis: GapItem[],
  retryNote?: string
): Promise<TailoredCVResult> {
  const prompt = `Tailor this CV for the job description. Return the complete tailored CV as JSON.

Original CV Template:
${JSON.stringify(template, null, 2)}

Job Description:
${jd}

Gap Analysis:
${JSON.stringify(gapAnalysis, null, 2)}

${retryNote ? `CORRECTION REQUIRED: ${retryNote}` : ''}

Rules:
1. Use JD language where the candidate's real experience earns it.
2. Reorder sections so strongest matches lead.
3. Surface buried evidence that matches JD requirements.
4. Inject ATS keywords into summary, competencies, and tools.
5. NEVER add skills, experience, or outcomes not in the provided template.
6. NEVER claim domain experience not present.
7. You may only reframe and reorder — never invent.

Return JSON only, same structure as the original CV, plus a "tailoringNotes" array:
{
  ...same CV structure...,
  "tailoringNotes": ["<note about each change made>"]
}`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = msg.content[0].type === 'text' ? msg.content[0].text : '{}';
  const result = extractJson<CVTemplate & { tailoringNotes: string[] }>(text);
  const { tailoringNotes = [], ...cv } = result;
  return { cv: cv as CVTemplate, tailoringNotes };
}

export async function generateCoverLetter(
  cv: CVTemplate,
  jd: string,
  gapAnalysis: GapItem[],
  company: string,
  location: string
): Promise<string> {
  const hardGaps = gapAnalysis.filter((g) => g.status === 'gap');
  const isUK = location.toLowerCase().includes('uk') || location.toLowerCase().includes('london') || location.toLowerCase().includes('england');

  const prompt = `Write a cover letter for this job application.

Candidate CV:
${JSON.stringify(cv, null, 2)}

Job Description:
${jd}

Company: ${company}
Location: ${location}

Hard Gaps (requirements not in CV):
${hardGaps.map((g) => `- ${g.requirement}: ${g.noteForCoverLetter}`).join('\n')}

Rules:
1. Open by mirroring specific language from the JD — NEVER start with "I am writing to apply for".
2. Tone: ${isUK ? 'formal (UK professional standard)' : 'slightly warmer (EU professional standard)'}.
3. ${hardGaps.length > 0 ? 'One paragraph must address the hard gaps honestly — frame domain as learnable, delivery capability as proven.' : 'No gaps to address.'}
4. Never invent experience not in the CV.
5. Maximum 4 paragraphs plus sign-off.
6. Return plain text only, paragraphs separated by blank lines.`;

  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  return msg.content[0].type === 'text' ? msg.content[0].text : '';
}

export async function scoreCV(cv: CVTemplate, jd: string, gapAnalysis: GapItem[]) {
  const total = gapAnalysis.length;
  if (total === 0) return { cvMatchScore: 0, atsScore: 0 };

  const matches = gapAnalysis.filter((g) => g.status === 'match').length;
  const partials = gapAnalysis.filter((g) => g.status === 'partial').length;
  const cvMatchScore = Math.round(((matches + partials * 0.5) / total) * 100);

  // ATS: count JD keywords found in CV text
  const cvText = JSON.stringify(cv).toLowerCase();
  const jdWords = jd
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 4);
  const uniqueJdWords = Array.from(new Set(jdWords));
  const found = uniqueJdWords.filter((w) => cvText.includes(w)).length;
  const atsScore = Math.round((found / Math.max(uniqueJdWords.length, 1)) * 100);

  return { cvMatchScore, atsScore };
}
