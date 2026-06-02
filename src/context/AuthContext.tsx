import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { supabase } from '@/lib/supabase';
import type { AuthUser } from '@/types';

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

function mapAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes('invalid login credentials')) {
    return 'Incorrect email or password.';
  }

  if (normalizedMessage.includes('user already registered')) {
    return 'An account already exists for this email.';
  }

  if (normalizedMessage.includes('password should be at least 6 characters')) {
    return 'Password must be at least 6 characters.';
  }

  if (normalizedMessage.includes('invalid email')) {
    return 'Enter a valid email address.';
  }

  if (normalizedMessage.includes('email not confirmed')) {
    return 'Check your inbox to confirm your email, then try again.';
  }

  return 'Unable to complete that request right now. Please try again.';
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    return null;
  }

  return data.session?.user ?? null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    return {
      error: error ? mapAuthError(error.message) : null,
    };
  };

  const signUp = async (email: string, password: string): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    return {
      error: error ? mapAuthError(error.message) : null,
    };
  };

  const signOut = async (): Promise<AuthActionResult> => {
    const { error } = await supabase.auth.signOut();

    return {
      error: error ? mapAuthError(error.message) : null,
    };
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
