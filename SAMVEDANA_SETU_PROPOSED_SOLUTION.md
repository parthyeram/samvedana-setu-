# Samvedana Setu
## Proposed Solution and Technical Documentation

### 1. Proposed Solution

Samvedana Setu is a digital societal innovation collaboration portal for the Government of Jharkhand. It connects citizens who report local problems with government verification teams, higher education institutions, universities, industry partners, startups, CSR organizations, and research groups.

The platform converts a community problem into a structured, trackable innovation project:

`Citizen report -> AI classification -> Duplicate check -> Government verification -> Institute/industry matching -> Collaboration -> Prototype or solution -> Government review -> Community tracking`

Citizens can submit a problem using text, an image, location search, GPS coordinates, and supporting evidence. AI identifies the problem category, subcategory, severity, detected objects, and required expertise. Government officials verify genuine reports and route them to suitable institutions. Institutes form multidisciplinary teams, industry partners contribute technical or financial support, and citizens can follow progress through a public timeline.

### 2. Problem Addressed

Communities often identify problems before formal systems do, but reports are fragmented across offices, social media, phone calls, and informal communication. Universities have expertise and student capacity, while industry has implementation, funding, mentoring, and deployment capability. These groups are rarely connected through one transparent workflow.

Samvedana Setu addresses this gap by providing:

- A single channel for structured civic problem reporting.
- AI-assisted classification and prioritization.
- Location-aware duplicate detection.
- Government verification and routing.
- Institute and industry collaboration.
- Project, milestone, evidence, and outcome tracking.
- Citizen visibility from report to final solution.

### 3. Technical Approach

#### 3.1 User-centred reporting

Citizens submit a problem through a responsive web interface. They can enter a description, upload an image, search a village, town, district, area, or PIN code, or select their live GPS location. The form supports AI suggestions and manual correction so the citizen remains in control.

#### 3.2 AI-assisted understanding

The backend sends text and image inputs to the configured AI provider. The AI returns structured JSON containing the title, category, subcategory, severity, summary, detected objects, and required expertise.

Provider order:

1. Gemini, currently configured as `gemini-3.6-flash`.
2. Groq, using the permitted project model `qwen/qwen3.6-27b`.
3. Hugging Face image captioning using `Salesforce/blip-image-captioning-base`.
4. Deterministic `prototype-demo` fallback based on safe keyword rules.

The actual API key is never displayed in the browser. The interface displays only the provider and model used, such as `gemini (gemini-3.6-flash)`.

#### 3.3 Category and subcategory handling

The platform preserves standard categories including Education, Healthcare, Agriculture, Water Management, Sanitation, Environment, Energy and Electricity, Roads and Transportation, Urban Infrastructure, Accessibility, and Public Administration.

AI-generated category and subcategory labels are also added dynamically when they are not already in the predefined list. This keeps both controlled classification and flexible AI output available.

#### 3.4 Duplicate detection

Before a new report is accepted, the backend checks active reports for a matching category, subcategory, and location. If a matching active problem already exists, the second report is saved as rejected with:

`Similar problem already registered.`

The original problem remains active and continues through verification and resolution.

### 4. System Architecture and Implementation

Samvedana Setu follows a three-tier architecture:

`Presentation Layer | Application Layer | Data Layer`

#### 4.1 Presentation Layer: Frontend

Technology:

- React.js
- Vite
- React Router
- Axios
- React Leaflet and OpenStreetMap tiles
- Responsive CSS design
- Chart.js where analytics visualizations are used

Features:

- Role-based navigation for citizens, government, institutes, and industry.
- Citizen reporting form with text, image, GPS, and search.
- AI analysis preview with provider/model identification.
- Live map with public problem locations and coordinates.
- My Challenges tracking page.
- Government verification queue.
- Institute project and team management.
- Industry collaboration request and accepted collaboration pages.
- Prototype or solution submission views.
- Notifications and workflow status display.

Deployment:

- Vercel hosts the production frontend.
- `VITE_API_URL` points to the Render backend.
- `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` support client-side image upload.
- Firebase web configuration is optional for Firestore mirroring and future authentication features.

#### 4.2 Application Layer: Backend

Technology:

- Node.js
- Express.js
- Prisma ORM
- JWT authentication
- bcryptjs password hashing
- CORS
- Multer for local upload handling where applicable
- Rate limiting for AI calls

Backend responsibilities:

- Authentication and account creation.
- Role-based access control.
- Citizen challenge creation and tracking.
- Duplicate report detection.
- Government verification and status transitions.
- Institute matching and project creation.
- Industry collaboration requests.
- Team member management.
- Milestones, deliverables, testing, outcomes, and project logs.
- AI provider fallback and response normalization.
- Notification creation and retrieval.

Security controls:

- Passwords are stored as bcrypt hashes.
- JWT tokens protect authenticated routes.
- Role authorization prevents access to unrelated portals.
- AI calls are rate limited.
- Backend API keys remain server-side in Render environment variables.
- Vercel receives only public frontend variables beginning with `VITE_`.
- Citizen data is scoped so users cannot view another citizen's private report details.

#### 4.3 Data Layer: PostgreSQL with Prisma

The production database uses PostgreSQL hosted by Render. Local development uses SQLite when configured for local use, while the production Prisma datasource uses PostgreSQL.

Main entities:

- `User`: citizen, government, institute, faculty, student, industry, and administrator accounts.
- `Challenge`: citizen problem report, location, category, severity, media, and status.
- `Institution`: institute expertise, departments, research areas, and facilities.
- `IndustryOrg`: partner focus areas and organization profile.
- `Project`: accepted challenge converted into a solution project.
- `TeamMember`: institute and industry project participants.
- `PartnerInterest`: industry collaboration requests.
- `Milestone`: project delivery stages.
- `Deliverable`: documents, evidence, and milestone outputs.
- `Approval`: government and organizational approvals.
- `TestingRecord`: prototype, pilot, or shared solution submissions.
- `OutcomeRecord`: deployment and impact outcomes.
- `IPRecord`: patents, copyright, or other intellectual property records.
- `ProjectLog`: auditable workflow activity.
- `Notification`: stakeholder notifications.

Database operations:

- Prisma schema synchronization during deployment.
- PostgreSQL internal URL for Render backend-to-database communication.
- Seed data only for demonstration environments.
- Backups and availability managed by the database hosting provider.

#### 4.4 AI and media services

AI services:

- Gemini: primary multimodal analysis for text and images.
- Groq: secondary text and vision fallback when available to the project.
- Hugging Face: image captioning fallback.
- Deterministic rules: immediate fallback for common terms such as pothole, garbage, waste, water leakage, and teacher absence.

Media services:

- Cloudinary stores submitted images in production.
- Evidence links can point to documents, images, text records, or other approved files.
- API keys and upload credentials are stored in service environment variables.

### 5. Workflow

#### Step 1: Citizen report

The citizen enters a description, uploads optional media, chooses or detects a location, and requests AI analysis.

#### Step 2: AI analysis

The system classifies the report, recommends expertise, estimates severity, and identifies the provider/model used.

#### Step 3: Duplicate check

The system compares the report with active reports by category, subcategory, and location. A duplicate is rejected with a clear explanation.

#### Step 4: Government verification

Government officials review the report, send staff to verify the location, and mark the report as genuine, under review, rejected, or ready for matching.

#### Step 5: Matching

The matching engine compares the problem with institution expertise, research areas, departments, industry focus areas, district, and required skills.

#### Step 6: Institute project

An institute accepts the challenge, forms a faculty and student team, defines the project, and creates milestones and deliverables.

#### Step 7: Industry collaboration

Industry can request collaboration for mentorship, equipment, funding, prototyping, testing, pilot deployment, or commercialization. The institute or government accepts the collaboration request.

#### Step 8: Shared solution submission

For collaboration projects, institute and industry share one solution submission. Whichever party submits first blocks the other party from submitting a competing solution. The project is marked `Submitted` and the solution is visible to authorized users.

#### Step 9: Review and outcome

Government reviews the prototype or solution, evidence, testing records, and expected outcomes. The project can advance, request changes, or be closed.

#### Step 10: Citizen tracking

The citizen opens My Challenges to see the current stage, public progress timeline, submitted solution, submitting organization, notes, and evidence.

### 6. Feasibility Analysis

#### A. Technical feasibility

The platform uses widely supported technologies and separates frontend, backend, database, AI, and media services. React and Express are suitable for rapid development. Prisma simplifies database access and migration between local SQLite and production PostgreSQL. Vercel and Render provide practical deployment for a prototype and early production system.

#### B. Operational feasibility

The workflow maps to existing stakeholder responsibilities. Citizens report issues, government verifies them, institutes solve them, and industry supports implementation. Role-based dashboards reduce confusion and provide each participant with only the actions relevant to them.

#### C. Economic feasibility

The initial platform can operate using low-cost or free development tiers. Costs are mainly database capacity, backend compute, AI usage, media storage, email or notification services, and future monitoring. Provider fallback reduces dependence on one paid AI service, while rate limiting controls usage.

#### D. Legal and privacy feasibility

The system should collect only necessary personal information, protect citizen identity in public views, publish clear consent language, and retain evidence according to government policy. API keys must never be committed to GitHub or exposed in frontend code.

### 7. Challenges and Risks

#### A. Data quality and integration

Reports may be incomplete, duplicated, incorrectly located, or written in multiple languages.

Mitigation: required fields, GPS and search, manual correction, AI confidence, government verification, duplicate detection, and future multilingual support.

#### B. Change management

Government, institutions, and industry may use different processes and terminology.

Mitigation: role-specific dashboards, simple status names, clear notification messages, onboarding, and pilot deployment in selected districts.

#### C. Model errors and maintenance

AI may return an incorrect category, unsupported subcategory, or an unavailable model response.

Mitigation: controlled taxonomy, dynamic labels, provider fallback, deterministic rules, visible provider identification, human editing, and government verification.

#### D. Model drift and provider availability

AI models and quotas change over time. A provider may return 404, 403, 429, or 503 errors.

Mitigation: configurable model names, timeouts, fallback providers, safe logs, quota monitoring, and periodic model compatibility tests.

#### E. Cybersecurity risks

Risks include stolen API keys, weak passwords, unauthorized access, malicious uploads, and abuse of public endpoints.

Mitigation: environment secrets, bcrypt, JWT, RBAC, rate limiting, file validation, CORS configuration, database backups, audit logs, and key rotation.

#### F. Media and evidence storage

Large files may increase cost or create unsafe content risks.

Mitigation: file size and type limits, Cloudinary transformations, virus scanning, access control, retention rules, and moderation review.

### 8. Benefits and Impact

#### Citizen benefits

- Simple reporting from a phone or browser.
- Accurate location and map search.
- Clear duplicate feedback.
- Visibility into verification and solution progress.
- Access to submitted solution details and evidence.

#### Government benefits

- Centralized challenge register.
- Faster categorization and routing.
- Duplicate reduction.
- Transparent verification and audit trail.
- District, domain, institute, and industry analytics.

#### Institute benefits

- Real-world student projects.
- Multidisciplinary team formation.
- Research and innovation opportunities.
- Structured milestones and deliverables.
- Evidence of social impact.

#### Industry benefits

- Direct access to validated societal needs.
- Collaboration opportunities with universities.
- Mentorship, pilot, funding, and commercialization pathways.
- Visibility into project progress and outcomes.

#### Broader impact

Samvedana Setu supports demand-driven innovation, experiential learning, community engagement, public transparency, and implementation-focused research aligned with the goals of NEP 2020.

### 9. Future Strategy

#### A. Predictive maintenance integration

Use historical reports and infrastructure data to identify assets likely to fail before citizens report them.

#### B. Dynamic demand forecasting

Forecast seasonal demand for water, sanitation, healthcare, transport, and emergency services.

#### C. Multilingual and multimodal expansion

Add regional language reporting, voice input, video analysis, document extraction, and offline-first mobile support.

#### D. Advanced analytics dashboard

Add district heat maps, category trends, response times, verification rates, project completion, industry participation, patents, startups, and measured social outcomes.

#### E. Real-time communication

Add secure chat, email, SMS, and push notifications between citizens, government, institutes, mentors, and industry partners.

#### F. Global deployment scalability

Use queues, object storage, caching, read replicas, observability, and regional deployments for large-scale adoption.

### 10. Business and Institutional Potential

The platform can be adopted by state departments, municipalities, universities, CSR programs, innovation hubs, and district administrations. Potential sustainability models include government service contracts, institutional subscriptions, CSR-funded challenge programs, research grants, and implementation partnerships.

The core public reporting and tracking layer should remain accessible, while advanced analytics, program management, and institutional integrations can support paid or grant-funded deployments.

### 11. Risk versus Solution

| Real-world issue | Samvedana Setu solution | Why it matters |
|---|---|---|
| Problems reported through disconnected channels | Centralized reporting portal | Creates one reliable challenge register |
| Duplicate complaints | Category, subcategory, and location duplicate check | Prevents repeated work |
| Reports lack precise location | GPS, map click, and global location search | Enables field verification |
| Government does not know whom to assign | AI classification and expertise matching | Improves routing |
| University expertise remains disconnected | Institute matching and project formation | Converts problems into student and research projects |
| Industry support is fragmented | Collaboration requests and shared solution workflow | Enables co-development and deployment |
| Citizens cannot see progress | Public timeline and solution details | Builds trust and accountability |
| AI provider failure | Gemini, Groq, Hugging Face, and deterministic fallback | Keeps the workflow usable |
| Evidence is scattered | Deliverables, testing records, and outcome records | Supports transparent review |

### 12. Methodology and Implementation Process

1. Gather stakeholder requirements from citizens, government, institutes, and industry.
2. Define roles, permissions, categories, workflow stages, and data fields.
3. Design the relational data model using Prisma.
4. Build authentication, RBAC, and protected API routes.
5. Build citizen reporting, map search, media upload, and AI analysis.
6. Implement duplicate detection and government verification.
7. Implement matching, project creation, teams, collaboration, and milestones.
8. Implement shared solution submission and evidence display.
9. Add dashboards, notifications, logs, and citizen tracking.
10. Test locally using SQLite and deploy production using Render PostgreSQL.
11. Deploy the frontend on Vercel with public `VITE_` variables only.
12. Monitor errors, quotas, performance, security, and user feedback.

### 13. Deployment Architecture

`Browser -> Vercel React frontend -> Render Express API -> Prisma -> Render PostgreSQL`

Supporting services:

`Render API -> Gemini / Groq / Hugging Face`

`Browser -> Cloudinary image upload`

`Frontend or backend -> Firebase optional Firestore mirror`

Deployment environment variables:

Backend on Render:

```env
DATABASE_URL=render_internal_postgresql_url
GEMINI_API_KEY=server_only_key
GEMINI_MODEL=gemini-3.6-flash
GROQ_API_KEY=server_only_key
HUGGING_FACE_API_KEY=server_only_token
HUGGING_FACE_MODEL=Salesforce/blip-image-captioning-base
JWT_SECRET=long_random_secret
NODE_ENV=production
PORT=10000
```

Frontend on Vercel:

```env
VITE_API_URL=https://samvedana-setu-backend.onrender.com/api
VITE_CLOUDINARY_CLOUD_NAME=cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=unsigned_upload_preset
VITE_FIREBASE_API_KEY=firebase_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=samvedana-setu.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=samvedana-setu
VITE_FIREBASE_STORAGE_BUCKET=samvedana-setu.firebasestorage.app
VITE_FIREBASE_APP_ID=firebase_web_app_id
```

Never place `DATABASE_URL`, `JWT_SECRET`, Gemini, Groq, or Hugging Face secrets in Vercel frontend variables.

### 13A. System Architecture Diagram

```text
+--------------------------- Presentation Layer ---------------------------+
| Citizen UI | Government UI | Institute UI | Industry UI | Live Map        |
| React.js + Vite + responsive CSS + React Router + Axios                   |
+-----------------------------------|---------------------------------------+
                                    | HTTPS REST API
+--------------------------- Application Layer ----------------------------+
| Express.js API                                                        |
| JWT authentication | RBAC | bcrypt passwords | rate limiting              |
| Challenge routes | verification | matching | projects | notifications    |
| AI orchestration: Gemini -> Groq -> Hugging Face -> prototype fallback |
+--------------------|-------------------------|----------------------------+
                     | Prisma ORM               | External services
+--------------------v-------------------------v----------------------------+
| PostgreSQL database                         | Gemini / Groq / HF APIs   |
| Users, challenges, projects, teams,          | Cloudinary media storage  |
| milestones, evidence, approvals, outcomes,  | Firebase optional mirror  |
| logs, and notifications                      |                           |
+----------------------------------------------+---------------------------+
```

Production hosting:

```text
Browser -> Vercel frontend -> Render Express backend -> Render PostgreSQL
                                      |-> Gemini / Groq / Hugging Face
                                      |-> Cloudinary
                                      |-> Firebase optional
```

### 13B. End-to-End Workflow Diagram

```text
Citizen creates report
        |
        v
Text/image + GPS or location search + evidence
        |
        v
AI classifies category, subcategory, severity, and expertise
        |
        v
Duplicate check by active category, subcategory, and location
        |
        +---- Duplicate found -> Reject -> "Similar problem already registered"
        |
        v
Government verification queue
        |
        +---- Invalid report -> Reject with reason
        |
        v
Verified report matched to institutes and industry partners
        |
        v
Institute accepts and forms faculty/student project team
        |
        v
Industry collaboration request and acceptance, when required
        |
        v
Milestones + deliverables + testing + evidence
        |
        v
One shared prototype or solution submission
        |
        v
Government reviews and approves, requests changes, or closes project
        |
        v
Citizen sees timeline, solution notes, evidence, and final outcome
```

### 14. Research and References

- Government of Jharkhand, Department of Higher and Technical Education, Problem Statement ID 26043.
- National Education Policy 2020, Ministry of Education, Government of India.
- React documentation.
- Vite documentation.
- Express.js documentation.
- Prisma documentation.
- PostgreSQL documentation.
- Google Gemini API documentation.
- Groq API documentation.
- Hugging Face Inference API documentation.
- Vercel deployment documentation.
- Render deployment and PostgreSQL documentation.
- Firebase Web SDK documentation.
- Cloudinary Upload API documentation.

### 15. Conclusion

Samvedana Setu is a practical bridge between community needs and innovation capacity. It combines citizen participation, AI-assisted understanding, government validation, university research, industry collaboration, and transparent project tracking in one scalable system. The platform can begin as a district-level pilot and grow into a statewide societal innovation ecosystem.

### 16. Stakeholder Roles

| Stakeholder | Main responsibilities |
|---|---|
| Citizen | Report a problem, provide evidence and location, track progress |
| Government official | Verify reports, assign staff, approve or reject, monitor outcomes |
| Institute administrator | Review matched problems, accept projects, manage institute teams |
| Faculty mentor | Guide the solution, review milestones, validate technical progress |
| Student team | Research the problem, build prototypes, submit deliverables |
| Industry partner | Provide expertise, mentorship, equipment, funding, testing, or deployment |
| Platform administrator | Manage organizations, users, permissions, configuration, and system health |

### 17. Core Functional Modules

1. Authentication and role management.
2. Citizen challenge reporting.
3. Image and document evidence management.
4. GPS, map-click, and location search.
5. AI classification and provider identification.
6. Duplicate detection and rejection explanation.
7. Government verification queue.
8. Institution and industry matching.
9. Project and team management.
10. Collaboration request management.
11. Milestone and deliverable tracking.
12. Prototype, testing, and solution submission.
13. Approval, outcome, and intellectual property records.
14. Notifications, audit logs, and analytics.
15. Citizen-facing public progress tracking.

### 18. API and Data Flow

The frontend communicates with the Express backend using authenticated REST requests. The backend validates the request, checks the user's role, applies business rules, writes to PostgreSQL through Prisma, and returns structured JSON.

Important API groups include:

```text
/api/auth              Login, signup, profile, organization approval
/api/challenges        Create, list, analyze, track, verify, live map
/api/institutions      Matched problems, accept, decline, request information
/api/industry          Partners, collaboration requests, responses
/api/projects          Projects, teams, milestones, evidence, approvals
/api/matching          Matching and ranked organization previews
/api/notifications     User notifications and read status
/api/analytics         Government dashboards and platform metrics
```

Typical report data flow:

```text
Form input -> validation -> AI preview -> manual confirmation
           -> duplicate check -> database record
           -> government queue -> matching -> project workflow
```

### 19. Challenge Status Model

```text
Submitted
   -> Under Review
   -> Verified
   -> Matched
   -> Assigned
   -> In Progress
   -> Prototype/Pilot
   -> Implemented
   -> Impact Evaluation
   -> Closed
```

Alternative outcomes include:

```text
Submitted -> Rejected
In Progress -> Discontinued
```

Every important project transition can create a notification and a project log entry. This provides an audit trail for government review.

### 20. Testing and Quality Assurance

#### Functional testing

- Citizen signup, login, and logout.
- Role-based access for every portal.
- Text and image AI analysis.
- Provider fallback and prototype fallback.
- Category and subcategory selection.
- Location search and GPS selection.
- Duplicate rejection.
- Government verification transitions.
- Matching and collaboration acceptance.
- Team member add and remove operations.
- Shared solution submission locking.
- Evidence and outcome visibility.

#### Technical testing

- API route tests using authenticated and unauthorized requests.
- Database constraint and relationship tests.
- Responsive browser testing on mobile and desktop.
- AI timeout and invalid-provider tests.
- Upload type and size validation.
- CORS and production environment tests.
- Deployment smoke tests after every release.

#### Acceptance testing

A pilot group should complete one report from each domain, verify the location, match an institute, request industry collaboration, submit evidence, and confirm that the original citizen can see the final solution.

### 21. Success Metrics

The government dashboard can measure:

- Number of reports received by district and category.
- Percentage of reports with complete location data.
- Duplicate detection rate.
- Average time from report to verification.
- Average time from verification to institute assignment.
- Number of participating institutes and industry partners.
- Number of active projects and collaborations.
- Milestone completion rate.
- Prototype and solution submission rate.
- Project closure and implementation rate.
- Citizen engagement and tracking activity.
- Measured beneficiaries and community impact.

### 22. Privacy, Governance, and Responsible AI

- Public maps should show only the information needed for community awareness.
- Personal identity should be hidden or minimized in public views.
- Citizens should consent before location and media are stored.
- Government officials should have access only to authorized operational data.
- AI output should be treated as a recommendation, not a final government decision.
- Human verification must remain part of the acceptance workflow.
- Healthcare classifications must include a non-diagnostic disclaimer.
- AI provider failures, model names, and safe error states should be logged without exposing keys.
- Uploaded evidence should have retention and deletion policies.

### 23. Scalability Roadmap

#### Phase 1: Prototype and district pilot

Deploy the current Vercel and Render system, onboard selected users, and validate the end-to-end workflow.

#### Phase 2: Statewide rollout

Add multilingual support, government department configuration, notification integrations, and district-level analytics.

#### Phase 3: Enterprise operation

Add managed queues, background AI jobs, object storage, monitoring, backup policies, service-level reporting, and stronger identity integration.

#### Phase 4: National or cross-state expansion

Support multiple state configurations, local taxonomies, regional languages, configurable workflows, and tenant-level data isolation.

### 24. Limitations and Assumptions

- AI classification depends on provider availability, model quality, quota, and input quality.
- Location search depends on third-party geocoding availability and internet access.
- Cloudinary or another object-storage provider is required for reliable production media storage.
- Government verification remains necessary to prevent false or harmful reports.
- The first release is a responsive web platform rather than a native mobile application.
- Analytics quality improves as verified historical data accumulates.

### 25. Recommended Demonstration Scenario

1. A citizen reports garbage dumping with an image and searched location.
2. Gemini classifies it as Sanitation and Waste Disposal.
3. A second citizen reports the same issue and receives `Similar problem already registered.`
4. Government verifies the original report.
5. The system matches a sanitation-focused institute and industry partner.
6. The institute creates a student and faculty team.
7. Industry accepts collaboration for equipment and pilot deployment.
8. The team submits one shared solution with evidence.
9. Government reviews the submission.
10. The citizen views the complete public progress timeline and outcome.

This scenario demonstrates the platform's most important differentiators: AI assistance, deduplication, government accountability, institute-industry collaboration, and transparent solution tracking.
