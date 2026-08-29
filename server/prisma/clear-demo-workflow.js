import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Keep users, institutes, and industry directory data; remove only workflow records.
async function clearWorkflow() {
  await prisma.notification.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.testingRecord.deleteMany();
  await prisma.iPRecord.deleteMany();
  await prisma.outcomeRecord.deleteMany();
  await prisma.projectLog.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.partnerInterest.deleteMany();
  await prisma.institutionDecision.deleteMany();
  await prisma.project.deleteMany();
  await prisma.challenge.deleteMany();
  console.log('Workflow data cleared. Users, institutes, and industry partners were kept.');
}

clearWorkflow().catch(error => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
