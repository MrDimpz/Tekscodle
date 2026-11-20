import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  Unsubscribe,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Difficulty } from './data/items';
import { DIFFICULTY_CONFIGS } from './utils/gameLogic';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export interface UserProfileRecord {
  uid: string;
  displayName: string;
  gamesPlayed: number;
  quickPlays: number;
  bestScore: number;
  totalPoints: number;
  dailyStreak: number;
  lastDailyDate: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface LeaderboardEntryRecord {
  uid: string;
  displayName: string;
  totalScore: number;
  avgErrorPct: number;
  difficulty: Difficulty;
  gamesPlayed: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  isPublic: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface DailyLeaderboardEntryRecord {
  id: string;
  uid: string;
  displayName: string;
  dailyDate: string;
  difficulty: Difficulty;
  totalScore: number;
  avgErrorPct: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  isPublic: boolean;
  createdAt?: Timestamp;
}

export function sanitizeDisplayName(raw: string | null | undefined): string {
  const trimmed = (raw || 'Shopper').replace(/\s+/g, ' ').trim();
  const safe = trimmed.slice(0, 40);
  return safe.length > 0 ? safe : 'Shopper';
}

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutPlayer(): Promise<void> {
  await signOut(auth);
}

export async function fetchUserProfile(uid: string): Promise<UserProfileRecord | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return snap.data() as UserProfileRecord;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updatePlayerDisplayName(
  user: User,
  newName: string
): Promise<string> {
  const safeName = sanitizeDisplayName(newName);
  const userRef = doc(db, 'users', user.uid);
  const lbRef = doc(db, 'leaderboard', user.uid);

  try {
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      await updateDoc(userRef, {
        displayName: safeName,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: safeName,
        gamesPlayed: 0,
        quickPlays: 0,
        bestScore: 0,
        totalPoints: 0,
        dailyStreak: 0,
        lastDailyDate: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
  }

  try {
    const lbSnap = await getDoc(lbRef);
    if (lbSnap.exists()) {
      await updateDoc(lbRef, {
        displayName: safeName,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `leaderboard/${user.uid}`);
  }

  return safeName;
}

export interface SubmitThreeRoundPayload {
  user: User;
  displayName: string;
  mode: 'daily' | 'practice';
  dailyDate: string;
  difficulty: Difficulty;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  avgErrorPct: number;
}

function getPreviousUtcDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function submitCompletedGameToFirestore(
  payload: SubmitThreeRoundPayload
): Promise<{
  isNewBest: boolean;
  dailySubmitted: boolean;
  dailyAlreadyExisted: boolean;
}> {
  const { user, mode, dailyDate, difficulty } = payload;
  const maxRound = DIFFICULTY_CONFIGS[difficulty].maxRoundPoints;

  // Defensive blueprint-aligned clamping
  const r1 = Math.max(0, Math.min(maxRound, Math.round(payload.round1Score)));
  const r2 = Math.max(0, Math.min(maxRound, Math.round(payload.round2Score)));
  const r3 = Math.max(0, Math.min(maxRound, Math.round(payload.round3Score)));
  const totalScore = r1 + r2 + r3;
  const avgErrorPct = Math.max(0, Math.min(100, Math.round(payload.avgErrorPct * 100) / 100));
  const safeName = sanitizeDisplayName(payload.displayName || user.displayName);

  // 1. Update private user profile
  const userPath = `users/${user.uid}`;
  const userRef = doc(db, 'users', user.uid);
  let nextGamesPlayed = 1;
  let isNewBest = true;

  try {
    const existingSnap = await getDoc(userRef);
    if (!existingSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: safeName,
        gamesPlayed: 1,
        quickPlays: 0,
        bestScore: totalScore,
        totalPoints: totalScore,
        dailyStreak: mode === 'daily' ? 1 : 0,
        lastDailyDate: mode === 'daily' ? dailyDate : '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prev = existingSnap.data() as UserProfileRecord;
      nextGamesPlayed = (prev.gamesPlayed || 0) + 1;
      isNewBest = totalScore > (prev.bestScore || 0);
      const nextBest = Math.max(prev.bestScore || 0, totalScore);
      const nextTotalPoints = (prev.totalPoints || 0) + totalScore;

      let nextStreak = prev.dailyStreak || 0;
      let nextLastDaily = prev.lastDailyDate || '';
      if (mode === 'daily' && prev.lastDailyDate !== dailyDate) {
        if (prev.lastDailyDate === getPreviousUtcDate(dailyDate)) {
          nextStreak = nextStreak + 1;
        } else {
          nextStreak = 1;
        }
        nextLastDaily = dailyDate;
      }

      await updateDoc(userRef, {
        displayName: safeName,
        gamesPlayed: nextGamesPlayed,
        quickPlays: prev.quickPlays || 0,
        bestScore: nextBest,
        totalPoints: nextTotalPoints,
        dailyStreak: nextStreak,
        lastDailyDate: nextLastDaily,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userPath);
  }

  // 2. Upsert public all-time global leaderboard entry
  const lbPath = `leaderboard/${user.uid}`;
  const lbRef = doc(db, 'leaderboard', user.uid);
  try {
    const lbSnap = await getDoc(lbRef);
    if (!lbSnap.exists()) {
      await setDoc(lbRef, {
        uid: user.uid,
        displayName: safeName,
        totalScore,
        avgErrorPct,
        difficulty,
        gamesPlayed: nextGamesPlayed,
        round1Score: r1,
        round2Score: r2,
        round3Score: r3,
        isPublic: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prevLb = lbSnap.data() as LeaderboardEntryRecord;
      if (totalScore >= prevLb.totalScore) {
        await updateDoc(lbRef, {
          displayName: safeName,
          totalScore,
          avgErrorPct,
          difficulty,
          gamesPlayed: Math.max(nextGamesPlayed, (prevLb.gamesPlayed || 0) + 1),
          round1Score: r1,
          round2Score: r2,
          round3Score: r3,
          updatedAt: serverTimestamp(),
        });
      } else {
        await updateDoc(lbRef, {
          displayName: safeName,
          gamesPlayed: Math.max(nextGamesPlayed, (prevLb.gamesPlayed || 0) + 1),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, lbPath);
  }

  // 3. If Daily Basket mode, submit immutable daily score once per day
  let dailySubmitted = false;
  let dailyAlreadyExisted = false;

  if (mode === 'daily') {
    const entryId = `${dailyDate}_${user.uid}`;
    const dailyPath = `dailyLeaderboard/${entryId}`;
    const dailyRef = doc(db, 'dailyLeaderboard', entryId);
    try {
      const dailySnap = await getDoc(dailyRef);
      if (dailySnap.exists()) {
        dailyAlreadyExisted = true;
      } else {
        await setDoc(dailyRef, {
          uid: user.uid,
          displayName: safeName,
          dailyDate,
          difficulty,
          totalScore,
          avgErrorPct,
          round1Score: r1,
          round2Score: r2,
          round3Score: r3,
          isPublic: true,
          createdAt: serverTimestamp(),
        });
        dailySubmitted = true;
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, dailyPath);
    }
  }

  return { isNewBest, dailySubmitted, dailyAlreadyExisted };
}

export async function recordQuickPlayToProfile(
  user: User,
  displayName: string,
  pointsEarned: number
): Promise<void> {
  const safePoints = Math.max(0, Math.min(1250, Math.round(pointsEarned)));
  const safeName = sanitizeDisplayName(displayName || user.displayName);
  const userRef = doc(db, 'users', user.uid);
  const path = `users/${user.uid}`;

  try {
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName: safeName,
        gamesPlayed: 0,
        quickPlays: 1,
        bestScore: 0,
        totalPoints: safePoints,
        dailyStreak: 0,
        lastDailyDate: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const prev = snap.data() as UserProfileRecord;
      await updateDoc(userRef, {
        displayName: safeName,
        quickPlays: (prev.quickPlays || 0) + 1,
        totalPoints: (prev.totalPoints || 0) + safePoints,
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export function subscribeGlobalLeaderboard(
  onUpdate: (entries: LeaderboardEntryRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = 'leaderboard';
  const q = query(
    collection(db, path),
    where('totalScore', '>=', 0),
    where('totalScore', '<=', 3750),
    orderBy('totalScore', 'desc'),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((d) => d.data() as LeaderboardEntryRecord);
      entries.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return a.avgErrorPct - b.avgErrorPct;
      });
      onUpdate(entries);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}

export function subscribeDailyLeaderboard(
  dailyDate: string,
  onUpdate: (entries: DailyLeaderboardEntryRecord[]) => void,
  onError: (err: Error) => void
): Unsubscribe {
  const path = 'dailyLeaderboard';
  const q = query(
    collection(db, path),
    where('dailyDate', '==', dailyDate),
    limit(50)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const entries = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<DailyLeaderboardEntryRecord, 'id'>),
      }));
      entries.sort((a, b) => {
        if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
        return a.avgErrorPct - b.avgErrorPct;
      });
      onUpdate(entries);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, path);
      } catch (wrapped) {
        onError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
      }
    }
  );
}
