/**
 * Company Name Normalization & Similarity Utility
 * Normalizes company names to detect corporate matches across variations
 * e.g., "Acme Technologies Pvt Ltd", "Acme Technologies India", "ACME", "acme-tech.com"
 */

// Legal suffixes and noise words commonly found in Indian & global company names
const LEGAL_SUFFIXES = [
  'pvt ltd', 'private limited', 'pvt. ltd.', 'ltd', 'limited', 'inc', 'incorporated',
  'llc', 'corp', 'corporation', 'gmbh', 'co.', 'co', 'technologies', 'technology',
  'tech', 'labs', 'software', 'solutions', 'systems', 'services', 'group', 'holdings',
  'global', 'international', 'india', 'pvt', 'private', 'enterprises', 'hub', 'digital'
];

/**
 * Clean and normalize a company name string into a canonical tokenized representation
 * @param {string} name 
 * @returns {string} Normalized lower-case alphanumeric string
 */
export function normalizeCompanyName(name) {
  if (!name || typeof name !== 'string') return '';

  let normalized = name.toLowerCase().trim();

  // Replace punctuation with spaces
  normalized = normalized.replace(/[^a-z0-9\s]/g, ' ');

  // Remove common legal suffixes
  LEGAL_SUFFIXES.forEach(suffix => {
    const regex = new RegExp(`\\b${suffix}\\b`, 'gi');
    normalized = normalized.replace(regex, '');
  });

  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Extract clean domain name from URL or raw text
 * @param {string} domainOrUrl 
 * @returns {string} Clean domain (e.g. "acme.com")
 */
export function extractCleanDomain(domainOrUrl) {
  if (!domainOrUrl || typeof domainOrUrl !== 'string') return '';
  let clean = domainOrUrl.toLowerCase().trim();
  clean = clean.replace(/^(https?:\/\/)?(www\.)?/, '');
  clean = clean.split('/')[0];
  clean = clean.split('?')[0];
  return clean;
}

/**
 * Calculate Dice Coefficient Similarity between two strings (0.0 to 1.0)
 */
export function calculateSimilarity(str1, str2) {
  const norm1 = normalizeCompanyName(str1);
  const norm2 = normalizeCompanyName(str2);

  if (norm1 === norm2) return 1.0;
  if (!norm1 || !norm2) return 0.0;

  // Exact substring check if normalized length >= 4
  if (norm1.length >= 4 && norm2.length >= 4) {
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return 0.85;
    }
  }

  // Bigram Dice coefficient
  const getBigrams = (str) => {
    const bigrams = new Set();
    for (let i = 0; i < str.length - 1; i++) {
      bigrams.add(str.substring(i, i + 2));
    }
    return bigrams;
  };

  const bigrams1 = getBigrams(norm1);
  const bigrams2 = getBigrams(norm2);
  let intersection = 0;

  bigrams1.forEach(bg => {
    if (bigrams2.has(bg)) intersection++;
  });

  const total = bigrams1.size + bigrams2.size;
  return total > 0 ? (2 * intersection) / total : 0;
}

/**
 * Verify whether two company records match based on normalized name, domain, parent company
 * @param {Object} target { name, domain, parentCompany }
 * @param {Object} candidate { name, domain, parentCompany, altNames }
 * @returns {Object} { isMatch: boolean, score: number, reason: string }
 */
export function verifyCompanyMatch(target, candidate) {
  if (!target || !candidate) return { isMatch: false, score: 0, reason: 'Invalid input' };

  // 1. Domain match check
  const targetDomain = extractCleanDomain(target.domain);
  const candidateDomain = extractCleanDomain(candidate.domain);
  if (targetDomain && candidateDomain && targetDomain === candidateDomain) {
    return { isMatch: true, score: 1.0, reason: `Exact domain match: ${targetDomain}` };
  }

  // 2. Exact normalized name match
  const normTarget = normalizeCompanyName(target.name);
  const normCandidate = normalizeCompanyName(candidate.name);

  if (normTarget && normCandidate && normTarget === normCandidate) {
    return { isMatch: true, score: 1.0, reason: `Exact normalized name match: "${normTarget}"` };
  }

  // 3. Alternate names check
  if (candidate.altNames && Array.isArray(candidate.altNames)) {
    for (const alt of candidate.altNames) {
      const normAlt = normalizeCompanyName(alt);
      if (normTarget && normAlt && normTarget === normAlt) {
        return { isMatch: true, score: 0.95, reason: `Matches alternate name: "${alt}"` };
      }
    }
  }

  // 4. Parent company match
  if (target.parentCompany && candidate.name) {
    const normParent = normalizeCompanyName(target.parentCompany);
    if (normParent && normCandidate && normParent === normCandidate) {
      return { isMatch: true, score: 0.9, reason: `Matches parent company: "${target.parentCompany}"` };
    }
  }

  // 5. Similarity score
  const similarity = calculateSimilarity(target.name, candidate.name);
  if (similarity >= 0.8) {
    return { isMatch: true, score: similarity, reason: `High similarity match (${Math.round(similarity * 100)}%)` };
  }

  if (similarity >= 0.6) {
    return { isMatch: false, score: similarity, isAmbiguous: true, reason: `Moderate similarity match (${Math.round(similarity * 100)}%) - requires manual review` };
  }

  return { isMatch: false, score: similarity, reason: 'No significant match' };
}
