import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  BookingItem,
  INITIAL_BOOKINGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROJECTS,
  ADMIN_STATS,
  NotificationItem,
  ProjectItem,
  RevisionItem,
  SERVICES,
  ServiceItem,
  STUDIOS,
  StudioRoom,
} from '../data/mockData';
import { StudioApi, CreateBookingPayload } from '../services/api';

export interface BookingDraft {
  serviceId: string;
  serviceName: string;
  studioId: string;
  studioName: string;
  studioSubtitle: string;
  durationLabel: string;
  durationHours: number;
  date: string;
  dayNumber: number;
  timeSlot: string;
  studioCharges: number;
  gstAmount: number;
  totalPrice: number;
  advanceAmount: number;
  paymentMethod: string;
  engineerIncluded?: boolean;
  notes?: string;
}

const DEFAULT_BOOKING_DRAFT: BookingDraft = {
  serviceId: 'dubbing',
  serviceName: 'Dubbing Studio',
  studioId: 'studio-dubbing',
  studioName: 'Dubbing Studio',
  studioSubtitle: 'Dubbing & VO (Acoustic Treated)',
  durationLabel: '2 Hours',
  durationHours: 2,
  date: 'Fri, 20 Nov 2026',
  dayNumber: 20,
  timeSlot: '02:00 PM - 04:00 PM (2 Slots)',
  studioCharges: 700,
  gstAmount: 0,
  totalPrice: 700,
  advanceAmount: 700, // Full payment term
  paymentMethod: 'UPI Full Payment',
  engineerIncluded: true,
};

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  role: string;
  tier?: string;
  studioCredits?: number;
  isAdmin: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  name: 'Devon Vance',
  email: 'client@cassaterecordz.com',
  phone: '+91 90252 53695',
  company: 'Vance Audio Visual Works',
  role: 'Studio Client',
  tier: 'Studio Client',
  studioCredits: 450,
  isAdmin: false,
};

interface AppContextType {
  user: UserProfile;
  isLoggedIn: boolean;
  login: (params: { identifier: string; password?: string; device?: string; loginLocation?: string }) => Promise<{ success: boolean; error?: string }>;
  register: (params: { name: string; email: string; password?: string; phone?: string; device?: string; loginLocation?: string }) => Promise<{ success: boolean; error?: string }>;
  loginDemo: (override?: Partial<UserProfile>) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  toggleAdminMode: () => void;

  services: ServiceItem[];
  studios: StudioRoom[];
  projects: ProjectItem[];
  bookings: BookingItem[];
  bookingDraft: BookingDraft;
  updateBookingDraft: (updates: Partial<BookingDraft>) => void;
  confirmBooking: (customPayload?: Partial<CreateBookingPayload>) => BookingItem;
  cancelBooking: (id: string) => void;
  refreshBookings: () => Promise<void>;

  getProject: (id: string) => ProjectItem | undefined;
  addRevision: (projectId: string, revision: Omit<RevisionItem, 'id' | 'createdAt' | 'status'>) => void;
  updateProjectProgress: (projectId: string, percent: number) => void;

  notifications: NotificationItem[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  adminStats: typeof ADMIN_STATS;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Helper to convert database rows to mobile BookingItem model
function mapDbRowToBookingItem(b: any): BookingItem {
  return {
    id: b.id,
    referenceCode: b.id,
    serviceId: b.service_id || 'dubbing',
    serviceName: b.service_name || 'Dubbing Studio',
    studioId: b.service_id === 'dubbing' ? 'studio-dubbing' : 'studio-a',
    studioName: b.studio_name || 'Dubbing Studio (Acoustic Treated)',
    date: b.date,
    timeSlot: b.time_slot_label || (Array.isArray(b.time_slots) ? b.time_slots.join(', ') : b.time_slot || ''),
    durationHours: Array.isArray(b.time_slots) ? b.time_slots.length : 2,
    studioCharges: Number(b.total_price) || 700,
    gstAmount: 0,
    totalPrice: Number(b.total_price) || 700,
    advanceAmount: Number(b.advance_amount) || Number(b.total_price) || 700,
    paymentMethod: b.payment_method || 'UPI Full Payment',
    status: b.status === 'CONFIRMED' || b.status === 'Confirmed' ? 'Confirmed' : (b.status === 'COMPLETED' ? 'Completed' : 'Rescheduled'),
    notes: 'Studio session booked via official Cassate Band Recordz mobile app.',
    createdAt: b.created_at ? b.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(DEFAULT_BOOKING_DRAFT);

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // ── Database Login & Registration ──
  const login = async (params: { identifier: string; password?: string; device?: string; loginLocation?: string }) => {
    try {
      const res = await StudioApi.login(params.identifier, params.password, params.device, params.loginLocation);
      if (res.success && res.user) {
        setUser({
          id: res.user.id || `usr-${Date.now().toString().slice(-5)}`,
          name: res.user.name || params.identifier.split('@')[0],
          email: res.user.email || params.identifier,
          phone: res.user.phone || '+91 90252 53695',
          company: res.user.company || 'Studio Producer',
          role: res.user.role || 'Studio Client',
          isAdmin: Boolean(res.user.is_admin || res.user.isAdmin),
        });
        setIsLoggedIn(true);
        return { success: true };
      }
      return { success: false, error: res.error || 'Invalid credentials' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const register = async (params: { name: string; email: string; password?: string; phone?: string; device?: string; loginLocation?: string }) => {
    try {
      const res = await StudioApi.register(params);
      if (res.success && res.user) {
        setUser({
          id: res.user.id || `usr-${Date.now().toString().slice(-5)}`,
          name: res.user.name || params.name,
          email: res.user.email || params.email,
          phone: res.user.phone || params.phone || '+91 90252 53695',
          company: 'Studio Producer',
          role: 'Studio Client',
          isAdmin: false,
        });
        setIsLoggedIn(true);
        return { success: true };
      }
      return { success: false, error: res.error || 'Registration failed' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  // ── Sync with Supabase Database ──
  const refreshBookings = useCallback(async () => {
    try {
      const liveList = await StudioApi.getBookings(user.id, user.email);
      if (liveList && liveList.length > 0) {
        const formatted = liveList.map(mapDbRowToBookingItem);
        setBookings(formatted);
      }
    } catch (err) {
      console.warn('[AppContext] Failed to refresh bookings:', err);
    }
  }, [user.id, user.email]);

  useEffect(() => {
    // 1. Fetch live bookings on mount
    refreshBookings();

    // 2. Real-time subscription to live database changes via WebSockets
    const unsubscribe = StudioApi.subscribeToBookings((updatedList) => {
      if (updatedList && updatedList.length > 0) {
        const formatted = updatedList.map(mapDbRowToBookingItem);
        setBookings(formatted);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [refreshBookings]);

  const loginDemo = (override?: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...override }));
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(DEFAULT_USER);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const toggleAdminMode = () => {
    setUser((prev) => ({ ...prev, isAdmin: !prev.isAdmin }));
  };

  const updateBookingDraft = (updates: Partial<BookingDraft>) => {
    setBookingDraft((prev) => {
      const merged = { ...prev, ...updates };

      const studio = STUDIOS.find((s) => s.id === merged.studioId) || STUDIOS[0];
      const hours = merged.durationHours || 2;
      const charges = studio.hourlyRate * hours;
      const gst = 0; // Zero GST
      const total = charges;
      const advance = total; // 100% Full Payment

      merged.studioCharges = charges;
      merged.gstAmount = gst;
      merged.totalPrice = total;
      merged.advanceAmount = advance;

      return merged;
    });
  };

  const confirmBooking = (customPayload?: Partial<CreateBookingPayload>): BookingItem => {
    const randomCode = `CBR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newBooking: BookingItem = {
      id: randomCode,
      referenceCode: randomCode,
      serviceId: customPayload?.serviceId || bookingDraft.serviceId,
      serviceName: customPayload?.serviceName || bookingDraft.serviceName,
      studioId: bookingDraft.studioId,
      studioName: customPayload?.studioName || bookingDraft.studioName,
      date: customPayload?.date || bookingDraft.date,
      timeSlot: customPayload?.timeSlotLabel || bookingDraft.timeSlot,
      durationHours: customPayload?.timeSlots?.length || bookingDraft.durationHours,
      studioCharges: customPayload?.totalPrice || bookingDraft.totalPrice,
      gstAmount: 0,
      totalPrice: customPayload?.totalPrice || bookingDraft.totalPrice,
      advanceAmount: customPayload?.totalPrice || bookingDraft.totalPrice,
      paymentMethod: customPayload?.paymentMethod || 'UPI Full Payment',
      status: 'Confirmed',
      notes: bookingDraft.notes || 'Studio session booked via official mobile app.',
      createdAt: new Date().toISOString().split('T')[0],
    };

    // 1. Immediately update UI state for zero latency
    setBookings((prev) => [newBooking, ...prev]);

    // 2. Persist to live Supabase PostgreSQL backend in background
    const apiPayload: CreateBookingPayload = {
      serviceId: newBooking.serviceId,
      serviceName: newBooking.serviceName,
      studioName: newBooking.studioName,
      date: newBooking.date,
      timeSlots: customPayload?.timeSlots || [newBooking.timeSlot],
      timeSlotLabel: newBooking.timeSlot,
      totalPrice: newBooking.totalPrice,
      advanceAmount: newBooking.totalPrice,
      paymentMethod: newBooking.paymentMethod,
      upiRefId: randomCode,
      clientName: user.name,
      clientPhone: user.phone,
      clientEmail: user.email,
      userId: user.id,
    };

    StudioApi.createBooking(apiPayload)
      .then((res) => {
        if (res.success) {
          console.log('[Backend] Booking saved to live Supabase:', res.booking?.id || randomCode);
        }
      })
      .catch((err) => {
        console.warn('[Backend] Async Supabase save notice:', err);
      });

    // 3. Push instant in-app notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Booking Confirmed!',
      message: `Your reservation for ${newBooking.serviceName} (${randomCode}) is confirmed & active.`,
      type: 'booking',
      timestamp: 'Just now',
      read: false,
      targetId: newBooking.id,
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return newBooking;
  };

  const cancelBooking = (id: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'Rescheduled' as const } : b))
    );

    const target = bookings.find((b) => b.id === id);
    if (target) {
      StudioApi.cancelBooking(id, target.date, [target.timeSlot]).catch(() => {});
    }
  };

  const getProject = (id: string) => {
    return projects.find((p) => p.id === id || p.code.toLowerCase().includes(id.toLowerCase()));
  };

  const addRevision = (
    projectId: string,
    revisionData: Omit<RevisionItem, 'id' | 'createdAt' | 'status'>
  ) => {
    const newRev: RevisionItem = {
      ...revisionData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'In Review',
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id === projectId) {
          return {
            ...proj,
            status: 'Review' as const,
            revisions: [newRev, ...proj.revisions],
          };
        }
        return proj;
      })
    );
  };

  const updateProjectProgress = (projectId: string, percent: number) => {
    setProjects((prev) =>
      prev.map((proj) => (proj.id === projectId ? { ...proj, progressPercent: percent } : proj))
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        user,
        isLoggedIn,
        login,
        register,
        loginDemo,
        logout,
        updateProfile,
        toggleAdminMode,
        services: SERVICES,
        studios: STUDIOS,
        projects,
        bookings,
        bookingDraft,
        updateBookingDraft,
        confirmBooking,
        cancelBooking,
        refreshBookings,
        getProject,
        addRevision,
        updateProjectProgress,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        adminStats: ADMIN_STATS,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
