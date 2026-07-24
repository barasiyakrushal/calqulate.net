// lib/citations.ts
// Shared bibliographic reference type + renderer for medical citations across
// the site. Storing full bibliographic fields (not just a URL) means a citation
// stays valid and human-verifiable even if a publisher changes its URL scheme —
// only the `url` field ever needs updating.

export interface Reference {
  /** Article / document title — used as the linked text. */
  title: string;
  /** e.g. "Rubino D, et al." Omit for non-authored documents (drug labels). */
  authors?: string;
  /** Journal name, e.g. "JAMA" or "N Engl J Med". */
  journal?: string;
  /** Publisher for non-journal sources (e.g. "U.S. Food & Drug Administration (FDA)"). */
  publisher?: string;
  year?: number;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url: string;
}

/**
 * Render an AMA-style citation string from the structured fields, gracefully
 * skipping anything missing:
 *   "Rubino D, et al. JAMA. 2021;325(14):1414–1425. doi:10.1001/jama.2021.3224"
 *   "U.S. Food & Drug Administration (FDA). 2023."
 */
export function formatCitation(r: Reference): string {
  const parts: string[] = [];
  if (r.authors) parts.push(r.authors.trim());

  const source = r.journal ?? r.publisher;
  if (source) parts.push(`${source}.`);

  if (r.year != null) {
    let v = String(r.year);
    if (r.volume) {
      v += `;${r.volume}`;
      if (r.issue) v += `(${r.issue})`;
      if (r.pages) v += `:${r.pages}`;
    }
    parts.push(`${v}.`);
  }

  if (r.doi) parts.push(`doi:${r.doi}`);

  return parts.join(" ");
}
