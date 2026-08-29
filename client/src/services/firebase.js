import { initializeApp, getApps } from 'firebase/app';
import { addDoc, collection, getFirestore, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let db;
function firestore() {
  if (!firebaseConfigured) throw new Error('Firebase is not configured');
  const app = getApps().length ? getApps()[0] : initializeApp(config);
  db ||= getFirestore(app);
  return db;
}

export async function mirrorChallengeToFirestore(challenge) {
  if (!firebaseConfigured) return null;
  const reference = await addDoc(collection(firestore(), 'samvedana_setu_challenges'), { ...challenge, createdAt: serverTimestamp(), source: 'samvedana-setu' });
  return reference.id;
}

export async function getFirestoreChallenges(userId) {
  const constraints = [where('submittedById', '==', userId), orderBy('createdAt', 'desc')];
  const snapshot = await getDocs(query(collection(firestore(), 'samvedana_setu_challenges'), ...constraints));
  return snapshot.docs.map(item => ({ id: item.id, ...item.data() }));
}
