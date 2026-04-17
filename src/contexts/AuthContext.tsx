import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signOut as fbSignOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile, type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { isDemoMode, DEMO_USER } from '@/lib/demo-mode';
import { maybeSeedDemoData } from '@/lib/demo-store';

interface AuthState {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signUpWithEmail: async () => {},
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode()) {
      setUser(DEMO_USER as unknown as User);
      maybeSeedDemoData(DEMO_USER.uid);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      // Create/update profile in Firestore on sign in
      if (firebaseUser) {
        const profileRef = doc(db, 'profiles', firebaseUser.uid);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          await setDoc(profileRef, {
            email: firebaseUser.email,
            fullName: firebaseUser.displayName,
            avatarUrl: firebaseUser.photoURL,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    if (isDemoMode()) return;
    await signInWithPopup(auth, googleProvider);
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    if (isDemoMode()) {
      setUser({ ...DEMO_USER, displayName: name, email } as unknown as User);
      return;
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await setDoc(doc(db, 'profiles', result.user.uid), {
      email,
      fullName: name,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isDemoMode()) {
      setUser({ ...DEMO_USER, email } as unknown as User);
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    if (isDemoMode()) {
      setUser(null);
      return;
    }
    await fbSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
