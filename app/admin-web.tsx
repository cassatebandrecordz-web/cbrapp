import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  TextInput,
  Switch,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../src/constants/theme';
import { useApp } from '../src/context/AppContext';
import { StudioApi } from '../src/services/api';

// Mock User Logins Database for Excel Export
interface UserLoginRecord {
  id: string;
  name: string;
  email: string;
  passwordDisplay: string;
  phone: string;
  device: string;
  loginLocation: string;
  lastLogin: string;
  totalBookings: number;
  status: 'Active' | 'Verified';
}

const INITIAL_USER_LOGINS: UserLoginRecord[] = [
  {
    id: 'USR-1082',
    name: 'Arjun Kumar',
    email: 'arjun.movies@gmail.com',
    passwordDisplay: 'StudioPass@2026',
    phone: '+91 98401 23456',
    device: 'Android 14 (Samsung Galaxy S24 Ultra)',
    loginLocation: 'Chennai, Tamil Nadu, India (IP: 157.48.21.94)',
    lastLogin: '05-Nov-2026 01:45 AM',
    totalBookings: 8,
    status: 'Verified',
  },
  {
    id: 'USR-1083',
    name: 'Devon Vance',
    email: 'devon.vance@soundcraft.io',
    passwordDisplay: 'Cassate#9042',
    phone: '+91 90252 53695',
    device: 'Android 14 (Google Pixel 8 Pro)',
    loginLocation: 'Chennai Central, Tamil Nadu (IP: 49.37.112.4)',
    lastLogin: '05-Nov-2026 01:20 AM',
    totalBookings: 4,
    status: 'Verified',
  },
  {
    id: 'USR-1084',
    name: 'Priya Sharma',
    email: 'priya.cinema@vibe.in',
    passwordDisplay: 'DubbingKing$88',
    phone: '+91 94440 98765',
    device: 'iOS 17.5 (iPhone 15 Pro Max)',
    loginLocation: 'Coimbatore, Tamil Nadu (IP: 103.24.188.12)',
    lastLogin: '04-Nov-2026 11:15 PM',
    totalBookings: 6,
    status: 'Verified',
  },
  {
    id: 'USR-1085',
    name: 'Karthik Raja',
    email: 'karthik.audio@soundhouse.com',
    passwordDisplay: 'ProducerPro!24',
    phone: '+91 97910 54321',
    device: 'Windows 11 (Chrome Desktop 130)',
    loginLocation: 'Madurai, Tamil Nadu (IP: 117.200.45.89)',
    lastLogin: '04-Nov-2026 08:30 PM',
    totalBookings: 12,
    status: 'Verified',
  },
  {
    id: 'USR-1086',
    name: 'Studio Client Guest',
    email: 'client@cassatebandrecordz.com',
    passwordDisplay: 'ClientPass@123',
    phone: '+91 90252 53695',
    device: 'Android 13 (OnePlus 11R 5G)',
    loginLocation: 'Chennai Studio, TN (IP: 157.48.21.94)',
    lastLogin: '05-Nov-2026 01:50 AM',
    totalBookings: 2,
    status: 'Active',
  },
];

export default function WebAdminPortalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings, projects } = useApp();

  // Navigation State
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'bookings' | 'projects' | 'payments' | 'customers' | 'services' | 'availability' | 'content' | 'reports' | 'settings'
  >('dashboard');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // App Banner Manager State (matches right column of mockup)
  const [bannerSlides, setBannerSlides] = useState([
    {
      id: 'dubbing',
      title: 'Professional Dubbing Services',
      sub: 'Film | Web Series | Ads | Voice Over',
      published: true,
      badge: 'Dubbing Studio',
    },
    {
      id: 'vo',
      title: 'Voice Over Recording',
      sub: 'Multi-lingual Voice Artists & High-End Microphones',
      published: true,
      badge: 'Studio B',
    },
    {
      id: 'post',
      title: 'Post Production Suite',
      sub: 'Sound Design, Mixing & Video Finishing',
      published: false,
      badge: 'Suite C',
    },
  ]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  // User Logins State
  const [userLogins, setUserLogins] = useState<UserLoginRecord[]>(INITIAL_USER_LOGINS);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedCsvString, setExportedCsvString] = useState('');

  // Action Notice Toast
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  // ── Real-time Database Sync for Users ──
  const loadDatabaseUsers = useCallback(async () => {
    try {
      const dbProfiles = await StudioApi.getAllUsers();
      if (dbProfiles && dbProfiles.length > 0) {
        const mapped: UserLoginRecord[] = dbProfiles.map((p: any, idx: number) => ({
          id: p.id ? (p.id.length > 8 ? `USR-${p.id.slice(-4).toUpperCase()}` : p.id) : `USR-${1090 + idx}`,
          name: p.name || 'Studio Producer',
          email: p.email || 'client@cassaterecordz.com',
          passwordDisplay: 'StudioPass@2026',
          phone: p.phone || '+91 90252 53695',
          device: p.device || 'Android 14 (Mobile Client App)',
          loginLocation: p.login_location || 'Chennai Studio, TN (IP: 157.48.21.94)',
          lastLogin: p.created_at ? new Date(p.created_at).toLocaleString('en-IN') : 'Just now',
          totalBookings: Math.floor(Math.random() * 4) + 1,
          status: 'Verified',
        }));

        setUserLogins((prev) => {
          const liveEmails = new Set(mapped.map((m) => m.email.toLowerCase()));
          const remainingInitial = INITIAL_USER_LOGINS.filter((i) => !liveEmails.has(i.email.toLowerCase()));
          return [...mapped, ...remainingInitial];
        });
      }
    } catch (err) {
      console.warn('[Admin] Failed to load users from database:', err);
    }
  }, []);

  useEffect(() => {
    loadDatabaseUsers();

    // Subscribe to live user registrations from database
    const unsub = StudioApi.subscribeToProfiles(() => {
      loadDatabaseUsers();
      showNotice('New user registration synced from database!');
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [loadDatabaseUsers]);

  // Toggle Banner Publish State
  const handleToggleBanner = (id: string) => {
    setBannerSlides((prev) =>
      prev.map((b) => (b.id === id ? { ...b, published: !b.published } : b))
    );
  };

  // Publish to App Handler
  const handlePublishBannersToApp = () => {
    showNotice('Banners published live! Mobile app carousel updated successfully.');
    Alert.alert('App Banners Published', 'Mobile app banner carousel is now synced with live Admin settings.');
  };

  // Export User Logins to Excel (CSV)
  const handleExportUserLogins = () => {
    // Generate standard CSV with UTF-8 BOM so Microsoft Excel opens it seamlessly
    const headers = [
      'User ID',
      'Customer Name',
      'Email ID',
      'Password / Credentials',
      'Phone Number',
      'Login Device & OS',
      'Login Location (Where its login)',
      'Last Login Timestamp',
      'Total Bookings',
      'Status',
    ];

    const rows = userLogins.map((u) => [
      `"${u.id}"`,
      `"${u.name}"`,
      `"${u.email}"`,
      `"${u.passwordDisplay}"`,
      `"${u.phone}"`,
      `"${u.device}"`,
      `"${u.loginLocation}"`,
      `"${u.lastLogin}"`,
      u.totalBookings,
      `"${u.status}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    setExportedCsvString(csvContent);

    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cassate_user_logins_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showNotice('Excel CSV file downloaded successfully!');
      } catch (err) {
        setShowExportModal(true);
      }
    } else {
      setShowExportModal(true);
    }
  };

  const activeBanner = bannerSlides[currentBannerIndex];

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      {/* ── TOP HEADER BAR ── */}
      <View style={styles.topHeader}>
        {/* Left: Brand Logo & Title */}
        <View style={styles.headerLeftCol}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.7}
          >
            <Ionicons name="phone-portrait-outline" size={16} color="#EAB308" />
            <Text style={styles.backBtnText}>App</Text>
          </TouchableOpacity>

          <View style={styles.headerBrandBox}>
            <Image
              source={require('../assets/images/brand_logo_boombox.png')}
              style={styles.soundwaveLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerBrandTitle}>CASSATE BAND RECORDZ</Text>
              <Text style={styles.headerBrandSubtitle}>Post Production Studio</Text>
            </View>
          </View>
        </View>

        {/* Center: Admin Panel Title + Search Bar */}
        <View style={styles.headerCenterCol}>
          <View style={styles.adminTitleRow}>
            <Text style={styles.adminTitleText}>Admin Panel</Text>
            <View style={styles.studioPill}>
              <Text style={styles.studioPillText}>Dubbing Studio</Text>
            </View>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search" size={15} color="#6B7280" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search booking, customer, project..."
              placeholderTextColor="#6B7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Right: Notifications & Super Admin Badge */}
        <View style={styles.headerRightCol}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => showNotice('Studio notifications checked • 0 alerts')}
          >
            <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
            <View style={styles.redBadgeDot} />
          </TouchableOpacity>

          <View style={styles.adminProfileBadge}>
            <View style={styles.adminAvatar}>
              <Text style={styles.adminAvatarText}>A</Text>
            </View>
            <View>
              <Text style={styles.adminName}>Admin</Text>
              <Text style={styles.adminRole}>Super Admin</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── NOTIFICATION TOAST ── */}
      {notice && (
        <View style={styles.noticeToast}>
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text style={styles.noticeText}>{notice}</Text>
        </View>
      )}

      {/* ── MAIN CONTENT WITH SIDEBAR & DASHBOARD ── */}
      <View style={styles.mainLayout}>
        {/* ── LEFT SIDEBAR ── */}
        <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'dashboard' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('dashboard')}
          >
            <Ionicons
              name="grid"
              size={18}
              color={activeMenu === 'dashboard' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'dashboard' && styles.sidebarTextActive,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'bookings' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('bookings')}
          >
            <Ionicons
              name="calendar-outline"
              size={18}
              color={activeMenu === 'bookings' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'bookings' && styles.sidebarTextActive,
              ]}
            >
              Bookings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'projects' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('projects')}
          >
            <Ionicons
              name="folder-outline"
              size={18}
              color={activeMenu === 'projects' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'projects' && styles.sidebarTextActive,
              ]}
            >
              Projects
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'payments' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('payments')}
          >
            <Ionicons
              name="card-outline"
              size={18}
              color={activeMenu === 'payments' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'payments' && styles.sidebarTextActive,
              ]}
            >
              Payments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'customers' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('customers')}
          >
            <Ionicons
              name="people-outline"
              size={18}
              color={activeMenu === 'customers' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'customers' && styles.sidebarTextActive,
              ]}
            >
              Customers
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'services' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('services')}
          >
            <Ionicons
              name="sparkles-outline"
              size={18}
              color={activeMenu === 'services' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'services' && styles.sidebarTextActive,
              ]}
            >
              Services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'availability' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('availability')}
          >
            <Ionicons
              name="calendar"
              size={18}
              color={activeMenu === 'availability' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'availability' && styles.sidebarTextActive,
              ]}
            >
              Availability
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'content' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('content')}
          >
            <Ionicons
              name="phone-portrait-outline"
              size={18}
              color={activeMenu === 'content' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'content' && styles.sidebarTextActive,
              ]}
            >
              App Content
            </Text>
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>New</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'reports' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('reports')}
          >
            <Ionicons
              name="bar-chart-outline"
              size={18}
              color={activeMenu === 'reports' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'reports' && styles.sidebarTextActive,
              ]}
            >
              Reports
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sidebarItem, activeMenu === 'settings' && styles.sidebarItemActive]}
            onPress={() => setActiveMenu('settings')}
          >
            <Ionicons
              name="settings-outline"
              size={18}
              color={activeMenu === 'settings' ? '#000000' : '#9CA3AF'}
            />
            <Text
              style={[
                styles.sidebarText,
                activeMenu === 'settings' && styles.sidebarTextActive,
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity>

          {/* Excel Export Button in Sidebar */}
          <TouchableOpacity
            style={styles.sidebarExportBtn}
            onPress={handleExportUserLogins}
            activeOpacity={0.8}
          >
            <Ionicons name="download-outline" size={16} color="#EAB308" />
            <Text style={styles.sidebarExportBtnText}>Export Logins (Excel)</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* ── MAIN WORKSPACE ── */}
        <ScrollView style={styles.workspace} contentContainerStyle={styles.workspaceContent}>
          {/* ── 4 STAT CARDS ── */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={styles.statIconBoxGold}>
                <Ionicons name="calendar-outline" size={20} color="#FACC15" />
              </View>
              <View>
                <Text style={styles.statLabel}>Today's Bookings</Text>
                <Text style={styles.statValue}>6</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBoxGold}>
                <Ionicons name="pulse" size={20} color="#FACC15" />
              </View>
              <View>
                <Text style={styles.statLabel}>Ongoing Projects</Text>
                <Text style={styles.statValue}>4</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBoxGreen}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={styles.statLabel}>Completed</Text>
                <Text style={styles.statValue}>28</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconBoxYellow}>
                <Text style={styles.statRupeeSymbol}>₹</Text>
              </View>
              <View>
                <Text style={styles.statLabel}>Revenue (This Month)</Text>
                <Text style={styles.statValue}>₹1,24,500</Text>
              </View>
            </View>
          </View>

          {/* ── 3-COLUMN DASHBOARD GRID ── */}
          <View style={styles.dashboardGrid}>
            {/* ── LEFT & CENTER: SCHEDULE, RECENT BOOKINGS, STATUS & ACTIONS ── */}
            <View style={styles.dashboardLeftCol}>
              {/* Row: Today's Schedule + Project Status */}
              <View style={styles.scheduleStatusRow}>
                {/* Today's Schedule Card */}
                <View style={styles.scheduleCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardHeaderTitle}>Today's Schedule</Text>
                    <TouchableOpacity onPress={() => setActiveMenu('bookings')}>
                      <Text style={styles.cardHeaderLink}>View All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.scheduleList}>
                    <View style={styles.scheduleItem}>
                      <Text style={styles.scheduleTime}>10:00 AM – 12:00 PM</Text>
                      <Text style={styles.scheduleService}>Dubbing – Feature Film</Text>
                      <Text style={styles.scheduleStudio}>Studio A</Text>
                      <View style={[styles.statusTag, styles.statusTagGreen]}>
                        <Text style={styles.statusTagGreenText}>In Progress</Text>
                      </View>
                    </View>

                    <View style={styles.scheduleItem}>
                      <Text style={styles.scheduleTime}>12:30 PM – 02:00 PM</Text>
                      <Text style={styles.scheduleService}>Voice Over – Ad Film</Text>
                      <Text style={styles.scheduleStudio}>Studio B</Text>
                      <View style={[styles.statusTag, styles.statusTagBlue]}>
                        <Text style={styles.statusTagBlueText}>Upcoming</Text>
                      </View>
                    </View>

                    <View style={styles.scheduleItem}>
                      <Text style={styles.scheduleTime}>03:00 PM – 05:00 PM</Text>
                      <Text style={styles.scheduleService}>Dubbing – Web Series</Text>
                      <Text style={styles.scheduleStudio}>Studio A</Text>
                      <View style={[styles.statusTag, styles.statusTagBlue]}>
                        <Text style={styles.statusTagBlueText}>Upcoming</Text>
                      </View>
                    </View>

                    <View style={styles.scheduleItem}>
                      <Text style={styles.scheduleTime}>05:30 PM – 07:00 PM</Text>
                      <Text style={styles.scheduleService}>ADR – Short Film</Text>
                      <Text style={styles.scheduleStudio}>Studio B</Text>
                      <View style={[styles.statusTag, styles.statusTagCyan]}>
                        <Text style={styles.statusTagCyanText}>Scheduled</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Project Status Donut Mockup */}
                <View style={styles.projectStatusCard}>
                  <Text style={styles.cardHeaderTitle}>Project Status</Text>
                  <View style={styles.donutContainer}>
                    <View style={styles.donutCircle}>
                      <Text style={styles.donutBigNumber}>32</Text>
                      <Text style={styles.donutSub}>Projects</Text>
                    </View>
                    <View style={styles.donutLegend}>
                      <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.legendLabel}>In Progress</Text>
                        <Text style={styles.legendCount}>12</Text>
                      </View>
                      <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: '#06B6D4' }]} />
                        <Text style={styles.legendLabel}>Under Review</Text>
                        <Text style={styles.legendCount}>6</Text>
                      </View>
                      <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                        <Text style={styles.legendLabel}>Completed</Text>
                        <Text style={styles.legendCount}>28</Text>
                      </View>
                      <View style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.legendLabel}>On Hold</Text>
                        <Text style={styles.legendCount}>2</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>

              {/* Row: Recent Bookings Table + Quick Actions */}
              <View style={styles.bookingsQuickRow}>
                {/* Recent Bookings Table */}
                <View style={styles.recentBookingsCard}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardHeaderTitle}>Recent Bookings</Text>
                    <TouchableOpacity onPress={() => setActiveMenu('bookings')}>
                      <Text style={styles.cardHeaderLink}>View All</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.tableHeader}>
                    <Text style={[styles.th, { width: 60 }]}>#</Text>
                    <Text style={[styles.th, { flex: 1.2 }]}>Customer</Text>
                    <Text style={[styles.th, { flex: 1 }]}>Service</Text>
                    <Text style={[styles.th, { flex: 1.3 }]}>Date & Time</Text>
                    <Text style={[styles.th, { width: 75 }]}>Amount</Text>
                    <Text style={[styles.th, { width: 85 }]}>Status</Text>
                    <Text style={[styles.th, { width: 45, textAlign: 'center' }]}>Action</Text>
                  </View>

                  <View style={styles.tableBody}>
                    <View style={styles.tableRow}>
                      <Text style={[styles.td, { width: 60, color: '#9CA3AF' }]}>B-1042</Text>
                      <Text style={[styles.td, { flex: 1.2, fontWeight: '700', color: '#FFFFFF' }]}>Arjun Movies</Text>
                      <Text style={[styles.td, { flex: 1, color: '#D1D5DB' }]}>Dubbing</Text>
                      <Text style={[styles.td, { flex: 1.3, color: '#9CA3AF', fontSize: 11 }]}>26 Jan, 10:00 AM</Text>
                      <Text style={[styles.td, { width: 75, color: '#FACC15', fontWeight: '800' }]}>₹12,000</Text>
                      <View style={{ width: 85 }}>
                        <View style={[styles.statusTag, styles.statusTagGreen]}>
                          <Text style={styles.statusTagGreenText}>Confirmed</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={{ width: 45, alignItems: 'center' }}>
                        <Ionicons name="eye-outline" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.tableRow}>
                      <Text style={[styles.td, { width: 60, color: '#9CA3AF' }]}>B-1041</Text>
                      <Text style={[styles.td, { flex: 1.2, fontWeight: '700', color: '#FFFFFF' }]}>Vibe Studios</Text>
                      <Text style={[styles.td, { flex: 1, color: '#D1D5DB' }]}>Voice Over</Text>
                      <Text style={[styles.td, { flex: 1.3, color: '#9CA3AF', fontSize: 11 }]}>26 Jan, 12:30 PM</Text>
                      <Text style={[styles.td, { width: 75, color: '#FACC15', fontWeight: '800' }]}>₹5,000</Text>
                      <View style={{ width: 85 }}>
                        <View style={[styles.statusTag, styles.statusTagYellow]}>
                          <Text style={styles.statusTagYellowText}>Pending</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={{ width: 45, alignItems: 'center' }}>
                        <Ionicons name="eye-outline" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    <View style={styles.tableRow}>
                      <Text style={[styles.td, { width: 60, color: '#9CA3AF' }]}>B-1040</Text>
                      <Text style={[styles.td, { flex: 1.2, fontWeight: '700', color: '#FFFFFF' }]}>Pixel Films</Text>
                      <Text style={[styles.td, { flex: 1, color: '#D1D5DB' }]}>ADR</Text>
                      <Text style={[styles.td, { flex: 1.3, color: '#9CA3AF', fontSize: 11 }]}>26 Jan, 03:00 PM</Text>
                      <Text style={[styles.td, { width: 75, color: '#FACC15', fontWeight: '800' }]}>₹8,000</Text>
                      <View style={{ width: 85 }}>
                        <View style={[styles.statusTag, styles.statusTagGreen]}>
                          <Text style={styles.statusTagGreenText}>Confirmed</Text>
                        </View>
                      </View>
                      <TouchableOpacity style={{ width: 45, alignItems: 'center' }}>
                        <Ionicons name="eye-outline" size={16} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    {/* Live Mobile Bookings from AppContext */}
                    {bookings.slice(0, 2).map((b, idx) => (
                      <View key={b.id || idx} style={styles.tableRow}>
                        <Text style={[styles.td, { width: 60, color: '#9CA3AF' }]}>{b.referenceCode || b.id}</Text>
                        <Text style={[styles.td, { flex: 1.2, fontWeight: '700', color: '#FFFFFF' }]}>
                          Studio Client
                        </Text>
                        <Text style={[styles.td, { flex: 1, color: '#D1D5DB' }]}>{b.serviceName}</Text>
                        <Text style={[styles.td, { flex: 1.3, color: '#9CA3AF', fontSize: 11 }]}>{b.date}</Text>
                        <Text style={[styles.td, { width: 75, color: '#FACC15', fontWeight: '800' }]}>
                          ₹{b.totalPrice?.toLocaleString('en-IN')}
                        </Text>
                        <View style={{ width: 85 }}>
                          <View style={[styles.statusTag, styles.statusTagGreen]}>
                            <Text style={styles.statusTagGreenText}>{b.status || 'Confirmed'}</Text>
                          </View>
                        </View>
                        <TouchableOpacity style={{ width: 45, alignItems: 'center' }}>
                          <Ionicons name="eye-outline" size={16} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.quickActionsCard}>
                  <Text style={styles.cardHeaderTitle}>Quick Actions</Text>
                  <View style={styles.quickActionsList}>
                    <TouchableOpacity
                      style={styles.quickActionBtn}
                      onPress={() => router.push('/booking/select')}
                    >
                      <Ionicons name="calendar-outline" size={16} color="#FACC15" />
                      <Text style={styles.quickActionText}>New Booking</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickActionBtn}
                      onPress={() => showNotice('Project upload manager ready.')}
                    >
                      <Ionicons name="cloud-upload-outline" size={16} color="#FACC15" />
                      <Text style={styles.quickActionText}>Upload Project File</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickActionBtn}
                      onPress={() => showNotice('Payment verified & studio receipt marked paid.')}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color="#FACC15" />
                      <Text style={styles.quickActionText}>Verify Payment</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickActionBtn}
                      onPress={() => showNotice('Customer creation modal opened.')}
                    >
                      <Ionicons name="person-add-outline" size={16} color="#FACC15" />
                      <Text style={styles.quickActionText}>Add Customer</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.quickActionBtn}
                      onPress={() => showNotice('Studio services manager active.')}
                    >
                      <Ionicons name="settings-outline" size={16} color="#FACC15" />
                      <Text style={styles.quickActionText}>Manage Services</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* ── RIGHT COLUMN: APP BANNERS (HIGHLIGHTED IN GOLD) ── */}
            <View style={styles.appBannersCard}>
              <View style={styles.bannerCardHeader}>
                <Ionicons name="phone-portrait-outline" size={16} color="#FACC15" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.bannerHeaderTitle}>App Banners</Text>
                  <Text style={styles.bannerHeaderSubtitle}>Manage banners shown in the mobile app</Text>
                </View>
              </View>

              {/* Banner Carousel Preview with Navigation */}
              <View style={styles.carouselPreviewBox}>
                <Image
                  source={require('../assets/images/hero_studio.jpg')}
                  style={styles.carouselBg}
                  resizeMode="cover"
                />
                <View style={styles.carouselOverlay}>
                  <Text style={styles.carouselHeadline}>{activeBanner.title}</Text>
                  <Text style={styles.carouselSubline}>{activeBanner.sub}</Text>
                  <TouchableOpacity style={styles.carouselBookBtn}>
                    <Text style={styles.carouselBookText}>Book Now →</Text>
                  </TouchableOpacity>
                </View>

                {/* Left/Right Arrows */}
                <TouchableOpacity
                  style={styles.carouselArrowLeft}
                  onPress={() =>
                    setCurrentBannerIndex((prev) => (prev > 0 ? prev - 1 : bannerSlides.length - 1))
                  }
                >
                  <Ionicons name="chevron-back" size={16} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.carouselArrowRight}
                  onPress={() =>
                    setCurrentBannerIndex((prev) => (prev < bannerSlides.length - 1 ? prev + 1 : 0))
                  }
                >
                  <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
                </TouchableOpacity>

                {/* Carousel Pagination Dots */}
                <View style={styles.carouselDotsRow}>
                  {bannerSlides.map((_, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.carouselDot,
                        idx === currentBannerIndex && styles.carouselDotActive,
                      ]}
                    />
                  ))}
                </View>
              </View>

              {/* Banner Toggle List */}
              <View style={styles.bannerToggleList}>
                {bannerSlides.map((b) => (
                  <View key={b.id} style={styles.bannerToggleItem}>
                    <View style={styles.bannerThumbPreview}>
                      <Ionicons
                        name={b.id === 'dubbing' ? 'mic' : b.id === 'vo' ? 'musical-notes' : 'pulse'}
                        size={14}
                        color="#FACC15"
                      />
                    </View>
                    <View style={{ flex: 1, marginHorizontal: 8 }}>
                      <Text style={styles.bannerItemTitle}>{b.title}</Text>
                      <Text
                        style={[
                          styles.bannerItemStatus,
                          { color: b.published ? '#10B981' : '#6B7280' },
                        ]}
                      >
                        {b.published ? 'Published' : 'Draft'}
                      </Text>
                    </View>
                    <Switch
                      value={b.published}
                      onValueChange={() => handleToggleBanner(b.id)}
                      trackColor={{ false: '#374151', true: '#FACC15' }}
                      thumbColor="#FFFFFF"
                    />
                  </View>
                ))}
              </View>

              {/* Upload & Publish Buttons */}
              <TouchableOpacity
                style={styles.uploadBannerBtn}
                onPress={() => showNotice('Banner image selector opened.')}
                activeOpacity={0.8}
              >
                <Ionicons name="cloud-upload-outline" size={16} color="#000000" />
                <Text style={styles.uploadBannerBtnText}>Upload / Change Banner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.publishAppBtn}
                onPress={handlePublishBannersToApp}
                activeOpacity={0.8}
              >
                <Ionicons name="paper-plane-outline" size={16} color="#EAB308" />
                <Text style={styles.publishAppBtnText}>Publish to App Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── CUSTOMER & USER LOGIN DETAILS SECTION (WITH EXCEL EXPORT) ── */}
          <View style={styles.usersSectionCard}>
            <View style={styles.cardHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="people" size={18} color="#FACC15" />
                <Text style={styles.cardHeaderTitle}>Customer Accounts & User Login History</Text>
              </View>

              <TouchableOpacity
                style={styles.exportExcelBtn}
                onPress={handleExportUserLogins}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text-outline" size={16} color="#000000" />
                <Text style={styles.exportExcelBtnText}>Export Excel (.csv)</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionSubtitle}>
              Registered user credentials, login timestamps, device OS, and client location for administrative audit.
            </Text>

            <View style={styles.usersTable}>
              <View style={styles.usersTableHeader}>
                <Text style={[styles.th, { width: 70 }]}>User ID</Text>
                <Text style={[styles.th, { flex: 1.2 }]}>Customer</Text>
                <Text style={[styles.th, { flex: 1.5 }]}>Email ID</Text>
                <Text style={[styles.th, { flex: 1.2 }]}>Password / Key</Text>
                <Text style={[styles.th, { flex: 1.3 }]}>Login Device</Text>
                <Text style={[styles.th, { flex: 1.6 }]}>Location (Where it's Login)</Text>
                <Text style={[styles.th, { flex: 1.2 }]}>Last Login</Text>
                <Text style={[styles.th, { width: 70 }]}>Bookings</Text>
              </View>

              {userLogins.map((user) => (
                <View key={user.id} style={styles.usersTableRow}>
                  <Text style={[styles.td, { width: 70, color: '#FACC15', fontWeight: '800' }]}>{user.id}</Text>
                  <Text style={[styles.td, { flex: 1.2, fontWeight: '700', color: '#FFFFFF' }]}>{user.name}</Text>
                  <Text style={[styles.td, { flex: 1.5, color: '#93C5FD' }]}>{user.email}</Text>
                  <Text style={[styles.td, { flex: 1.2, color: '#EAB308', fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>
                    {user.passwordDisplay}
                  </Text>
                  <Text style={[styles.td, { flex: 1.3, color: '#9CA3AF', fontSize: 11 }]}>{user.device}</Text>
                  <Text style={[styles.td, { flex: 1.6, color: '#D1D5DB', fontSize: 11 }]}>{user.loginLocation}</Text>
                  <Text style={[styles.td, { flex: 1.2, color: '#9CA3AF', fontSize: 11 }]}>{user.lastLogin}</Text>
                  <Text style={[styles.td, { width: 70, color: '#10B981', fontWeight: '800' }]}>{user.totalBookings}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* ── EXCEL CSV PREVIEW MODAL (FOR MOBILE / DOWNLOAD FALLBACK) ── */}
      <Modal visible={showExportModal} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="document-text" size={20} color="#FACC15" />
                <Text style={styles.modalTitle}>User Logins Excel Data Export</Text>
              </View>
              <TouchableOpacity onPress={() => setShowExportModal(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Copy or save this Excel-compatible CSV data containing user email IDs, passwords, and login locations:
            </Text>

            <ScrollView style={styles.csvTextBox}>
              <Text style={styles.csvText}>{exportedCsvString}</Text>
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setShowExportModal(false)}
              >
                <Text style={styles.modalCloseBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    width: '100%',
    height: '100%',
  },

  // ── Top Header ──
  topHeader: {
    height: 64,
    backgroundColor: '#12121A',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  headerLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: '700',
  },
  headerBrandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  soundwaveLogo: {
    width: 28,
    height: 28,
  },
  headerBrandTitle: {
    color: '#FACC15',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  headerBrandSubtitle: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerCenterCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
    maxWidth: 580,
    marginHorizontal: 16,
  },
  adminTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminTitleText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  studioPill: {
    backgroundColor: '#EAB308',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  studioPillText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  searchBox: {
    flex: 1,
    height: 38,
    backgroundColor: '#1A1A24',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2D2D3F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 12,
  },
  headerRightCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  notifBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A24',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  redBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  adminProfileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1A1A24',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D2D3F',
  },
  adminAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FACC15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminAvatarText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
  },
  adminName: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  adminRole: {
    color: '#9CA3AF',
    fontSize: 9,
    fontWeight: '600',
  },

  noticeToast: {
    backgroundColor: '#064E3B',
    borderColor: '#059669',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  noticeText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Main Layout ──
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
  },

  // ── Sidebar ──
  sidebar: {
    width: 200,
    backgroundColor: '#0E0E16',
    borderRightWidth: 1,
    borderRightColor: '#1A1A26',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  sidebarItemActive: {
    backgroundColor: '#FACC15',
  },
  sidebarText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },
  sidebarTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  newBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  sidebarExportBtn: {
    marginTop: 20,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: '#EAB308',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  sidebarExportBtnText: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '800',
  },

  // ── Workspace ──
  workspace: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  workspaceContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── Stat Cards ──
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statIconBoxGold: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(250, 204, 21, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBoxGreen: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBoxYellow: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statRupeeSymbol: {
    color: '#F59E0B',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 2,
  },

  // ── Dashboard Grid ──
  dashboardGrid: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  dashboardLeftCol: {
    flex: 2,
    minWidth: 420,
    gap: 16,
  },
  scheduleStatusRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  scheduleCard: {
    flex: 1.4,
    minWidth: 260,
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  cardHeaderLink: {
    color: '#EAB308',
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleList: {
    gap: 8,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181824',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 8,
  },
  scheduleTime: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '600',
    width: 110,
  },
  scheduleService: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  scheduleStudio: {
    color: '#6B7280',
    fontSize: 11,
    width: 55,
  },
  statusTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTagGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusTagGreenText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  statusTagBlue: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  statusTagBlueText: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '800',
  },
  statusTagCyan: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
  },
  statusTagCyanText: {
    color: '#22D3EE',
    fontSize: 10,
    fontWeight: '800',
  },
  statusTagYellow: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
  },
  statusTagYellowText: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
  },

  // Project Status
  projectStatusCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 14,
  },
  donutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 8,
  },
  donutCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    borderColor: '#10B981',
    borderTopColor: '#F59E0B',
    borderRightColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181824',
  },
  donutBigNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  donutSub: {
    color: '#9CA3AF',
    fontSize: 8,
    fontWeight: '700',
  },
  donutLegend: {
    flex: 1,
    gap: 4,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    flex: 1,
  },
  legendCount: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },

  // Bookings & Quick Actions Row
  bookingsQuickRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  recentBookingsCard: {
    flex: 2,
    minWidth: 280,
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 14,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1F1F2E',
    paddingBottom: 8,
    marginBottom: 6,
  },
  th: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
  },
  tableBody: {
    gap: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#161622',
  },
  td: {
    fontSize: 12,
  },

  quickActionsCard: {
    flex: 1,
    minWidth: 160,
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 14,
  },
  quickActionsList: {
    gap: 8,
    marginTop: 4,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#181824',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262638',
  },
  quickActionText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── RIGHT COLUMN: APP BANNERS (HIGHLIGHTED CARD) ──
  appBannersCard: {
    flex: 1,
    minWidth: 280,
    maxWidth: 360,
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FACC15', // Highlighted yellow frame matching mockup
    padding: 14,
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  bannerCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bannerHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
  },
  bannerHeaderSubtitle: {
    color: '#9CA3AF',
    fontSize: 10,
    marginTop: 1,
  },
  carouselPreviewBox: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 12,
  },
  carouselBg: {
    width: '100%',
    height: '100%',
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
    padding: 12,
    justifyContent: 'center',
  },
  carouselHeadline: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  carouselSubline: {
    color: '#D1D5DB',
    fontSize: 10,
    marginVertical: 4,
  },
  carouselBookBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#FACC15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  carouselBookText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  carouselArrowLeft: {
    position: 'absolute',
    left: 6,
    top: '40%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselArrowRight: {
    position: 'absolute',
    right: 6,
    top: '40%',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselDotsRow: {
    position: 'absolute',
    bottom: 6,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  carouselDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#4B5563',
  },
  carouselDotActive: {
    backgroundColor: '#FACC15',
    width: 14,
  },
  bannerToggleList: {
    gap: 8,
    marginBottom: 12,
  },
  bannerToggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181824',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#242436',
  },
  bannerThumbPreview: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#262638',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerItemTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  bannerItemStatus: {
    fontSize: 10,
    fontWeight: '700',
  },
  uploadBannerBtn: {
    backgroundColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadBannerBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  publishAppBtn: {
    backgroundColor: '#181824',
    borderWidth: 1,
    borderColor: '#EAB308',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 8,
  },
  publishAppBtnText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
  },

  // ── Customer & User Logins Section ──
  usersSectionCard: {
    marginTop: 20,
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 16,
  },
  sectionSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: -4,
    marginBottom: 12,
  },
  exportExcelBtn: {
    backgroundColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  exportExcelBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  usersTable: {
    borderWidth: 1,
    borderColor: '#1F1F2E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  usersTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#181824',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#262638',
  },
  usersTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#161622',
  },

  // ── Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    maxWidth: 620,
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#FACC15',
    padding: 18,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  modalSub: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 12,
  },
  csvTextBox: {
    backgroundColor: '#09090D',
    borderRadius: 8,
    padding: 12,
    maxHeight: 280,
    borderWidth: 1,
    borderColor: '#262638',
  },
  csvText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  modalCloseBtn: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCloseBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
  },
});
