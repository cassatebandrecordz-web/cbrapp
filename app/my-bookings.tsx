import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { Header } from '../src/components/Header';
import { GlowCard } from '../src/components/GlowCard';
import { StatusBadge } from '../src/components/StatusBadge';
import { DemoNoticeBanner } from '../src/components/DemoNoticeBanner';
import { useApp } from '../src/context/AppContext';

export default function MyBookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings, cancelBooking, refreshBookings, user, isGuest } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshBookings();
    setRefreshing(false);
  };

  const [activeTab, setActiveTab] = useState<'All' | 'Upcoming' | 'Past'>('All');

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'Upcoming') return b.status === 'Confirmed' || b.status === 'In Session';
    if (activeTab === 'Past') return b.status === 'Completed' || b.status === 'Rescheduled';
    return true;
  });

  const handleCancelDemo = (id: string, refCode: string) => {
    Alert.alert(
      'Reschedule Session (Demo)',
      `Are you sure you want to mark session ${refCode} for rescheduling?`,
      [
        { text: 'Keep Session', style: 'cancel' },
        {
          text: 'Mark Rescheduled',
          style: 'destructive',
          onPress: () => {
            cancelBooking(id);
            Alert.alert('Session Updated', 'Your session status has been updated to Rescheduled in this demo.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Header
        title="MY STUDIO BOOKINGS"
        subtitle="Active & Historical Sessions"
        showBack={true}
        showContact={true}
      />

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={['#EAB308', '#CA8A04']}
          />
        }
      >
        <DemoNoticeBanner compact={true} />

        {/* Filter Tabs */}
        <View style={styles.tabFilterRow}>
          {(['All', 'Upcoming', 'Past'] as const).map((tab) => {
            const isSelected = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.filterTab, isSelected && styles.filterTabActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.filterTabText, isSelected && styles.filterTabTextActive]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bookings List (Account-Synced Passes Only) */}
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={44} color="#64748B" />
            <Text style={styles.emptyTitle}>No Sessions Found</Text>
            <Text style={styles.emptySub}>
              {isGuest
                ? 'You are exploring in Guest Mode with a fresh start page. Book a studio session to generate an entry pass, or Sign In to sync your registered account passes.'
                : `No bookings found under "${activeTab}" for ${user.email || 'your account'}.`}
            </Text>
            {isGuest && (
              <TouchableOpacity
                style={styles.signInSyncBtn}
                onPress={() => router.push('/login')}
                activeOpacity={0.85}
              >
                <Ionicons name="log-in-outline" size={15} color="#000000" />
                <Text style={styles.signInSyncBtnText}>Sign In to Sync Previous Passes</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.bookingsList}>
            {filteredBookings.map((b) => (
              <GlowCard key={b.id} style={styles.bookingCard}>
                <View style={styles.cardHeader}>
                  <View style={styles.dateBadge}>
                    <Text style={styles.dateMonth}>
                      {new Date(b.date).toLocaleString('default', { month: 'short' }).toUpperCase()}
                    </Text>
                    <Text style={styles.dateDay}>{new Date(b.date).getDate()}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.serviceTitle}>{b.serviceName}</Text>
                    <Text style={styles.studioSubtitle}>{b.studioName}</Text>
                  </View>

                  <StatusBadge status={b.status} />
                </View>

                {/* Details Row */}
                <View style={styles.detailsBox}>
                  <View style={styles.infoRow}>
                    <Ionicons name="time-outline" size={13} color="#94A3B8" />
                    <Text style={styles.infoText}>{b.timeSlot} ({b.durationHours} hrs)</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="wallet-outline" size={13} color="#94A3B8" />
                    <Text style={styles.infoText}>
                      Method: {b.paymentMethod} • ₹{b.totalPrice?.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="barcode-outline" size={13} color="#94A3B8" />
                    <Text style={styles.refText}>Pass Code: {b.referenceCode}</Text>
                  </View>
                  {b.notes ? (
                    <Text style={styles.notesText} numberOfLines={2}>
                      Notes: "{b.notes}"
                    </Text>
                  ) : null}
                </View>

                {/* Actions Footer */}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.viewPassBtn}
                    onPress={() =>
                      router.push({
                        pathname: '/booking/confirmation',
                        params: { bookingId: b.id, code: b.referenceCode },
                      })
                    }
                  >
                    <Ionicons name="qr-code-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.viewPassText}>View Studio Pass</Text>
                  </TouchableOpacity>

                  {b.status === 'Confirmed' && (
                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => handleCancelDemo(b.id, b.referenceCode)}
                    >
                      <Text style={styles.cancelText}>Reschedule / Modify</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </GlowCard>
            ))}
          </View>
        )}

        {/* Book Another Session CTA */}
        <TouchableOpacity
          style={styles.bookNewBtn}
          onPress={() => router.push('/(tabs)/booking')}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#EAB308', '#CA8A04']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.btnGradient}
          >
            <Ionicons name="add-circle-outline" size={20} color="#0A0A0E" />
            <Text style={styles.btnText}>BOOK ANOTHER SESSION</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  tabFilterRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F6F1',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginVertical: 10,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  filterTabTextActive: {
    color: '#FBFCF8',
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  signInSyncBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FACC15',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 16,
  },
  signInSyncBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  bookingsList: {
    gap: 12,
  },
  bookingCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dateBadge: {
    width: 46,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    color: COLORS.primaryLight,
    fontSize: 10,
    fontWeight: '800',
  },
  dateDay: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '900',
  },
  serviceTitle: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '800',
  },
  studioSubtitle: {
    color: COLORS.primaryLight,
    fontSize: 11,
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: '#FBFCF8',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    gap: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    color: '#374151',
    fontSize: 11,
  },
  refText: {
    color: COLORS.primary,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
  },
  notesText: {
    color: '#6B7280',
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  viewPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  viewPassText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  cancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '600',
  },
  bookNewBtn: {
    borderRadius: 14,
    marginTop: 20,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  btnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  btnText: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
});
