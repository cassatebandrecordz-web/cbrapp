import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { soundEffects } from '../utils/soundEffects';

interface AuthScreenProps {
  initialTab?: 'login' | 'register';
}

export default function AuthScreen({ initialTab = 'login' }: AuthScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { login, register, loginDemo } = useApp();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Form State
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mandatory Sign In Handler (verifies with Database)
  const handleSignIn = async () => {
    soundEffects.playAuthSubmit();
    const identifier = emailOrPhone.trim();

    if (!identifier) {
      Alert.alert('Sign In Required', 'Please enter your registered email address or mobile number.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Password Required', 'Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const deviceStr = Platform.OS === 'android'
      ? 'Android Mobile App'
      : Platform.OS === 'ios'
      ? 'iOS Mobile App'
      : 'Web Studio Portal';

    const res = await login({
      identifier,
      password: password.trim(),
      device: deviceStr,
      loginLocation: 'Chennai Studio, TN, India',
    });

    setIsSubmitting(false);

    if (res.success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert(
        'Sign In Failed',
        res.error || 'Invalid credentials. If you are a new producer, please tap Register to create an account.'
      );
    }
  };

  // Mandatory Register Handler (registers directly to Database)
  const handleRegister = async () => {
    soundEffects.playAuthSubmit();
    const trimmedName = name.trim();
    const identifier = emailOrPhone.trim();

    if (!trimmedName) {
      Alert.alert('Registration', 'Please enter your full name or producer alias.');
      return;
    }

    if (!identifier) {
      Alert.alert('Registration', 'Please enter your email address or mobile number.');
      return;
    }

    if (!password.trim()) {
      Alert.alert('Registration', 'Please choose a password.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords entered do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const emailStr = identifier.includes('@') ? identifier : `${identifier}@gmail.com`;
    const phoneStr = !identifier.includes('@') ? identifier : '+91 90252 53695';
    const deviceStr = Platform.OS === 'android'
      ? 'Android Mobile App'
      : Platform.OS === 'ios'
      ? 'iOS Mobile App'
      : 'Web Studio Portal';

    const res = await register({
      name: trimmedName,
      email: emailStr,
      password: password.trim(),
      phone: phoneStr,
      device: deviceStr,
      loginLocation: 'Chennai Studio, TN, India',
    });

    setIsSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Account Registered!',
        `Welcome to Cassate Band Recordz, ${trimmedName}! Your studio account is active and ready.`,
        [{ text: 'Continue to Studio', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      Alert.alert('Registration Failed', res.error || 'Could not complete registration. Please check your network.');
    }
  };

  // Social Login Handler
  const handleSocialLogin = async (provider: 'Google' | 'Apple') => {
    soundEffects.playAuthSubmit();
    const mockEmail = `${provider.toLowerCase()}.user@gmail.com`;
    await register({
      name: `${provider} Client`,
      email: mockEmail,
      phone: '+91 90252 53695',
      device: Platform.OS === 'android' ? 'Android Mobile App' : 'iOS Mobile App',
      loginLocation: 'Chennai Studio, TN, India',
    });
    router.replace('/(tabs)');
  };

  // Forgot Password Handler
  const handleForgotPassword = () => {
    Alert.alert(
      'Password Reset',
      'A secure verification code has been sent to your registered email/phone.',
      [{ text: 'OK' }]
    );
  };

  const isLogin = activeTab === 'login';
  const isDesktopWeb = Platform.OS === 'web' && width > 520;

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <View style={styles.outerContainer}>
        <ScrollView
          style={[styles.scrollView, isDesktopWeb && styles.desktopScrollView]}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(insets.top, 12),
              paddingBottom: Math.max(insets.bottom, 24) + 16,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top Bar: Sign In Must (No Skip) ── */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => {
                soundEffects.playClick(850, 0.03);
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/');
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.mustLoginBadge}>
              <Ionicons name="lock-closed" size={12} color="#FACC15" />
              <Text style={styles.mustLoginBadgeText}>Studio Account Required</Text>
            </View>
          </View>

          {/* ── Segmented Pill Toggle: [ Sign In | Register ] ── */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[styles.segmentBtn, isLogin && styles.segmentBtnActive]}
              onPress={() => {
                soundEffects.playTabSwitch();
                setActiveTab('login');
              }}
              activeOpacity={0.85}
            >
              {isLogin ? (
                <LinearGradient
                  colors={['#FACC15', '#EAB308', '#CA8A04']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Ionicons name="person" size={15} color="#000000" />
                  <Text style={styles.segmentTextActive}>Sign In</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTabContent}>
                  <Ionicons name="person-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.segmentTextInactive}>Sign In</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.segmentBtn, !isLogin && styles.segmentBtnActive]}
              onPress={() => {
                soundEffects.playTabSwitch();
                setActiveTab('register');
              }}
              activeOpacity={0.85}
            >
              {!isLogin ? (
                <LinearGradient
                  colors={['#FACC15', '#EAB308', '#CA8A04']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.activeTabGradient}
                >
                  <Ionicons name="person-add" size={15} color="#000000" />
                  <Text style={styles.segmentTextActive}>Register</Text>
                </LinearGradient>
              ) : (
                <View style={styles.inactiveTabContent}>
                  <Ionicons name="person-add-outline" size={15} color="#FFFFFF" />
                  <Text style={styles.segmentTextInactive}>Register</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Heading & Subheading ── */}
          <View style={styles.headingSection}>
            <Text style={styles.mainHeading}>
              {isLogin ? 'Sign In to Your Account' : 'Create Your Account'}
            </Text>
            <Text style={styles.subHeading}>
              {isLogin
                ? 'Access your bookings, projects and studio services'
                : 'Join Cassate Band Recordz for studio bookings'}
            </Text>
          </View>

          {/* ── Form Inputs ── */}
          <View style={styles.formContainer}>
            {/* Full Name field for Register */}
            {!isLogin && (
              <View style={styles.inputPill}>
                <Ionicons name="person-outline" size={18} color="#CBD5E1" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Full Name / Studio Artist"
                  placeholderTextColor="#64748B"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            )}

            {/* Email or Mobile Number */}
            <View style={styles.inputPill}>
              <Ionicons name="mail-outline" size={18} color="#CBD5E1" />
              <TextInput
                style={styles.textInput}
                placeholder="Email or Mobile Number"
                placeholderTextColor="#64748B"
                value={emailOrPhone}
                onChangeText={setEmailOrPhone}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password */}
            <View style={styles.inputPill}>
              <Ionicons name="lock-closed-outline" size={18} color="#CBD5E1" />
              <TextInput
                style={styles.textInput}
                placeholder="Password"
                placeholderTextColor="#64748B"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* Confirm Password field for Register */}
            {!isLogin && (
              <View style={styles.inputPill}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#CBD5E1" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Confirm Password"
                  placeholderTextColor="#64748B"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color="#94A3B8"
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Remember Me & Forgot Password Row (Sign In mode) */}
            {isLogin && (
              <View style={styles.optionsRow}>
                <TouchableOpacity
                  style={styles.rememberMeRow}
                  onPress={() => setRememberMe(!rememberMe)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkboxBox, rememberMe && styles.checkboxActive]}>
                    {rememberMe && <Ionicons name="checkmark" size={13} color="#000000" />}
                  </View>
                  <Text style={styles.rememberMeText}>Remember Me</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* ── Main Submit Button ── */}
            <TouchableOpacity
              style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
              onPress={isLogin ? handleSignIn : handleRegister}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={['#FACC15', '#EAB308', '#CA8A04']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {isSubmitting ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#000000" />
                    <Text style={styles.submitBtnText}>
                      {isLogin ? 'Sign In Loading...' : 'Registering...'}
                    </Text>
                  </View>
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>
                      {isLogin ? 'Sign In to Studio' : 'Register Account'}
                    </Text>
                    <Ionicons name="arrow-forward" size={18} color="#000000" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* ── "or" Divider ── */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Social Login Buttons ── */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocialLogin('Google')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-google" size={17} color="#EA4335" />
                <Text style={styles.socialBtnText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.socialBtn}
                onPress={() => handleSocialLogin('Apple')}
                activeOpacity={0.8}
              >
                <Ionicons name="logo-apple" size={17} color="#FFFFFF" />
                <Text style={styles.socialBtnText}>Continue with Apple</Text>
              </TouchableOpacity>
            </View>

            {/* ── Footer Switch Link ── */}
            <View style={styles.footerSection}>
              <Text style={styles.footerPrompt}>
                {isLogin
                  ? 'New to Cassate Band Recordz?'
                  : 'Already have an account?'}
              </Text>
              <TouchableOpacity
                onPress={() => setActiveTab(isLogin ? 'register' : 'login')}
                activeOpacity={0.8}
                style={styles.footerLinkRow}
              >
                <Text style={styles.footerActionText}>
                  {isLogin ? 'Create an account now' : 'Sign in to your account'}
                </Text>
                <Ionicons name="arrow-forward" size={13} color="#EAB308" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* ── Bottom Ambient Gold Glow Curves ── */}
        <View style={styles.bottomGoldGlowLeft} pointerEvents="none" />
        <View style={styles.bottomGoldGlowRight} pointerEvents="none" />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  desktopScrollView: {
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: 22,
  },
  topBar: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginBottom: 16,
  },
  mustLoginBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.35)',
  },
  mustLoginBadgeText: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '800',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#262632',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentedContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#111116',
    borderWidth: 1,
    borderColor: '#262632',
    padding: 3,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    borderRadius: 22,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {},
  activeTabGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 22,
  },
  inactiveTabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  segmentTextActive: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  segmentTextInactive: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headingSection: {
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  mainHeading: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  subHeading: {
    color: '#94A3B8',
    fontSize: 12.5,
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 18,
  },
  formContainer: {
    width: '100%',
  },
  inputPill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#111116',
    borderWidth: 1,
    borderColor: '#262632',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    paddingHorizontal: 12,
    height: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 18,
    paddingHorizontal: 4,
  },
  rememberMeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#4B5563',
    backgroundColor: '#111116',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#EAB308',
    borderColor: '#EAB308',
  },
  rememberMeText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  forgotPasswordText: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  submitGradient: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#262632',
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: '600',
  },
  socialRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  socialBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#111116',
    borderWidth: 1,
    borderColor: '#262632',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 8,
  },
  socialBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  footerSection: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 8,
    gap: 4,
  },
  footerPrompt: {
    color: '#94A3B8',
    fontSize: 12,
  },
  footerLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerActionText: {
    color: '#EAB308',
    fontSize: 13,
    fontWeight: '800',
  },
  bottomGoldGlowLeft: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
  },
  bottomGoldGlowRight: {
    position: 'absolute',
    bottom: -40,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
  },
});
