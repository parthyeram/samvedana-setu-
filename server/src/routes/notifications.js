import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();
router.get('/', authenticate, async (req, res) => { const data = await prisma.notification.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }); res.json({ success: true, data }); });
router.patch('/:id/read', authenticate, async (req, res) => { const data = await prisma.notification.update({ where: { id: Number(req.params.id) }, data: { read: true } }); res.json({ success: true, data }); });
router.patch('/read-all', authenticate, async (req, res) => { await prisma.notification.updateMany({ where: { userId: req.user.id }, data: { read: true } }); res.json({ success: true }); });
router.get('/unread-count', authenticate, async (req, res) => { const count = await prisma.notification.count({ where: { userId: req.user.id, read: false } }); res.json({ success: true, data: { count } }); });
export default router;
