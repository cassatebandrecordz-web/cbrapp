import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { soundEffects } from '../src/utils/soundEffects';

export default function ContactStudioScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const handleCall = (number: string = '9025253695') => {
    soundEffects.playClick(850, 0.03);
    Linking.openURL(`tel:+91${number}`).catch(() => {
      Alert.alert('Phone Dial', `Could not initiate call to +91 ${number}`);
    });
  };

  const handleWhatsApp = (number: string = '9025253695') => {
    soundEffects.playClick(850, 0.03);
    Linking.openURL(`https://wa.me/91${number}`).catch(() => {
      Alert.alert('WhatsApp Connect', `Opening WhatsApp chat with +91 ${number}`);
    });
  };

  const handleEmail = (email: string = 'postproduction@cassatebandrecordz.com') => {
    soundEffects.playClick(850, 0.03);
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Studio Email', `Could not open mail client for ${email}`);
    });
  };

  const handleOpenGoogleMaps = () => {
    soundEffects.playClick(850, 0.03);
    const mapsUrl =
      'https://www.google.com/maps/search/?api=1&query=Annai+Illam,+104,+Krishna+St,+Palaniappa+Nagar,+Chennai,+Tamil+Nadu+600087';
    Linking.openURL(mapsUrl).catch(() => {
      Alert.alert('Google Maps', `Opening Google Maps for studio location...`);
    });
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
          <Text style={styles.headerTitle}>CONTACT STUDIO</Text>
          <Text style={styles.headerSubtitle}>YOUR IDEAS, WE'VE DONE IT.</Text>
        </View>

        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          isDesktopWeb && styles.desktopScrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 64 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Studio Brand & Tagline Card ── */}
        <View style={styles.brandHeroCard}>
          <View style={styles.brandLogoWrap}>
            <Image
              source={require('../assets/images/cassate_logo.png')}
              style={styles.brandLogoImg}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.brandTagline}>YOUR IDEAS, WE'VE DONE IT.</Text>
          <Text style={styles.brandSubline}>Your All-In-One Post Production House.</Text>
        </View>

        {/* ── 2. Direct Studio Contact Section ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderPill}>
            <View style={styles.pillIconCircle}>
              <Ionicons name="call" size={11} color="#000000" />
            </View>
            <Text style={styles.sectionHeaderTitle}>Direct Studio Contact</Text>
          </View>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.cardContainer}>
          {/* Primary Phone / Reception Desk */}
          <View style={styles.contactItemRow}>
            <View style={[styles.contactIconCircle, { backgroundColor: '#FEF9C3', borderColor: '#FDE047' }]}>
              <Ionicons name="call" size={16} color="#CA8A04" />
            </View>
            <View style={styles.contactItemContent}>
              <View style={styles.badgeRow}>
                <Text style={styles.contactItemLabel}>Reception & Booking Desk</Text>
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                </View>
              </View>
              <Text style={styles.contactItemValue}>+91 90252 53695</Text>
            </View>
            <TouchableOpacity
              style={styles.actionBtnGold}
              onPress={() => handleCall('9025253695')}
              activeOpacity={0.8}
            >
              <Ionicons name="call" size={12} color="#000000" />
              <Text style={styles.actionBtnTextDark}>Call</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemDivider} />

          {/* Official WhatsApp */}
          <View style={styles.contactItemRow}>
            <View style={[styles.contactIconCircle, { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}>
              <Ionicons name="logo-whatsapp" size={18} color="#16A34A" />
            </View>
            <View style={styles.contactItemContent}>
              <View style={styles.badgeRow}>
                <Text style={styles.contactItemLabel}>Official Studio WhatsApp</Text>
                <View style={[styles.primaryBadge, { backgroundColor: '#DCFCE7', borderColor: '#86EFAC' }]}>
                  <Text style={[styles.primaryBadgeText, { color: '#15803D' }]}>DIRECT</Text>
                </View>
              </View>
              <Text style={styles.contactItemValue}>+91 90252 53695</Text>
            </View>
            <TouchableOpacity
              style={styles.actionBtnGreen}
              onPress={() => handleWhatsApp('9025253695')}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-whatsapp" size={13} color="#FFFFFF" />
              <Text style={styles.actionBtnTextWhite}>Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemDivider} />

          {/* Booking & Production Email (Structured cleanly to never overflow or wrap awkwardly) */}
          <View style={styles.emailItemBlock}>
            <View style={styles.emailHeaderRow}>
              <View style={[styles.contactIconCircle, { backgroundColor: '#E0F2FE', borderColor: '#BAE6FD' }]}>
                <Ionicons name="mail" size={16} color="#0284C7" />
              </View>
              <View style={styles.emailTitleCol}>
                <Text style={styles.contactItemLabel}>Bookings & Ingestion Email</Text>
                <Text style={styles.emailSubLabel}>Direct studio production inbox</Text>
              </View>
              <TouchableOpacity
                style={styles.actionBtnBlue}
                onPress={() => handleEmail('postproduction@cassatebandrecordz.com')}
                activeOpacity={0.8}
              >
                <Ionicons name="mail-outline" size={12} color="#FFFFFF" />
                <Text style={styles.actionBtnTextWhite}>Email</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.emailAddressPill}
              onPress={() => handleEmail('postproduction@cassatebandrecordz.com')}
              activeOpacity={0.7}
            >
              <Ionicons name="at-circle" size={14} color="#0284C7" />
              <Text style={styles.emailAddressPillText} numberOfLines={1}>
                postproduction@cassatebandrecordz.com
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── 3. Studio Address Section ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderPill}>
            <View style={styles.pillIconCircle}>
              <Ionicons name="location" size={11} color="#000000" />
            </View>
            <Text style={styles.sectionHeaderTitle}>Studio Address</Text>
          </View>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.cardContainer}>
          <View style={styles.addressBox}>
            <View style={[styles.contactIconCircle, { backgroundColor: '#FEF9C3', borderColor: '#FDE047', alignSelf: 'flex-start' }]}>
              <Ionicons name="business" size={18} color="#CA8A04" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressTitle}>CBR STUDIO</Text>
              <Text style={styles.addressLinePrimary}>Annai Illam, 104, Krishna St,</Text>
              <Text style={styles.addressLineSecondary}>Palaniappa Nagar, Chennai,</Text>
              <Text style={styles.addressLineSecondary}>Tamil Nadu 600087</Text>
            </View>
          </View>
        </View>

        {/* ── 4. Google Maps Location Section ── */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderPill}>
            <View style={styles.pillIconCircle}>
              <Ionicons name="map" size={11} color="#000000" />
            </View>
            <Text style={styles.sectionHeaderTitle}>Location & Directions</Text>
          </View>
          <View style={styles.sectionHeaderLine} />
        </View>

        <View style={styles.mapCard}>
          {/* Map Preview Graphic */}
          <View style={styles.mapGraphicBox}>
            <LinearGradient
              colors={['#FEF9C3', '#FDE68A', '#FEF08A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.mapGraphicGradient}
            >
              <View style={styles.mapGridLineH1} />
              <View style={styles.mapGridLineH2} />
              <View style={styles.mapGridLineV1} />
              <View style={styles.mapGridLineV2} />

              {/* Centered Map Pin */}
              <View style={styles.mapCenterPinBox}>
                <View style={styles.pinRadarPulse} />
                <View style={styles.pinRadarPulseOuter} />
                <Ionicons name="location" size={34} color="#DC2626" />
              </View>

              <View style={styles.mapBadgePill}>
                <Ionicons name="navigate-circle" size={13} color="#CA8A04" />
                <Text style={styles.mapBadgeText}>Palaniappa Nagar, Chennai 600087</Text>
              </View>
            </LinearGradient>
          </View>

          {/* Google Maps CTA Button */}
          <TouchableOpacity
            style={styles.googleMapsBtn}
            onPress={handleOpenGoogleMaps}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#FACC15', '#EAB308', '#CA8A04']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.googleMapsGradient}
            >
              <Ionicons name="map" size={16} color="#000000" />
              <Text style={styles.googleMapsBtnText}>OPEN IN GOOGLE MAPS</Text>
              <Ionicons name="arrow-forward" size={14} color="#000000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ── 5. Studio Working Hours Card ── */}
        <View style={styles.cardContainer}>
          <View style={styles.hoursRow}>
            <View style={styles.hoursIconBox}>
              <Ionicons name="time-outline" size={18} color="#CA8A04" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hoursTitle}>Studio Working Hours</Text>
              <Text style={styles.hoursDetail}>Monday – Friday: 09:00 AM – 10:00 PM</Text>
              <Text style={styles.hoursDetail}>Saturday – Sunday: 09:00 AM – 11:00 PM</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FBFCF8',
    alignItems: 'center',
    width: '100%',
  },
  topHeader: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 8,
    backgroundColor: '#FBFCF8',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
    zIndex: 20,
  },
  desktopHeader: {
    maxWidth: 440,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
    fontSize: 14.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    color: '#CA8A04',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  headerRightSpacer: {
    width: 34,
    height: 34,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  desktopScrollContent: {
    maxWidth: 440,
    alignSelf: 'center',
  },

  // ── 1. Brand Hero Card ──
  brandHeroCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  brandLogoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  brandLogoImg: {
    width: 140,
    height: 38,
  },
  brandTagline: {
    color: '#CA8A04',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSubline: {
    color: '#6B7280',
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 2,
  },

  // ── Section Header Pills ──
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
    marginTop: 2,
    width: '100%',
  },
  sectionHeaderPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  pillIconCircle: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeaderTitle: {
    color: '#854D0E',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  sectionHeaderLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 8,
  },

  // ── Generic Card Container ──
  cardContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },

  // ── Contact Items ──
  contactItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 2,
    width: '100%',
  },
  contactIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactItemContent: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 2,
  },
  contactItemLabel: {
    color: '#4B5563',
    fontSize: 10.5,
    fontWeight: '700',
  },
  primaryBadge: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  primaryBadgeText: {
    color: '#854D0E',
    fontSize: 7.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  contactItemValue: {
    color: '#111827',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  // ── Email Structured Block ──
  emailItemBlock: {
    width: '100%',
    paddingVertical: 2,
  },
  emailHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    marginBottom: 6,
  },
  emailTitleCol: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  emailSubLabel: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  emailAddressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    width: '100%',
  },
  emailAddressPillText: {
    flex: 1,
    color: '#0369A1',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },

  actionBtnGold: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FACC15',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#16A34A',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 1,
  },
  actionBtnTextDark: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '800',
  },
  actionBtnTextWhite: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 8,
  },

  // ── Address Card ──
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    width: '100%',
  },
  addressTitle: {
    color: '#111827',
    fontSize: 12.5,
    fontWeight: '900',
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  addressLinePrimary: {
    color: '#374151',
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 16,
  },
  addressLineSecondary: {
    color: '#4B5563',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },

  // ── Google Map Card ──
  mapCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 4,
    elevation: 2,
  },
  mapGraphicBox: {
    width: '100%',
    height: 115,
    position: 'relative',
  },
  mapGraphicGradient: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapGridLineH1: {
    position: 'absolute',
    top: 28,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(202, 138, 4, 0.25)',
  },
  mapGridLineH2: {
    position: 'absolute',
    bottom: 28,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(202, 138, 4, 0.25)',
  },
  mapGridLineV1: {
    position: 'absolute',
    left: 55,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(202, 138, 4, 0.25)',
  },
  mapGridLineV2: {
    position: 'absolute',
    right: 55,
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(202, 138, 4, 0.25)',
  },
  mapCenterPinBox: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: -6,
  },
  pinRadarPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(234, 179, 8, 0.3)',
  },
  pinRadarPulseOuter: {
    position: 'absolute',
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  mapBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  mapBadgeText: {
    color: '#1F2937',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  googleMapsBtn: {
    width: '100%',
  },
  googleMapsGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingVertical: 11,
  },
  googleMapsBtnText: {
    color: '#000000',
    fontSize: 11.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // ── Working Hours ──
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  hoursIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FDE047',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hoursTitle: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  hoursDetail: {
    color: '#4B5563',
    fontSize: 10.5,
    fontWeight: '600',
    lineHeight: 15,
  },
});
