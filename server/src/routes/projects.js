import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { scopeToOrg } from '../middleware/orgScope.js';
import { generateProjectId } from '../utils/idGenerator.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticate, authorize('university_admin', 'faculty_mentor'), async (req, res) => {
  try {
    const { challengeId, title } = req.body;
    const universityId = Number(req.body.institutionId || req.user.universityId);
    const assigned = await prisma.notification.findFirst({ where: { userId: req.user.id, type: 'matched', relatedChallengeId: challengeId, relatedInstitutionId: universityId } });
    if (!universityId || !assigned) return res.status(403).json({ success: false, error: 'This problem is not assigned to the selected institute.' });
    const existing = await prisma.project.findFirst({ where: { challengeId, status: { not: 'Closed' } } });
    if (existing) return res.status(400).json({ success: false, error: 'Project already exists for challenge' });

    const count = await prisma.project.count();
    const project = await prisma.project.create({
      data: {
        displayId: generateProjectId(count),
        challengeId,
        universityId,
        title,
        status: 'Accepted'
      }
    });

    await prisma.challenge.update({
      where: { id: challengeId },
      data: { status: 'Assigned' }
    });
    await prisma.partnerInterest.updateMany({
      where: { challengeId, projectId: null },
      data: { projectId: project.id }
    });

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', authenticate, scopeToOrg, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: req.orgFilter.project,
      include: { challenge: true, university: true, teamMembers: true, partnerInterests: { include: { industryOrg: true } }, approvals: { orderBy: { createdAt: 'desc' }, take: 1 } }
    });
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Keep named collection routes ahead of /:id so "tracking" is not parsed as a project ID.
router.get('/tracking', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ include: { challenge: true, university: true, partnerInterests: { include: { industryOrg: true } }, milestones: true, testingRecords: true }, orderBy: { updatedAt: 'desc' } });
    res.json({ success: true, data: projects });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: Number(req.params.id) }, include: { challenge: true, teamMembers: { include: { user: { select: { id: true, name: true, role: true } } } }, milestones: { include: { deliverables: true } }, partnerInterests: true, approvals: true, testingRecords: true, outcomeRecords: true, projectLogs: { orderBy: { createdAt: 'desc' } } } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.patch('/:id/status', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.update({ where: { id: Number(req.params.id) }, data: { status: req.body.status } });
    const challengeStatus = { 'Accepted': 'Assigned', 'Team Formation': 'Assigned', 'Solution Proposal': 'Solution Proposal', 'Admin Approval': 'Admin Approval', 'Industry Collaboration': 'Collaboration Requested', 'Collaboration Accepted': 'Collaboration Accepted', 'Prototype/Pilot': 'Prototype/Pilot', 'Implemented': 'Resolved', 'Impact Evaluation': 'Resolved', 'Closed': 'Closed' }[project.status];
    if (challengeStatus) await prisma.challenge.update({ where: { id: project.challengeId }, data: { status: challengeStatus } });
    await prisma.projectLog.create({ data: { projectId: project.id, actorId: req.user.id, action: 'status_changed', details: req.body.status } });
    const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'govt_official'] }, accountStatus: 'active' }, select: { id: true } });
    await Promise.all(admins.map(admin => prisma.notification.create({ data: { userId: admin.id, message: `Project ${project.displayId} moved to ${project.status}. Track the delivery progress in the Government workspace.`, type: 'project_progress', relatedChallengeId: project.challengeId, relatedProjectId: project.id } })));
    res.json({ success: true, data: project });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.patch('/:id/details', authenticate, async (req, res) => {
  try {
    const project = await prisma.project.update({ where: { id: Number(req.params.id) }, data: {
      proposedSolution: req.body.proposedSolution,
      expectedOutcome: req.body.expectedOutcome,
      requiredSkills: JSON.stringify(req.body.requiredSkills || [])
    } });
    await prisma.projectLog.create({ data: { projectId: project.id, actorId: req.user.id, action: 'proposal_updated', details: 'Collaborative proposal updated' } });
    res.json({ success: true, data: project });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/:id/team', authenticate, authorize('university_admin', 'faculty_mentor', 'industry_partner'), async (req, res) => {
  try {
    const members = Array.isArray(req.body.members) ? req.body.members : [{ userId: req.body.userId, role: req.body.role }];
    const industryRoles = ['project_manager', 'technical_lead', 'engineer', 'domain_expert', 'technical_staff'];
    const instituteRoles = ['faculty_mentor', 'student'];
    const rolesToReplace = req.user.role === 'industry_partner' ? industryRoles : instituteRoles;
    await prisma.teamMember.deleteMany({ where: { projectId: Number(req.params.id), role: { in: rolesToReplace } } });
    const created = await Promise.all(members.filter(member => member.name?.trim() || member.memberName?.trim() || member.userId).map(member => prisma.teamMember.create({ data: { projectId: Number(req.params.id), userId: member.userId ? Number(member.userId) : undefined, role: member.role, memberName: member.name || member.memberName, memberEmail: member.email, department: member.department } })));
    await prisma.project.update({ where: { id: Number(req.params.id) }, data: { status: 'Team Formation' } });
    const project = await prisma.project.findUnique({ where: { id: Number(req.params.id) }, include: { challenge: true, university: true } });
    const existingApproval = await prisma.approval.findFirst({ where: { projectId: project.id, stage: 'Organization Approval', status: 'pending' } });
    if (!existingApproval) {
      await prisma.approval.create({ data: { projectId: project.id, stage: 'Organization Approval', approverId: req.user.id, approverRole: req.user.role, status: 'pending', comments: 'Institute team formed and submitted for Government organizational approval.' } });
      const admins = await prisma.user.findMany({ where: { role: { in: ['admin', 'govt_official'] }, accountStatus: 'active' }, select: { id: true } });
      await Promise.all(admins.map(admin => prisma.notification.create({ data: { userId: admin.id, message: `${project.university.name} formed a team for ${project.challenge.displayId}. Review it in Organization Approvals.`, type: 'team_approval', relatedChallengeId: project.challengeId, relatedProjectId: project.id } })));
    }
    res.json({ success: true, data: created });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/approval-requests/pending', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  try {
    const data = await prisma.approval.findMany({ where: { stage: { in: ['Organization Approval', 'Final Submission'] }, status: 'pending' }, include: { project: { include: { challenge: true, university: true, teamMembers: { include: { user: { select: { name: true, role: true } } } } } } }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});
router.patch('/:id/organization-approval', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  try {
    const approval = await prisma.approval.findUnique({ where: { id: Number(req.params.id) }, include: { project: { include: { challenge: true } } } });
    if (!approval || approval.stage !== 'Organization Approval') return res.status(404).json({ success: false, error: 'Organization approval request not found.' });
    const status = req.body.status === 'approved' ? 'approved' : 'rejected';
    const updated = await prisma.approval.update({ where: { id: approval.id }, data: { status, approverId: req.user.id, approverRole: req.user.role, comments: req.body.comments, decidedAt: new Date() } });
    await prisma.project.update({ where: { id: approval.projectId }, data: { status: status === 'approved' ? 'Admin Approval' : 'Team Formation' } });
    const instituteUsers = await prisma.user.findMany({ where: { universityId: approval.project.universityId, accountStatus: 'active' }, select: { id: true } });
    await Promise.all(instituteUsers.map(user => prisma.notification.create({ data: { userId: user.id, message: `Government ${status} the project team for ${approval.project.challenge.displayId}.`, type: 'organization_approval', relatedChallengeId: approval.project.challengeId, relatedProjectId: approval.projectId } })));
    res.json({ success: true, data: updated });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/:id/milestones', authenticate, async (req, res) => {
  try { const item = await prisma.milestone.create({ data: { projectId: Number(req.params.id), title: req.body.title, description: req.body.description, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined } }); res.json({ success: true, data: item }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.patch('/:id/milestones/:milestoneId', authenticate, async (req, res) => {
  try { const item = await prisma.milestone.update({ where: { id: Number(req.params.milestoneId) }, data: { status: req.body.status, completedAt: req.body.status === 'completed' ? new Date() : null } }); res.json({ success: true, data: item }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/:id/testing', authenticate, async (req, res) => {
  try {
    const projectId = Number(req.params.id);
    const project = await prisma.project.findUnique({ where: { id: projectId }, include: { partnerInterests: true } });
    const collaboration = project?.partnerInterests?.some(item => item.status === 'accepted');
    if (collaboration && req.body.testType === 'solution') {
      const existing = await prisma.testingRecord.findFirst({ where: { projectId, testType: 'prototype' } });
      if (existing) return res.status(409).json({ success: false, error: 'A shared solution has already been submitted for this collaboration.' });
    }
    const item = await prisma.testingRecord.create({ data: { projectId, testType: collaboration ? 'prototype' : req.body.testType, resultSummary: req.body.resultSummary, evidenceUrl: req.body.evidenceUrl, submittedByRole: collaboration ? req.user.role : undefined } });
    if (collaboration) {
      await prisma.project.update({ where: { id: projectId }, data: { status: 'Submitted' } });
      await prisma.challenge.update({ where: { id: project.challengeId }, data: { status: 'Closed' } });
    }
    res.json({ success: true, data: item });
  }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/:id/outcomes', authenticate, async (req, res) => {
  try { const item = await prisma.outcomeRecord.create({ data: { projectId: Number(req.params.id), outcomeType: req.body.outcomeType, description: req.body.description, impactMetrics: JSON.stringify(req.body.impactMetrics || {}) } }); res.json({ success: true, data: item }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/:id/approvals', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  try { const item = await prisma.approval.create({ data: { projectId: Number(req.params.id), stage: req.body.stage || 'Government Review', approverId: req.user.id, approverRole: req.user.role, status: req.body.status, comments: req.body.comments, decidedAt: new Date() } }); res.json({ success: true, data: item }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

export default router;
