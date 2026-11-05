import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Linking,
  Animated,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { GlowCard } from '../../src/components/GlowCard';
import { useApp } from '../../src/context/AppContext';
import { STUDIO_INFO } from '../../src/data/mockData';
import { soundEffects } from '../../src/utils/soundEffects';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { user, bookings, projects, updateProfile, isGuest } = useApp();

  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [isEditing, setIsEditing] = useState(false);

  // Transition Animations
  const entranceFade = useRef(new Animated.Value(0)).current;
  const entranceSlide = useRef(new Animated.Value(18)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceFade, { toValue: 1, duration: 420, useNativeDriver: true }),
      Animated.spring(entranceSlide, { toValue: 0, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSaveProfile = () => {
    soundEffects.playAuthSubmit();
    updateProfile({ name, phone });
    setIsEditing(false);
    Alert.alert('Profile Saved', 'Your studio producer details have been updated.');
  };

  const handleOpenLink = (url: string, title: string) => {
    soundEffects.playClick(850, 0.03);
    Linking.openURL(url).catch(() => {
      Alert.alert(title, `Could not open link:\n${url}`);
    });
  };

  const handleLogout = () => {
    soundEffects.playClick(440, 0.05);
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your studio session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => router.replace('/login'),
        },
      ]
    );
  };

  const isDesktopWeb = Platform.OS === 'web' && width > 520;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 8) }]}>
      {/* ── Top Header Bar (Pearl White & Gold) ── */}
      <View style={[styles.topHeader, isDesktopWeb && styles.desktopHeader]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => {
            soundEffects.playClick(850, 0.03);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)');
            }
          }}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#111827" />
        </TouchableOpacity>

        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Studio Client Profile</Text>
          <Text style={styles.headerSubtitle}>CASSATE BAND RECORDZ</Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          isDesktopWeb && styles.desktopScrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ flex: 1, opacity: entranceFade, transform: [{ translateY: entranceSlide }] }}>
          {/* ── 1. Luxury Profile Card (Pearl & Gold) ── */}
          <GlowCard style={styles.profileCard} borderColor="#EAB308">
            <View style={styles.profileHeader}>
              <View style={styles.avatarCircle}>
                <Ionicons name="person" size={28} color="#CA8A04" />
                <View style={styles.onlineDot} />
              </View>

              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.userName}>{isGuest ? 'Guest Producer' : name}</Text>
                <View style={styles.roleTag}>
                  <Ionicons name={isGuest ? 'person-outline' : 'shield-checkmark'} size={11} color="#CA8A04" />
                  <Text style={styles.userRole}>{isGuest ? 'Guest Mode (Fresh Start)' : 'Verified Client'}</Text>
                </View>
                <Text style={styles.userPhone}>
                  {isGuest ? 'Sign in to sync previous passes' : user.email || phone}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.editBtn}
                onPress={() => {
                  soundEffects.playClick(850, 0.03);
                  setIsEditing(!isEditing);
                }}
                activeOpacity={0.7}
              >
                <Ionicons name={isEditing ? 'close' : 'create-outline'} size={17} color="#111827" />
              </TouchableOpacity>
            </View>

            {isEditing && (
              <View style={styles.editBox}>
                <Text style={styles.editLabel}>Producer / Client Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholderTextColor="#9CA3AF"
                />
                <Text style={[styles.editLabel, { marginTop: 10 }]}>Contact Phone Number</Text>
                <TextInput
                  style={styles.textInput}
                  value={phone}
                  onChangeText={setPhone}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                />
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={handleSaveProfile}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                </TouchableOpacity>
              </View>
            )}
          </GlowCard>

          {/* ── Quick Switch / Sign In Account Card ── */}
          <TouchableOpacity
            style={styles.switchAccountCard}
            onPress={() => {
              soundEffects.playClick(850, 0.03);
              router.push('/login');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.switchAccountLeft}>
              <View style={styles.switchAccountIconBox}>
                <Ionicons name="log-in-outline" size={18} color="#000000" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.switchAccountTitle}>
                  {isGuest ? 'Sign In / Register Account' : 'Switch Studio Account'}
                </Text>
                <Text style={styles.switchAccountSub}>
                  {isGuest ? 'Sign in with Email or Phone to sync your previous passes' : `Active account: ${user.email || user.name}`}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={17} color="#CA8A04" />
          </TouchableOpacity>

          {/* ── Client Navigation Menu ── */}
          <View style={styles.menuContainer}>
            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                soundEffects.playClick(850, 0.03);
                router.push('/my-bookings');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#FEF9C3' }]}>
                <Ionicons name="calendar-outline" size={18} color="#CA8A04" />
              </View>
              <Text style={styles.menuText}>My Studio Bookings & QR Passes</Text>
              <View style={styles.menuCountBadge}>
                <Text style={styles.menuCountText}>{bookings.length}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                soundEffects.playClick(850, 0.03);
                router.push('/(tabs)/projects');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="film-outline" size={18} color="#0284C7" />
              </View>
              <Text style={styles.menuText}>My Active Projects & Production Files</Text>
              <View style={[styles.menuCountBadge, { backgroundColor: '#E0F2FE' }]}>
                <Text style={[styles.menuCountText, { color: '#0284C7' }]}>{projects.length}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                soundEffects.playClick(850, 0.03);
                router.push('/notifications');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#FEF9C3' }]}>
                <Ionicons name="notifications-outline" size={18} color="#CA8A04" />
              </View>
              <Text style={styles.menuText}>Notifications & Studio Alerts</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuRow}
              onPress={() => {
                soundEffects.playClick(850, 0.03);
                router.push('/contact');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="call-outline" size={18} color="#16A34A" />
              </View>
              <Text style={styles.menuText}>Contact Studio Reception</Text>
              <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* ── 4. Connect With Us Section ── */}
          <View style={styles.connectUsBlock}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionHeaderPill}>
                <View style={styles.pillIconCircle}>
                  <Ionicons name="share-social" size={13} color="#000000" />
                </View>
                <Text style={styles.sectionHeaderTitle}>Connect With Us</Text>
              </View>
              <View style={styles.sectionHeaderLine} />
            </View>

            <View style={styles.socialCardsRow}>
              {/* Instagram */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleOpenLink(STUDIO_INFO.socials.instagram, 'Instagram')}
                activeOpacity={0.75}
              >
                <View style={[styles.socialIconBox, { backgroundColor: '#FDF2F8' }]}>
                  <Ionicons name="logo-instagram" size={22} color="#E1306C" />
                </View>
                <Text style={styles.socialCardLabel}>Instagram</Text>
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleOpenLink(STUDIO_INFO.socials.linkedin, 'LinkedIn')}
                activeOpacity={0.75}
              >
                <View style={[styles.socialIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="logo-linkedin" size={22} color="#0A66C2" />
                </View>
                <Text style={styles.socialCardLabel}>LinkedIn</Text>
              </TouchableOpacity>

              {/* Google Business / Maps */}
              <TouchableOpacity
                style={styles.socialCard}
                onPress={() => handleOpenLink(STUDIO_INFO.socials.googleMyBusiness, 'Google My Business')}
                activeOpacity={0.75}
              >
                <View style={[styles.socialIconBox, { backgroundColor: '#FEF9C3' }]}>
                  <Ionicons name="logo-google" size={21} color="#CA8A04" />
                </View>
                <Text style={styles.socialCardLabel}>Google Review</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── 5. Sign Out Button ── */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" />
            <Text style={styles.logoutBtnText}>Sign Out Studio Account</Text>
          </TouchableOpacity>

          {/* ── 6. App Info Footer ── */}
          <View style={styles.footerInfo}>
            <Text style={styles.footerBrand}>CASSATE BAND RECORDZ</Text>
            <Text style={styles.footerTagline}>Your Ideas, We've Done It.</Text>
            <Text style={styles.footerVersion}>Mobile Production Client v1.0 • Studio Suite</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFCF8', // Pearl White Canvas
  },
  topHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FBFCF8',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
    zIndex: 20,
  },
  desktopHeader: {
    maxWidth: 440,
    alignSelf: 'center',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  headerSubtitle: {
    color: '#CA8A04',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginTop: 1,
  },
  headerRightSpacer: {
    width: 36,
    height: 36,
  },
  scrollContent: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  desktopScrollContent: {
    maxWidth: 440,
    alignSelf: 'center',
  },

  // ── Profile Card Styles ──
  profileCard: {
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 3,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEF9C3',
    borderWidth: 1.5,
    borderColor: '#CA8A04',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16A34A',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  userName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  userRole: {
    color: '#854D0E',
    fontSize: 11,
    fontWeight: '800',
  },
  userPhone: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  editBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBox: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E9EAE5',
  },
  editLabel: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#F5F6F1',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: '#FACC15',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 2,
  },
  saveBtnText: {
    color: '#000000',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  // ── Switch Account Card ──
  switchAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 2,
  },
  switchAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  switchAccountIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  switchAccountTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
  },
  switchAccountSub: {
    color: '#6B7280',
    fontSize: 10.5,
    fontWeight: '500',
    marginTop: 1,
  },
  // ── Client Navigation Menu ──
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 4,
    paddingHorizontal: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  menuIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuText: {
    color: '#111827',
    fontSize: 12.5,
    fontWeight: '700',
    flex: 1,
  },
  menuCountBadge: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  menuCountText: {
    color: '#854D0E',
    fontSize: 10.5,
    fontWeight: '800',
  },
  divider: {
    height: 1,
    backgroundColor: '#E9EAE5',
  },

  // ── Connect With Us ──
  connectUsBlock: {
    marginTop: 18,
    marginBottom: 6,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 3.5,
    gap: 7,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  pillIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#EAB308',
    marginLeft: 8,
    borderRadius: 1,
    opacity: 0.85,
  },
  socialCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  socialCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  socialIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  socialCardLabel: {
    color: '#111827',
    fontSize: 10.5,
    fontWeight: '800',
    textAlign: 'center',
  },

  // ── Logout Button ──
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 12.5,
    fontWeight: '800',
  },

  // ── Footer ──
  footerInfo: {
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 8,
  },
  footerBrand: {
    color: '#111827',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footerTagline: {
    color: '#CA8A04',
    fontSize: 9.5,
    fontStyle: 'italic',
    fontWeight: '600',
    marginTop: 2,
  },
  footerVersion: {
    color: '#6B7280',
    fontSize: 9,
    marginTop: 3,
    fontWeight: '500',
  },
});
