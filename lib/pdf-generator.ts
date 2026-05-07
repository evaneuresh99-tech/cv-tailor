import { PDFDocument, rgb, StandardFonts, type RGB } from 'pdf-lib';
import type { CVTemplate, CVTrack } from './cv-templates';

const TRACK_COLOURS: Record<CVTrack, RGB> = {
  'ops-lead': rgb(0.09, 0.60, 0.59),      // teal
  'product-owner': rgb(0.22, 0.47, 0.82), // blue
  'technical-pm': rgb(0.51, 0.25, 0.72),  // purple
};

const MARGIN = 50;
const PAGE_WIDTH = 595; // A4
const PAGE_HEIGHT = 842;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface DrawCtx {
  doc: PDFDocument;
  pages: ReturnType<PDFDocument['addPage']>[];
  regular: Awaited<ReturnType<PDFDocument['embedFont']>>;
  bold: Awaited<ReturnType<PDFDocument['embedFont']>>;
  accent: RGB;
  y: number;
  pageIdx: number;
}

function getPage(ctx: DrawCtx) {
  return ctx.pages[ctx.pageIdx];
}

function ensureSpace(ctx: DrawCtx, needed: number) {
  if (ctx.y - needed < MARGIN) {
    ctx.pages.push(ctx.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]));
    ctx.pageIdx++;
    ctx.y = PAGE_HEIGHT - MARGIN;
  }
}

function drawText(
  ctx: DrawCtx,
  text: string,
  opts: { x?: number; size?: number; font?: 'regular' | 'bold'; colour?: RGB; maxWidth?: number }
) {
  const font = opts.font === 'bold' ? ctx.bold : ctx.regular;
  const size = opts.size ?? 10;
  const colour = opts.colour ?? rgb(0.1, 0.1, 0.1);
  const x = opts.x ?? MARGIN;
  const maxWidth = opts.maxWidth ?? CONTENT_WIDTH;

  // Word-wrap
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  for (const l of lines) {
    ensureSpace(ctx, size + 4);
    getPage(ctx).drawText(l, { x, y: ctx.y, size, font, color: colour });
    ctx.y -= size + 4;
  }
}

function drawSection(ctx: DrawCtx, title: string) {
  ctx.y -= 6;
  ensureSpace(ctx, 18);
  // Accent line
  getPage(ctx).drawRectangle({ x: MARGIN, y: ctx.y - 2, width: CONTENT_WIDTH, height: 1, color: ctx.accent });
  ctx.y -= 6;
  drawText(ctx, title.toUpperCase(), { size: 9, font: 'bold', colour: ctx.accent });
  ctx.y -= 2;
}

function drawBullet(ctx: DrawCtx, text: string, indent = 8) {
  const x = MARGIN + indent;
  const mw = CONTENT_WIDTH - indent - 10;
  const size = 9;
  const font = ctx.regular;
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > mw && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  for (let i = 0; i < lines.length; i++) {
    ensureSpace(ctx, size + 4);
    if (i === 0) {
      getPage(ctx).drawText('•', { x: MARGIN + 2, y: ctx.y, size, font, color: rgb(0.1, 0.1, 0.1) });
    }
    getPage(ctx).drawText(lines[i], { x, y: ctx.y, size, font, color: rgb(0.1, 0.1, 0.1) });
    ctx.y -= size + 4;
  }
}

export async function generateCVPdf(cv: CVTemplate, track: CVTrack): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const accent = TRACK_COLOURS[track];

  const firstPage = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const ctx: DrawCtx = {
    doc, pages: [firstPage], regular, bold, accent,
    y: PAGE_HEIGHT - MARGIN, pageIdx: 0,
  };

  // ── Header ──────────────────────────────────────────────────────────────
  drawText(ctx, cv.candidateName, { size: 20, font: 'bold', colour: accent });
  ctx.y -= 2;
  const contactLine = [cv.location, cv.phone, cv.email, cv.linkedin].filter(Boolean).join('  |  ');
  drawText(ctx, contactLine, { size: 8, colour: rgb(0.4, 0.4, 0.4) });

  // ── Summary ─────────────────────────────────────────────────────────────
  drawSection(ctx, 'Professional Summary');
  drawText(ctx, cv.summary, { size: 9 });

  // ── Competencies ────────────────────────────────────────────────────────
  drawSection(ctx, 'Core Competencies');
  const colW = CONTENT_WIDTH / 3;
  const rows = Math.ceil(cv.competencies.length / 3);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 3; c++) {
      const comp = cv.competencies[r * 3 + c];
      if (!comp) continue;
      ensureSpace(ctx, 12);
      const x = MARGIN + c * colW;
      getPage(ctx).drawText(`• ${comp}`, { x, y: ctx.y, size: 8.5, font: regular, color: rgb(0.1, 0.1, 0.1) });
    }
    ctx.y -= 13;
  }

  // ── Experience ──────────────────────────────────────────────────────────
  drawSection(ctx, 'Professional Experience');
  for (const exp of cv.experience) {
    ctx.y -= 4;
    ensureSpace(ctx, 14);
    // Title + period on same line
    drawText(ctx, exp.title, { size: 10, font: 'bold' });
    const periodW = regular.widthOfTextAtSize(exp.period, 9);
    getPage(ctx).drawText(exp.period, {
      x: PAGE_WIDTH - MARGIN - periodW,
      y: ctx.y + 14,
      size: 9, font: regular, color: rgb(0.4, 0.4, 0.4),
    });
    drawText(ctx, exp.company, { size: 9, colour: accent });
    for (const bullet of exp.bullets) {
      drawBullet(ctx, bullet);
    }
  }

  // ── Achievements ────────────────────────────────────────────────────────
  drawSection(ctx, 'Key Achievements');
  for (const ach of cv.achievements) {
    drawBullet(ctx, ach);
  }

  // ── Education ───────────────────────────────────────────────────────────
  drawSection(ctx, 'Education');
  for (const ed of cv.education) {
    drawText(ctx, `${ed.degree} — ${ed.institution} (${ed.year})`, { size: 9 });
  }

  // ── Tools ───────────────────────────────────────────────────────────────
  drawSection(ctx, 'Tools & Technologies');
  for (const [category, tools] of Object.entries(cv.tools)) {
    ensureSpace(ctx, 12);
    drawText(ctx, `${category}: ${tools.join(', ')}`, { size: 9 });
  }

  // ── Languages ───────────────────────────────────────────────────────────
  drawSection(ctx, 'Languages');
  drawText(ctx, cv.languages.map((l) => `${l.language} (${l.level})`).join('  •  '), { size: 9 });

  return doc.save();
}

export async function generateCoverLetterPdf(text: string, candidateName: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const ctx: DrawCtx = {
    doc, pages: [page], regular, bold, accent: rgb(0.22, 0.47, 0.82),
    y: PAGE_HEIGHT - MARGIN, pageIdx: 0,
  };

  drawText(ctx, candidateName, { size: 14, font: 'bold' });
  ctx.y -= 8;

  const paragraphs = text.split('\n\n').filter(Boolean);
  for (const para of paragraphs) {
    ctx.y -= 6;
    drawText(ctx, para.trim(), { size: 10 });
  }

  return doc.save();
}
