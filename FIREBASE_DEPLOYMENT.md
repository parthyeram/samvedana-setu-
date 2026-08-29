# Samvedana Setu deployment

## Free deployment architecture

- Vercel: React frontend
- Firebase Authentication: user identity and roles
- Firestore: reports and real-time application data
- Cloudinary: images and documents
- Vercel API Functions: secure business logic after the Express routes are migrated

## Required Vercel variables

Add the variables from `client/.env.example` in the Vercel project settings. `VITE_` variables are public Firebase web configuration values. Keep admin credentials and AI keys server-side only.

## Important migration note

The current Express server still uses Prisma/SQLite as its primary data store. Do not deploy the current frontend alone and expect `/api` calls to work. Either deploy the Express server separately and replace `REPLACE_WITH_DEPLOYED_API` in `vercel.json`, or migrate the server routes to Vercel functions and Firestore before removing Prisma.

## Firestore security

Create Firestore rules before production. Citizens should only read their own reports and notifications; institutes and industry partners should only read matched records; government roles should control verification and approvals.
