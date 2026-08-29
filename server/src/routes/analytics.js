import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();
router.get('/overview', authenticate, authorize('admin', 'govt_official'), async (req, res) => { const [total, pending, active, resolved] = await Promise.all([prisma.challenge.count(), prisma.challenge.count({ where: { status: { in: ['Submitted', 'Under Review'] } } }), prisma.project.count({ where: { status: { notIn: ['Closed', 'Discontinued'] } } }), prisma.challenge.count({ where: { status: { in: ['Resolved', 'Closed'] } } })]); res.json({ success: true, data: { total, pending, active, resolved } }); });
export default router;
