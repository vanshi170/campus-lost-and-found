/**
 * ============================================================================
 * CAMPUS LOST & FOUND - AUTOMATED ITEM MATCHER UTILITY
 * ============================================================================
 * 
 * Purpose:
 * When a student reports a Lost item or a Found item, this algorithm computes
 * a similarity score (0 - 100) against items of the opposite type that are
 * currently 'open' in the database.
 * 
 * Scoring Breakdown (Total: 100 Points):
 * 1. Category Match:      30 points
 * 2. Text Similarity:      up to 35 points (Jaccard similarity on keyword tokens)
 * 3. Color Match:          10 points (if specified in both items)
 * 4. Campus Zone/Location: 15 points max (zone match + location text overlap)
 * 5. Date Proximity:       up to 10 points (within 3 days = 10, within 7 days = 5)
 * 
 * Threshold: Only items with a score >= 30 are considered relevant matches.
 */

// Common English words to ignore when performing text similarity
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'of',
  'by', 'from', 'is', 'was', 'are', 'were', 'it', 'my', 'i', 'me', 'near',
  'around', 'behind', 'front', 'left', 'right', 'there', 'here', 'has', 'have',
  'had', 'some', 'any', 'that', 'this', 'inside', 'outside', 'floor', 'room'
]);

/**
 * Tokenize a string into a clean Set of meaningful lowercase words.
 * Strips punctuation, removes stop words, and ignores 1-character noise.
 * 
 * @param {string} text - Raw input string
 * @returns {Set<string>} - Set of normalized keywords
 */
function extractKeywords(text) {
  if (!text || typeof text !== 'string') return new Set();

  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ') // Remove special symbols & punctuation
      .split(/\s+/)                  // Split by whitespace
      .map(word => word.trim())
      .filter(word => word.length > 1 && !STOP_WORDS.has(word))
  );
}

/**
 * Calculate Jaccard Similarity between two sets of words:
 * J(A, B) = |A ∩ B| / |A ∪ B|
 * Returns a value between 0.0 and 1.0.
 * 
 * @param {Set<string>} setA 
 * @param {Set<string>} setB 
 * @returns {number} - Similarity ratio
 */
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersectionCount = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionCount++;
    }
  }

  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize > 0 ? intersectionCount / unionSize : 0;
}

/**
 * Compare two items (one target item and one candidate opposite-type item)
 * and calculate a comprehensive match score with transparent reasons.
 * 
 * @param {Object} target - The reference item (lost or found)
 * @param {Object} candidate - The item being evaluated
 * @returns {{ matchScore: number, reasons: string[] }}
 */
function scoreItemPair(target, candidate) {
  let score = 0;
  const reasons = [];

  // -------------------------------------------------------------
  // 1. CATEGORY MATCH (30 Points)
  // -------------------------------------------------------------
  if (target.category && candidate.category && target.category === candidate.category) {
    score += 30;
    reasons.push(`Same category (${target.category})`);
  }

  // -------------------------------------------------------------
  // 2. TEXT SIMILARITY: TITLE + DESCRIPTION (Up to 35 Points)
  // -------------------------------------------------------------
  const targetText = `${target.title || ''} ${target.description || ''}`;
  const candidateText = `${candidate.title || ''} ${candidate.description || ''}`;

  const targetTokens = extractKeywords(targetText);
  const candidateTokens = extractKeywords(candidateText);
  const similarity = jaccardSimilarity(targetTokens, candidateTokens);

  // Scaled linearly up to 35 points
  const textScore = Math.round(similarity * 35);
  if (textScore > 0) {
    score += textScore;
    if (textScore >= 6) {
      // Find matching keywords for a human-readable explanation
      const commonWords = [...targetTokens].filter(word => candidateTokens.has(word));
      if (commonWords.length > 0) {
        reasons.push(`Matching keywords: ${commonWords.slice(0, 3).join(', ')}`);
      } else {
        reasons.push('Similar title or description');
      }
    }
  }

  // -------------------------------------------------------------
  // 3. COLOR MATCH (10 Points)
  // -------------------------------------------------------------
  const targetColor = (target.color || '').trim().toLowerCase();
  const candidateColor = (candidate.color || '').trim().toLowerCase();

  if (targetColor && candidateColor) {
    // Exact color match or substring match (e.g., 'dark blue' vs 'blue')
    if (
      targetColor === candidateColor ||
      targetColor.includes(candidateColor) ||
      candidateColor.includes(targetColor)
    ) {
      score += 10;
      reasons.push(`Matching color (${candidate.color})`);
    }
  }

  // -------------------------------------------------------------
  // 4. CAMPUS ZONE & SPECIFIC LOCATION (Up to 15 Points)
  // -------------------------------------------------------------
  let locationPoints = 0;
  let zoneMatched = false;

  if (target.campusZone && candidate.campusZone && target.campusZone === candidate.campusZone) {
    zoneMatched = true;
    locationPoints += 10;
    reasons.push(`Same campus zone (${target.campusZone})`);
  }

  // Check specific location text overlap (e.g. "Library 2nd floor" & "Library 2nd floor desk")
  const targetLocTokens = extractKeywords(target.locationName || '');
  const candidateLocTokens = extractKeywords(candidate.locationName || '');
  const locOverlap = [...targetLocTokens].some(token => candidateLocTokens.has(token));

  if (locOverlap) {
    locationPoints += zoneMatched ? 5 : 8;
    reasons.push('Specific location overlap');
  }

  // Cap location block at 15 points
  score += Math.min(locationPoints, 15);

  // -------------------------------------------------------------
  // 5. DATE CLOSENESS (Up to 10 Points)
  // -------------------------------------------------------------
  if (target.dateOccurred && candidate.dateOccurred) {
    const targetDate = new Date(target.dateOccurred);
    const candidateDate = new Date(candidate.dateOccurred);

    // Identify which is lost and which is found
    const lostDate = target.type === 'lost' ? targetDate : candidateDate;
    const foundDate = target.type === 'found' ? targetDate : candidateDate;

    // Found item date should be on or after lost date (with 24h allowance for reporting buffer)
    const allowanceMs = 24 * 60 * 60 * 1000;
    const chronologicalSense = foundDate.getTime() >= (lostDate.getTime() - allowanceMs);

    const diffDays = Math.round(Math.abs(targetDate - candidateDate) / (1000 * 60 * 60 * 24));

    if (chronologicalSense) {
      if (diffDays <= 3) {
        score += 10;
        reasons.push(diffDays === 0 ? 'Reported on the same day' : `Dates within ${diffDays} day${diffDays > 1 ? 's' : ''}`);
      } else if (diffDays <= 7) {
        score += 5;
        reasons.push(`Dates within a week (${diffDays} days apart)`);
      }
    } else if (diffDays <= 2) {
      // Small penalty allowance for minor date estimation differences by students
      score += 5;
      reasons.push('Dates within 2 days');
    }
  }

  // Ensure score stays within bounds [0, 100]
  const finalScore = Math.min(Math.max(score, 0), 100);

  return {
    matchScore: finalScore,
    reasons
  };
}

/**
 * Given a target item and a list of candidate items, filter and sort
 * the top matching items based on the matching rules.
 * 
 * @param {Object} targetItem - Target item document
 * @param {Array<Object>} candidateItems - List of items from DB
 * @param {number} [threshold=30] - Minimum match score to include
 * @param {number} [topLimit=5] - Maximum number of matches to return
 * @returns {Array<Object>} - Sorted array of scored candidate matches
 */
function findMatches(targetItem, candidateItems = [], threshold = 30, topLimit = 5) {
  if (!targetItem || !Array.isArray(candidateItems)) return [];

  const oppositeType = targetItem.type === 'lost' ? 'found' : 'lost';

  const scoredMatches = candidateItems
    .filter(candidate => {
      // Must be opposite type, status open, and not the same item
      return (
        candidate.type === oppositeType &&
        candidate.status === 'open' &&
        candidate._id.toString() !== targetItem._id.toString()
      );
    })
    .map(candidate => {
      const { matchScore, reasons } = scoreItemPair(targetItem, candidate);
      return {
        item: candidate,
        matchScore,
        reasons
      };
    })
    .filter(result => result.matchScore >= threshold)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, topLimit);

  return scoredMatches;
}

module.exports = {
  findMatches,
  scoreItemPair,
  extractKeywords,
  jaccardSimilarity
};
