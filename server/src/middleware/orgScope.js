/**
 * Middleware to scope queries based on organization and role
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const scopeToOrg = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Authentication required for scoping' });
  }

  req.orgFilter = {
    challenge: {},
    project: {}
  };

  const { role, id: userId, universityId, industryOrgId } = req.user;

  switch (role) {
    case 'citizen':
      req.orgFilter.challenge = { submittedById: userId };
      // Citizens generally don't browse projects, but if they do, maybe only ones related to their challenges
      req.orgFilter.project = { challenge: { submittedById: userId } };
      break;

    case 'student':
    case 'faculty_mentor':
    case 'university_admin':
      // They can see all verified challenges
      req.orgFilter.challenge = { status: { in: ['Verified', 'Matched', 'Assigned', 'Closed'] } };
      // They can only see projects belonging to their university
      req.orgFilter.project = { universityId: universityId };
      if (role === 'university_admin' && !universityId) req.orgFilter.project = {};
      break;

    case 'industry_partner':
      // They can see verified challenges
      req.orgFilter.challenge = { status: { in: ['Verified', 'Matched', 'Assigned', 'Closed'] } };
      // They can only see projects they have expressed interest in
      req.orgFilter.project = { partnerInterests: { some: { industryOrgId: industryOrgId } } };
      break;

    case 'govt_official':
    case 'admin':
      // Read-all access, no filters
      break;

    default:
      // Unknown role gets nothing
      req.orgFilter.challenge = { id: -1 };
      req.orgFilter.project = { id: -1 };
      break;
  }

  next();
};
