import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { matchInstitutions, matchIndustryPartners } from '../services/matching.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/run/:challengeId', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  try {
    const challenge = await prisma.challenge.findUnique({ where: { id: parseInt(req.params.challengeId) } });
    if (!challenge) return res.status(404).json({ success: false, error: 'Not found' });
    
    const institutions = await prisma.institution.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
    const results = matchInstitutions(challenge, institutions);
    const partners = await prisma.industryOrg.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
    const industryResults = matchIndustryPartners(challenge, partners);
    res.json({ success: true, data: { institutions: results, industries: industryResults } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/preview', authenticate, authorize('citizen'), async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
    const partners = await prisma.industryOrg.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
    const challenge = { ...req.body, district: req.body.district || req.body.location };
    res.json({ success: true, data: { institutions: matchInstitutions(challenge, institutions), industries: matchIndustryPartners(challenge, partners) } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/notify/:challengeId', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  try {
    const challengeId = Number(req.params.challengeId);
    const organizationId = Number(req.body.organizationId);
    const organizationType = req.body.organizationType;
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ success: false, error: 'Problem not found' });
    if (organizationType === 'institution') {
      const institutions = await prisma.institution.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
      const topMatch = matchInstitutions(challenge, institutions)[0];
      if (!topMatch || topMatch.institution.id !== organizationId) return res.status(400).json({ success: false, error: 'Only the highest-match institute can be notified for this problem.' });
    }
    if (organizationType === 'industry') {
      const partners = await prisma.industryOrg.findMany({ where: { active: true }, orderBy: { id: 'asc' } });
      const topMatch = matchIndustryPartners(challenge, partners)[0];
      if (!topMatch || topMatch.partner.id !== organizationId) return res.status(400).json({ success: false, error: 'Only the highest-match industry partner can be notified for this problem.' });
    }
    const where = organizationType === 'industry' ? { industryOrgId: organizationId, accountStatus: 'active' } : { email: 'institution@demo.in', accountStatus: 'active' };
    const recipients = await prisma.user.findMany({ where });
    if (!recipients.length) return res.status(400).json({ success: false, error: 'The shared Institute/University account is not active. Use institution@demo.in or approve that account first.' });
    await Promise.all(recipients.map(user => prisma.notification.create({ data: { userId: user.id, message: `Problem ${challenge.displayId} was matched to ${organizationType === 'institution' ? 'the selected institute' : 'your organization'}. Review and respond.`, type: 'matched', relatedChallengeId: challenge.id, relatedInstitutionId: organizationType === 'institution' ? organizationId : undefined } })));
    if (organizationType === 'industry') {
      const existing = await prisma.partnerInterest.findFirst({ where: { challengeId, industryOrgId: organizationId } });
      const project = await prisma.project.findFirst({ where: { challengeId, status: { not: 'Closed' } } });
      if (!existing) await prisma.partnerInterest.create({ data: { challengeId, projectId: project?.id, industryOrgId: organizationId, supportTypes: JSON.stringify(['expertise']), message: `Matched by government at ${req.body.matchScore || 'available'}% score.` } });
      else if (!existing.projectId && project) await prisma.partnerInterest.update({ where: { id: existing.id }, data: { projectId: project.id } });
    }
    await prisma.challenge.update({ where: { id: challengeId }, data: { status: 'Organizations Notified' } });
    res.json({ success: true, data: { notified: recipients.length } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

export default router;
