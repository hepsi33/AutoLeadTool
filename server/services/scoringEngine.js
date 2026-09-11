/**
 * Lead Scoring Engine for Zyoin Business Development
 * Computes 0-100 Lead Score across 4 weighted pillars:
 * 1. Hiring Activity (Max 40)
 * 2. Growth Signals (Max 25)
 * 3. Zyoin Relevance (Max 20)
 * 4. India Opportunity (Max 15)
 * 
 * Assigns Priority: HOT (85-100), HIGH (70-84), MEDIUM (55-69)
 */

export function calculateLeadScore(company) {
  const openings = company.relevantOpenings || 0;
  const category = company.category || 'Startup';
  const growthDetails = (company.growthDetails || '').toLowerCase();
  const indiaLocations = (company.indiaLocations || '').toLowerCase();

  // --- PILLAR 1: HIRING ACTIVITY (Max 40) ---
  let hiringScore = 10;
  if (openings >= 50) hiringScore = 40;
  else if (openings >= 35) hiringScore = 35;
  else if (openings >= 25) hiringScore = 28;
  else if (openings >= 15) hiringScore = 20;
  else if (openings >= 5) hiringScore = 14;

  // --- PILLAR 2: GROWTH SIGNALS (Max 25) ---
  let growthScore = 10;
  if (growthDetails.includes('series d') || growthDetails.includes('series e') || growthDetails.includes('$100m') || growthDetails.includes('new campus') || growthDetails.includes('billion')) {
    growthScore = 25;
  } else if (growthDetails.includes('funding') || growthDetails.includes('gcc') || growthDetails.includes('expansion') || growthDetails.includes('acquired')) {
    growthScore = 20;
  } else if (growthDetails.includes('scaling') || growthDetails.includes('growth')) {
    growthScore = 15;
  }

  // --- PILLAR 3: ZYOIN RELEVANCE (Max 20) ---
  let relevanceScore = 14;
  const roles = (company.keyRolesHiring || '').toLowerCase();
  if (roles.includes('java') || roles.includes('qa') || roles.includes('devops') || roles.includes('data') || roles.includes('cyber') || roles.includes('cloud')) {
    relevanceScore = 19;
  } else if (roles.includes('engineer') || roles.includes('developer')) {
    relevanceScore = 16;
  }

  // --- PILLAR 4: INDIA OPPORTUNITY (Max 15) ---
  let indiaScore = 10;
  if (indiaLocations.includes('bengaluru') || indiaLocations.includes('hyderabad') || indiaLocations.includes('pune')) {
    indiaScore = 15;
  } else if (indiaLocations.includes('gurgaon') || indiaLocations.includes('chennai') || indiaLocations.includes('mumbai') || indiaLocations.includes('noida')) {
    indiaScore = 13;
  }

  const totalScore = Math.min(100, hiringScore + growthScore + relevanceScore + indiaScore);

  let priority = 'MEDIUM';
  if (totalScore >= 85) priority = 'HOT';
  else if (totalScore >= 70) priority = 'HIGH';
  else if (totalScore >= 55) priority = 'MEDIUM';
  else priority = 'LOW';

  return {
    leadScore: totalScore,
    priority,
    scoreBreakdown: {
      hiringScore,
      growthScore,
      relevanceScore,
      indiaScore
    }
  };
}
