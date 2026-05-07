import { NextRequest, NextResponse } from 'next/server';
import { cvTemplates, getAllTemplateSummaries, getTemplateByTrack, type CVTrack } from '@/lib/cv-templates';
import { selectBestTemplate, runGapAnalysis, tailorCV, scoreCV, generateCoverLetter } from '@/lib/ai-client';
import { diffCVAgainstTemplate } from '@/lib/diff-checker';
import { generateCVPdf, generateCoverLetterPdf } from '@/lib/pdf-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jd, action, track, company, location } = body as {
      jd: string;
      action: 'tailor' | 'cover-letter';
      track?: CVTrack;
      company?: string;
      location?: string;
    };

    if (!jd?.trim()) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const summaries = getAllTemplateSummaries();

    // Step 1: CV selection
    const selection = await selectBestTemplate(summaries, jd);
    const selectedTemplate = getTemplateByTrack(selection.selectedTrack);
    if (!selectedTemplate) {
      return NextResponse.json({ error: 'Could not find matching template' }, { status: 500 });
    }

    // Step 2: Gap analysis
    const gapAnalysis = await runGapAnalysis(selectedTemplate, jd);

    // Step 3: Pre-tailoring scores
    const preScores = await scoreCV(selectedTemplate, jd, gapAnalysis);

    if (action === 'cover-letter') {
      // Use already-tailored track if provided
      const cvForLetter = track ? (getTemplateByTrack(track) ?? selectedTemplate) : selectedTemplate;
      const text = await generateCoverLetter(
        cvForLetter,
        jd,
        gapAnalysis,
        company ?? 'the company',
        location ?? ''
      );
      const pdfBytes = await generateCoverLetterPdf(text, cvForLetter.candidateName);
      const candidateName = cvForLetter.candidateName.replace(/\s+/g, '_');
      const co = (company ?? 'Company').replace(/\s+/g, '_');
      return new NextResponse(Buffer.from(pdfBytes), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${candidateName}_${co}_CoverLetter.pdf"`,
        },
      });
    }

    // Step 4: Tailor CV (with up to 2 retries for diff violations)
    let tailored = await tailorCV(selectedTemplate, jd, gapAnalysis);
    let violations = diffCVAgainstTemplate(tailored.cv, selectedTemplate);
    let retryCount = 0;

    while (violations.length > 0 && retryCount < 2) {
      const retryNote = `The following items were invented and must be removed: ${violations.map((v) => `"${v.value}" in ${v.field}`).join('; ')}. Only use content from the original template.`;
      tailored = await tailorCV(selectedTemplate, jd, gapAnalysis, retryNote);
      violations = diffCVAgainstTemplate(tailored.cv, selectedTemplate);
      retryCount++;
    }

    // Step 5: Post-tailoring scores
    const gapAnalysisPost = await runGapAnalysis(tailored.cv, jd);
    const postScores = await scoreCV(tailored.cv, jd, gapAnalysisPost);

    // Step 6: Generate CV PDF
    const pdfBytes = await generateCVPdf(tailored.cv, selection.selectedTrack);
    const candidateName = tailored.cv.candidateName.replace(/\s+/g, '_');
    const co = (company ?? extractCompanyFromJD(jd)).replace(/\s+/g, '_');
    const pdfBase64 = Buffer.from(pdfBytes).toString('base64');
    const filename = `${candidateName}_${co}_${selection.selectedTrack}_CV.pdf`;

    const hardGaps = gapAnalysis.filter((g) => g.status === 'gap');

    return NextResponse.json({
      selection,
      gapAnalysis,
      preScores,
      postScores,
      tailoringNotes: tailored.tailoringNotes,
      hardGaps,
      diffViolations: violations,
      pdfBase64,
      filename,
      tailoredTrack: selection.selectedTrack,
    });
  } catch (err) {
    console.error('[/api/tailor]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}

function extractCompanyFromJD(jd: string): string {
  // Very rough heuristic: first capitalised word sequence after "at" or "for"
  const match = jd.match(/\b(?:at|for|with)\s+([A-Z][A-Za-z0-9&.\-]+(?:\s+[A-Z][A-Za-z0-9&.\-]+){0,3})/);
  return match?.[1] ?? 'Company';
}
