import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Paw } from '../icons';
import { signIn, signUp } from '../supabase';
import { colors, fonts, shadows, type } from '../theme';
import { PrimaryButton } from '../ui';

export function Auth({ onClose, onSignedIn }: { onClose: () => void; onSignedIn: () => void }) {
  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 6) {
      setError('Enter an email and a password of at least 6 characters.');
      return;
    }
    setBusy(true);
    const res = mode === 'signup' ? await signUp(email.trim(), password) : await signIn(email.trim(), password);
    setBusy(false);
    if (!res.ok) {
      setError(res.error ?? 'Something went wrong.');
      return;
    }
    if (res.needsConfirmation) {
      setInfo('Check your inbox to confirm your email, then sign in.');
      setMode('signin');
      return;
    }
    onSignedIn();
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.brand}>
            <Paw size={34} color={colors.terracotta} />
            <Text style={[type.screenTitleSm, { marginTop: 10 }]}>
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </Text>
            <Text style={[type.screenSub, { textAlign: 'center', marginTop: 6 }]}>
              {mode === 'signin' ? 'Sign in to find your dog a sitter.' : 'Join Simon’s to book trusted sitters.'}
            </Text>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={colors.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
          />

          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            placeholderTextColor={colors.muted}
            secureTextEntry
            autoCapitalize="none"
          />

          {error && <Text style={styles.error}>{error}</Text>}
          {info && <Text style={styles.info}>{info}</Text>}

          <View style={{ marginTop: 20 }}>
            {busy ? (
              <View style={styles.busy}>
                <ActivityIndicator color={colors.white} />
              </View>
            ) : (
              <PrimaryButton title={mode === 'signin' ? 'Sign in' : 'Create account'} onPress={submit} />
            )}
          </View>

          <Pressable onPress={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }} style={{ marginTop: 16 }}>
            <Text style={styles.switch}>
              {mode === 'signin' ? 'New here? ' : 'Already have an account? '}
              <Text style={styles.switchLink}>{mode === 'signin' ? 'Create an account' : 'Sign in'}</Text>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: { paddingHorizontal: 22, paddingVertical: 10, alignItems: 'flex-end' },
  close: { fontFamily: fonts.body800, fontSize: 14, color: colors.muted },
  body: { flex: 1, paddingHorizontal: 26, paddingTop: 10 },
  brand: { alignItems: 'center', marginBottom: 26 },
  label: { fontFamily: fonts.body800, fontSize: 13, color: colors.inkSoft, marginBottom: 7 },
  input: {
    height: 50,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 15,
    fontFamily: fonts.body700,
    fontSize: 15.5,
    color: colors.ink,
    ...shadows.soft,
  },
  error: { fontFamily: fonts.body700, fontSize: 13.5, color: colors.terracotta600, marginTop: 14 },
  info: { fontFamily: fonts.body700, fontSize: 13.5, color: colors.sage600, marginTop: 14 },
  busy: { height: 54, borderRadius: 18, backgroundColor: colors.terracotta, alignItems: 'center', justifyContent: 'center', ...shadows.btn },
  switch: { textAlign: 'center', fontFamily: fonts.body600, fontSize: 14, color: colors.inkSoft },
  switchLink: { fontFamily: fonts.body800, color: colors.terracotta600 },
});
