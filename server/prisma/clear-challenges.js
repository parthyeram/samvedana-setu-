import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const challenges = await prisma.challenge.findMany({ select: { id: true } });
  const challengeIds = challenges.map(item => item.id);
  const projects = await prisma.project.findMany({ where: { challengeId: { in: challengeIds } }, select: { id: true } });
  const projectIds = projects.map(item => item.id);
  const milestones = await prisma.milestone.findMany({ where: { projectId: { in: projectIds } }, select: { id: true } });
  const milestoneIds = milestones.map(item => item.id);

  await prisma.$transaction(async tx => {
    await tx.deliverable.deleteMany({ where: { milestoneId: { in: milestoneIds } } });
    await tx.milestone.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.teamMember.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.partnerInterest.deleteMany({ where: { OR: [{ projectId: { in: projectIds } }, { challengeId: { in: challengeIds } }] } });
    await tx.approval.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.testingRecord.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.iPRecord.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.outcomeRecord.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.projectLog.deleteMany({ where: { projectId: { in: projectIds } } });
    await tx.notification.deleteMany({ where: { OR: [{ relatedProjectId: { in: projectIds } }, { relatedChallengeId: { in: challengeIds } }] } });
    await tx.project.deleteMany({ where: { id: { in: projectIds } } });
    await tx.institutionDecision.deleteMany({ where: { challengeId: { in: challengeIds } } });
    await tx.challenge.deleteMany({ where: { id: { in: challengeIds } } });
  });
  console.log(`Removed ${challengeIds.length} reports and all related workflow records. Users and organizations were kept.`);
}

main().catch(error => { console.error('Clear reports failed:', error); process.exit(1); }).finally(() => prisma.$disconnect());
