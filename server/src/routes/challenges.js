import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { scopeToOrg } from '../middleware/orgScope.js';
import { generateChallengeId } from '../utils/idGenerator.js';
import { canTransitionChallenge } from '../services/stateMachine.js';
import { aiRateLimit } from '../middleware/rateLimit.js';
import { analyzeChallenge } from '../services/ai.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticate, authorize('citizen'), async (req, res) => {
  try {
    const count = await prisma.challenge.count();
    const displayId = generateChallengeId(count);
    
    const challenge = await prisma.challenge.create({
      data: {
        ...req.body,
        displayId,
        submittedById: req.user.id,
        mediaUrls: JSON.stringify(req.body.mediaUrls || []),
        documentUrls: JSON.stringify(req.body.documentUrls || []),
        detectedObjects: JSON.stringify(req.body.detectedObjects || []),
        requiredExpertise: JSON.stringify(req.body.requiredExpertise || [])
      }
    });
    res.json({ success: true, data: challenge });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// The map is a shared, privacy-safe view. Full challenge details remain scoped below.
router.get('/live-map', authenticate, async (req, res) => {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { status: { not: 'Rejected' } },
      select: { id: true, displayId: true, title: true, category: true, subcategory: true, severity: true, status: true, latitude: true, longitude: true, district: true, block: true, village: true, submittedById: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, data: challenges.map(challenge => ({ ...challenge, reportedBy: challenge.submittedById === req.user.id ? 'You' : 'Another citizen', submittedById: undefined })) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/', authenticate, scopeToOrg, async (req, res) => {
  try {
    const where = { ...req.orgFilter.challenge };
    if (req.query.status) where.status = req.query.status;
    const challenges = await prisma.challenge.findMany({
      where,
      include: { submittedBy: { select: { name: true } } }
    });
    // Parse arrays
    const parsed = challenges.map(c => ({
      ...c,
      mediaUrls: JSON.parse(c.mediaUrls || '[]'),
      documentUrls: JSON.parse(c.documentUrls || '[]'),
      detectedObjects: JSON.parse(c.detectedObjects || '[]'),
      requiredExpertise: JSON.parse(c.requiredExpertise || '[]')
    }));
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const challengeId = Number(req.params.id);
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId }, include: { submittedBy: { select: { name: true } }, projects: { select: { id: true, status: true, testingRecords: true, partnerInterests: { select: { status: true } } }, orderBy: { updatedAt: 'desc' }, take: 1 } } });
    if (!challenge) return res.status(404).json({ success: false, error: 'Problem not found' });

    if (req.user.role === 'citizen' && challenge.submittedById !== req.user.id) return res.status(403).json({ success: false, error: 'This problem belongs to another citizen.' });
    if (['university_admin', 'faculty_mentor', 'student'].includes(req.user.role)) {
      const notification = await prisma.notification.findFirst({ where: { userId: req.user.id, relatedChallengeId: challengeId, type: 'matched' } });
      if (!notification) return res.status(403).json({ success: false, error: 'This problem was not assigned to your institute.' });
    }

    res.json({ success: true, data: { ...challenge, mediaUrls: JSON.parse(challenge.mediaUrls || '[]'), documentUrls: JSON.parse(challenge.documentUrls || '[]'), detectedObjects: JSON.parse(challenge.detectedObjects || '[]'), requiredExpertise: JSON.parse(challenge.requiredExpertise || '[]') } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.post('/analyze', authenticate, authorize('citizen'), aiRateLimit, async (req, res) => {
  try {
    const result = await analyzeChallenge(req.body);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/:id/status', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  try {
    const { status, rejectionReason } = req.body;
    let challenge = await prisma.challenge.update({ where: { id: Number(req.params.id) }, data: { status, rejectionReason } });
    await prisma.notification.create({ data: { userId: challenge.submittedById, message: `Your report ${challenge.displayId} is now ${status}.`, type: 'status_change', relatedChallengeId: challenge.id } });
    res.json({ success: true, data: challenge });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

export default router;
