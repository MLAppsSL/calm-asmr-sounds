import { getApps } from '@react-native-firebase/app';

import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { auth } from '@/lib/firebase';
import type { AuthUser } from '@/types';

type FirebaseErrorLike = {
  code?: string;
  message?: string;
};

type AuthActionResult = {
  error: string | null;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<AuthActionResult>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const missingFirebaseConfigMessage =
  'Firebase auth is not configured for this build. Rebuild the development client after confirming google-services.json and GoogleService-Info.plist are present.';

function isFirebaseConfigured() {
  return getApps().length > 0;
}

function mapAuthError(error: unknown) {
  if (!isFirebaseConfigured()) {
    return missingFirebaseConfigMessage;
  }

  if (typeof error !== 'object' || error === null) {
    return 'Unable to complete that request right now. Please try again.';
  }

  const firebaseError = error as FirebaseErrorLike;
  const normalizedCode = firebaseError.code?.toLowerCase() ?? '';
  const normalizedMessage = firebaseError.message?.toLowerCase() ?? '';

  if (normalizedCode === 'auth/invalid-credential') {
    return 'Incorrect email or password.';
  }

  if (normalizedCode === 'auth/invalid-email') {
    return 'Enter a valid email address.';
  }

  if (
    normalizedCode === 'auth/wrong-password' ||
    normalizedCode === 'auth/user-not-found' ||
    normalizedCode === 'auth/invalid-login-credentials'
  ) {
    return 'Incorrect email or password.';
  }

  if (normalizedCode === 'auth/email-already-in-use') {
    return 'An account already exists for this email.';
  }

  if (normalizedCode === 'auth/weak-password') {
    return 'Password must be at least 6 characters.';
  }

  if (
    normalizedCode === 'auth/network-request-failed' ||
    normalizedMessage.includes('network request failed')
  ) {
    return 'Unable to reach Firebase right now. Check your connection and try again.';
  }

  if (normalizedCode === 'auth/too-many-requests') {
    return 'Too many attempts. Please wait a moment and try again.';
  }

  return 'Unable to complete that request right now. Please try again.';
}

async function getCurrentUser() {
  if (!isFirebaseConfigured()) {
    return null;
  }

  return auth().currentUser;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    if (!isFirebaseConfigured()) {
      setIsLoading(false);
      return () => {
        isMounted = false;
      };
    }

    void getCurrentUser()
      .then((nextUser) => {
        if (isMounted) {
          setUser(nextUser);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    const unsubscribe = auth().onAuthStateChanged((nextUser) => {
      if (!isMounted) {
        return;
      }

      setUser(nextUser);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthActionResult> => {
    if (!isFirebaseConfigured()) {
      return { error: missingFirebaseConfigMessage };
    }

    try {
      await auth().signInWithEmailAndPassword(email.trim(), password);
      return { error: null };
    } catch (error: unknown) {
      return {
        error: mapAuthError(error),
      };
    }
  };

  const signUp = async (email: string, password: string): Promise<AuthActionResult> => {
    if (!isFirebaseConfigured()) {
      return { error: missingFirebaseConfigMessage };
    }

    try {
      await auth().createUserWithEmailAndPassword(email.trim(), password);
      return { error: null };
    } catch (error: unknown) {
      return {
        error: mapAuthError(error),
      };
    }
  };

  const signOut = async (): Promise<AuthActionResult> => {
    if (!isFirebaseConfigured()) {
      return { error: missingFirebaseConfigMessage };
    }

    try {
      await auth().signOut();
      return { error: null };
    } catch (error: unknown) {
      return {
        error: mapAuthError(error),
      };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
