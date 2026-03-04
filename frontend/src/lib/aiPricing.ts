import { v4 as uuid } from 'uuid';
import type { Project, BOQItem, RateEntry, AIPricingSuggestion } from '@/types';

// ── String Similarity ───────────────────────────────

/** Tokenise a description into meaningful words (length ≥ 3, lowered) */
function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3);
}

/** Jaccard-style word overlap score (0–1) */
function wordOverlap(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

/** Substring containment bonus — checks if key phrases from one appear in the other */
function substringBonus(itemDesc: string, rateDesc: string): number {
  const a = itemDesc.toLowerCase();
  const b = rateDesc.toLowerCase();
  // Check if rate description is contained (or vice versa)
  if (a.includes(b) || b.includes(a)) return 0.3;
  // Check 3-word ngrams
  const wordsA = tokenise(itemDesc);
  let bonus = 0;
  for (let i = 0; i <= wordsA.length - 3; i++) {
    const ngram = wordsA.slice(i, i + 3).join(' ');
    if (b.includes(ngram)) { bonus = 0.15; break; }
  }
  return bonus;
}

// ── Matching Engine ─────────────────────────────────

interface MatchResult {
  rate: RateEntry;
  score: number;
  reason: string;
}

/** Score a single BOQ item against a single rate entry */
function scoreMatch(item: BOQItem, rate: RateEntry, projectIndustryId: string): MatchResult {
  const itemTokens = tokenise(item.description);
  const rateTokens = tokenise(rate.description);

  // 1. Description similarity (60% weight)
  const overlap = wordOverlap(itemTokens, rateTokens);
  const bonus = substringBonus(item.description, rate.description);
  const descScore = Math.min(overlap + bonus, 1.0);

  // 2. Unit match (20% weight)
  const unitScore = item.unit.toLowerCase() === rate.unit.toLowerCase() ? 1.0 : 0.0;

  // 3. Industry/trade match (20% weight)
  const industryScore = rate.industryId === projectIndustryId ? 1.0 : 0.3;

  const finalScore = descScore * 0.6 + unitScore * 0.2 + industryScore * 0.2;

  // Build reason string
  const matchedWords = itemTokens.filter((w) => rateTokens.includes(w));
  const reason = matchedWords.length > 0
    ? `Matched: "${matchedWords.slice(0, 4).join(', ')}"`
    : `Partial match`;

  return { rate, score: finalScore, reason };
}

/** Determine confidence level from score */
function confidenceLevel(score: number): 'high' | 'medium' | 'low' {
  if (score >= 0.55) return 'high';
  if (score >= 0.35) return 'medium';
  return 'low';
}

/** Find best matching rate for a single BOQ item */
function findBestMatch(
  item: BOQItem,
  rates: RateEntry[],
  industryId: string,
  minScore = 0.2,
): MatchResult | null {
  let best: MatchResult | null = null;

  for (const rate of rates) {
    const result = scoreMatch(item, rate, industryId);
    if (result.score >= minScore && (!best || result.score > best.score)) {
      best = result;
    }
  }

  return best;
}

// ── Public API ──────────────────────────────────────

/** Generate AI pricing suggestions for all unpriced items in a project */
export function generatePricingSuggestions(
  project: Project,
  rates: RateEntry[],
): AIPricingSuggestion[] {
  const suggestions: AIPricingSuggestion[] = [];

  for (const section of project.boqSections) {
    for (const item of section.items) {
      // Only suggest for unpriced items (totalRate === 0)
      if (item.totalRate > 0) continue;
      // Skip items with very short descriptions
      if (item.description.trim().length < 5) continue;

      const match = findBestMatch(item, rates, project.industryId);
      if (!match) continue;

      const pct = Math.round(match.score * 100);

      suggestions.push({
        id: uuid(),
        boqItemId: item.id,
        sectionId: section.id,
        matchedRateId: match.rate.id,
        matchedDescription: match.rate.description,
        confidence: pct,
        confidenceLevel: confidenceLevel(match.score),
        suggestedRates: {
          materialsRate: match.rate.materialsRate,
          labourRate: match.rate.labourRate,
          plantRate: match.rate.plantRate,
          subcontractRate: match.rate.subcontractRate,
        },
        matchReason: `${pct}% — ${match.reason}`,
        status: 'pending',
      });
    }
  }

  // Sort by confidence descending
  suggestions.sort((a, b) => b.confidence - a.confidence);
  return suggestions;
}

/** Stats summary for the suggestions bar */
export function suggestionStats(suggestions: AIPricingSuggestion[]) {
  return {
    total: suggestions.length,
    pending: suggestions.filter((s) => s.status === 'pending').length,
    accepted: suggestions.filter((s) => s.status === 'accepted').length,
    dismissed: suggestions.filter((s) => s.status === 'dismissed').length,
    highConfidence: suggestions.filter((s) => s.status === 'pending' && s.confidenceLevel === 'high').length,
  };
}
