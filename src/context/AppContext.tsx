import React, { createContext, useContext, useState } from 'react';
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
  studioId: 'studio-a',
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
  advanceAmount: 350,
  paymentMethod: 'Pay at Studio',
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
  phone: '+91 98765 43210',
  company: 'Vance Audio Visual Works',
  role: 'Studio Client',
  tier: 'Studio Client',
  studioCredits: 450,
  isAdmin: false,
};

interface AppContextType {
  user: UserProfile;
  isLoggedIn: boolean;
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
  confirmBooking: () => BookingItem;
  cancelBooking: (id: string) => void;

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [projects, setProjects] = useState<ProjectItem[]>(INITIAL_PROJECTS);
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [bookingDraft, setBookingDraft] = useState<BookingDraft>(DEFAULT_BOOKING_DRAFT);

  const isLoggedIn = true;

  const loginDemo = (override?: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...override }));
  };

  const logout = () => {
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
      const advance = Math.round(total * 0.5);

      merged.studioCharges = charges;
      merged.gstAmount = gst;
      merged.totalPrice = total;
      merged.advanceAmount = advance;

      return merged;
    });
  };

  const confirmBooking = (): BookingItem => {
    const randomCode = `CBR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: BookingItem = {
      id: `b-${Date.now()}`,
      referenceCode: randomCode,
      serviceId: bookingDraft.serviceId,
      serviceName: bookingDraft.serviceName,
      studioId: bookingDraft.studioId,
      studioName: bookingDraft.studioName,
      date: bookingDraft.date,
      timeSlot: bookingDraft.timeSlot,
      durationHours: bookingDraft.durationHours,
      studioCharges: bookingDraft.studioCharges,
      gstAmount: bookingDraft.gstAmount,
      totalPrice: bookingDraft.totalPrice,
      advanceAmount: bookingDraft.advanceAmount,
      paymentMethod: bookingDraft.paymentMethod,
      status: 'Confirmed',
      notes: bookingDraft.notes || 'Studio session booked via mobile app.',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Push instant notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Booking Confirmed!',
      message: `Your reservation for ${bookingDraft.serviceName} (${randomCode}) is logged.`,
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
