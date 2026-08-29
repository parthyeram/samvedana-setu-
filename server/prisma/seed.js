import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SamvedanaSetu database with full prototype data...');

  // 1. Clear existing tables in dependency order
  await prisma.notification.deleteMany();
  await prisma.projectLog.deleteMany();
  await prisma.institutionDecision.deleteMany();
  await prisma.outcomeRecord.deleteMany();
  await prisma.iPRecord.deleteMany();
  await prisma.testingRecord.deleteMany();
  await prisma.approval.deleteMany();
  await prisma.deliverable.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.partnerInterest.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();
  await prisma.industryOrg.deleteMany();

  // 2. Seed Institutions (Generic names only: Prototype Demo)
  const instA = await prisma.institution.create({
    data: {
      name: 'Institution A',
      type: 'Academic Institution',
      district: 'Ranchi',
      description: 'Premier Technical & Environmental Research HEI',
      expertise: JSON.stringify(['Environmental Engineering', 'Civil Engineering', 'Water Management', 'Public Health']),
      departments: JSON.stringify(['Engineering', 'Environmental Science', 'Public Health']),
      researchAreas: JSON.stringify(['Water Purification', 'Waste Management', 'Public Health']),
      innovationFacilities: JSON.stringify(['Environmental Testing Lab', 'Water Quality Lab'])
    }
  });

  const instB = await prisma.institution.create({
    data: {
      name: 'Institution B',
      type: 'Academic Institution',
      district: 'Dhanbad',
      description: 'Specialized Institute for Mining, Transportation & Infrastructure',
      expertise: JSON.stringify(['Civil Engineering', 'Transportation Engineering', 'Electrical Engineering', 'Urban Planning', 'IoT']),
      departments: JSON.stringify(['Civil Engineering', 'Urban Studies', 'Electrical Engineering']),
      researchAreas: JSON.stringify(['Smart Infrastructure', 'Transportation Systems', 'Sensor Networks']),
      innovationFacilities: JSON.stringify(['IoT Lab', 'Materials Testing Lab', 'Urban Design Studio'])
    }
  });

  const instC = await prisma.institution.create({
    data: {
      name: 'Institution C',
      type: 'Academic Institution',
      district: 'East Singhbhum',
      description: 'Regional University with focus on Agronomy, Rural Health & Biotech',
      expertise: JSON.stringify(['Environmental Science', 'Public Health', 'Agricultural Engineering', 'Agronomy', 'Biotechnology']),
      departments: JSON.stringify(['Agriculture', 'Health Sciences', 'Biotechnology']),
      researchAreas: JSON.stringify(['Crop Science', 'Rural Health Systems', 'Soil Diagnostics']),
      innovationFacilities: JSON.stringify(['Biotech Lab', 'Agricultural Research Field', 'Soil Testing Lab'])
    }
  });

  const instD = await prisma.institution.create({
    data: {
      name: 'Institution D',
      type: 'Academic Institution',
      district: 'Bokaro',
      description: 'Engineering and Computer Science Innovation Hub',
      expertise: JSON.stringify(['Computer Science', 'Electrical Engineering', 'IoT', 'Data Science', 'Education Technology', 'AI/ML']),
      departments: JSON.stringify(['Computer Science', 'Education', 'Electrical']),
      researchAreas: JSON.stringify(['AI Applications', 'EdTech Systems', 'Smart Grids']),
      innovationFacilities: JSON.stringify(['IoT Lab', 'AI Computing Lab', 'Maker Space'])
    }
  });

  const instE = await prisma.institution.create({
    data: {
      name: 'Institution E', type: 'Academic Institution', district: 'Hazaribagh',
      description: 'Healthcare, biotechnology, and rural public service research institute',
      expertise: JSON.stringify(['Public Health', 'Healthcare', 'Biotechnology', 'Data Science', 'Sanitation']),
      departments: JSON.stringify(['Health Sciences', 'Biotechnology', 'Computer Science']),
      researchAreas: JSON.stringify(['Disease Prevention', 'Rural Healthcare', 'Sanitation Systems']),
      innovationFacilities: JSON.stringify(['Healthcare Lab', 'Biotech Lab', 'Data Lab'])
    }
  });

  const instF = await prisma.institution.create({
    data: {
      name: 'Institution F', type: 'Academic Institution', district: 'Jamshedpur',
      description: 'Education, accessibility, and inclusive technology innovation center',
      expertise: JSON.stringify(['Education Technology', 'Accessibility', 'AI/ML', 'Computer Vision', 'Public Administration']),
      departments: JSON.stringify(['Education', 'Computer Science', 'Social Sciences']),
      researchAreas: JSON.stringify(['Digital Learning', 'Assistive Technology', 'Citizen Services']),
      innovationFacilities: JSON.stringify(['Assistive Technology Lab', 'AI Computing Lab', 'Learning Studio'])
    }
  });

  const instG = await prisma.institution.create({
    data: {
      name: 'Institution G', type: 'Academic Institution', district: 'Deoghar',
      description: 'Renewable energy, climate resilience, and environmental systems university',
      expertise: JSON.stringify(['Renewable Energy', 'Environmental Engineering', 'Climate Science', 'Water Management', 'GIS']),
      departments: JSON.stringify(['Energy Engineering', 'Environmental Science', 'Geography']),
      researchAreas: JSON.stringify(['Solar Energy', 'Climate Resilience', 'Flood and Drought Mapping']),
      innovationFacilities: JSON.stringify(['Solar Lab', 'GIS Lab', 'Climate Simulation Lab'])
    }
  });

  const instH = await prisma.institution.create({
    data: {
      name: 'Institution H', type: 'Academic Institution', district: 'Bokaro',
      description: 'Urban planning, public safety, transport, and infrastructure research institute',
      expertise: JSON.stringify(['Civil Engineering', 'Urban Planning', 'Transportation Engineering', 'Structural Engineering', 'Public Safety']),
      departments: JSON.stringify(['Civil Engineering', 'Urban Planning', 'Safety Studies']),
      researchAreas: JSON.stringify(['Road Safety', 'Smart Transport', 'Resilient Infrastructure']),
      innovationFacilities: JSON.stringify(['Materials Testing Lab', 'Transport Simulation Lab', 'Safety Research Center'])
    }
  });

  // 3. Seed Industry Partners
  const indA = await prisma.industryOrg.create({
    data: {
      name: 'Industry Partner A',
      type: 'startup',
      district: 'Ranchi',
      focusAreas: JSON.stringify(['IoT', 'Smart Water Management', 'Environmental Monitoring', 'Sensor Technology'])
    }
  });

  const indB = await prisma.industryOrg.create({
    data: {
      name: 'Startup Partner A',
      type: 'startup',
      district: 'Ranchi',
      focusAreas: JSON.stringify(['Renewable Energy', 'Solar Technology', 'Rural Electrification', 'Energy Storage'])
    }
  });

  const indC = await prisma.industryOrg.create({
    data: {
      name: 'CSR Partner A',
      type: 'csr',
      district: 'East Singhbhum',
      focusAreas: JSON.stringify(['Public Health', 'Rural Development', 'Education', 'Sanitation Infrastructure'])
    }
  });

  const indD = await prisma.industryOrg.create({
    data: {
      name: 'Research Partner A',
      type: 'research_lab',
      district: 'Ranchi',
      focusAreas: JSON.stringify(['Agronomy', 'Soil Science', 'Agricultural Technology', 'Environmental Science'])
    }
  });

  const indE = await prisma.industryOrg.create({
    data: {
      name: 'Civic Mobility Solutions',
      type: 'company',
      district: 'Dhanbad',
      focusAreas: JSON.stringify(['Computer Vision', 'Smart Transportation', 'GIS Mapping', 'Road Safety'])
    }
  });

  const indF = await prisma.industryOrg.create({
    data: {
      name: 'HealthGrid Technologies', type: 'company', district: 'Hazaribagh',
      focusAreas: JSON.stringify(['Healthcare', 'Telemedicine', 'AI/ML', 'Public Health', 'Data Platforms'])
    }
  });

  const indG = await prisma.industryOrg.create({
    data: {
      name: 'Sustainable Energy Works', type: 'company', district: 'Deoghar',
      focusAreas: JSON.stringify(['Renewable Energy', 'Solar Technology', 'Energy Storage', 'Climate Resilience', 'Water Infrastructure'])
    }
  });

  const indH = await prisma.industryOrg.create({
    data: {
      name: 'Inclusive Civic Systems', type: 'company', district: 'Jamshedpur',
      focusAreas: JSON.stringify(['Accessibility', 'Education Technology', 'GIS Mapping', 'Public Safety', 'Citizen Services'])
    }
  });

  // 4. Seed Users for All 7 Personas
  const passwordHash = await bcrypt.hash('demo1234', 10);
  const adminHash = await bcrypt.hash('admin1234', 10);

  const citizen1 = await prisma.user.create({
    data: {
      name: 'Sunita Devi',
      email: 'citizen@demo.in',
      passwordHash,
      role: 'citizen',
      citizenId: 'CIT-0001',
      district: 'Ranchi',
      block: 'Kanke',
      village: 'Ward 12',
      phone: '+91 98765 43210',
      languagePref: 'en'
    }
  });

  const citizen2 = await prisma.user.create({
    data: {
      name: 'Rajesh Kumar',
      email: 'citizen2@demo.in',
      passwordHash,
      role: 'citizen',
      citizenId: 'CIT-0002',
      district: 'Dhanbad',
      block: 'Jharia',
      village: 'Sector 4',
      phone: '+91 98765 43211',
      languagePref: 'hi'
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      name: 'State Administrator',
      email: 'admin@demo.in',
      passwordHash: adminHash,
      role: 'admin',
      district: 'Ranchi',
      phone: '+91 94311 00001'
    }
  });

  await prisma.user.create({
    data: {
      name: 'DHTE Government Officer',
      email: 'govt@demo.in',
      passwordHash,
      role: 'govt_official',
      district: 'Ranchi',
      phone: '+91 94311 00002'
    }
  });

  const instAdmin = await prisma.user.create({
    data: {
      name: 'Dean Academic (Institution A)',
      email: 'institution@demo.in',
      passwordHash,
      role: 'university_admin',
      district: 'Ranchi',
      phone: '+91 94311 00003'
    }
  });

  // Give every demo institute its own portal account so targeted notifications
  // can be tested even when a different institute ranks highest.
  const otherInstitutes = [
    [instB, 'b', 'Institution B Admin'], [instC, 'c', 'Institution C Admin'], [instD, 'd', 'Institution D Admin'],
    [instE, 'e', 'Institution E Admin'], [instF, 'f', 'Institution F Admin'], [instG, 'g', 'Institution G Admin'], [instH, 'h', 'Institution H Admin']
  ];
  for (const [institution, suffix, name] of otherInstitutes) {
    await prisma.user.create({ data: { name, email: `institution-${suffix}@demo.in`, passwordHash, role: 'university_admin', universityId: institution.id, district: institution.district, phone: `+91 94311 00${String(institution.id).padStart(3, '0')}` } });
    await prisma.user.create({ data: { name: `Faculty Mentor ${suffix.toUpperCase()}`, email: `faculty-${suffix}@demo.in`, passwordHash, role: 'faculty_mentor', universityId: institution.id, district: institution.district } });
    await prisma.user.create({ data: { name: `Student Lead ${suffix.toUpperCase()}`, email: `student-${suffix}@demo.in`, passwordHash, role: 'student', universityId: institution.id, district: institution.district } });
  }

  const faculty = await prisma.user.create({
    data: {
      name: 'Dr. Anand Verma',
      email: 'faculty@demo.in',
      passwordHash,
      role: 'faculty_mentor',
      universityId: instA.id,
      district: 'Ranchi',
      phone: '+91 94311 00004'
    }
  });

  const student = await prisma.user.create({
    data: {
      name: 'Priya Sharma (Student Lead)',
      email: 'student@demo.in',
      passwordHash,
      role: 'student',
      universityId: instA.id,
      district: 'Ranchi',
      phone: '+91 94311 00005'
    }
  });

  const industryUser = await prisma.user.create({
    data: {
      name: 'Vikram Singh (Director)',
      email: 'industry@demo.in',
      passwordHash,
      role: 'industry_partner',
      industryOrgId: indA.id,
      district: 'Ranchi',
      phone: '+91 94311 00006'
    }
  });

  // 5. Seed 10 Challenges Across Domains & Statuses
  const c1 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0001',
      title: 'Overflowing garbage near community water tap',
      description: 'Garbage has been accumulating beside the shared community water tap for several days. Waste is spilling onto the pathway causing foul odour and contamination risk.',
      citizenOriginalText: 'garbage piling up near the water tap, very smelly now',
      aiAssisted: true,
      category: 'Environment',
      subcategory: 'Waste Management',
      district: 'Ranchi',
      block: 'Kanke',
      village: 'Ward 12',
      latitude: 23.4139,
      longitude: 85.3050,
      severity: 'High',
      severityReason: 'Sanitation hazard in close proximity to shared drinking water source',
      priorityScore: 82,
      priorityLevel: 'High',
      aiConfidence: 0.86,
      aiSummary: 'Waste accumulation near potable water source creating sanitation risk.',
      aiProviderUsed: 'gemini',
      status: 'Matched',
      detectedObjects: JSON.stringify(['garbage pile', 'waste container', 'standing water']),
      requiredExpertise: JSON.stringify(['Environmental Science', 'Waste Management', 'Environmental Engineering']),
      submittedById: citizen1.id
    }
  });

  const c2 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0002',
      title: 'Broken streetlight on the approach road',
      description: 'A streetlight on the approach road appears non-functional, leaving the stretch dark after sunset and posing a safety hazard.',
      citizenOriginalText: 'lights not working on dark road',
      aiAssisted: true,
      category: 'Energy & Electricity',
      subcategory: 'Broken Streetlights',
      district: 'Dhanbad',
      block: 'Jharia',
      village: 'Sector 4',
      latitude: 23.7957,
      longitude: 86.4304,
      severity: 'Medium',
      severityReason: 'Pedestrian and vehicular safety hazard at night',
      priorityScore: 58,
      priorityLevel: 'Medium',
      aiConfidence: 0.78,
      status: 'Under Review',
      detectedObjects: JSON.stringify(['damaged light pole']),
      requiredExpertise: JSON.stringify(['Electrical Engineering', 'Renewable Energy', 'IoT']),
      submittedById: citizen1.id
    }
  });

  const c3 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0003',
      title: 'Large pothole on the main connecting road',
      description: 'A sizeable pothole has formed on the main connecting road, widening rapidly and forcing vehicles to dangerously swerve.',
      citizenOriginalText: 'big pothole on main road, cars keep swerving',
      aiAssisted: true,
      category: 'Roads & Transport',
      subcategory: 'Potholes',
      district: 'East Singhbhum',
      block: 'Jamshedpur',
      village: 'Bistupur',
      latitude: 22.8046,
      longitude: 86.2029,
      severity: 'High',
      priorityScore: 79,
      priorityLevel: 'High',
      aiConfidence: 0.90,
      status: 'Assigned',
      detectedObjects: JSON.stringify(['deep pothole', 'asphalt damage']),
      requiredExpertise: JSON.stringify(['Civil Engineering', 'Transportation Engineering', 'Urban Planning']),
      submittedById: citizen1.id,
      assignedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    }
  });

  const c4 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0004',
      title: 'Possible contamination in drinking water supply',
      description: 'Residents report discoloration and odor in drinking water from the shared pipeline. Preliminary observation indicates potential filtration breakdown.',
      citizenOriginalText: 'water from the tap looks dirty since two days',
      aiAssisted: true,
      category: 'Water & Sanitation',
      subcategory: 'Drinking Water',
      district: 'Ranchi',
      block: 'Namkum',
      village: 'Ward 3',
      latitude: 23.3441,
      longitude: 85.3596,
      severity: 'High',
      priorityScore: 88,
      priorityLevel: 'High',
      aiConfidence: 0.75,
      status: 'Assigned',
      detectedObjects: JSON.stringify(['turbid water sample']),
      requiredExpertise: JSON.stringify(['Water Management', 'Environmental Engineering', 'Public Health']),
      submittedById: citizen1.id,
      assignedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000)
    }
  });

  const c5 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0005',
      title: 'Discolouration observed on standing crop leaves',
      description: 'Citizen noticed yellowing and dark spots on leaves across a 2-acre paddy parcel. Preliminary observation requiring agronomy diagnosis.',
      citizenOriginalText: 'leaves in my field turning yellow-brown in patches',
      aiAssisted: true,
      category: 'Agriculture',
      subcategory: 'Crop Disease',
      district: 'Hazaribagh',
      block: 'Barhi',
      village: 'Village Cluster 2',
      latitude: 24.0011,
      longitude: 85.3691,
      severity: 'Medium',
      priorityScore: 55,
      priorityLevel: 'Medium',
      aiConfidence: 0.64,
      status: 'Under Review',
      requiredExpertise: JSON.stringify(['Agricultural Engineering', 'Agronomy', 'Biotechnology']),
      submittedById: citizen1.id
    }
  });

  const c6 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0006',
      title: 'Missing wheelchair ramp at primary health sub-centre',
      description: 'Entrance to primary healthcare facility has steep stairs with no ramp or grab rails, preventing accessibility for disabled citizens.',
      aiAssisted: false,
      category: 'Accessibility',
      subcategory: 'Missing Ramps',
      district: 'Ranchi',
      block: 'Kanke',
      village: 'Health Post 4',
      latitude: 23.3800,
      longitude: 85.3200,
      severity: 'Medium',
      priorityScore: 62,
      priorityLevel: 'Medium',
      status: 'Submitted',
      requiredExpertise: JSON.stringify(['Civil Engineering', 'Accessibility Architecture']),
      submittedById: citizen1.id
    }
  });

  const c7 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0007',
      title: 'Frequent power outages and voltage fluctuation in tribal hamlet',
      description: 'Voltage instability has damaged agricultural water pumps and left students without study light in the evening.',
      aiAssisted: true,
      category: 'Energy & Electricity',
      subcategory: 'Electricity Access',
      district: 'West Singhbhum',
      block: 'Chaibasa',
      village: 'Hamirpur Tola',
      latitude: 22.5500,
      longitude: 85.8000,
      severity: 'High',
      priorityScore: 78,
      priorityLevel: 'High',
      status: 'Verified',
      requiredExpertise: JSON.stringify(['Electrical Engineering', 'Renewable Energy', 'IoT']),
      submittedById: citizen1.id
    }
  });

  const c8 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0008',
      title: 'Waterlogging and blocked stormwater drain',
      description: 'Stagnant wastewater pooling on main road after 20 minutes of rain, threatening adjacent primary school.',
      category: 'Water & Sanitation',
      subcategory: 'Flooding',
      district: 'Bokaro',
      block: 'Chas',
      village: 'Sector 9',
      latitude: 23.6300,
      longitude: 86.1500,
      severity: 'High',
      priorityScore: 74,
      priorityLevel: 'High',
      status: 'Submitted',
      requiredExpertise: JSON.stringify(['Civil Engineering', 'Water Management', 'Urban Planning']),
      submittedById: citizen1.id
    }
  });

  const c9 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0009',
      title: 'Lack of digital STEM learning tools in rural secondary school',
      description: 'Secondary school lacks functional computer terminals and science experiment kits for class 9-10 syllabus.',
      category: 'Education',
      subcategory: 'Digital Classrooms',
      district: 'Gumla',
      block: 'Raidih',
      village: 'High School Compound',
      latitude: 23.0400,
      longitude: 84.5400,
      severity: 'Medium',
      priorityScore: 52,
      priorityLevel: 'Medium',
      status: 'Verified',
      requiredExpertise: JSON.stringify(['Education Technology', 'Computer Science', 'IoT']),
      submittedById: citizen1.id
    }
  });

  const c10 = await prisma.challenge.create({
    data: {
      displayId: 'JH-2026-0010',
      title: 'Damaged culvert causing isolation of tribal village during monsoon',
      description: 'Stone culvert cracked with partial bank erosion, risking bridge collapse during heavy downpours.',
      category: 'Roads & Transport',
      subcategory: 'Road Damage',
      district: 'Palamu',
      block: 'Daltonganj',
      village: 'Koilwar',
      latitude: 24.0400,
      longitude: 84.0700,
      severity: 'Critical',
      priorityScore: 92,
      priorityLevel: 'Critical',
      status: 'Submitted',
      requiredExpertise: JSON.stringify(['Civil Engineering', 'Transportation Engineering']),
      submittedById: citizen1.id
    }
  });

  // 6. Seed 2 Active Projects
  const p1 = await prisma.project.create({
    data: {
      displayId: 'PRJ-2026-0001',
      challengeId: c3.id,
      universityId: instB.id,
      title: 'Rapid Cold-Mix Polymer Pothole Repair System',
      status: 'In Progress',
      proposedSolution: 'Formulate an all-weather bio-based cold bituminous patching mix with smart vibration compaction sensor.',
      expectedOutcome: 'Zero-cure-time pothole repair lasting at least 2 monsoon cycles with 40% reduced cost.',
      estimatedDurationDays: 60,
      requiredSkills: JSON.stringify(['Bitumen Chemistry', 'Civil Engineering', 'IoT Sensors']),
      startDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      targetEndDate: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000)
    }
  });

  const p2 = await prisma.project.create({
    data: {
      displayId: 'PRJ-2026-0002',
      challengeId: c4.id,
      universityId: instA.id,
      title: 'Low-Cost IoT Community Water Purification & Turbidity Alert',
      status: 'Solution Proposal',
      proposedSolution: 'Multi-stage activated charcoal and UV filtration system integrated with low-power turbidity and pH telemetry.',
      expectedOutcome: 'Potable water output satisfying BIS 10500 standards with automated SMS alerts for filter change.',
      estimatedDurationDays: 90,
      requiredSkills: JSON.stringify(['Water Engineering', 'IoT Hardware', 'Microbiology']),
      startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      targetEndDate: new Date(Date.now() + 85 * 24 * 60 * 60 * 1000)
    }
  });

  // 7. Team Members
  await prisma.teamMember.create({
    data: { projectId: p2.id, userId: faculty.id, role: 'faculty_mentor' }
  });
  await prisma.teamMember.create({
    data: { projectId: p2.id, userId: student.id, role: 'student' }
  });

  // 8. Partner Interests
  await prisma.partnerInterest.create({
    data: {
      projectId: p2.id,
      industryOrgId: indA.id,
      supportTypes: JSON.stringify(['Technology', 'Mentorship', 'Prototyping']),
      message: 'We can provide IoT telemetry sensors and technical guidance on embedded firmware.',
      status: 'interest_submitted'
    }
  });

  // 9. Milestones & Deliverables
  const m1 = await prisma.milestone.create({
    data: {
      projectId: p1.id,
      title: 'Bitumen Polymer Formulation Lab Testing',
      description: 'Prepare 5 test blends and evaluate tensile strength & water resistance.',
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'completed',
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  });

  const m2 = await prisma.milestone.create({
    data: {
      projectId: p1.id,
      title: 'Field Patch Demonstration (50m test strip)',
      description: 'Deploy cold-mix patch on Jamshedpur approach sector.',
      dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      status: 'in_progress'
    }
  });

  await prisma.deliverable.create({
    data: {
      milestoneId: m1.id,
      title: 'Lab Test Strength Report & Micrography PDF',
      fileUrl: '/uploads/lab_report_v1.pdf',
      submittedById: student.id,
      reviewStatus: 'approved',
      reviewerComments: 'Results meet highway standard specs. Approved for pilot phase.'
    }
  });

  // 10. Audit Logs (ProjectLog)
  await prisma.projectLog.create({
    data: {
      projectId: p2.id,
      actorId: instAdmin.id,
      action: 'Project Accepted',
      details: 'Institution A accepted Challenge JH-2026-0004 and initialized proposal.'
    }
  });

  await prisma.projectLog.create({
    data: {
      projectId: p1.id,
      actorId: adminUser.id,
      action: 'Status Advanced to In Progress',
      details: 'Milestone 1 completed and proposal approved by state committee.'
    }
  });

  // 11. Notifications
  await prisma.notification.create({
    data: {
      userId: citizen1.id,
      type: 'matched',
      message: 'JH-2026-0001 was matched with top academic and industry institutions.',
      relatedChallengeId: c1.id,
      read: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: instAdmin.id,
      type: 'matched',
      message: 'JH-2026-0001 was matched to Institution A. Review the challenge and form a team.',
      relatedChallengeId: c1.id,
      read: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: citizen1.id,
      type: 'assigned',
      message: 'JH-2026-0003 has been assigned to Institution B. Solution design in progress.',
      relatedChallengeId: c3.id,
      relatedProjectId: p1.id,
      read: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: faculty.id,
      type: 'interest_submitted',
      message: 'Industry Partner A submitted collaboration interest for PRJ-2026-0002.',
      relatedProjectId: p2.id,
      read: false
    }
  });

  console.log('✅ Seed completed successfully! All 10 challenges, 8 HEIs, 8 industry partners, and 8 personas seeded.');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
