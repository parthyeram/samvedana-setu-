import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { matchInstitutions } from '../services/matching.js';
import { generateProjectId } from '../utils/idGenerator.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticate, async (req, res) => {
  try {
    const institutions = await prisma.institution.findMany({ where: { active: true }, include: { _count: { select: { projects: true } }, decisions: true }, orderBy: { id: 'asc' } });
    const parsed = institutions.map(i => ({
      ...i,
      expertise: JSON.parse(i.expertise || '[]'),
      departments: JSON.parse(i.departments || '[]'),
      researchAreas: JSON.parse(i.researchAreas || '[]'),
      innovationFacilities: JSON.parse(i.innovationFacilities || '[]')
      ,solvedProjects: i._count.projects
      ,acceptedProblems: i.decisions.filter(d => d.decision === 'accepted').length
      ,rejectedProblems: i.decisions.filter(d => d.decision === 'rejected').length
    }));
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/matched-challenges', authenticate, async (req, res) => {
  try {
    const notified = await prisma.notification.findMany({ where: { userId: req.user.id, type: 'matched', relatedChallengeId: { not: null }, relatedInstitutionId: { not: null } }, select: { relatedChallengeId: true, relatedInstitutionId: true } });
    if (!notified.length) return res.json({ success: true, data: [] });
    const challenges = await prisma.challenge.findMany({ where: { id: { in: notified.map(item => item.relatedChallengeId).filter(Boolean) }, status: { in: ['Verified', 'Matched', 'Organizations Notified', 'Interested', 'Assigned', 'Solution Proposal', 'In Progress'] } }, orderBy: { priorityScore: 'desc' } });
    const institutions = await prisma.institution.findMany({ where: { id: { in: notified.map(item => item.relatedInstitutionId).filter(Boolean) } } });
    const decisions = await prisma.institutionDecision.findMany({ where: { challengeId: { in: notified.map(item => item.relatedChallengeId).filter(Boolean) }, institutionId: { in: notified.map(item => item.relatedInstitutionId).filter(Boolean) } } });
    const data = notified.map(note => { const challenge = challenges.find(item => item.id === note.relatedChallengeId); const institution = institutions.find(item => item.id === note.relatedInstitutionId); const decision = decisions.find(item => item.challengeId === note.relatedChallengeId && item.institutionId === note.relatedInstitutionId); return challenge && institution ? { challenge, institutionId: institution.id, decision: decision?.decision || 'pending', match: matchInstitutions(challenge, [institution])[0] || null } : null; }).filter(item => item?.match && item.decision === 'pending');
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/accept/:id', authenticate, authorize('university_admin', 'faculty_mentor'), async (req, res) => {
  try {
    const challengeId = Number(req.params.id);
    const institutionId = Number(req.body.institutionId || req.user.universityId);
    const assigned = await prisma.notification.findFirst({ where: { userId: req.user.id, type: 'matched', relatedChallengeId: challengeId, relatedInstitutionId: institutionId } });
    if (!institutionId || !assigned) return res.status(403).json({ success: false, error: 'This problem is not assigned to the selected institute.' });
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) return res.status(404).json({ success: false, error: 'Problem not found.' });
    await prisma.institutionDecision.upsert({ where: { challengeId_institutionId: { challengeId, institutionId } }, update: { decision: 'accepted' }, create: { challengeId, institutionId, decision: 'accepted' } });
    const existing = await prisma.project.findFirst({ where: { challengeId, universityId: institutionId, status: { not: 'Closed' } } });
    const project = existing || await prisma.project.create({
      data: {
        displayId: generateProjectId(await prisma.project.count()),
        challengeId,
        universityId: institutionId,
        title: challenge.title,
        status: 'Accepted'
      }
    });
    await prisma.challenge.update({ where: { id: challengeId }, data: { status: 'Assigned' } });
    await prisma.partnerInterest.updateMany({ where: { challengeId, projectId: null }, data: { projectId: project.id } });
    await prisma.notification.create({ data: { userId: challenge.submittedById, message: `An institute is interested in solving ${challenge.displayId}.`, type: 'matched', relatedChallengeId: challenge.id } });
    const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'govt_official'] }, accountStatus: 'active' }, select: { id: true } });
    await Promise.all(admins.map(admin => prisma.notification.create({ data: { userId: admin.id, message: `An institute accepted ${challenge.displayId} and is preparing a project team.`, type: 'institute_acceptance', relatedChallengeId: challenge.id } })));
    res.json({ success: true, data: project });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
router.post('/decline/:id', authenticate, authorize('university_admin', 'faculty_mentor'), async (req, res) => { const challengeId = Number(req.params.id); const institutionId = Number(req.body.institutionId || req.user.universityId); const assigned = await prisma.notification.findFirst({ where: { userId: req.user.id, type: 'matched', relatedChallengeId: challengeId, relatedInstitutionId: institutionId } }); if (!institutionId || !assigned) return res.status(403).json({ success: false, error: 'This problem is not assigned to the selected institute.' }); await prisma.institutionDecision.upsert({ where: { challengeId_institutionId: { challengeId, institutionId } }, update: { decision: 'rejected' }, create: { challengeId, institutionId, decision: 'rejected' } }); const challenge = await prisma.challenge.update({ where: { id: challengeId }, data: { status: 'Matched' } }); const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'govt_official'] }, accountStatus: 'active' }, select: { id: true } }); await Promise.all(admins.map(admin => prisma.notification.create({ data: { userId: admin.id, message: `The selected institute declined ${challenge.displayId}. Re-match the problem to another organization.`, type: 'institute_declined', relatedChallengeId: challenge.id } }))); res.json({ success: true, data: challenge }); });
router.post('/request-info/:id', authenticate, authorize('university_admin', 'faculty_mentor'), async (req, res) => { const challenge = await prisma.challenge.update({ where: { id: Number(req.params.id) }, data: { status: 'Under Review' } }); await prisma.notification.create({ data: { userId: challenge.submittedById, message: `An institute requested more information for ${challenge.displayId}.`, type: 'request_info', relatedChallengeId: challenge.id } }); res.json({ success: true, data: challenge }); });

export default router;
