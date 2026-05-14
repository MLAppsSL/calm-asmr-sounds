import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getApps } from '@react-native-firebase/app';
import { auth } from '@/lib/firebase';

export default function HomeScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [currentUserText, setCurrentUserText] = useState('No authenticated user');
  const [configError, setConfigError] = useState<string | null>(null);

  useEffect(() => {
    if (getApps().length === 0) {
      const baseMessage =
        Platform.OS === 'web'
          ? 'React Native Firebase native modules do not auto-configure on web. Use an iOS or Android development build for this test.'
          : 'No default native Firebase app is available in this build. Rebuild and reinstall the development client after changing app identifiers or Firebase config files.';

      setConfigError(baseMessage);
      setCurrentUserText('Firebase native app not initialized');

      return;
    }

    try {
      const unsubscribe = auth().onAuthStateChanged((user) => {
        if (!user) {
          setCurrentUserText('No authenticated user');
          return;
        }

        const label = user.isAnonymous ? 'Anonymous user' : (user.email ?? 'Authenticated user');
        setCurrentUserText(`${label}\nUID: ${user.uid}`);
      });

      setConfigError(null);

      return unsubscribe;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Firebase initialization error';
      setConfigError(message);
      setCurrentUserText('Firebase native app not initialized');
      return;
    }
  }, []);

  async function runAuthAction(action: () => Promise<unknown>) {
    if (configError) {
      Alert.alert('Firebase config issue', configError);
      return;
    }

    try {
      setIsBusy(true);
      await action();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Firebase auth error';
      Alert.alert('Firebase Auth Error', message);
    } finally {
      setIsBusy(false);
    }
  }

  function requireCredentials() {
    if (email.trim() && password) {
      return true;
    }

    Alert.alert('Missing credentials', 'Enter an email and password first.');
    return false;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Firebase Auth Test</Text>
        <Text style={styles.subtitle}>
          Use this screen to verify the native Firebase config can create and authenticate users.
        </Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Current session</Text>
          <Text style={styles.statusValue}>{currentUserText}</Text>
        </View>

        {configError ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Firebase config issue</Text>
            <Text style={styles.errorText}>{configError}</Text>
          </View>
        ) : null}

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#777777"
          style={styles.input}
          value={email}
        />
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#777777"
          secureTextEntry
          style={styles.input}
          value={password}
        />

        <Pressable
          disabled={isBusy}
          onPress={() => {
            if (!requireCredentials()) {
              return;
            }

            void runAuthAction(() => auth().createUserWithEmailAndPassword(email.trim(), password));
          }}
          style={[styles.button, styles.primaryButton, isBusy && styles.buttonDisabled]}
        >
          <Text style={styles.primaryButtonText}>Create account</Text>
        </Pressable>

        <Pressable
          disabled={isBusy}
          onPress={() => {
            if (!requireCredentials()) {
              return;
            }

            void runAuthAction(() => auth().signInWithEmailAndPassword(email.trim(), password));
          }}
          style={[styles.button, styles.secondaryButton, isBusy && styles.buttonDisabled]}
        >
          <Text style={styles.secondaryButtonText}>Sign in</Text>
        </Pressable>

        <Pressable
          disabled={isBusy}
          onPress={() => {
            void runAuthAction(() => auth().signInAnonymously());
          }}
          style={[styles.button, styles.secondaryButton, isBusy && styles.buttonDisabled]}
        >
          <Text style={styles.secondaryButtonText}>Sign in anonymously</Text>
        </Pressable>

        <Pressable
          disabled={isBusy}
          onPress={() => {
            void runAuthAction(() => auth().signOut());
          }}
          style={[styles.button, styles.secondaryButton, isBusy && styles.buttonDisabled]}
        >
          <Text style={styles.secondaryButtonText}>Sign out</Text>
        </Pressable>

        {isBusy ? <ActivityIndicator color="#ffffff" style={styles.loader} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flexGrow: 1,
    padding: 24,
    gap: 14,
    justifyContent: 'center',
  },
  title: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#b3b3b3',
    fontSize: 15,
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: '#151515',
    borderColor: '#2a2a2a',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  statusLabel: {
    color: '#8f8f8f',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  statusValue: {
    color: '#ffffff',
    fontSize: 15,
    lineHeight: 22,
  },
  errorCard: {
    backgroundColor: '#2a1111',
    borderColor: '#613030',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  errorTitle: {
    color: '#ffb4b4',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  errorText: {
    color: '#ffd6d6',
    fontSize: 14,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#111111',
    borderColor: '#2a2a2a',
    borderRadius: 14,
    borderWidth: 1,
    color: '#ffffff',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  button: {
    alignItems: 'center',
    borderRadius: 14,
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#ffffff',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#1d1d1d',
    borderColor: '#323232',
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  loader: {
    marginTop: 8,
  },
});
