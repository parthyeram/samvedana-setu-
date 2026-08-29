/**
 * Safely parse array fields from DB (handles JSON strings, arrays, or comma-separated strings)
 */
function parseArray(val) {
  if (Array.isArray(val)) return val;
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : [];
  }
}

/**
 * Matches a challenge against institutions using weighted multi-factor scoring
 * @param {Object} challenge 
 * @param {Array} institutions 
 */
export const matchInstitutions = (challenge, institutions = []) => {
  const reqExp = parseArray(challenge.requiredExpertise);
  
  const matches = institutions
    .filter(inst => inst.active !== false)
    .map(inst => {
      const exp = parseArray(inst.expertise);
      const depts = parseArray(inst.departments);
      const areas = parseArray(inst.researchAreas);
      const facilities = parseArray(inst.innovationFacilities);

      // Hard exclusion filter 1: Zero expertise overlap
      const overlap = exp.filter(e => reqExp.some(r => r.toLowerCase() === e.toLowerCase())).length;
      if (reqExp.length > 0 && overlap === 0) return null;

      // 1. Expertise Match (0 - 40 pts)
      let expertiseScore = reqExp.length > 0 ? (overlap / reqExp.length) * 40 : 25;
      
      // Category preference rule: Agriculture / Healthcare boosts
      if (challenge.category === 'Agriculture' && exp.some(e => /agri|crop|soil|farm/i.test(e))) {
        expertiseScore = Math.min(40, expertiseScore + 5);
      }
      if (challenge.category === 'Healthcare' && exp.some(e => /health|medic|bio/i.test(e))) {
        expertiseScore = Math.min(40, expertiseScore + 5);
      }

      // 2. Domain Match (0 - 25 pts)
      let domainScore = 0;
      const categoryMatch = depts.some(d => d.toLowerCase().includes((challenge.category || '').toLowerCase())) ||
                            areas.some(a => a.toLowerCase().includes((challenge.category || '').toLowerCase()));
      if (categoryMatch) domainScore = 25;
      else if (depts.length > 0 || areas.length > 0) domainScore = 14;

      // 3. Location Match (0 - 15 pts)
      let locationScore = 0;
      if (challenge.district && inst.district && inst.district.toLowerCase() === challenge.district.toLowerCase()) {
        locationScore = 15;
      }

      // 4. Capability Match (0 - 20 pts)
      let capabilityScore = 0;
      const requiresIoT = reqExp.some(r => /iot|sensor|smart/i.test(r));
      const hasIoTLab = facilities.some(f => /iot|maker|sensor/i.test(f));

      if (requiresIoT) {
        capabilityScore = hasIoTLab ? 20 : 5;
      } else {
        capabilityScore = facilities.length > 0 ? Math.min(20, facilities.length * 10) : 10;
      }

      const total = expertiseScore + domainScore + locationScore + capabilityScore;

      return {
        institution: inst,
        matchScore: Math.min(Math.round(total), 100),
        breakdown: {
          expertiseScore: Math.round(expertiseScore),
          domainScore: Math.round(domainScore),
          locationScore: Math.round(locationScore),
          capabilityScore: Math.round(capabilityScore)
        }
      };
    })
    .filter(m => m !== null)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice();
    
  return matches;
};

/**
 * Matches a challenge against industry partners based on focus areas
 * @param {Object} challenge 
 * @param {Array} partners 
 */
export const matchIndustryPartners = (challenge, partners = []) => {
  const reqExp = parseArray(challenge.requiredExpertise);

  return partners
    .filter(p => p.active !== false)
    .map(partner => {
      const focus = parseArray(partner.focusAreas);
      
      const overlap = focus.filter(f => 
        reqExp.some(r => r.toLowerCase().includes(f.toLowerCase()) || f.toLowerCase().includes(r.toLowerCase())) ||
        (challenge.category && f.toLowerCase().includes(challenge.category.toLowerCase()))
      ).length;

      let score = 50; // base score for active partner
      if (overlap > 0) score += Math.min(40, overlap * 20);
      if (challenge.district && partner.district && partner.district.toLowerCase() === challenge.district.toLowerCase()) {
        score += 10;
      }

      return {
        partner,
        matchScore: Math.min(Math.round(score), 100),
        matchedFocusAreas: focus.filter(f => 
          reqExp.some(r => r.toLowerCase().includes(f.toLowerCase())) ||
          (challenge.category && f.toLowerCase().includes(challenge.category.toLowerCase()))
        )
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice();
};
