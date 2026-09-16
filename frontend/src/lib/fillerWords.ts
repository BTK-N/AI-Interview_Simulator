/**
 * Shared filler word definitions and detection utilities.
 * Ensures the inline transcript highlighter and header badge counts
 * are mathematically identical across all evaluation surfaces.
 */

export const COMMON_FILLERS: Record<string, string> = {
  um: 'Replace vocalized pauses with silent breath pauses. Silence signals executive command.',
  uh: 'Deliberate cadence and structured breathing eliminate hesitation markers.',
  like: 'State assertions directly without comparative hedging ("like", "sort of").',
  basically: 'Eliminate meta-commentary. Lead with concrete architectural mechanisms.',
  actually: 'Drop conversational intensifiers; present technical rationale assertively.',
  'you know': 'Assume the interviewer understands fundamentals; focus on trade-off nuances.',
  'sort of': 'Provide exact system bounds and metrics rather than approximate qualifiers.',
  so: 'Avoid starting explanations with conversational conjunctions; state principles directly.',
};

export interface FillerCountResult {
  total: number;
  counts: Record<string, number>;
}

export function countFillers(transcript: string): FillerCountResult {
  if (!transcript) return { total: 0, counts: {} };

  const lower = transcript.toLowerCase();
  const counts: Record<string, number> = {};
  let total = 0;

  let processed = lower;

  // 1. Detect multi-word phrases first
  for (const phrase of ['you know', 'sort of']) {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi');
    const matches = processed.match(regex);
    if (matches) {
      counts[phrase] = matches.length;
      total += matches.length;
      processed = processed.replace(regex, ' ');
    }
  }

  // 2. Detect single word fillers
  const words = processed.split(/\s+/);
  for (const raw of words) {
    const clean = raw.replace(/[^a-z]/g, '');
    if (COMMON_FILLERS[clean] && clean !== 'you know' && clean !== 'sort of') {
      counts[clean] = (counts[clean] || 0) + 1;
      total++;
    }
  }

  return { total, counts };
}
