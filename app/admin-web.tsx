import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { GlowCard } from '../src/components/GlowCard';
import { useApp } from '../src/context/AppContext';

export default function WebAdminPortalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings, projects, cancelBooking, updateProjectProgress } = useApp();

  const [activeTab, setActiveTab] = useState<'bookings' | 'projects' | 'clients' | 'invoices'>('bookings');
  const [bookingFilter, setBookingFilter] = useState<'all' | 'confirmed' | 'pending'>('all');
  const [projectFilter, setProjectFilter] = useState<'all' | 'review' | 'progress'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleApprove = (code: string) => {
    showNotice(`Booking #${code} has been marked APPROVED & studio pass sent to client.`);
  };

  const handleCheckIn = (code: string) => {
    showNotice(`Client for Booking #${code} has been checked into Studio A booth.`);
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'confirmed') return b.status === 'Confirmed';
    if (bookingFilter === 'pending') return b.status !== 'Confirmed';
    return true;
  });

  const filteredProjects = projects.filter((p) => {
    if (projectFilter === 'review') return p.status === 'Review';
    if (projectFilter === 'progress') return p.status === 'In Progress';
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Desktop Web Admin Navbar */}
      <View style={styles.webNavbar}>
        <View style={styles.navBrandCol}>
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backToAppBtn}>
            <Ionicons name="arrow-back" size={16} color={COLORS.primary} />
            <Text style={styles.backToAppText}>Client App</Text>
          </TouchableOpacity>
          <View style={styles.brandDivider} />
          <Image
            source={require('../assets/images/brand_logo_boombox.png')}
            style={{ width: 34, height: 25, marginRight: 4 }}
            resizeMode="contain"
          />
          <View>
            <Text style={styles.webPortalTitle}>CASSATE BAND RECORDZ</Text>
            <Text style={styles.webPortalSub}>YOUR IDEAS, WE'VE DONE IT. • Web Admin Operations</Text>
          </View>
        </View>

        <View style={styles.navStatusCol}>
          <View style={styles.hotlinePillGroup}>
            <TouchableOpacity
              style={styles.hotlinePillPrimary}
              onPress={() => Linking.openURL('tel:9025253695').catch(() => {})}
            >
              <Ionicons name="call" size={11} color="#0A0A0E" />
              <Text style={styles.hotlineTextPrimary}>9025253695</Text>
              <View style={styles.primaryBadgeSmall}>
                <Text style={styles.primaryBadgeSmallText}>PRIMARY</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.hotlinePillSecondary}
              onPress={() => Linking.openURL('tel:7010012232').catch(() => {})}
            >
              <Ionicons name="call-outline" size={11} color={COLORS.primary} />
              <Text style={styles.hotlineTextSecondary}>7010012232</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.statusLivePill}>
            <View style={styles.livePulseDot} />
            <Text style={styles.statusLiveText}>3 SUITES ONLINE • DOLBY ATMOS 9.1.4</Text>
          </View>
          <View style={styles.adminUserPill}>
            <Ionicons name="shield-checkmark" size={14} color={COLORS.primary} />
            <Text style={styles.adminUserName}>Devon Vance (Admin)</Text>
          </View>
        </View>
      </View>

      {/* Floating Action Notice Toast */}
      {actionNotice && (
        <View style={styles.toastNotice}>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.primary} />
          <Text style={styles.toastText}>{actionNotice}</Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={true}
      >
        {/* KPI Metric Cards Row (Studio Gold & White) */}
        <View style={styles.kpiRow}>
          <GlowCard style={styles.kpiCard} borderColor="#38321E">
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.14)' }]}>
                <Ionicons name="calendar" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.kpiBadge}>Today</Text>
            </View>
            <Text style={styles.kpiValue}>12</Text>
            <Text style={styles.kpiLabel}>Today Bookings</Text>
            <Text style={styles.kpiSub}>5 Dubbing • 4 VO • 3 Mixing</Text>
          </GlowCard>

          <GlowCard style={styles.kpiCard} borderColor="#1E2A38">
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(56, 189, 248, 0.14)' }]}>
                <Ionicons name="pulse" size={18} color="#38BDF8" />
              </View>
              <Text style={[styles.kpiBadge, { color: '#38BDF8', borderColor: '#38BDF8' }]}>Active</Text>
            </View>
            <Text style={[styles.kpiValue, { color: '#38BDF8' }]}>8</Text>
            <Text style={styles.kpiLabel}>Projects In Progress</Text>
            <Text style={styles.kpiSub}>4 Cut • 3 Review • 1 QC</Text>
          </GlowCard>

          <GlowCard style={styles.kpiCard} borderColor="#1E382A">
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(16, 185, 129, 0.14)' }]}>
                <Ionicons name="checkmark-done" size={18} color="#10B981" />
              </View>
              <Text style={[styles.kpiBadge, { color: '#10B981', borderColor: '#10B981' }]}>Completed</Text>
            </View>
            <Text style={[styles.kpiValue, { color: '#10B981' }]}>36</Text>
            <Text style={styles.kpiLabel}>Delivered Masters</Text>
            <Text style={styles.kpiSub}>100% On-time OTT delivery</Text>
          </GlowCard>

          <GlowCard style={styles.kpiCard} borderColor="#38321E">
            <View style={styles.kpiHeader}>
              <View style={[styles.kpiIconBox, { backgroundColor: 'rgba(234, 179, 8, 0.14)' }]}>
                <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
              </View>
              <Text style={styles.kpiBadge}>Revenue</Text>
            </View>
            <Text style={styles.kpiValue}>₹2,48,500</Text>
            <Text style={styles.kpiLabel}>Month-to-Date</Text>
            <Text style={styles.kpiSub}>18% GST Accounted</Text>
          </GlowCard>
        </View>

        {/* Web Admin Portal Tabs Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'bookings' && styles.tabBtnActive]}
            onPress={() => setActiveTab('bookings')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={activeTab === 'bookings' ? '#0A0A0E' : '#A1A1AA'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'bookings' && styles.tabBtnTextActive]}>
              Studio Bookings Desk ({bookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'projects' && styles.tabBtnActive]}
            onPress={() => setActiveTab('projects')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="film-outline"
              size={16}
              color={activeTab === 'projects' ? '#0A0A0E' : '#A1A1AA'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'projects' && styles.tabBtnTextActive]}>
              Project Pipeline ({projects.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'clients' && styles.tabBtnActive]}
            onPress={() => setActiveTab('clients')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="people-outline"
              size={16}
              color={activeTab === 'clients' ? '#0A0A0E' : '#A1A1AA'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'clients' && styles.tabBtnTextActive]}>
              Client Directory
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'invoices' && styles.tabBtnActive]}
            onPress={() => setActiveTab('invoices')}
            activeOpacity={0.8}
          >
            <Ionicons
              name="receipt-outline"
              size={16}
              color={activeTab === 'invoices' ? '#0A0A0E' : '#A1A1AA'}
            />
            <Text style={[styles.tabBtnText, activeTab === 'invoices' && styles.tabBtnTextActive]}>
              Invoices & GST
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= TAB 1: BOOKINGS DESK ================= */}
        {activeTab === 'bookings' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Studio Session Bookings</Text>
                <Text style={styles.sectionSub}>Manage booth reservations, schedule approvals and client check-in</Text>
              </View>

              {/* Booking Filters */}
              <View style={styles.filterGroup}>
                <TouchableOpacity
                  style={[styles.filterChip, bookingFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setBookingFilter('all')}
                >
                  <Text style={[styles.filterChipText, bookingFilter === 'all' && styles.filterChipTextActive]}>
                    All ({bookings.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterChip, bookingFilter === 'confirmed' && styles.filterChipActive]}
                  onPress={() => setBookingFilter('confirmed')}
                >
                  <Text style={[styles.filterChipText, bookingFilter === 'confirmed' && styles.filterChipTextActive]}>
                    Confirmed
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterChip, bookingFilter === 'pending' && styles.filterChipActive]}
                  onPress={() => setBookingFilter('pending')}
                >
                  <Text style={[styles.filterChipText, bookingFilter === 'pending' && styles.filterChipTextActive]}>
                    Pending ({bookings.filter((b) => b.status !== 'Confirmed').length})
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Bookings List Cards */}
            {filteredBookings.map((b) => (
              <GlowCard key={b.id} style={styles.bookingRowCard} borderColor="#2E2E3C">
                <View style={styles.bookingCardHeader}>
                  <View style={styles.bookingCodeCol}>
                    <Text style={styles.bookingCode}>Pass: {b.referenceCode}</Text>
                    <Text style={styles.bookingServiceName}>{b.serviceName}</Text>
                    <Text style={styles.bookingStudioRoom}>{b.studioName} • {b.durationHours} Hours</Text>
                  </View>

                  <View style={styles.bookingStatusCol}>
                    <View style={styles.confirmedBadge}>
                      <Ionicons name="checkmark-circle" size={12} color="#10B981" />
                      <Text style={styles.confirmedBadgeText}>{b.status.toUpperCase()}</Text>
                    </View>
                    <Text style={styles.bookingPrice}>₹{b.totalPrice.toLocaleString()}</Text>
                  </View>
                </View>

                <View style={styles.bookingDivider} />

                <View style={styles.bookingFooterRow}>
                  <View style={styles.dateTimeRow}>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.primary} />
                    <Text style={styles.dateTimeText}>{b.date} | {b.timeSlot}</Text>
                  </View>

                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => handleCheckIn(b.referenceCode)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnSecondaryText}>Check-in Client</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnPrimary}
                      onPress={() => handleApprove(b.referenceCode)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionBtnPrimaryText}>Approve Pass</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlowCard>
            ))}
          </View>
        )}

        {/* ================= TAB 2: PROJECTS PIPELINE ================= */}
        {activeTab === 'projects' && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Post-Production Pipeline</Text>
                <Text style={styles.sectionSub}>Review revisions, track timelines, and approve OTT deliveries</Text>
              </View>

              <View style={styles.filterGroup}>
                <TouchableOpacity
                  style={[styles.filterChip, projectFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setProjectFilter('all')}
                >
                  <Text style={[styles.filterChipText, projectFilter === 'all' && styles.filterChipTextActive]}>
                    All ({projects.length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterChip, projectFilter === 'review' && styles.filterChipActive]}
                  onPress={() => setProjectFilter('review')}
                >
                  <Text style={[styles.filterChipText, projectFilter === 'review' && styles.filterChipTextActive]}>
                    Review ({projects.filter((p) => p.status === 'Review').length})
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.filterChip, projectFilter === 'progress' && styles.filterChipActive]}
                  onPress={() => setProjectFilter('progress')}
                >
                  <Text style={[styles.filterChipText, projectFilter === 'progress' && styles.filterChipTextActive]}>
                    In Progress
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {filteredProjects.map((proj) => (
              <GlowCard key={proj.id} style={styles.bookingRowCard} borderColor="#2E2E3C">
                <View style={styles.bookingCardHeader}>
                  <View>
                    <Text style={styles.bookingCode}>Project: {proj.code || proj.id}</Text>
                    <Text style={styles.bookingServiceName}>{proj.title}</Text>
                    <Text style={styles.bookingStudioRoom}>Category: {proj.serviceType || proj.category || 'Post Production'} • Editor: Arjun Soundworks</Text>
                  </View>

                  <View style={styles.bookingStatusCol}>
                    <View
                      style={[
                        styles.confirmedBadge,
                        proj.status === 'Review' && { backgroundColor: 'rgba(234, 179, 8, 0.15)', borderColor: COLORS.primary },
                        proj.status === 'In Progress' && { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38BDF8' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.confirmedBadgeText,
                          proj.status === 'Review' && { color: COLORS.primary },
                          proj.status === 'In Progress' && { color: '#38BDF8' },
                        ]}
                      >
                        {proj.status.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.bookingPrice}>{proj.progressPercent}% Done</Text>
                  </View>
                </View>

                {/* Progress bar */}
                <View style={styles.pipelineBarBg}>
                  <View style={[styles.pipelineBarFill, { width: `${proj.progressPercent}%` }]} />
                </View>

                <View style={styles.bookingFooterRow}>
                  <Text style={styles.dateTimeText}>
                    Files: {proj.files ? proj.files.length : 2} Assets • Due: Nov 28, 2026
                  </Text>

                  <View style={styles.actionBtnRow}>
                    <TouchableOpacity
                      style={styles.actionBtnSecondary}
                      onPress={() => showNotice(`Revision notes for ${proj.title} loaded.`)}
                    >
                      <Text style={styles.actionBtnSecondaryText}>View Notes</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.actionBtnPrimary}
                      onPress={() => {
                        updateProjectProgress(proj.id, 100);
                        showNotice(`Project ${proj.title} marked 100% Mastered & Delivered.`);
                      }}
                    >
                      <Text style={styles.actionBtnPrimaryText}>Mark Mastered</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </GlowCard>
            ))}
          </View>
        )}

        {/* ================= TAB 3: CLIENT DIRECTORY ================= */}
        {activeTab === 'clients' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Registered Studio Clients</Text>
            <Text style={styles.sectionSub}>Film production houses, ad agencies, and voice talents</Text>

            <View style={styles.clientTableCard}>
              {[
                { name: 'Devon Vance', company: 'Vance Audio Visual Works', phone: '+91 98765 43210', role: 'Creative Producer', sessions: 8 },
                { name: 'Rajesh Nair', company: 'CinemaScope Motion Pictures', phone: '+91 98111 22334', role: 'Film Director', sessions: 14 },
                { name: 'Ananya Roy', company: 'Ogilvy Commercials', phone: '+91 98222 33445', role: 'Senior Audio Lead', sessions: 5 },
                { name: 'Karthik Rao', company: 'Indie Sound Records', phone: '+91 98333 44556', role: 'Music Producer', sessions: 11 },
              ].map((client, idx) => (
                <View key={idx} style={[styles.clientTableRow, idx > 0 && styles.clientTableBorder]}>
                  <View style={styles.clientAvatarBox}>
                    <Text style={styles.clientAvatarText}>{client.name.substring(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.clientName}>{client.name}</Text>
                    <Text style={styles.clientCompany}>{client.company} • {client.role}</Text>
                    <Text style={styles.clientPhone}>{client.phone}</Text>
                  </View>
                  <View style={styles.clientSessionCol}>
                    <Text style={styles.clientSessionCount}>{client.sessions} Sessions</Text>
                    <TouchableOpacity
                      style={styles.clientContactBtn}
                      onPress={() => showNotice(`Initiating call with ${client.name} (${client.phone})...`)}
                    >
                      <Ionicons name="call" size={13} color={COLORS.primary} />
                      <Text style={styles.clientContactText}>Contact</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ================= TAB 4: INVOICES & GST ================= */}
        {activeTab === 'invoices' && (
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Invoices & Studio Receipts</Text>
            <Text style={styles.sectionSub}>GST-compliant invoices, advance receipts, and mode breakdown</Text>

            <View style={styles.clientTableCard}>
              {[
                { inv: 'INV-2026-081', client: 'Devon Vance', date: '20 Nov 2026', total: '₹4,720', gst: '₹720', advance: '₹2,360', status: 'Partially Paid (50%)', mode: 'UPI' },
                { inv: 'INV-2026-079', client: 'Rajesh Nair', date: '18 Nov 2026', total: '₹14,160', gst: '₹2,160', advance: '₹14,160', status: 'Fully Paid', mode: 'VISA' },
                { inv: 'INV-2026-075', client: 'Ananya Roy', date: '15 Nov 2026', total: '₹8,260', gst: '₹1,260', advance: '₹8,260', status: 'Fully Paid', mode: 'Razorpay' },
              ].map((inv, idx) => (
                <View key={idx} style={[styles.clientTableRow, idx > 0 && styles.clientTableBorder]}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.clientName}>{inv.inv} • {inv.client}</Text>
                    <Text style={styles.clientCompany}>Date: {inv.date} • Mode: {inv.mode}</Text>
                    <Text style={styles.clientPhone}>GST (18%): {inv.gst} | Adv: {inv.advance}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.bookingPrice}>{inv.total}</Text>
                    <Text style={[styles.confirmedBadgeText, { color: COLORS.primary, marginTop: 4 }]}>{inv.status}</Text>
                    <TouchableOpacity
                      style={[styles.actionBtnSecondary, { marginTop: 6, paddingVertical: 4, paddingHorizontal: 8 }]}
                      onPress={() => showNotice(`Invoice PDF ${inv.inv} downloaded.`)}
                    >
                      <Text style={styles.actionBtnSecondaryText}>Download PDF</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  webNavbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#111116',
    borderBottomWidth: 1,
    borderBottomColor: '#23232E',
  },
  navBrandCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backToAppBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  backToAppText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  brandDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#2A2A38',
  },
  webPortalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  webPortalSub: {
    color: '#A1A1AA',
    fontSize: 10.5,
  },
  navStatusCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  hotlinePillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hotlinePillPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
  },
  hotlineTextPrimary: {
    color: '#0A0A0E',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  primaryBadgeSmall: {
    backgroundColor: '#0A0A0E',
    paddingHorizontal: 3.5,
    paddingVertical: 0.5,
    borderRadius: 3,
  },
  primaryBadgeSmallText: {
    color: COLORS.primary,
    fontSize: 7,
    fontWeight: '900',
  },
  hotlinePillSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.35)',
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: 14,
  },
  hotlineTextSecondary: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  statusLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#2E2E3C',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  statusLiveText: {
    color: '#E4E4E7',
    fontSize: 9.5,
    fontWeight: '800',
  },
  adminUserPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(234, 179, 8, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  adminUserName: {
    color: COLORS.primaryLight,
    fontSize: 11,
    fontWeight: '800',
  },
  toastNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1E1C12',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  scrollContent: {
    padding: 18,
  },
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  kpiCard: {
    flex: 1,
    minWidth: 180,
    padding: 14,
    backgroundColor: '#131319',
    borderRadius: 14,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiBadge: {
    color: COLORS.primary,
    fontSize: 9.5,
    fontWeight: '800',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  kpiLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  kpiSub: {
    color: '#71717A',
    fontSize: 10,
    marginTop: 3,
  },
  tabBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#111116',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#23232E',
    marginBottom: 16,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: COLORS.primary,
  },
  tabBtnText: {
    color: '#A1A1AA',
    fontSize: 11.5,
    fontWeight: '700',
  },
  tabBtnTextActive: {
    color: '#0A0A0E',
    fontWeight: '900',
  },
  sectionContainer: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  sectionSub: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 2,
  },
  filterGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    backgroundColor: '#16161D',
    borderWidth: 1,
    borderColor: '#23232E',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  filterChipActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderColor: COLORS.primary,
  },
  filterChipText: {
    color: '#A1A1AA',
    fontSize: 10.5,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  bookingRowCard: {
    padding: 14,
    backgroundColor: '#131319',
    borderRadius: 14,
    marginBottom: 12,
  },
  bookingCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bookingCodeCol: {
    flex: 1,
  },
  bookingCode: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  bookingServiceName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  bookingStudioRoom: {
    color: '#A1A1AA',
    fontSize: 11,
    marginTop: 1,
  },
  bookingStatusCol: {
    alignItems: 'flex-end',
  },
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  confirmedBadgeText: {
    color: '#10B981',
    fontSize: 9.5,
    fontWeight: '900',
  },
  bookingPrice: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  bookingDivider: {
    height: 1,
    backgroundColor: '#20202A',
    marginVertical: 10,
  },
  bookingFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateTimeText: {
    color: '#E4E4E7',
    fontSize: 11,
    fontWeight: '700',
  },
  actionBtnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSecondary: {
    backgroundColor: '#23232E',
    borderWidth: 1,
    borderColor: '#30303E',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  actionBtnSecondaryText: {
    color: '#E4E4E7',
    fontSize: 10.5,
    fontWeight: '700',
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  actionBtnPrimaryText: {
    color: '#0A0A0E',
    fontSize: 10.5,
    fontWeight: '900',
  },
  pipelineBarBg: {
    height: 5,
    backgroundColor: '#20202A',
    borderRadius: 2.5,
    marginVertical: 10,
    overflow: 'hidden',
  },
  pipelineBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2.5,
  },
  clientTableCard: {
    backgroundColor: '#131319',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#23232E',
    padding: 12,
  },
  clientTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  clientTableBorder: {
    borderTopWidth: 1,
    borderTopColor: '#20202A',
  },
  clientAvatarBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(234, 179, 8, 0.14)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clientAvatarText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '900',
  },
  clientName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  clientCompany: {
    color: '#A1A1AA',
    fontSize: 10.5,
    marginTop: 2,
  },
  clientPhone: {
    color: '#71717A',
    fontSize: 10,
    marginTop: 1,
  },
  clientSessionCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  clientSessionCount: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  clientContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  clientContactText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '800',
  },
});
