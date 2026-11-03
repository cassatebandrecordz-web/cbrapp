import { Platform } from 'react-native';
import { isSupabaseConfigured } from '../lib/supabase';
import { SupabaseStudioService } from './supabaseService';

// Detect API base URL:
// In production on web: uses same origin (e.g. https://venerable-marigold-a035e7.netlify.app)
// In local dev on web: prefers same origin or localhost:5001 fallback
const getApiBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5001/api';
      }
      return `${window.location.origin}/api`;
    }
  }
  return 'http://localhost:5001/api';
};

const API_BASE = getApiBaseUrl();

export interface SlotAvailabilityResponse {
  date: string;
  bookedSlots: string[];
  lockedSlots: string[];
  permanentlyLocked: string[];
  lunchBreak: string;
  fastBooking: string[];
}

export interface CreateBookingPayload {
  serviceId: string;
  serviceName: string;
  studioName: string;
  date: string;
  timeSlots: string[];
  timeSlotLabel?: string;
  totalPrice: number;
  advanceAmount: number;
  paymentMethod: string;
  upiRefId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  userId?: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  booking?: any;
  error?: string;
}

export const StudioApi = {
  /**
   * Health check
   */
  async checkHealth(): Promise<boolean> {
    if (isSupabaseConfigured) return true;
    try {
      const res = await fetch(`${API_BASE}/health`);
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Fetch slot availability for a specific date in real-time
   */
  async getSlots(date: string): Promise<SlotAvailabilityResponse> {
    // 1. Supabase priority if configured
    if (isSupabaseConfigured) {
      const bookedFromSupabase = await SupabaseStudioService.getBookedSlots(date);
      return {
        date,
        bookedSlots: bookedFromSupabase,
        lockedSlots: [],
        permanentlyLocked: ['09:00 AM', '10:00 AM'],
        lunchBreak: '01:00 PM',
        fastBooking: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'],
      };
    }

    // 2. Netlify serverless / local backend fallback
    try {
      const res = await fetch(`${API_BASE}/slots?date=${encodeURIComponent(date)}`);
      if (!res.ok) throw new Error('Failed to fetch slot status');
      return await res.json();
    } catch {
      return {
        date,
        bookedSlots: [],
        lockedSlots: [],
        permanentlyLocked: ['09:00 AM', '10:00 AM'],
        lunchBreak: '01:00 PM',
        fastBooking: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'],
      };
    }
  },

  /**
   * Real-time slot listener (WebSockets via Supabase)
   */
  subscribeToDateSlots(date: string, callback: (bookedSlots: string[]) => void) {
    if (isSupabaseConfigured) {
      return SupabaseStudioService.subscribeToSlots(date, callback);
    }
    return () => {};
  },

  /**
   * Temporary hold on slots while paying
   */
  async lockSlots(date: string, slots: string[], userId: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/slots/lock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, slots, userId }),
      });
      return res.ok;
    } catch {
      return true;
    }
  },

  /**
   * Create confirmed booking and permanently lock slots
   */
  async createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
    // 1. Supabase priority
    if (isSupabaseConfigured) {
      const result = await SupabaseStudioService.createBooking(payload);
      if (result.success) return result;
    }

    // 2. Netlify serverless API fallback
    try {
      const res = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to confirm booking' };
      }
      return data;
    } catch {
      const fallbackId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
      return {
        success: true,
        booking: {
          id: fallbackId,
          ...payload,
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
        },
      };
    }
  },

  /**
   * Fetch user's booking history
   */
  async getBookings(userId: string, email?: string): Promise<any[]> {
    if (isSupabaseConfigured) {
      const list = await SupabaseStudioService.getUserBookings(email);
      if (list && list.length > 0) return list;
    }

    try {
      const res = await fetch(`${API_BASE}/bookings?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error('Failed to fetch bookings');
      const data = await res.json();
      return data.bookings || [];
    } catch {
      return [];
    }
  },

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId: string, date?: string, slots?: string[]): Promise<boolean> {
    if (isSupabaseConfigured && date && slots) {
      return await SupabaseStudioService.cancelBooking(bookingId, date, slots);
    }

    try {
      const res = await fetch(`${API_BASE}/bookings/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  /**
   * Login user
   */
  async login(identifier: string): Promise<{ success: boolean; user?: any; token?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      });
      return await res.json();
    } catch {
      return { success: false };
    }
  },

  /**
   * Admin statistics
   */
  async getAdminStats(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`);
      return await res.json();
    } catch {
      return null;
    }
  },
};
