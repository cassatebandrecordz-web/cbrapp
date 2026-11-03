import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { GlowCard } from '../../src/components/GlowCard';
import { useApp } from '../../src/context/AppContext';
import { soundEffects } from '../../src/utils/soundEffects';

export default function ConfirmedPassesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { bookings } = useApp();

  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Past'>('All');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'Upcoming') return b.status === 'Confirmed' || b.status === 'In Session';
    if (activeTab === 'Past') return b.status === 'Completed' || b.status === 'Rescheduled';
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── Top Header ── */}
      <View style={styles.topHeader}>
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

        <View style={styles.headerTitleCol}>
          <View style={styles.headerPillRow}>
            <Ionicons name="ticket" size={17} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Confirmed Studio Passes</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{bookings.length}</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            Official entry passes for your reserved studio sessions
          </Text>
        </View>

        {/* Quick New Booking Button */}
        <TouchableOpacity
          style={styles.newBookingIconBtn}
          onPress={() => router.push('/booking/select')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Filter Tabs ── */}
        <View style={styles.tabFilterRow}>
          {(['All', 'Upcoming', 'Past'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isSelected && styles.filterTabActive]}
                onPress={() => setActiveTab(tab)}
                activeOpacity={0.7}
              >
                <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Confirmed Passes List ── */}
        {filteredBookings.length === 0 ? (
          <GlowCard style={styles.emptyCard}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="ticket-outline" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.emptyTitle}>No Studio Passes Yet</Text>
            <Text style={styles.emptySubtitle}>
              You don't have any confirmed bookings under "{activeTab}". Select a studio service or tap below to reserve your slot!
            </Text>

            <TouchableOpacity
              style={styles.emptyCtaBtn}
              onPress={() => router.push('/booking/select')}
              activeOpacity={0.85}
            >
              <Ionicons name="calendar-outline" size={16} color="#FFFFFF" />
              <Text style={styles.emptyCtaBtnText}>Book a Studio Slot →</Text>
            </TouchableOpacity>
          </GlowCard>
        ) : (
          <View style={styles.passListContainer}>
            {filteredBookings.map((item) => (
              <GlowCard key={item.id} style={styles.passTicketCard}>
                {/* Top Bar: Pass Type + Ref Code + Confirmed Status */}
                <View style={styles.passTopBar}>
                  <View style={styles.passTypeBadge}>
                    <Ionicons name="barcode-outline" size={13} color="#92400E" />
                    <Text style={styles.passTypeBadgeText}>STUDIO PASS</Text>
                    <Text style={styles.passRefCodeText}>#{item.referenceCode}</Text>
                  </View>
                  <View style={styles.passConfirmedPill}>
                    <View style={styles.passLiveDot} />
                    <Text style={styles.passConfirmedText}>{item.status.toUpperCase()}</Text>
                  </View>
                </View>

                {/* Main Service Row */}
                <View style={styles.passMainRow}>
                  <View style={styles.passIconBox}>
                    <Ionicons name="mic" size={22} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.passServiceName}>{item.serviceName}</Text>
                    <Text style={styles.passStudioRoom}>
                      {item.studioName === 'Studio A' || !item.studioName
                        ? 'Audio Control Room'
                        : `${item.studioName} • Audio Control Room`}
                    </Text>
                    <View style={styles.passEngineerRow}>
                      <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                      <Text style={styles.passEngineerText}>Dubbing Engineer Included</Text>
                    </View>
                  </View>
                </View>

                {/* Perforated Ticket Divider */}
                <View style={styles.ticketPerforatedRow}>
                  <View style={styles.ticketPunchLeft} />
                  <View style={styles.ticketDashedLine} />
                  <View style={styles.ticketPunchRight} />
                </View>

                {/* Timing & Date Summary Box */}
                <View style={styles.passTimingBox}>
                  <View style={styles.passTimingCol}>
                    <View style={styles.passInfoItem}>
                      <Ionicons name="calendar-outline" size={13} color="#CA8A04" />
                      <Text style={styles.passInfoLabel}>DATE</Text>
                    </View>
                    <Text style={styles.passInfoValue}>{item.date}</Text>
                  </View>

                  <View style={styles.passTimingDivider} />

                  <View style={styles.passTimingCol}>
                    <View style={styles.passInfoItem}>
                      <Ionicons name="time-outline" size={13} color="#CA8A04" />
                      <Text style={styles.passInfoLabel}>TIMINGS</Text>
                    </View>
                    <Text style={styles.passInfoValue} numberOfLines={1}>
                      {item.timeSlot}
                    </Text>
                  </View>
                </View>

                {/* Financials Row */}
                <View style={styles.passFinancialsRow}>
                  <View style={styles.financeItem}>
                    <Text style={styles.financeLabel}>Total Amount</Text>
                    <Text style={styles.financeValue}>₹{item.totalPrice?.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.financeItem}>
                    <Text style={styles.financeLabel}>Payment Status</Text>
                    <Text style={styles.financeValueGreen}>Fully Paid (100%)</Text>
                  </View>
                  <View style={styles.financeItem}>
                    <Text style={styles.financeLabel}>Pass Type</Text>
                    <Text style={styles.financeValueMuted}>Studio Confirmed</Text>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.passActionsRow}>
                  <TouchableOpacity
                    style={styles.passViewBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/booking/confirmation',
                        params: { bookingId: item.id, code: item.referenceCode },
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons name="qr-code-outline" size={15} color="#FFFFFF" />
                    <Text style={styles.passViewBtnText}>View Studio Pass (QR Entry) →</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.passCalendarBtn}
                    onPress={() =>
                      Alert.alert(
                        'Pass Synced',
                        `Session #${item.referenceCode} for ${item.date} (${item.timeSlot}) is synced with your schedule.`
                      )
                    }
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar-sharp" size={15} color="#4B5563" />
                  </TouchableOpacity>
                </View>
              </GlowCard>
            ))}
          </View>
        )}

        {/* ── Book Another Studio Slot Button ── */}
        <TouchableOpacity
          style={styles.bookSlotButton}
          onPress={() => router.push('/booking/select')}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle" size={18} color="#000000" />
          <Text style={styles.bookSlotButtonText}>Book New Studio Slot</Text>
        </TouchableOpacity>
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
  topHeader: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FBFCF8',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  headerTitleCol: {
    flex: 1,
  },
  headerPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  countBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#92400E',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  newBookingIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  scrollContent: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  tabFilterRow: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  filterTabTextActive: {
    color: '#111827',
    fontWeight: '800',
  },
  emptyCard: {
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    marginTop: 20,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 20,
  },
  emptyCtaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  emptyCtaBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
  },
  passListContainer: {
    marginBottom: 16,
  },
  passTicketCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  passTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FAFBF6',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  passTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 5,
  },
  passTypeBadgeText: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.3,
  },
  passRefCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4B5563',
    marginLeft: 4,
  },
  passConfirmedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  passLiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  passConfirmedText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },
  passMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },
  passIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passServiceName: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#111827',
  },
  passStudioRoom: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 1,
  },
  passEngineerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  passEngineerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  ticketPerforatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
    position: 'relative',
  },
  ticketPunchLeft: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.bgPrimary,
    marginLeft: -7,
  },
  ticketDashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  ticketPunchRight: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.bgPrimary,
    marginRight: -7,
  },
  passTimingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9F5',
    marginHorizontal: 14,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ECEEE6',
  },
  passTimingCol: {
    flex: 1,
  },
  passInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  passInfoLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#78716C',
    letterSpacing: 0.3,
  },
  passInfoValue: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#1C1917',
  },
  passTimingDivider: {
    width: 1,
    height: 26,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 10,
  },
  passFinancialsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
  },
  financeItem: {
    alignItems: 'flex-start',
  },
  financeLabel: {
    fontSize: 9.5,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  financeValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  financeValueGreen: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  financeValueMuted: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  passActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 4,
  },
  passViewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#111827',
    paddingVertical: 10,
    borderRadius: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  passViewBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  passCalendarBtn: {
    width: 38,
    height: 38,
    borderRadius: 9,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  bookSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FACC15',
    paddingVertical: 13,
    borderRadius: 12,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
    marginTop: 8,
    marginBottom: 20,
  },
  bookSlotButtonText: {
    color: '#000000',
    fontSize: 13.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
