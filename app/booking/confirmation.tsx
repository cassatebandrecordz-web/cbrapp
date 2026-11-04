import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { Header } from '../../src/components/Header';
import { GlowCard } from '../../src/components/GlowCard';
import { DemoNoticeBanner } from '../../src/components/DemoNoticeBanner';
import { useApp } from '../../src/context/AppContext';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookingId, code } = useLocalSearchParams<{ bookingId: string; code: string }>();
  const { bookings } = useApp();

  const booking = bookings.find((b) => b.id === bookingId) || bookings[0];

  const handleAddToCalendar = async () => {
    try {
      const serviceName = booking?.serviceName || 'Studio Session';
      const studioName = booking?.studioName || 'Dubbing Suite';
      const refCode = booking?.referenceCode || code || 'CBR-PASS';
      const dateStr = booking?.date || '';
      const timeStr = booking?.timeSlot || '';

      // Parse date into Year, Month, Day
      let year = new Date().getFullYear();
      let month = new Date().getMonth() + 1;
      let day = new Date().getDate();

      if (dateStr) {
        const match = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
        if (match) {
          year = parseInt(match[1]);
          month = parseInt(match[2]);
          day = parseInt(match[3]);
        }
      }

      // Parse time into Start Hour and Minute
      let startHour = 10;
      let startMin = 0;
      if (timeStr) {
        const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
        if (timeMatch) {
          startHour = parseInt(timeMatch[1]);
          if (timeMatch[3].toUpperCase() === 'PM' && startHour < 12) startHour += 12;
          if (timeMatch[3].toUpperCase() === 'AM' && startHour === 12) startHour = 0;
          startMin = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        }
      }

      const pad = (n: number) => String(n).padStart(2, '0');
      const endHour = (startHour + 2) % 24;
      const startIso = `${year}${pad(month)}${pad(day)}T${pad(startHour)}${pad(startMin)}00`;
      const endIso = `${year}${pad(month)}${pad(day)}T${pad(endHour)}${pad(startMin)}00`;

      const title = encodeURIComponent(`Cassate Band Recordz - ${serviceName}`);
      const details = encodeURIComponent(
        `Studio Reservation Pass\nService: ${serviceName}\nReference Code: ${refCode}\nRoom: ${studioName}\nReserved Time: ${timeStr}\n\nClient: ${booking?.clientName || 'Studio Client'}\nPhone: +91 90252 53695\nCassate Band Recordz Post Production Studio`
      );
      const location = encodeURIComponent('Cassate Band Recordz Post Production Studio, Chennai');

      const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;

      const supported = await Linking.canOpenURL(gCalUrl);
      if (supported) {
        await Linking.openURL(gCalUrl);
      } else {
        await Linking.openURL(gCalUrl);
      }
    } catch (err) {
      Alert.alert(
        'Calendar Event',
        `Session for ${booking?.serviceName} on ${booking?.date} at ${booking?.timeSlot}.\n\nPlease check your calendar app to save this booking.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Header
        title="BOOKING CONFIRMED"
        subtitle="Studio Reservation Pass"
        showBack={true}
        onBack={() => router.replace('/(tabs)/booking')}
        rightAction={
          <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="close-circle-outline" size={24} color="#111827" />
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <DemoNoticeBanner />

        {/* Success Icon Hero */}
        <View style={styles.successHero}>
          <View style={styles.checkIconOuter}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.checkIconInner}
            >
              <Ionicons name="checkmark" size={32} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.confirmedTitle}>Studio Session Reserved!</Text>
          <Text style={styles.confirmedSub}>
            Your demo booking is logged in the studio schedule.
          </Text>
        </View>

        {/* Digital Studio Pass Card with QR mockup */}
        <GlowCard style={styles.passCard}>
          {/* Top Pass Bar */}
          <View style={styles.passHeader}>
            <View>
              <Text style={styles.passBrand}>CASSATE BAND RECORDZ</Text>
              <Text style={styles.passSubtitle}>STUDIO ACCESS PASS</Text>
            </View>
            <View style={styles.confirmedBadge}>
              <Text style={styles.confirmedBadgeText}>CONFIRMED</Text>
            </View>
          </View>

          {/* Reference Code & QR Mockup */}
          <View style={styles.qrRow}>
            <View style={styles.qrCodeBox}>
              <Ionicons name="qr-code" size={72} color="#111827" />
            </View>
            <View style={styles.qrTextCol}>
              <Text style={styles.refCodeLabel}>REFERENCE CODE</Text>
              <Text style={styles.refCodeVal}>{booking?.referenceCode || code || 'CBR-2026-9042'}</Text>
              <Text style={styles.presentText}>Present this digital pass at studio reception.</Text>
            </View>
          </View>

          <View style={styles.passDivider} />

          {/* Details Grid */}
          <View style={styles.passDetailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>SERVICE</Text>
              <Text style={styles.detailValue}>{booking?.serviceName}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>STUDIO ROOM</Text>
              <Text style={styles.detailValue}>
                {booking?.studioName && booking?.studioName !== 'Studio A'
                  ? booking.studioName
                  : 'Dubbing Suite'}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>DATE</Text>
              <Text style={styles.detailValue}>{booking?.date}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TIME WINDOW</Text>
              <Text style={styles.detailValue}>{booking?.timeSlot}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>PAYMENT METHOD</Text>
              <Text style={styles.detailValue}>{booking?.paymentMethod}</Text>
            </View>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>TOTAL AMOUNT</Text>
              <Text style={[styles.detailValue, { color: COLORS.primary, fontWeight: '900' }]}>
                ₹{booking?.totalPrice?.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </GlowCard>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.calendarBtn}
            onPress={handleAddToCalendar}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={18} color={COLORS.primary} />
            <Text style={styles.calendarBtnText}>Add Session to Calendar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryActionBtn}
            onPress={() => router.push('/my-bookings')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#EAB308', '#CA8A04']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionGradient}
            >
              <Text style={styles.actionBtnText}>VIEW ALL MY BOOKINGS</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.returnHomeBtn}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.returnHomeText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flexGrow: 1,
    padding: 16,
  },
  successHero: {
    alignItems: 'center',
    marginVertical: 14,
  },
  checkIconOuter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmedTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
    marginTop: 10,
  },
  confirmedSub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  passCard: {
    padding: 18,
    marginTop: 6,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  passBrand: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  passSubtitle: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
  },
  confirmedBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  confirmedBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '900',
  },
  qrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
  },
  qrCodeBox: {
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qrTextCol: {
    flex: 1,
  },
  refCodeLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
  },
  refCodeVal: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    fontFamily: 'monospace',
    marginVertical: 3,
  },
  presentText: {
    color: '#6B7280',
    fontSize: 11,
    lineHeight: 15,
  },
  passDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },
  passDetailsGrid: {
    gap: 10,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
  },
  detailValue: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: 20,
    gap: 10,
  },
  calendarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  calendarBtnText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '700',
  },
  primaryActionBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  returnHomeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  returnHomeText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
});
