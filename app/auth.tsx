import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { useUIStore } from '@/shared/domain/stores/uiStore';

type AuthMode = 'sign-in' | 'sign-up';

export default function AuthScreen() {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignIn = mode === 'sign-in';
  const title = isSignIn ? 'Welcome back' : 'Create your account';
  const subtitle = isSignIn
    ? 'Sign in to keep your favorites ready across devices.'
    : 'Sign up to sync your favorites without interrupting your listening.';
  const backgroundColor = isDarkMode ? '#020617' : '#f8fafc';
  const cardColor = isDarkMode ? 'rgba(15,23,42,0.82)' : 'rgba(255,255,255,0.95)';
  const borderColor = isDarkMode ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)';
  const inputColor = isDarkMode ? 'rgba(15,23,42,0.72)' : '#ffffff';
  const textColor = isDarkMode ? '#e2e8f0' : '#0f172a';
  const mutedColor = isDarkMode ? 'rgba(226,232,240,0.68)' : 'rgba(15,23,42,0.62)';
  const placeholderColor = isDarkMode ? 'rgba(148,163,184,0.8)' : 'rgba(100,116,139,0.82)';
  const accentColor = '#a78bfa';

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !password) {
      setErrorMessage('Enter both your email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const result = isSignIn
      ? await signIn(trimmedEmail, password)
      : await signUp(trimmedEmail, password);

    setIsSubmitting(false);

    if (result.error) {
      setErrorMessage(result.error);
      return;
    }

    router.back();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
      >
        <View style={[styles.card, { backgroundColor: cardColor, borderColor }]}>
          <View style={styles.header}>
            <Pressable
              onPress={() => {
                router.back();
              }}
              style={styles.closeButton}
            >
              <MaterialIcons color={textColor} name="close" size={22} />
            </Pressable>
            <Text style={[styles.eyebrow, { color: accentColor }]}>Optional account</Text>
            <Text style={[styles.title, { color: textColor }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>{subtitle}</Text>
          </View>

          <View style={styles.modeSwitchRow}>
            <Pressable
              onPress={() => {
                setMode('sign-in');
                setErrorMessage(null);
              }}
              style={[styles.modeButton, isSignIn && { backgroundColor: accentColor }]}
            >
              <Text style={[styles.modeButtonText, { color: isSignIn ? '#0f172a' : mutedColor }]}>
                Sign In
              </Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setMode('sign-up');
                setErrorMessage(null);
              }}
              style={[styles.modeButton, !isSignIn && { backgroundColor: accentColor }]}
            >
              <Text style={[styles.modeButtonText, { color: !isSignIn ? '#0f172a' : mutedColor }]}>
                Sign Up
              </Text>
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputGroup, { backgroundColor: inputColor, borderColor }]}>
              <Text style={[styles.inputLabel, { color: mutedColor }]}>Email</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={placeholderColor}
                style={[styles.input, { color: textColor }]}
                value={email}
              />
            </View>

            <View style={[styles.inputGroup, { backgroundColor: inputColor, borderColor }]}>
              <Text style={[styles.inputLabel, { color: mutedColor }]}>Password</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete={isSignIn ? 'current-password' : 'new-password'}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor={placeholderColor}
                secureTextEntry
                style={[styles.input, { color: textColor }]}
                value={password}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              disabled={isSubmitting}
              onPress={() => {
                void handleSubmit();
              }}
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#0f172a" />
              ) : (
                <Text style={styles.submitButtonText}>
                  {isSignIn ? 'Sign In' : 'Create Account'}
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => {
                router.back();
              }}
              style={styles.skipButton}
            >
              <Text style={[styles.skipButtonText, { color: mutedColor }]}>
                Continue without an account
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 24,
    padding: 24,
  },
  header: {
    gap: 8,
  },
  closeButton: {
    alignItems: 'center',
    alignSelf: 'flex-end',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  modeSwitchRow: {
    backgroundColor: 'rgba(148,163,184,0.12)',
    borderRadius: 18,
    flexDirection: 'row',
    padding: 4,
  },
  modeButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 12,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    fontSize: 16,
    padding: 0,
  },
  errorText: {
    color: '#fda4af',
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#a78bfa',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
