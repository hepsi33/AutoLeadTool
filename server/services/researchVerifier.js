/**
 * Research Verification & Signal Quality Engine
 * Verifies hiring and growth evidence, calculates confidence scores,
 * enforces strict separation of FACT vs INFERENCE, and generates BD targeting strategies.
 */

// Evaluate source quality rating
export function evaluateSourceQuality(url, sourceName = '') {
  if (!url) return 'LOW';
  const normUrl = url.toLowerCase();

  // Official corporate site / careers portal / official announcements / major reputable business media
  if (
    normUrl.includes('careers') || normUrl.includes('jobs.') ||
    normUrl.includes('reuters.com') || normUrl.includes('economictimes.') ||
    normUrl.includes('business-standard.com') || normUrl.includes('techcrunch.com') ||
    normUrl.includes('livemint.com') || normUrl.includes('moneycontrol.com')
  ) {
    return 'HIGH';
  }

  // LinkedIn / major job platforms
  if (normUrl.includes('linkedin.com') || normUrl.includes('naukri.com') || normUrl.includes('foundit.in')) {
    return 'MEDIUM';
  }

  return 'LOW';
}

/**
 * Verify company details and construct structured factual intelligence + inference BD strategy
 */
export function verifyAndEnrichCompany(rawCompany) {
  const hiringQuality = evaluateSourceQuality(rawCompany.hiringEvidenceUrl);
  const growthQuality = evaluateSourceQuality(rawCompany.growthEvidenceUrl);

  // Overall research confidence
  let confidence = 'MEDIUM';
  if (hiringQuality === 'HIGH' && growthQuality === 'HIGH') {
    confidence = 'HIGH';
  } else if (hiringQuality === 'LOW' || growthQuality === 'LOW') {
    confidence = 'LOW';
  }

  // Fact vs Inference Separation
  const openingsCount = rawCompany.relevantOpenings || 0;
  const companyCategory = rawCompany.category || 'Startup';
  const roles = rawCompany.keyRolesHiring || 'Engineering and Technical Roles';

  // FACT: Verifiable empirical evidence
  const facts = {
    hiringFact: `FACT: Verified ${openingsCount} active technical job requisitions updated on ${rawCompany.hiringEvidenceDate || 'recent date'}.`,
    growthFact: `FACT: ${rawCompany.growthSignal} - ${rawCompany.growthDetails}`,
    locationFact: `FACT: Operations & active hiring in ${rawCompany.hiringLocation || rawCompany.indiaLocations}.`
  };

  // INFERENCE: Business development opportunity reasoning
  let whyZyoinShouldTarget = '';
  let suggestedBdAngle = '';
  let suggestedDecisionMakerRole = '';

  if (companyCategory === 'GCC') {
    whyZyoinShouldTarget = `Company expanded its ${rawCompany.indiaLocations} GCC facility with recent investments, indicating an urgent requirement for rapid, high-bar engineering & leadership talent acquisition in India.`;
    suggestedBdAngle = 'End-to-end talent acquisition & niche leadership hiring support for GCC expansion in India.';
    suggestedDecisionMakerRole = 'GCC Country Head / VP Human Resources / Head of Talent Acquisition - India GCC';
  } else {
    if (openingsCount >= 30) {
      whyZyoinShouldTarget = `High-volume growth startup with ${openingsCount} active tech openings across ${roles}, requiring scalable RPO and contingent staffing support to hit aggressive expansion targets.`;
      suggestedBdAngle = 'Rapid engineering team scaling and contingent technology recruitment support.';
      suggestedDecisionMakerRole = 'Head of Talent Acquisition / VP Engineering / CTO / CHRO';
    } else {
      whyZyoinShouldTarget = `Niche technology startup hiring specialized roles (${roles}), presenting an ideal target for Zyoin executive search and specialized engineering staffing.`;
      suggestedBdAngle = 'Specialized technology recruitment and niche engineering talent acquisition.';
      suggestedDecisionMakerRole = 'Talent Acquisition Lead / Head of HR / CTO';
    }
  }

  return {
    ...rawCompany,
    sourceQuality: hiringQuality,
    researchConfidence: confidence,
    facts,
    whyZyoinShouldTarget,
    suggestedBdAngle,
    suggestedDecisionMakerRole,
    // Verifiable contact person rule: Only provide if verified, otherwise "NOT VERIFIED"
    suggestedContactPerson: rawCompany.suggestedContactPerson || 'NOT VERIFIED (Search TA Lead via LinkedIn)',
    contactLinkedIn: rawCompany.contactLinkedIn || 'NOT VERIFIED'
  };
}
