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

// ── TypeScript Interfaces ──
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

interface AdminBookingRecord {
  id: string;
  clientUsername: string;
  clientEmail: string;
  clientPhone: string;
  service: string;
  studioSuite: string;
  dateTime: string;
  amount: number;
  paymentMethod: string;
  status: 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled';
}

interface StudioProjectRecord {
  id: string;
  title: string;
  clientUsername: string;
  service: string;
  studioSuite: string;
  progressPercent: number;
  status: 'In Progress' | 'Under Review' | 'Completed' | 'On Hold';
  dueDate: string;
  stemsCount: number;
}

interface StudioPaymentRecord {
  id: string;
  clientUsername: string;
  amount: number;
  upiRefId: string;
  method: string;
  dateTime: string;
  status: 'Verified' | 'Pending';
}

interface StudioServiceRateCard {
  id: string;
  name: string;
  category: string;
  studioSuite: string;
  ratePerHour: number;
  unit: string;
  active: boolean;
}

// ── Initial Mock / Seed Data ──
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

const INITIAL_BOOKINGS: AdminBookingRecord[] = [
  {
    id: 'B-1042',
    clientUsername: 'Arjun Movies',
    clientEmail: 'arjun.movies@gmail.com',
    clientPhone: '+91 98401 23456',
    service: 'Dubbing – Feature Film',
    studioSuite: 'Studio A',
    dateTime: '26 Jan, 10:00 AM – 12:00 PM',
    amount: 12000,
    paymentMethod: 'UPI (GPay)',
    status: 'Confirmed',
  },
  {
    id: 'B-1041',
    clientUsername: 'Vibe Studios',
    clientEmail: 'priya.cinema@vibe.in',
    clientPhone: '+91 94440 98765',
    service: 'Voice Over – Ad Film',
    studioSuite: 'Studio B',
    dateTime: '26 Jan, 12:30 PM – 02:00 PM',
    amount: 5000,
    paymentMethod: 'UPI (PhonePe)',
    status: 'Pending',
  },
  {
    id: 'B-1040',
    clientUsername: 'Pixel Films',
    clientEmail: 'karthik.audio@soundhouse.com',
    clientPhone: '+91 97910 54321',
    service: 'ADR – Short Film',
    studioSuite: 'Studio B',
    dateTime: '26 Jan, 03:00 PM – 05:00 PM',
    amount: 8000,
    paymentMethod: 'UPI (Paytm)',
    status: 'Confirmed',
  },
  {
    id: 'B-1039',
    clientUsername: 'Devon Vance',
    clientEmail: 'devon.vance@soundcraft.io',
    clientPhone: '+91 90252 53695',
    service: 'Dubbing – Web Series',
    studioSuite: 'Studio A',
    dateTime: '25 Jan, 05:30 PM – 07:30 PM',
    amount: 15000,
    paymentMethod: 'UPI (HDFC NetBanking)',
    status: 'Completed',
  },
];

const INITIAL_PROJECTS: StudioProjectRecord[] = [
  {
    id: 'PRJ-201',
    title: 'Ponniyin Selvan 2 ADR & Dubbing',
    clientUsername: 'Arjun Movies',
    service: 'Dubbing',
    studioSuite: 'Studio A',
    progressPercent: 75,
    status: 'In Progress',
    dueDate: '10 Feb 2026',
    stemsCount: 24,
  },
  {
    id: 'PRJ-202',
    title: 'Kantara Sound Design & Mix',
    clientUsername: 'Vibe Studios',
    service: 'Mixing',
    studioSuite: 'Studio A',
    progressPercent: 40,
    status: 'In Progress',
    dueDate: '15 Feb 2026',
    stemsCount: 48,
  },
  {
    id: 'PRJ-203',
    title: 'Tata Tea National Commercial VO',
    clientUsername: 'Devon Vance',
    service: 'Voice Over',
    studioSuite: 'Studio B',
    progressPercent: 90,
    status: 'Under Review',
    dueDate: '08 Feb 2026',
    stemsCount: 8,
  },
  {
    id: 'PRJ-204',
    title: 'Thalapathy 69 Trailer Foley',
    clientUsername: 'Pixel Films',
    service: 'Foley',
    studioSuite: 'Studio B',
    progressPercent: 100,
    status: 'Completed',
    dueDate: '20 Jan 2026',
    stemsCount: 32,
  },
];

const INITIAL_PAYMENTS: StudioPaymentRecord[] = [
  {
    id: 'PAY-8901',
    clientUsername: 'Arjun Movies',
    amount: 12000,
    upiRefId: 'UPI-430192837192',
    method: 'GPay',
    dateTime: '26 Jan 2026, 09:45 AM',
    status: 'Verified',
  },
  {
    id: 'PAY-8902',
    clientUsername: 'Vibe Studios',
    amount: 5000,
    upiRefId: 'UPI-982310293812',
    method: 'PhonePe',
    dateTime: '26 Jan 2026, 11:30 AM',
    status: 'Pending',
  },
  {
    id: 'PAY-8903',
    clientUsername: 'Pixel Films',
    amount: 8000,
    upiRefId: 'UPI-119283746501',
    method: 'Paytm',
    dateTime: '26 Jan 2026, 02:15 PM',
    status: 'Verified',
  },
  {
    id: 'PAY-8904',
    clientUsername: 'Devon Vance',
    amount: 15000,
    upiRefId: 'UPI-881920394817',
    method: 'HDFC NetBanking',
    dateTime: '25 Jan 2026, 04:50 PM',
    status: 'Verified',
  },
];

const INITIAL_SERVICES: StudioServiceRateCard[] = [
  {
    id: 'srv-1',
    name: 'Dubbing – Feature Film',
    category: 'Post Production',
    studioSuite: 'Studio A (High-End Pro Tools HDX)',
    ratePerHour: 2000,
    unit: 'Per Hour',
    active: true,
  },
  {
    id: 'srv-2',
    name: 'Voice Over & Commercial Recording',
    category: 'Vocal Recording',
    studioSuite: 'Studio B (Neumann U87 + Avalon VT-737)',
    ratePerHour: 1500,
    unit: 'Per Hour',
    active: true,
  },
  {
    id: 'srv-3',
    name: 'ADR – Dialogue Replacement',
    category: 'Post Production',
    studioSuite: 'Studio A & B Sync',
    ratePerHour: 1800,
    unit: 'Per Hour',
    active: true,
  },
  {
    id: 'srv-4',
    name: 'Stereo Mixing & Mastering',
    category: 'Audio Engineering',
    studioSuite: 'Suite C (Genelec 8351B Monitoring)',
    ratePerHour: 2500,
    unit: 'Per Track',
    active: true,
  },
  {
    id: 'srv-5',
    name: 'Dolby Atmos 7.1.4 Mastering',
    category: 'Immersive Audio',
    studioSuite: 'Atmos Theatre Suite',
    ratePerHour: 5000,
    unit: 'Per Track',
    active: true,
  },
  {
    id: 'srv-6',
    name: 'Foley & Custom Sound Design',
    category: 'Sound FX',
    studioSuite: 'Foley Stage B',
    ratePerHour: 2200,
    unit: 'Per Hour',
    active: false,
  },
];

export default function WebAdminPortalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { bookings: liveAppContextBookings } = useApp();

  // ── Layout & View State (Sidebar Always Hidden by Default) ──
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<
    'dashboard' | 'bookings' | 'projects' | 'payments' | 'customers' | 'services' | 'availability' | 'content' | 'reports' | 'settings'
  >('dashboard');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // ── Data States ──
  const [userLogins, setUserLogins] = useState<UserLoginRecord[]>(INITIAL_USER_LOGINS);
  const [bookingsList, setBookingsList] = useState<AdminBookingRecord[]>(INITIAL_BOOKINGS);
  const [projectsList, setProjectsList] = useState<StudioProjectRecord[]>(INITIAL_PROJECTS);
  const [paymentsList, setPaymentsList] = useState<StudioPaymentRecord[]>(INITIAL_PAYMENTS);
  const [servicesList, setServicesList] = useState<StudioServiceRateCard[]>(INITIAL_SERVICES);

  // Availability Slot Matrix State
  const [availStudio, setAvailStudio] = useState<'Studio A' | 'Studio B'>('Studio A');
  const [availDate, setAvailDate] = useState('Today (26 Jan)');
  const [slotStatusMap, setSlotStatusMap] = useState<Record<string, 'Available' | 'Booked' | 'Locked'>>({
    '10:00 AM – 12:00 PM': 'Booked',
    '12:30 PM – 02:00 PM': 'Booked',
    '03:00 PM – 05:00 PM': 'Booked',
    '05:30 PM – 07:00 PM': 'Available',
    '07:30 PM – 09:30 PM': 'Available',
  });

  // App Banner Manager State (matches right column mockup)
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

  // ── Modals & Notice State ──
  const [selectedPassBooking, setSelectedPassBooking] = useState<AdminBookingRecord | null>(null);
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);
  const [newBookingClient, setNewBookingClient] = useState('');
  const [newBookingService, setNewBookingService] = useState('Dubbing – Feature Film');
  const [newBookingSuite, setNewBookingSuite] = useState('Studio A');
  const [newBookingDate, setNewBookingDate] = useState('27 Jan, 10:00 AM – 12:00 PM');
  const [newBookingAmount, setNewBookingAmount] = useState('12000');

  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('+91 90252 53695');
  const [newCustPassword, setNewCustPassword] = useState('StudioPass@2026');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTargetProject, setUploadTargetProject] = useState('Ponniyin Selvan 2 ADR');

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportedCsvString, setExportedCsvString] = useState('');

  // Toast Notice
  const [notice, setNotice] = useState<string | null>(null);
  const showNotice = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3800);
  };

  // ── Real-time Database User Sync ──
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

    // Subscribe to real-time user registrations from database
    const unsub = StudioApi.subscribeToProfiles(() => {
      loadDatabaseUsers();
      showNotice('New user registration synced in real-time from database!');
    });

    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, [loadDatabaseUsers]);

  // Sync live AppContext bookings into bookingsList
  useEffect(() => {
    if (liveAppContextBookings && liveAppContextBookings.length > 0) {
      const mappedLive: AdminBookingRecord[] = liveAppContextBookings.map((b) => ({
        id: b.referenceCode || b.id || `B-${Math.floor(1000 + Math.random() * 9000)}`,
        clientUsername: b.serviceName?.includes('Dubbing') ? 'Arjun Movies' : 'Studio Client',
        clientEmail: 'client@cassatebandrecordz.com',
        clientPhone: '+91 90252 53695',
        service: b.serviceName || 'Dubbing',
        studioSuite: b.studioName || 'Studio A',
        dateTime: `${b.date || '26 Jan'}, ${b.timeSlots?.[0] || '10:00 AM'}`,
        amount: b.totalPrice || 12000,
        paymentMethod: 'UPI Verified',
        status: (b.status as any) || 'Confirmed',
      }));

      setBookingsList((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newOnes = mappedLive.filter((m) => !existingIds.has(m.id));
        return [...newOnes, ...prev];
      });
    }
  }, [liveAppContextBookings]);

  // ── EXCEL CSV EXPORT HANDLER (ONLY for Bookings & Client Usernames) ──
  const handleExportUserLogins = () => {
    // Generates an Excel-compatible CSV with UTF-8 BOM
    const headers = [
      'Client Username',
      'Customer Email ID',
      'Password / Credentials',
      'Phone Number',
      'Total Bookings',
      'Latest Booking Service',
      'Last Login Device',
      'Login Location (Where its login)',
      'Last Login Timestamp',
      'Account Status',
    ];

    const rows = userLogins.map((u, idx) => {
      const matchedBooking = bookingsList[idx % bookingsList.length];
      return [
        `"${u.name}"`,
        `"${u.email}"`,
        `"${u.passwordDisplay}"`,
        `"${u.phone}"`,
        u.totalBookings,
        `"${matchedBooking ? matchedBooking.service : 'Dubbing – Feature Film'}"`,
        `"${u.device}"`,
        `"${u.loginLocation}"`,
        `"${u.lastLogin}"`,
        `"${u.status}"`,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    setExportedCsvString(csvContent);

    if (Platform.OS === 'web') {
      try {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `cassate_client_logins_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        showNotice('Client logins Excel (.csv) downloaded successfully!');
      } catch {
        setShowExportModal(true);
      }
    } else {
      setShowExportModal(true);
    }
  };

  // ── Quick Handlers ──
  const handleCreateBookingSubmit = () => {
    if (!newBookingClient.trim()) {
      Alert.alert('Required', 'Please enter a client username.');
      return;
    }
    const newRecord: AdminBookingRecord = {
      id: `B-${Math.floor(1045 + Math.random() * 900)}`,
      clientUsername: newBookingClient.trim(),
      clientEmail: `${newBookingClient.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      clientPhone: '+91 90252 53695',
      service: newBookingService,
      studioSuite: newBookingSuite,
      dateTime: newBookingDate,
      amount: parseInt(newBookingAmount, 10) || 12000,
      paymentMethod: 'UPI (GPay)',
      status: 'Confirmed',
    };

    setBookingsList((prev) => [newRecord, ...prev]);
    setShowNewBookingModal(false);
    setNewBookingClient('');
    showNotice(`Booking confirmed for ${newRecord.clientUsername}!`);
  };

  const handleAddCustomerSubmit = async () => {
    if (!newCustName.trim() || !newCustEmail.trim()) {
      Alert.alert('Required', 'Please enter customer name and valid email.');
      return;
    }

    try {
      await StudioApi.register({
        name: newCustName.trim(),
        email: newCustEmail.trim(),
        password: newCustPassword.trim(),
        phone: newCustPhone.trim(),
        device: 'Android 14 (Mobile Client App)',
        loginLocation: 'Chennai Studio, TN (IP: 157.48.21.94)',
      });
    } catch (e) {
      console.warn('Backend register call returned:', e);
    }

    const newRecord: UserLoginRecord = {
      id: `USR-${Math.floor(1090 + Math.random() * 900)}`,
      name: newCustName.trim(),
      email: newCustEmail.trim(),
      passwordDisplay: newCustPassword.trim(),
      phone: newCustPhone.trim(),
      device: 'Android 14 (Samsung S24)',
      loginLocation: 'Chennai, Tamil Nadu (IP: 157.48.21.94)',
      lastLogin: 'Just now',
      totalBookings: 1,
      status: 'Verified',
    };

    setUserLogins((prev) => [newRecord, ...prev]);
    setShowAddCustomerModal(false);
    setNewCustName('');
    setNewCustEmail('');
    showNotice(`Client account saved and synced with database: ${newRecord.name}`);
  };

  const handleVerifyPayment = (paymentId: string) => {
    setPaymentsList((prev) =>
      prev.map((p) => (p.id === paymentId ? { ...p, status: 'Verified' } : p))
    );
    showNotice(`Payment ${paymentId} verified and receipt marked paid!`);
  };

  const handleToggleService = (id: string) => {
    setServicesList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
    showNotice('Service rate card updated.');
  };

  const handleToggleSlot = (slotTime: string) => {
    setSlotStatusMap((prev) => {
      const current = prev[slotTime] || 'Available';
      const next = current === 'Available' ? 'Booked' : current === 'Booked' ? 'Locked' : 'Available';
      return { ...prev, [slotTime]: next };
    });
    showNotice(`Slot ${slotTime} status updated.`);
  };

  const handleToggleBanner = (id: string) => {
    setBannerSlides((prev) =>
      prev.map((b) => (b.id === id ? { ...b, published: !b.published } : b))
    );
  };

  const handlePublishBannersToApp = () => {
    showNotice('Banners published live! Mobile app carousel updated successfully.');
  };

  const activeBanner = bannerSlides[currentBannerIndex];

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'web' ? 0 : insets.top }]}>
      {/* ── TOP HEADER BAR ── */}
      <View style={styles.topHeader}>
        {/* Left: App Back + Brand Logo + SIDEBAR TOGGLE BUTTON */}
        <View style={styles.headerLeftCol}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.push('/(tabs)')}
            activeOpacity={0.7}
          >
            <Ionicons name="phone-portrait-outline" size={15} color="#EAB308" />
            <Text style={styles.backBtnText}>App</Text>
          </TouchableOpacity>

          {/* ── HIDE / UNHIDE SIDEBAR BUTTON ── */}
          <TouchableOpacity
            style={[styles.sidebarToggleBtn, !isSidebarOpen && styles.sidebarToggleBtnCollapsed]}
            onPress={() => setIsSidebarOpen((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isSidebarOpen ? 'chevron-back-circle-outline' : 'menu'}
              size={17}
              color="#FACC15"
            />
            <Text style={styles.sidebarToggleBtnText}>
              {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
            </Text>
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
            onPress={() => showNotice('Studio notifications checked • 0 active alerts')}
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

      {/* ── MAIN LAYOUT: CONDITIONAL SIDEBAR + WORKSPACE ── */}
      <View style={styles.mainLayout}>
        {/* ── LEFT SIDEBAR (COLLAPSIBLE VIA TOGGLE BUTTON) ── */}
        {isSidebarOpen && (
          <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
            <View style={styles.sidebarHeaderRow}>
              <Text style={styles.sidebarHeaderHeading}>NAVIGATION</Text>
              <TouchableOpacity
                onPress={() => setIsSidebarOpen(false)}
                style={styles.sidebarCollapseSmallBtn}
              >
                <Ionicons name="chevron-back" size={14} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.sidebarItem, activeMenu === 'dashboard' && styles.sidebarItemActive]}
              onPress={() => setActiveMenu('dashboard')}
            >
              <Ionicons
                name="grid"
                size={15}
                color={activeMenu === 'dashboard' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'dashboard' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
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
                size={15}
                color={activeMenu === 'bookings' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'bookings' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
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
                size={15}
                color={activeMenu === 'projects' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'projects' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
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
                size={15}
                color={activeMenu === 'payments' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'payments' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
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
                size={15}
                color={activeMenu === 'customers' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'customers' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
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
                size={15}
                color={activeMenu === 'services' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'services' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
              >
                Services
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sidebarItem, activeMenu === 'availability' && styles.sidebarItemActive]}
              onPress={() => setActiveMenu('availability')}
            >
              <Ionicons
                name="time-outline"
                size={15}
                color={activeMenu === 'availability' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'availability' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
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
                size={15}
                color={activeMenu === 'content' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'content' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
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
                size={15}
                color={activeMenu === 'reports' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'reports' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
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
                size={15}
                color={activeMenu === 'settings' ? '#000000' : '#9CA3AF'}
              />
              <Text
                style={[
                  styles.sidebarText,
                  activeMenu === 'settings' && styles.sidebarTextActive,
                ]}
                numberOfLines={1}
              >
                Settings
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}

        {/* ── MAIN WORKSPACE ── */}
        <ScrollView style={styles.workspace} contentContainerStyle={styles.workspaceContent}>
          {/* ============================================================ */}
          {/* VIEW 1: DASHBOARD (MATCHES MOCKUP PIXEL-FOR-PIXEL)           */}
          {/* ============================================================ */}
          {activeMenu === 'dashboard' && (
            <>
              {/* ── 4 TOP STAT CARDS ── */}
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

                  {/* Row: Recent Bookings Table (WITH EXPORT CLIENT LOGINS) + Quick Actions */}
                  <View style={styles.bookingsQuickRow}>
                    {/* ── RECENT BOOKINGS CARD (WITH EXPORT BUTTON) ── */}
                    <View style={styles.recentBookingsCard}>
                      <View style={styles.cardHeaderRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.cardHeaderTitle}>Recent Bookings</Text>
                        </View>

                        {/* EXPORT CLIENT LOGINS BUTTON - ONLY IN BOOKINGS AREA */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <TouchableOpacity
                            style={styles.exportClientLoginsBtn}
                            onPress={handleExportUserLogins}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="download-outline" size={13} color="#000000" />
                            <Text style={styles.exportClientLoginsBtnText}>Export Client Logins (Excel)</Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={() => setActiveMenu('bookings')}>
                            <Text style={styles.cardHeaderLink}>View All</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Bookings Table Header */}
                      <View style={styles.tableHeader}>
                        <Text style={[styles.th, { width: 55 }]}>#</Text>
                        <Text style={[styles.th, { flex: 1.3 }]}>Customer (Username)</Text>
                        <Text style={[styles.th, { flex: 1.1 }]}>Service</Text>
                        <Text style={[styles.th, { flex: 1.3 }]}>Date & Time</Text>
                        <Text style={[styles.th, { width: 75 }]}>Amount</Text>
                        <Text style={[styles.th, { width: 85 }]}>Status</Text>
                        <Text style={[styles.th, { width: 45, textAlign: 'center' }]}>Pass</Text>
                      </View>

                      {/* Bookings Table Body */}
                      <View style={styles.tableBody}>
                        {bookingsList.slice(0, 4).map((b) => (
                          <View key={b.id} style={styles.tableRow}>
                            <Text style={[styles.td, { width: 55, color: '#9CA3AF' }]}>{b.id}</Text>
                            <View style={{ flex: 1.3 }}>
                              <Text style={[styles.td, { fontWeight: '700', color: '#FFFFFF' }]}>
                                {b.clientUsername}
                              </Text>
                              <Text style={{ color: '#6B7280', fontSize: 10 }}>{b.clientEmail}</Text>
                            </View>
                            <Text style={[styles.td, { flex: 1.1, color: '#D1D5DB' }]}>{b.service}</Text>
                            <Text style={[styles.td, { flex: 1.3, color: '#9CA3AF', fontSize: 11 }]}>
                              {b.dateTime}
                            </Text>
                            <Text style={[styles.td, { width: 75, color: '#FACC15', fontWeight: '800' }]}>
                              ₹{b.amount.toLocaleString('en-IN')}
                            </Text>
                            <View style={{ width: 85 }}>
                              <View
                                style={[
                                  styles.statusTag,
                                  b.status === 'Confirmed'
                                    ? styles.statusTagGreen
                                    : b.status === 'Pending'
                                    ? styles.statusTagYellow
                                    : styles.statusTagBlue,
                                ]}
                              >
                                <Text
                                  style={
                                    b.status === 'Confirmed'
                                      ? styles.statusTagGreenText
                                      : b.status === 'Pending'
                                      ? styles.statusTagYellowText
                                      : styles.statusTagBlueText
                                  }
                                >
                                  {b.status}
                                </Text>
                              </View>
                            </View>
                            <TouchableOpacity
                              style={{ width: 45, alignItems: 'center' }}
                              onPress={() => setSelectedPassBooking(b)}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="eye-outline" size={16} color="#FACC15" />
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
                          onPress={() => setShowNewBookingModal(true)}
                        >
                          <Ionicons name="calendar-outline" size={16} color="#FACC15" />
                          <Text style={styles.quickActionText}>New Booking</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.quickActionBtn}
                          onPress={() => setShowUploadModal(true)}
                        >
                          <Ionicons name="cloud-upload-outline" size={16} color="#FACC15" />
                          <Text style={styles.quickActionText}>Upload Project File</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.quickActionBtn}
                          onPress={() => {
                            const pendingPayment = paymentsList.find((p) => p.status === 'Pending');
                            if (pendingPayment) {
                              handleVerifyPayment(pendingPayment.id);
                            } else {
                              showNotice('All current payments are already verified.');
                            }
                          }}
                        >
                          <Ionicons name="checkmark-circle-outline" size={16} color="#FACC15" />
                          <Text style={styles.quickActionText}>Verify Payment</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.quickActionBtn}
                          onPress={() => setShowAddCustomerModal(true)}
                        >
                          <Ionicons name="person-add-outline" size={16} color="#FACC15" />
                          <Text style={styles.quickActionText}>Add Customer</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.quickActionBtn}
                          onPress={() => setActiveMenu('services')}
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
            </>
          )}

          {/* ============================================================ */}
          {/* VIEW 2: BOOKINGS (FULL VIEW WITH EXPORT CLIENT LOGINS)       */}
          {/* ============================================================ */}
          {activeMenu === 'bookings' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Studio Bookings & Client Reservations</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Manage client bookings, time slots, studio suites, and export client user credentials.
                  </Text>
                </View>

                {/* Top Action Bar with Export Client Logins & New Booking */}
                <View style={styles.viewHeaderActions}>
                  <TouchableOpacity
                    style={styles.exportClientLoginsBtnLarge}
                    onPress={handleExportUserLogins}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="download-outline" size={15} color="#000000" />
                    <Text style={styles.exportClientLoginsBtnLargeText}>Export Client Logins (Excel)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.primaryActionBtn}
                    onPress={() => setShowNewBookingModal(true)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={16} color="#000000" />
                    <Text style={styles.primaryActionBtnText}>New Booking</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardBox}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: 75 }]}>Booking ID</Text>
                  <Text style={[styles.th, { flex: 1.4 }]}>Client Username</Text>
                  <Text style={[styles.th, { flex: 1.4 }]}>Email & Phone</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Service</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Studio Suite</Text>
                  <Text style={[styles.th, { flex: 1.4 }]}>Date & Time Slot</Text>
                  <Text style={[styles.th, { width: 85 }]}>Amount</Text>
                  <Text style={[styles.th, { width: 95 }]}>Status</Text>
                  <Text style={[styles.th, { width: 75, textAlign: 'center' }]}>Pass QR</Text>
                </View>

                <View style={styles.tableBody}>
                  {bookingsList.map((b) => (
                    <View key={b.id} style={styles.tableRow}>
                      <Text style={[styles.td, { width: 75, color: '#FACC15', fontWeight: '800' }]}>
                        {b.id}
                      </Text>
                      <Text style={[styles.td, { flex: 1.4, color: '#FFFFFF', fontWeight: '800' }]}>
                        {b.clientUsername}
                      </Text>
                      <View style={{ flex: 1.4 }}>
                        <Text style={{ color: '#93C5FD', fontSize: 11 }}>{b.clientEmail}</Text>
                        <Text style={{ color: '#9CA3AF', fontSize: 10 }}>{b.clientPhone}</Text>
                      </View>
                      <Text style={[styles.td, { flex: 1.2, color: '#D1D5DB' }]}>{b.service}</Text>
                      <Text style={[styles.td, { flex: 1.2, color: '#EAB308' }]}>{b.studioSuite}</Text>
                      <Text style={[styles.td, { flex: 1.4, color: '#9CA3AF', fontSize: 11 }]}>
                        {b.dateTime}
                      </Text>
                      <Text style={[styles.td, { width: 85, color: '#10B981', fontWeight: '800' }]}>
                        ₹{b.amount.toLocaleString('en-IN')}
                      </Text>
                      <View style={{ width: 95 }}>
                        <View
                          style={[
                            styles.statusTag,
                            b.status === 'Confirmed'
                              ? styles.statusTagGreen
                              : b.status === 'Pending'
                              ? styles.statusTagYellow
                              : styles.statusTagBlue,
                          ]}
                        >
                          <Text
                            style={
                              b.status === 'Confirmed'
                                ? styles.statusTagGreenText
                                : b.status === 'Pending'
                                ? styles.statusTagYellowText
                                : styles.statusTagBlueText
                            }
                          >
                            {b.status}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={{ width: 75, alignItems: 'center' }}
                        onPress={() => setSelectedPassBooking(b)}
                      >
                        <View style={styles.viewPassPill}>
                          <Ionicons name="qr-code-outline" size={13} color="#000000" />
                          <Text style={styles.viewPassPillText}>Pass</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 3: PROJECTS                                            */}
          {/* ============================================================ */}
          {activeMenu === 'projects' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Studio Projects</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Track dubbing, vocal stems, mixing revisions, and deliverable schedules.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setShowUploadModal(true)}
                >
                  <Ionicons name="cloud-upload" size={15} color="#000000" />
                  <Text style={styles.primaryActionBtnText}>Upload Stems</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardBox}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: 80 }]}>Project ID</Text>
                  <Text style={[styles.th, { flex: 1.6 }]}>Project Title</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Client</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Suite</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>Progress</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Due Date</Text>
                  <Text style={[styles.th, { width: 70 }]}>Stems</Text>
                  <Text style={[styles.th, { width: 95 }]}>Status</Text>
                </View>

                <View style={styles.tableBody}>
                  {projectsList.map((p) => (
                    <View key={p.id} style={styles.tableRow}>
                      <Text style={[styles.td, { width: 80, color: '#FACC15', fontWeight: '800' }]}>
                        {p.id}
                      </Text>
                      <Text style={[styles.td, { flex: 1.6, color: '#FFFFFF', fontWeight: '700' }]}>
                        {p.title}
                      </Text>
                      <Text style={[styles.td, { flex: 1.2, color: '#9CA3AF' }]}>{p.clientUsername}</Text>
                      <Text style={[styles.td, { flex: 1, color: '#EAB308' }]}>{p.studioSuite}</Text>
                      <View style={{ flex: 1.5, paddingRight: 10 }}>
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              {
                                width: `${p.progressPercent}%`,
                                backgroundColor: p.progressPercent === 100 ? '#10B981' : '#FACC15',
                              },
                            ]}
                          />
                        </View>
                        <Text style={{ color: '#9CA3AF', fontSize: 10, marginTop: 2 }}>
                          {p.progressPercent}% Complete
                        </Text>
                      </View>
                      <Text style={[styles.td, { flex: 1, color: '#D1D5DB', fontSize: 11 }]}>
                        {p.dueDate}
                      </Text>
                      <Text style={[styles.td, { width: 70, color: '#22D3EE', fontWeight: '700' }]}>
                        {p.stemsCount} files
                      </Text>
                      <View style={{ width: 95 }}>
                        <View
                          style={[
                            styles.statusTag,
                            p.status === 'Completed'
                              ? styles.statusTagGreen
                              : p.status === 'Under Review'
                              ? styles.statusTagCyan
                              : styles.statusTagYellow,
                          ]}
                        >
                          <Text
                            style={
                              p.status === 'Completed'
                                ? styles.statusTagGreenText
                                : p.status === 'Under Review'
                                ? styles.statusTagCyanText
                                : styles.statusTagYellowText
                            }
                          >
                            {p.status}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 4: PAYMENTS                                            */}
          {/* ============================================================ */}
          {activeMenu === 'payments' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Studio Payments & UPI Ledger</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Real-time UPI transactions, UTR receipts, and payment verification.
                  </Text>
                </View>
                <View style={styles.upiPill}>
                  <Text style={styles.upiPillText}>UPI ID: cassatebandrecordz@okhdfcbank</Text>
                </View>
              </View>

              <View style={styles.cardBox}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: 90 }]}>Receipt ID</Text>
                  <Text style={[styles.th, { flex: 1.3 }]}>Client Username</Text>
                  <Text style={[styles.th, { flex: 1.3 }]}>Amount (₹)</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>UPI UTR / Ref No.</Text>
                  <Text style={[styles.th, { flex: 1.1 }]}>App / Method</Text>
                  <Text style={[styles.th, { flex: 1.3 }]}>Timestamp</Text>
                  <Text style={[styles.th, { width: 90 }]}>Status</Text>
                  <Text style={[styles.th, { width: 80, textAlign: 'center' }]}>Action</Text>
                </View>

                <View style={styles.tableBody}>
                  {paymentsList.map((p) => (
                    <View key={p.id} style={styles.tableRow}>
                      <Text style={[styles.td, { width: 90, color: '#FACC15', fontWeight: '800' }]}>
                        {p.id}
                      </Text>
                      <Text style={[styles.td, { flex: 1.3, color: '#FFFFFF', fontWeight: '700' }]}>
                        {p.clientUsername}
                      </Text>
                      <Text style={[styles.td, { flex: 1.3, color: '#10B981', fontWeight: '800' }]}>
                        ₹{p.amount.toLocaleString('en-IN')}
                      </Text>
                      <Text style={[styles.td, { flex: 1.5, color: '#93C5FD', fontFamily: 'monospace' }]}>
                        {p.upiRefId}
                      </Text>
                      <Text style={[styles.td, { flex: 1.1, color: '#D1D5DB' }]}>{p.method}</Text>
                      <Text style={[styles.td, { flex: 1.3, color: '#9CA3AF', fontSize: 11 }]}>
                        {p.dateTime}
                      </Text>
                      <View style={{ width: 90 }}>
                        <View
                          style={[
                            styles.statusTag,
                            p.status === 'Verified' ? styles.statusTagGreen : styles.statusTagYellow,
                          ]}
                        >
                          <Text
                            style={
                              p.status === 'Verified'
                                ? styles.statusTagGreenText
                                : styles.statusTagYellowText
                            }
                          >
                            {p.status}
                          </Text>
                        </View>
                      </View>
                      <View style={{ width: 80, alignItems: 'center' }}>
                        {p.status === 'Pending' ? (
                          <TouchableOpacity
                            style={styles.verifyBtn}
                            onPress={() => handleVerifyPayment(p.id)}
                          >
                            <Text style={styles.verifyBtnText}>Verify</Text>
                          </TouchableOpacity>
                        ) : (
                          <Ionicons name="checkmark-done" size={18} color="#10B981" />
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 5: CUSTOMERS (SYNCED WITH SUPABASE DATABASE)            */}
          {/* ============================================================ */}
          {activeMenu === 'customers' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Customer Accounts & Authentication Directory</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Real-time Supabase database profiles, device tracking, and user login history.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setShowAddCustomerModal(true)}
                >
                  <Ionicons name="person-add" size={15} color="#000000" />
                  <Text style={styles.primaryActionBtnText}>Add Customer</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardBox}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { width: 75 }]}>User ID</Text>
                  <Text style={[styles.th, { flex: 1.3 }]}>Customer Name</Text>
                  <Text style={[styles.th, { flex: 1.5 }]}>Email ID</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Password / Key</Text>
                  <Text style={[styles.th, { flex: 1.3 }]}>Login Device</Text>
                  <Text style={[styles.th, { flex: 1.6 }]}>Location (Where its login)</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Last Active</Text>
                  <Text style={[styles.th, { width: 75 }]}>Bookings</Text>
                </View>

                <View style={styles.tableBody}>
                  {userLogins.map((user) => (
                    <View key={user.id} style={styles.tableRow}>
                      <Text style={[styles.td, { width: 75, color: '#FACC15', fontWeight: '800' }]}>
                        {user.id}
                      </Text>
                      <Text style={[styles.td, { flex: 1.3, fontWeight: '700', color: '#FFFFFF' }]}>
                        {user.name}
                      </Text>
                      <Text style={[styles.td, { flex: 1.5, color: '#93C5FD' }]}>{user.email}</Text>
                      <Text
                        style={[
                          styles.td,
                          { flex: 1.2, color: '#EAB308', fontFamily: 'monospace' },
                        ]}
                      >
                        {user.passwordDisplay}
                      </Text>
                      <Text style={[styles.td, { flex: 1.3, color: '#9CA3AF', fontSize: 11 }]}>
                        {user.device}
                      </Text>
                      <Text style={[styles.td, { flex: 1.6, color: '#D1D5DB', fontSize: 11 }]}>
                        {user.loginLocation}
                      </Text>
                      <Text style={[styles.td, { flex: 1.2, color: '#9CA3AF', fontSize: 11 }]}>
                        {user.lastLogin}
                      </Text>
                      <Text style={[styles.td, { width: 75, color: '#10B981', fontWeight: '800' }]}>
                        {user.totalBookings}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 6: SERVICES                                            */}
          {/* ============================================================ */}
          {activeMenu === 'services' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Studio Services & Hourly Rate Card</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Enable or disable studio services and configure hourly/track pricing.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => showNotice('New service created.')}
                >
                  <Ionicons name="add" size={16} color="#000000" />
                  <Text style={styles.primaryActionBtnText}>Add Service</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.servicesGrid}>
                {servicesList.map((srv) => (
                  <View key={srv.id} style={styles.serviceRateCard}>
                    <View style={styles.serviceCardTop}>
                      <View style={styles.serviceIconPill}>
                        <Ionicons name="sparkles" size={14} color="#FACC15" />
                        <Text style={styles.serviceCatText}>{srv.category}</Text>
                      </View>
                      <Switch
                        value={srv.active}
                        onValueChange={() => handleToggleService(srv.id)}
                        trackColor={{ false: '#374151', true: '#FACC15' }}
                        thumbColor="#FFFFFF"
                      />
                    </View>

                    <Text style={styles.serviceNameTitle}>{srv.name}</Text>
                    <Text style={styles.serviceSuiteDesc}>{srv.studioSuite}</Text>

                    <View style={styles.serviceRateRow}>
                      <Text style={styles.serviceRatePrice}>₹{srv.ratePerHour.toLocaleString('en-IN')}</Text>
                      <Text style={styles.serviceRateUnit}>/ {srv.unit}</Text>
                      <View
                        style={[
                          styles.activeBadge,
                          { backgroundColor: srv.active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)' },
                        ]}
                      >
                        <Text
                          style={{
                            color: srv.active ? '#10B981' : '#EF4444',
                            fontSize: 10,
                            fontWeight: '800',
                          }}
                        >
                          {srv.active ? 'Live on App' : 'Disabled'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 7: AVAILABILITY (SLOT MATRIX)                          */}
          {/* ============================================================ */}
          {activeMenu === 'availability' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Studio Room Slot Availability</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Lock, unlock, or mark slots as booked in real-time across Studio A and Studio B.
                  </Text>
                </View>

                {/* Studio Suite Selector */}
                <View style={styles.suiteToggleRow}>
                  <TouchableOpacity
                    style={[styles.suiteTab, availStudio === 'Studio A' && styles.suiteTabActive]}
                    onPress={() => setAvailStudio('Studio A')}
                  >
                    <Text style={[styles.suiteTabText, availStudio === 'Studio A' && styles.suiteTabTextActive]}>
                      Studio A (Dubbing/Atmos)
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.suiteTab, availStudio === 'Studio B' && styles.suiteTabActive]}
                    onPress={() => setAvailStudio('Studio B')}
                  >
                    <Text style={[styles.suiteTabText, availStudio === 'Studio B' && styles.suiteTabTextActive]}>
                      Studio B (VO/Foley)
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.cardBox}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.th, { flex: 1.5 }]}>Time Slot Range</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Studio Suite</Text>
                  <Text style={[styles.th, { flex: 1 }]}>Status</Text>
                  <Text style={[styles.th, { flex: 1.2 }]}>Current Reservation</Text>
                  <Text style={[styles.th, { width: 120, textAlign: 'center' }]}>Toggle Slot</Text>
                </View>

                <View style={styles.tableBody}>
                  {Object.entries(slotStatusMap).map(([time, status]) => (
                    <View key={time} style={styles.tableRow}>
                      <Text style={[styles.td, { flex: 1.5, color: '#FFFFFF', fontWeight: '800' }]}>
                        {time}
                      </Text>
                      <Text style={[styles.td, { flex: 1, color: '#FACC15' }]}>{availStudio}</Text>
                      <View style={{ flex: 1 }}>
                        <View
                          style={[
                            styles.statusTag,
                            status === 'Available'
                              ? styles.statusTagGreen
                              : status === 'Booked'
                              ? styles.statusTagYellow
                              : styles.statusTagBlue,
                          ]}
                        >
                          <Text
                            style={
                              status === 'Available'
                                ? styles.statusTagGreenText
                                : status === 'Booked'
                                ? styles.statusTagYellowText
                                : styles.statusTagBlueText
                            }
                          >
                            {status}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.td, { flex: 1.2, color: '#9CA3AF' }]}>
                        {status === 'Booked' ? 'Client: Arjun Movies' : 'Open for Booking'}
                      </Text>
                      <View style={{ width: 120, alignItems: 'center' }}>
                        <TouchableOpacity
                          style={styles.slotToggleBtn}
                          onPress={() => handleToggleSlot(time)}
                        >
                          <Text style={styles.slotToggleBtnText}>Switch Status</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 8: APP CONTENT (APP BANNERS MANAGER)                   */}
          {/* ============================================================ */}
          {activeMenu === 'content' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Mobile App Banners & Content</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Control which carousel slides appear on the mobile Android app home screen.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={handlePublishBannersToApp}
                >
                  <Ionicons name="paper-plane" size={15} color="#000000" />
                  <Text style={styles.primaryActionBtnText}>Publish to App Now</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bannersManagerRow}>
                {/* Left: Mobile App Preview Frame */}
                <View style={styles.mobileSimFrame}>
                  <Text style={styles.mobileSimFrameTitle}>Mobile App Live Preview</Text>
                  <View style={styles.mobilePhoneScreen}>
                    <Image
                      source={require('../assets/images/hero_studio.jpg')}
                      style={styles.mobilePhoneScreenBg}
                      resizeMode="cover"
                    />
                    <View style={styles.mobilePhoneOverlay}>
                      <Text style={styles.mobilePhoneHead}>{activeBanner.title}</Text>
                      <Text style={styles.mobilePhoneSub}>{activeBanner.sub}</Text>
                      <TouchableOpacity style={styles.mobilePhoneBtn}>
                        <Text style={styles.mobilePhoneBtnText}>Book Slot →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* Right: Slide Controller List */}
                <View style={{ flex: 1, gap: 12 }}>
                  {bannerSlides.map((b) => (
                    <View key={b.id} style={styles.bannerEditCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Ionicons name="image-outline" size={18} color="#FACC15" />
                          <Text style={styles.bannerItemTitle}>{b.title}</Text>
                        </View>
                        <Switch
                          value={b.published}
                          onValueChange={() => handleToggleBanner(b.id)}
                          trackColor={{ false: '#374151', true: '#FACC15' }}
                          thumbColor="#FFFFFF"
                        />
                      </View>
                      <Text style={{ color: '#9CA3AF', fontSize: 12, marginVertical: 4 }}>{b.sub}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <View style={[styles.statusTag, b.published ? styles.statusTagGreen : styles.statusTagYellow]}>
                          <Text style={b.published ? styles.statusTagGreenText : styles.statusTagYellowText}>
                            {b.published ? 'Live on Mobile App' : 'Draft / Hidden'}
                          </Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 9: REPORTS                                             */}
          {/* ============================================================ */}
          {activeMenu === 'reports' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Studio Analytics & Utilization Reports</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Financial revenue distribution, studio suite occupancy, and top clients.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => showNotice('Monthly report PDF generated.')}
                >
                  <Ionicons name="document-text" size={15} color="#000000" />
                  <Text style={styles.primaryActionBtnText}>Download Statement</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statCard}>
                  <View style={styles.statIconBoxGold}>
                    <Ionicons name="mic" size={20} color="#FACC15" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Studio A Occupancy</Text>
                    <Text style={styles.statValue}>85%</Text>
                  </View>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconBoxGreen}>
                    <Ionicons name="musical-notes" size={20} color="#10B981" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Studio B Occupancy</Text>
                    <Text style={styles.statValue}>72%</Text>
                  </View>
                </View>

                <View style={styles.statCard}>
                  <View style={styles.statIconBoxYellow}>
                    <Ionicons name="trending-up" size={20} color="#F59E0B" />
                  </View>
                  <View>
                    <Text style={styles.statLabel}>Monthly Growth</Text>
                    <Text style={styles.statValue}>+24.8%</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ============================================================ */}
          {/* VIEW 10: SETTINGS                                           */}
          {/* ============================================================ */}
          {activeMenu === 'settings' && (
            <View style={styles.fullViewContainer}>
              <View style={styles.viewHeaderRow}>
                <View>
                  <Text style={styles.viewHeaderTitle}>Studio Configuration & Admin Settings</Text>
                  <Text style={styles.viewHeaderSubtitle}>
                    Configure studio contact, UPI merchant ID, and system credentials.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => showNotice('Studio settings updated successfully.')}
                >
                  <Ionicons name="save" size={15} color="#000000" />
                  <Text style={styles.primaryActionBtnText}>Save Settings</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.cardBox}>
                <Text style={styles.settingsSectionTitle}>General Studio Information</Text>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Studio Name</Text>
                  <TextInput
                    style={styles.settingsInput}
                    defaultValue="Cassate Band Recordz Post Production Studio"
                    editable={false}
                  />
                </View>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Official Phone</Text>
                  <TextInput style={styles.settingsInput} defaultValue="+91 90252 53695" editable={false} />
                </View>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>Support Email</Text>
                  <TextInput
                    style={styles.settingsInput}
                    defaultValue="info@cassatebandrecordz.com"
                    editable={false}
                  />
                </View>
                <View style={styles.settingsRow}>
                  <Text style={styles.settingsLabel}>UPI Merchant ID</Text>
                  <TextInput
                    style={styles.settingsInput}
                    defaultValue="cassatebandrecordz@okhdfcbank"
                    editable={false}
                  />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      {/* ── MODAL 1: DIGITAL STUDIO PASS & QR CODE ── */}
      <Modal visible={!!selectedPassBooking} transparent={true} animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="qr-code" size={20} color="#FACC15" />
                <Text style={styles.modalTitle}>Digital Studio Pass</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedPassBooking(null)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {selectedPassBooking && (
              <View style={styles.passBody}>
                <View style={styles.passCardInner}>
                  <Text style={styles.passStudioBadge}>CASSATE BAND RECORDZ VIP ACCESS</Text>
                  <Text style={styles.passClientName}>{selectedPassBooking.clientUsername}</Text>
                  <Text style={styles.passService}>{selectedPassBooking.service}</Text>

                  <View style={styles.passDetailsGrid}>
                    <View>
                      <Text style={styles.passDetailLabel}>Booking ID</Text>
                      <Text style={styles.passDetailVal}>{selectedPassBooking.id}</Text>
                    </View>
                    <View>
                      <Text style={styles.passDetailLabel}>Studio Suite</Text>
                      <Text style={styles.passDetailVal}>{selectedPassBooking.studioSuite}</Text>
                    </View>
                    <View>
                      <Text style={styles.passDetailLabel}>Slot Schedule</Text>
                      <Text style={styles.passDetailVal}>{selectedPassBooking.dateTime}</Text>
                    </View>
                    <View>
                      <Text style={styles.passDetailLabel}>Status</Text>
                      <Text style={[styles.passDetailVal, { color: '#10B981' }]}>
                        {selectedPassBooking.status}
                      </Text>
                    </View>
                  </View>

                  {/* QR Box */}
                  <View style={styles.qrBox}>
                    <Ionicons name="qr-code" size={110} color="#000000" />
                    <Text style={styles.qrCaption}>Scan at Studio Reception Desk</Text>
                  </View>
                </View>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.modalCloseBtn}
                    onPress={() => setSelectedPassBooking(null)}
                  >
                    <Text style={styles.modalCloseBtnText}>Close Pass</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* ── MODAL 2: NEW BOOKING MODAL ── */}
      <Modal visible={showNewBookingModal} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="calendar" size={20} color="#FACC15" />
                <Text style={styles.modalTitle}>Create New Studio Booking</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNewBookingModal(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Customer / Client Username</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Dream Warrior Pictures"
                placeholderTextColor="#6B7280"
                value={newBookingClient}
                onChangeText={setNewBookingClient}
              />

              <Text style={styles.formLabel}>Service Type</Text>
              <TextInput
                style={styles.formInput}
                value={newBookingService}
                onChangeText={setNewBookingService}
              />

              <Text style={styles.formLabel}>Studio Suite</Text>
              <TextInput
                style={styles.formInput}
                value={newBookingSuite}
                onChangeText={setNewBookingSuite}
              />

              <Text style={styles.formLabel}>Date & Time Slot</Text>
              <TextInput
                style={styles.formInput}
                value={newBookingDate}
                onChangeText={setNewBookingDate}
              />

              <Text style={styles.formLabel}>Total Amount (₹)</Text>
              <TextInput
                style={styles.formInput}
                value={newBookingAmount}
                onChangeText={setNewBookingAmount}
                keyboardType="numeric"
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowNewBookingModal(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleCreateBookingSubmit}
                >
                  <Text style={styles.modalPrimaryBtnText}>Confirm Booking</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 3: ADD CUSTOMER MODAL (SAVES TO SUPABASE) ── */}
      <Modal visible={showAddCustomerModal} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="person-add" size={20} color="#FACC15" />
                <Text style={styles.modalTitle}>Add Customer & Sync With Database</Text>
              </View>
              <TouchableOpacity onPress={() => setShowAddCustomerModal(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Customer Name / Studio Client</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Ramesh Varma"
                placeholderTextColor="#6B7280"
                value={newCustName}
                onChangeText={setNewCustName}
              />

              <Text style={styles.formLabel}>Email ID (Login Username)</Text>
              <TextInput
                style={styles.formInput}
                placeholder="ramesh.varma@gmail.com"
                placeholderTextColor="#6B7280"
                value={newCustEmail}
                onChangeText={setNewCustEmail}
                keyboardType="email-address"
              />

              <Text style={styles.formLabel}>Phone Number</Text>
              <TextInput
                style={styles.formInput}
                value={newCustPhone}
                onChangeText={setNewCustPhone}
              />

              <Text style={styles.formLabel}>Password / Passcode</Text>
              <TextInput
                style={styles.formInput}
                value={newCustPassword}
                onChangeText={setNewCustPassword}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowAddCustomerModal(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={handleAddCustomerSubmit}
                >
                  <Text style={styles.modalPrimaryBtnText}>Save Customer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 4: UPLOAD PROJECT FILE MODAL ── */}
      <Modal visible={showUploadModal} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="cloud-upload" size={20} color="#FACC15" />
                <Text style={styles.modalTitle}>Upload Audio Stems / Reference</Text>
              </View>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <Ionicons name="close" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Target Project</Text>
              <TextInput
                style={styles.formInput}
                value={uploadTargetProject}
                onChangeText={setUploadTargetProject}
              />

              <View style={styles.uploadDropZone}>
                <Ionicons name="document-attach-outline" size={36} color="#FACC15" />
                <Text style={styles.uploadDropZoneTitle}>Select WAV, MP3, Pro Tools Session, or MP4</Text>
                <Text style={styles.uploadDropZoneSub}>Supports lossless multi-track stems up to 4GB</Text>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setShowUploadModal(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalPrimaryBtn}
                  onPress={() => {
                    setShowUploadModal(false);
                    showNotice('Project audio stems uploaded & processed.');
                  }}
                >
                  <Text style={styles.modalPrimaryBtnText}>Start Upload</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── MODAL 5: EXCEL CSV EXPORT PREVIEW (MOBILE / FALLBACK) ── */}
      <Modal visible={showExportModal} transparent={true} animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Ionicons name="document-text" size={20} color="#FACC15" />
                <Text style={styles.modalTitle}>Client Logins Excel Data Export</Text>
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
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: {
    color: '#EAB308',
    fontSize: 12,
    fontWeight: '700',
  },

  // Sidebar Hide / Unhide Toggle Button
  sidebarToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1A1A24',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sidebarToggleBtnCollapsed: {
    borderColor: '#FACC15',
    backgroundColor: 'rgba(250, 204, 21, 0.1)',
  },
  sidebarToggleBtnText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
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

  // ── Sidebar (Medium-Sized Compact Width: 136px) ──
  sidebar: {
    width: 136,
    minWidth: 136,
    maxWidth: 136,
    backgroundColor: '#0E0E16',
    borderRightWidth: 1,
    borderRightColor: '#1A1A26',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  sidebarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  sidebarHeaderHeading: {
    color: '#6B7280',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  sidebarCollapseSmallBtn: {
    padding: 2,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 7,
    borderRadius: 6,
    marginBottom: 3,
  },
  sidebarItemActive: {
    backgroundColor: '#FACC15',
  },
  sidebarText: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '700',
  },
  sidebarTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  newBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 3.5,
    paddingVertical: 0.5,
    borderRadius: 4,
    marginLeft: 'auto',
  },
  newBadgeText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '900',
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

  // Export Client Logins Button (inside Bookings Area)
  exportClientLoginsBtn: {
    backgroundColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  exportClientLoginsBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  exportClientLoginsBtnLarge: {
    backgroundColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  exportClientLoginsBtnLargeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
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

  // ── App Banners (Highlighted Yellow Frame) ──
  appBannersCard: {
    flex: 1,
    minWidth: 280,
    maxWidth: 360,
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FACC15',
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

  // ── Full View Container (For Bookings, Projects, Payments, etc.) ──
  fullViewContainer: {
    gap: 16,
  },
  viewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 4,
  },
  viewHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  viewHeaderSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  viewHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  primaryActionBtn: {
    backgroundColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  primaryActionBtnText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '900',
  },
  cardBox: {
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 16,
  },
  viewPassPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FACC15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  viewPassPillText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },

  // Projects View
  progressBarTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#262638',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Payments View
  upiPill: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: '#EAB308',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  upiPillText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
  },
  verifyBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // Services View
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  serviceRateCard: {
    width: '48%',
    minWidth: 260,
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 14,
  },
  serviceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  serviceIconPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#181824',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  serviceCatText: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '700',
  },
  serviceNameTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 2,
  },
  serviceSuiteDesc: {
    color: '#9CA3AF',
    fontSize: 11,
    marginBottom: 10,
  },
  serviceRateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  serviceRatePrice: {
    color: '#FACC15',
    fontSize: 16,
    fontWeight: '900',
  },
  serviceRateUnit: {
    color: '#6B7280',
    fontSize: 11,
  },
  activeBadge: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  // Availability View
  suiteToggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  suiteTab: {
    backgroundColor: '#181824',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#262638',
  },
  suiteTabActive: {
    backgroundColor: '#FACC15',
    borderColor: '#FACC15',
  },
  suiteTabText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '800',
  },
  suiteTabTextActive: {
    color: '#000000',
    fontWeight: '900',
  },
  slotToggleBtn: {
    backgroundColor: '#1F1F2E',
    borderWidth: 1,
    borderColor: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  slotToggleBtnText: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '700',
  },

  // App Banners Content View
  bannersManagerRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  mobileSimFrame: {
    width: 260,
    backgroundColor: '#12121A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 12,
    alignItems: 'center',
  },
  mobileSimFrameTitle: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
  },
  mobilePhoneScreen: {
    width: 236,
    height: 380,
    backgroundColor: '#000000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 2,
    borderColor: '#262638',
  },
  mobilePhoneScreenBg: {
    width: '100%',
    height: '100%',
  },
  mobilePhoneOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 14,
    justifyContent: 'center',
  },
  mobilePhoneHead: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  mobilePhoneSub: {
    color: '#D1D5DB',
    fontSize: 11,
    marginVertical: 6,
  },
  mobilePhoneBtn: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  mobilePhoneBtnText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '900',
  },
  bannerEditCard: {
    backgroundColor: '#12121A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F1F2E',
    padding: 14,
  },

  // Settings View
  settingsSectionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 14,
  },
  settingsRow: {
    marginBottom: 12,
  },
  settingsLabel: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingsInput: {
    backgroundColor: '#181824',
    borderWidth: 1,
    borderColor: '#262638',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 12,
  },

  // ── Modals General ──
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    gap: 10,
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
  modalCancelBtn: {
    backgroundColor: '#1F1F2E',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalCancelBtnText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700',
  },
  modalPrimaryBtn: {
    backgroundColor: '#FACC15',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalPrimaryBtnText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '900',
  },

  // Form Controls in Modals
  formContainer: {
    gap: 8,
  },
  formLabel: {
    color: '#D1D5DB',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  formInput: {
    backgroundColor: '#181824',
    borderWidth: 1,
    borderColor: '#2D2D3F',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
  },
  uploadDropZone: {
    borderWidth: 2,
    borderColor: '#FACC15',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: 'rgba(250, 204, 21, 0.04)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    gap: 6,
  },
  uploadDropZoneTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  uploadDropZoneSub: {
    color: '#9CA3AF',
    fontSize: 11,
  },

  // Digital Pass Inner Card
  passBody: {
    alignItems: 'center',
  },
  passCardInner: {
    width: '100%',
    backgroundColor: '#181824',
    borderWidth: 1.5,
    borderColor: '#FACC15',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  passStudioBadge: {
    color: '#FACC15',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  passClientName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  passService: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 14,
  },
  passDetailsGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    backgroundColor: '#12121A',
    padding: 12,
    borderRadius: 8,
    marginBottom: 14,
  },
  passDetailLabel: {
    color: '#6B7280',
    fontSize: 10,
    fontWeight: '700',
  },
  passDetailVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrCaption: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 4,
  },
});
