import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { matchIndustryPartners } from '../services/matching.js';

const router = Router();
const prisma = new PrismaClient();
router.get('/directory', authenticate, authorize('industry_partner', 'admin', 'govt_official'), async (req, res) => {
  const organizations = await prisma.industryOrg.findMany({ where: { active: true }, include: { _count: { select: { interests: true } } }, orderBy: { id: 'asc' } });
  const challenges = await prisma.challenge.findMany({ where: { status: { not: 'Rejected' } }, orderBy: { priorityScore: 'desc' } });
  const notified = await prisma.partnerInterest.findMany({ select: { industryOrgId: true, challengeId: true } });
  const notifiedByIndustry = notified.reduce((groups, item) => { (groups[item.industryOrgId] ||= new Set()).add(item.challengeId); return groups; }, {});
  res.json({ success: true, data: organizations.map(item => ({ ...item, capabilities: [...JSON.parse(item.expertise || '[]'), ...JSON.parse(item.focusAreas || '[]')], preferredCategories: JSON.parse(item.preferredCategories || '[]'), resources: JSON.parse(item.focusAreas || '[]'), projects: item._count.interests, problems: challenges.filter(challenge => notifiedByIndustry[item.id]?.has(challenge.id)).map(challenge => ({ ...challenge, matchScore: matchIndustryPartners(challenge, [item])[0]?.matchScore || 0 })).filter(challenge => challenge.matchScore > 0).slice(0, 10) })) });
});
router.get('/partners/:challengeId', authenticate, authorize('university_admin', 'faculty_mentor'), async (req, res) => {
  try {
    const challenge = await prisma.challenge.findUnique({ where: { id: Number(req.params.challengeId) } });
    if (!challenge) return res.status(404).json({ success: false, error: 'Challenge not found' });
    const partners = await prisma.industryOrg.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
    const existing = await prisma.partnerInterest.findMany({ where: { challengeId }, select: { industryOrgId: true, status: true } });
    const requests = new Map(existing.map(item => [item.industryOrgId, item.status]));
    res.json({ success: true, data: matchIndustryPartners(challenge, partners).map(item => ({ ...item, requestStatus: requests.get(item.partner.id) || null })) });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/request/:challengeId', authenticate, authorize('university_admin', 'faculty_mentor'), async (req, res) => {
  try {
    const challengeId = Number(req.params.challengeId);
    const industryOrgId = Number(req.body.industryOrgId);
    const project = req.body.projectId ? await prisma.project.findFirst({ where: { id: Number(req.body.projectId), challengeId, ...(req.user.universityId ? { universityId: req.user.universityId } : {}) } }) : null;
    const collaborationStatuses = ['Accepted', 'Team Formation', 'Admin Approval', 'Industry Collaboration', 'Solution Proposal', 'In Progress'];
    if (!project || !collaborationStatuses.includes(project.status)) return res.status(400).json({ success: false, error: 'Accept the project and form the institute team before requesting industry collaboration.' });
    const partner = await prisma.industryOrg.findFirst({ where: { id: industryOrgId, active: true } });
    if (!partner) return res.status(404).json({ success: false, error: 'Industry partner not found' });
    const existing = await prisma.partnerInterest.findFirst({ where: { challengeId, industryOrgId } });
    if (existing && existing.status !== 'declined') return res.status(409).json({ success: false, error: 'This collaboration request has already been sent for this project.' });
    const interest = existing || await prisma.partnerInterest.create({ data: { challengeId, projectId: project.id, industryOrgId, supportTypes: JSON.stringify(req.body.supportTypes || ['expertise']), message: req.body.message || 'Institute requests collaborative support for this community solution.' } });
    if (existing) await prisma.partnerInterest.update({ where: { id: existing.id }, data: { projectId: project?.id || existing.projectId, supportTypes: JSON.stringify(req.body.supportTypes || ['expertise']), message: req.body.message || existing.message } });
    const recipients = await prisma.user.findMany({ where: { industryOrgId, role: 'industry_partner', accountStatus: 'active' }, select: { id: true } });
    if (!existing || existing.status === 'declined') {
      await Promise.all(recipients.map(user => prisma.notification.create({ data: { userId: user.id, message: `Institution requested your support for ${challengeId}. Review expertise, funding, equipment, or deployment needs.`, type: 'collaboration', relatedChallengeId: challengeId, relatedProjectId: project.id } })));
    }
    await prisma.challenge.update({ where: { id: challengeId }, data: { status: 'Collaboration Requested' } });
    res.json({ success: true, data: interest, notified: recipients.length });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
router.get('/collaborations', authenticate, async (req, res) => {
  const partner = req.user.industryOrgId ? await prisma.industryOrg.findUnique({ where: { id: req.user.industryOrgId } }) : null;
  if (!partner) return res.json({ success: true, data: [] });
  const interests = await prisma.partnerInterest.findMany({ where: { industryOrgId: partner.id }, include: { project: true }, orderBy: { updatedAt: 'desc' } });
  // Industry users see a problem only after government notification or an institute request.
  const challengeIds = [...new Set(interests.map(item => item.challengeId).filter(Boolean))];
  const challenges = await prisma.challenge.findMany({ where: { id: { in: challengeIds } }, orderBy: { priorityScore: 'desc' } });
  const data = challenges.map(challenge => {
    const interest = interests.find(item => item.challengeId === challenge.id);
    const match = matchIndustryPartners(challenge, [partner])[0];
    return { ...challenge, matchScore: match?.matchScore || 0, matchedFocusAreas: match?.matchedFocusAreas || [], industry: { id: partner.id, name: partner.name }, requestStatus: interest?.status, requestSource: interest?.projectId ? 'Institute collaboration request' : 'Government match notification' };
  });
  res.json({ success: true, data });
});
router.post('/interest', authenticate, authorize('industry_partner'), async (req, res) => {
  const interest = await prisma.partnerInterest.create({ data: { industryOrgId: req.user.industryOrgId, challengeId: Number(req.body.challengeId), supportTypes: JSON.stringify(req.body.supportTypes || []), message: req.body.message } });
  await prisma.challenge.update({ where: { id: Number(req.body.challengeId) }, data: { status: 'Collaboration Requested' } });
  res.json({ success: true, data: interest });
});
router.get('/my-interests', authenticate, async (req, res) => {
  const data = await prisma.partnerInterest.findMany({ where: { industryOrgId: req.user.industryOrgId }, include: { project: { include: { challenge: true } }, industryOrg: true } });
  res.json({ success: true, data });
});
router.patch('/interests/:id', authenticate, authorize('industry_partner'), async (req, res) => {
  const interest = await prisma.partnerInterest.findFirst({ where: { id: Number(req.params.id), industryOrgId: req.user.industryOrgId }, include: { project: { include: { challenge: true } }, industryOrg: true } });
  if (!interest) return res.status(404).json({ success: false, error: 'Collaboration request not found' });
  let project = interest.project;
  if (!project) project = await prisma.project.findFirst({ where: { challengeId: interest.challengeId, status: { not: 'Closed' } } });
  if (project && !interest.projectId) await prisma.partnerInterest.update({ where: { id: interest.id }, data: { projectId: project.id } });
  const challenge = project?.challenge || await prisma.challenge.findUnique({ where: { id: interest.challengeId } });
  if (!challenge) return res.status(400).json({ success: false, error: 'This request is not linked to a challenge' });
  if (!project) return res.status(400).json({ success: false, error: 'The institute must accept this problem before an industry team can be formed.' });
  const status = req.body.status === 'accepted' ? 'accepted' : 'declined';
  const updated = await prisma.partnerInterest.update({ where: { id: interest.id }, data: { status } });
  if (status === 'accepted') await prisma.challenge.update({ where: { id: challenge.id }, data: { status: 'Collaboration Accepted' } });
   await prisma.notification.create({ data: { userId: challenge.submittedById, message: `Industry collaboration request for ${challenge.displayId} was ${status}.`, type: 'collaboration', relatedChallengeId: challenge.id } });
   if (status === 'accepted' && project.universityId) { const instituteUsers = await prisma.user.findMany({ where: { universityId: project.universityId, accountStatus: 'active' }, select: { id: true } }); await Promise.all(instituteUsers.map(user => prisma.notification.create({ data: { userId: user.id, message: `Industry collaboration for ${challenge.displayId} was accepted.`, type: 'collaboration', relatedChallengeId: challenge.id, relatedProjectId: project.id } }))); }
  res.json({ success: true, data: updated });
});
export default router;
