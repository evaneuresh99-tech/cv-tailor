import type { CVTemplate } from './cv-templates';

export interface DiffViolation {
  field: string;
  value: string;
  reason: string;
}

function normalise(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

function isTraceable(needle: string, haystack: string[]): boolean {
  const n = normalise(needle);
  // Allow if it's a substring of any original item or vice-versa
  return haystack.some((h) => {
    const hn = normalise(h);
    return hn.includes(n) || n.includes(hn) || levenshteinSimilarity(n, hn) > 0.75;
  });
}

function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const dist = levenshtein(a, b);
  return 1 - dist / maxLen;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export function diffCVAgainstTemplate(
  tailored: CVTemplate,
  original: CVTemplate
): DiffViolation[] {
  const violations: DiffViolation[] = [];

  // All original bullets flattened
  const originalBullets = original.experience.flatMap((e) => e.bullets);
  const originalAchievements = original.achievements;
  const originalCompetencies = original.competencies;

  // All original tool values flattened
  const originalTools = Object.values(original.tools).flat();

  // Check competencies
  for (const comp of tailored.competencies) {
    if (!isTraceable(comp, originalCompetencies)) {
      violations.push({
        field: 'competency',
        value: comp,
        reason: 'Not found in original competencies list',
      });
    }
  }

  // Check experience bullets
  for (const exp of tailored.experience) {
    const originalExp = original.experience.find(
      (e) => normalise(e.company) === normalise(exp.company)
    );
    const sourcePool = originalExp ? originalExp.bullets : originalBullets;

    for (const bullet of exp.bullets) {
      if (!isTraceable(bullet, sourcePool)) {
        violations.push({
          field: `experience.${exp.company}`,
          value: bullet,
          reason: `Bullet not traceable to original template for ${exp.company}`,
        });
      }
    }
  }

  // Check achievements
  for (const ach of tailored.achievements) {
    if (!isTraceable(ach, originalAchievements)) {
      violations.push({
        field: 'achievement',
        value: ach,
        reason: 'Achievement not found in original template',
      });
    }
  }

  // Check tools
  for (const [category, tools] of Object.entries(tailored.tools)) {
    for (const tool of tools) {
      if (!isTraceable(tool, originalTools)) {
        violations.push({
          field: `tools.${category}`,
          value: tool,
          reason: `Tool "${tool}" not in original tools list`,
        });
      }
    }
  }

  return violations;
}
