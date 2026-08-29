import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth.js';
import { generateToken } from '../middleware/auth.js';
import { generateCitizenId } from '../utils/idGenerator.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, district, block, village, universityId, industryOrgId, languagePref, phone, address, designation, department, governmentId, registrationId, instituteName, affiliationId, departments, expertise, preferredCategories, companyName, registrationNumber, industryType } = req.body;
    if (['admin', 'govt_official'].includes(role)) return res.status(403).json({ success: false, error: 'Government accounts must be created by a super-admin.' });
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ success: false, error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    
    let citizenId = null;
    if (role === 'citizen') {
      const count = await prisma.user.count({ where: { role: 'citizen' } });
      citizenId = generateCitizenId(count);
    }

    let linkedUniversityId = universityId;
    let linkedIndustryOrgId = industryOrgId;
    if (role === 'university_admin') { const institution = await prisma.institution.create({ data: { name: instituteName || name, type: 'Academic Institution', district, affiliationId: affiliationId || registrationId, departments: JSON.stringify(departments || []), expertise: JSON.stringify(expertise || []), preferredCategories: JSON.stringify(preferredCategories || []), active: false } }); linkedUniversityId = institution.id; }
    if (role === 'industry_partner') { const industry = await prisma.industryOrg.create({ data: { name: companyName || name, type: industryType || 'company', district, registrationNumber, expertise: JSON.stringify(expertise || []), preferredCategories: JSON.stringify(preferredCategories || []), active: false } }); linkedIndustryOrgId = industry.id; }
    const pending = ['university_admin', 'industry_partner'].includes(role);
    const user = await prisma.user.create({ data: { name, email, passwordHash, role, district, block, village, phone, address, designation, department, governmentId, registrationId, expertise: JSON.stringify(expertise || []), preferredCategories: JSON.stringify(preferredCategories || []), universityId: linkedUniversityId, industryOrgId: linkedIndustryOrgId, languagePref, citizenId, accountStatus: pending ? 'pending' : 'active' } });

    if (pending) return res.status(202).json({ success: true, data: { pendingApproval: true, message: 'Registration submitted. Government approval is required before login.' } });

    const token = generateToken({ userId: user.id, role: user.role, universityId: user.universityId, industryOrgId: user.industryOrgId });
    const { passwordHash: _p, ...profile } = user;
    res.json({ success: true, data: { token, user: profile } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }
    const allowed = role === 'institution' ? ['university_admin', 'faculty_mentor', 'student'] : role === 'industry' ? ['industry_partner'] : role === 'admin' ? ['admin', 'govt_official'] : ['citizen'];
    if (role && !allowed.includes(user.role)) return res.status(403).json({ success: false, error: 'This account does not belong to the selected login type.' });
    if (user.accountStatus !== 'active') return res.status(403).json({ success: false, error: 'This account is awaiting government approval.' });

    const token = generateToken({ userId: user.id, role: user.role, universityId: user.universityId, industryOrgId: user.industryOrgId });
    const { passwordHash: _p, ...profile } = user;
    res.json({ success: true, data: { token, user: profile } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const { passwordHash: _p, ...profile } = user;
    res.json({ success: true, data: { user: profile } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/pending-organizations', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  const users = await prisma.user.findMany({ where: { accountStatus: 'pending', role: { in: ['university_admin', 'industry_partner'] } }, select: { id: true, name: true, email: true, role: true, registrationId: true, industryType: true, address: true, createdAt: true, universityId: true, industryOrgId: true } });
  res.json({ success: true, data: users });
});

router.get('/organization-members', authenticate, authorize('university_admin', 'faculty_mentor', 'industry_partner'), async (req, res) => {
  const requestedUniversityId = Number(req.query.universityId);
  const organizationFilter = req.user.industryOrgId ? { industryOrgId: req.user.industryOrgId, role: 'industry_partner' } : { universityId: requestedUniversityId || req.user.universityId, role: { in: ['faculty_mentor', 'student'] } };
  const users = await prisma.user.findMany({
    where: { ...organizationFilter, accountStatus: 'active' },
    select: { id: true, name: true, email: true, role: true, department: true, expertise: true }
  });
  res.json({ success: true, data: users.map(user => ({ ...user, expertise: JSON.parse(user.expertise || '[]') })) });
});

router.patch('/:id/organization-approval', authenticate, authorize('admin', 'govt_official'), async (req, res) => {
  const status = req.body.status === 'approved' ? 'active' : 'rejected';
  const user = await prisma.user.update({ where: { id: Number(req.params.id) }, data: { accountStatus: status } });
  if (user.universityId) await prisma.institution.update({ where: { id: user.universityId }, data: { active: status === 'active' } });
  if (user.industryOrgId) await prisma.industryOrg.update({ where: { id: user.industryOrgId }, data: { active: status === 'active' } });
  res.json({ success: true, data: { id: user.id, status } });
});

export default router;
