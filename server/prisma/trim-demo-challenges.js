import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const challenges = await prisma.challenge.findMany({ orderBy: { displayId: 'asc' }, select: { id: true, displayId: true } });
  const keep = challenges.slice(0, 3);
  const remove = challenges.slice(3);
  const removeChallengeIds = remove.map(item => item.id);
  const projects = await prisma.project.findMany({ where: { challengeId: { in: removeChallengeIds } }, select: { id: true } });
  const projectIds = projects.map(item => item.id);
  const milestones = await prisma.milestone.findMany({ where: { projectId: { in: projectIds } }, select: { id: true } });
  const milestoneIds = milestones.map(item => item.id);

  await prisma.$transaction(async tx => {
    await tx.deliverable.deleteMany({ where: { milestoneId: { in: milestoneIds } } });
    await tx.milestone.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.teamMember.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.partnerInterest.deleteMany({ where: { OR: [{ projectId: { in: projectIds } }, { challengeId: { in: removeChallengeIds } }] } });
    await tx.approval.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.testingRecord.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.iPRecord.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.outcomeRecord.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.projectLog.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.notification.deleteMany({ where: { OR: [{ relatedProjectId: { in: projectIds } }, { relatedChallengeId: { in: removeChallengeIds } }] } });
    await tx.project.deleteMany({ where: { id: { in: projectIds } } });
    await tx.institutionDecision.deleteMany({ where: { challengeId: { in: removeChallengeIds } } });
    await tx.notification.deleteMany({ where: { relatedChallengeId: { in: removeChallengeIds } } });
    await tx.challenge.deleteMany({ where: { id: { in: removeChallengeIds } } });
  });

  console.log(`Kept ${keep.length} challenges: ${keep.map(item => item.displayId).join(', ')}`);
  console.log(`Removed ${remove.length} extra sample challenges.`);
}

main().catch(error => { console.error('Trim failed:', error); process.exit(1); }).finally(() => prisma.$disconnect());
