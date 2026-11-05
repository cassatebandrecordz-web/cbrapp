import { Platform } from 'react-native';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CreateBookingPayload, BookingResponse } from './api';

/**
 * Extracts all matching date formats for a given date string.
 * Example: 'Wed, 4 Nov 2026' -> ['Wed, 4 Nov 2026', '2026-11-04']
 *          '2026-11-04'      -> ['2026-11-04', 'Wed, 4 Nov 2026']
 */
export function getDateVariants(dateStr: string): string[] {
  if (!dateStr) return [];
  const variants = [dateStr.trim()];

  try {
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      const iso = `${yyyy}-${mm}-${dd}`;
      if (!variants.includes(iso)) variants.push(iso);

      const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const dayName = DAY_NAMES[parsed.getDay()];
      const monthShort = MONTH_SHORT[parsed.getMonth()];
      const human = `${dayName}, ${parsed.getDate()} ${monthShort} ${yyyy}`;
      if (!variants.includes(human)) variants.push(human);
    }
  } catch {
    // Ignore date parse errors
  }

  return variants;
}

export const SupabaseStudioService = {
  /**
   * Check if Supabase connection is active
   */
  isConfigured: isSupabaseConfigured,

  /**
   * Fetch booked slots for a given date directly from Supabase PostgreSQL
   */
  async getBookedSlots(date: string): Promise<string[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const variants = getDateVariants(date);

      const { data, error } = await supabase
        .from('studio_slots')
        .select('slot_time, status, expires_at')
        .in('date', variants);

      if (error) {
        console.warn('[Supabase] Failed to fetch slots:', error.message);
        return [];
      }

      const now = new Date().toISOString();
      return (data || [])
        .filter((row) => {
          if (row.status === 'booked' || row.status === 'maintenance') return true;
          if (row.status === 'locked' && row.expires_at && row.expires_at > now) return true;
          return false;
        })
        .map((row) => row.slot_time);
    } catch (err) {
      console.warn('[Supabase] Error getting slots:', err);
      return [];
    }
  },

  /**
   * Subscribe to live Real-Time WebSocket slot changes for a date.
   * When another user books a slot, this fires immediately without page refresh!
   */
  subscribeToSlots(date: string, onChange: (bookedSlots: string[]) => void) {
    if (!isSupabaseConfigured) return () => {};

    const channelName = `public:studio_slots:${date.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'studio_slots',
        },
        async () => {
          // Re-fetch all slots for date when changes happen in database
          const updated = await SupabaseStudioService.getBookedSlots(date);
          onChange(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Save a confirmed booking and insert the booked slots into Supabase
   */
  async createBooking(payload: CreateBookingPayload): Promise<BookingResponse> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Supabase is not configured' };
    }

    try {
      const passId = payload.upiRefId?.startsWith('CBR-')
        ? payload.upiRefId
        : `CBR-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      const dateVariants = getDateVariants(payload.date);

      // 1. Insert into bookings table
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          id: passId,
          service_id: payload.serviceId || 'dubbing',
          service_name: payload.serviceName || 'Dubbing Studio',
          studio_name: payload.studioName || 'Dubbing Studio (Acoustic Treated)',
          date: payload.date,
          time_slots: payload.timeSlots,
          time_slot_label: payload.timeSlotLabel || payload.timeSlots.join(', '),
          total_price: payload.totalPrice,
          advance_amount: payload.totalPrice, // Full Payment Term
          payment_method: payload.paymentMethod || 'UPI Full Payment',
          payment_status: 'PAID_IN_FULL',
          upi_ref_id: payload.upiRefId || passId,
          status: 'CONFIRMED',
          client_name: payload.clientName || 'Studio Client',
          client_phone: payload.clientPhone || '+91 90252 53695',
          client_email: payload.clientEmail || 'client@cassaterecordz.com',
        })
        .select()
        .single();

      if (bookingError) {
        console.warn('[Supabase] Booking insert error:', bookingError.message);
        throw new Error(bookingError.message);
      }

      // 2. Insert slot locks for each selected slot for ALL date variants
      const slotsToInsert: any[] = [];
      for (const slot of payload.timeSlots) {
        for (const d of dateVariants) {
          slotsToInsert.push({
            date: d,
            slot_time: slot,
            service_id: payload.serviceId || 'dubbing',
            status: 'booked',
            client_name: payload.clientName || 'Studio Client',
            booking_id: passId,
          });
        }
      }

      const { error: slotsError } = await supabase
        .from('studio_slots')
        .upsert(slotsToInsert, { onConflict: 'date,slot_time,service_id' });

      if (slotsError) {
        console.warn('[Supabase] Slot reservation warning:', slotsError.message);
      }

      return {
        success: true,
        message: 'Booking successfully confirmed in Supabase!',
        booking: bookingData,
      };
    } catch (err: any) {
      console.error('[Supabase] Error creating booking:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetch all bookings for a client or entire studio
   */
  async getAllBookings(clientEmail?: string): Promise<any[]> {
    if (!isSupabaseConfigured) return [];

    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (clientEmail) {
        query = query.ilike('client_email', clientEmail.trim());
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('[Supabase] Failed to fetch bookings:', err);
      return [];
    }
  },

  /**
   * Subscribe to live Real-Time WebSocket updates for all studio bookings
   */
  subscribeToAllBookings(onChange: (bookings: any[]) => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:bookings_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        async () => {
          const updated = await SupabaseStudioService.getAllBookings();
          onChange(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Cancel booking and release slots
   */
  async cancelBooking(bookingId: string, date: string, slots: string[]): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      await supabase
        .from('bookings')
        .update({ status: 'CANCELLED' })
        .eq('id', bookingId);

      await supabase
        .from('studio_slots')
        .delete()
        .eq('booking_id', bookingId);

      return true;
    } catch (err) {
      console.error('[Supabase] Error cancelling booking:', err);
      return false;
    }
  },

  /**
   * Register a new user in Supabase Auth & create/upsert a Profile record in Database
   */
  async registerUser(params: {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    device?: string;
    loginLocation?: string;
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database not configured' };
    }

    try {
      const { name, email, password = 'StudioPass@2026', phone = '', device = '', loginLocation = '' } = params;

      // 1. Supabase Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            name: name.trim(),
            phone: phone.trim(),
            device: device || (Platform.OS === 'android' ? 'Android Mobile App' : Platform.OS === 'ios' ? 'iOS Mobile App' : 'Web Studio Portal'),
            login_location: loginLocation || 'Chennai Studio, TN, India',
          },
        },
      });

      if (authError && !authError.message?.toLowerCase().includes('already registered')) {
        console.warn('[Supabase] Auth signUp notice:', authError.message);
      }

      const userId = authData.user?.id || `usr-${Date.now().toString().slice(-6)}`;

      // 2. Insert/Upsert into profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || '+91 90252 53695',
          role: 'Studio Client',
          is_admin: false,
        })
        .select()
        .single();

      if (profileError) {
        console.warn('[Supabase] Profile upsert notice:', profileError.message);
      }

      return {
        success: true,
        user: profileData || {
          id: userId,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: 'Studio Client',
          isAdmin: false,
        },
      };
    } catch (err: any) {
      console.error('[Supabase] Error registering user:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Login user with email & password in Supabase Database
   */
  async loginUser(params: {
    email: string;
    password?: string;
  }): Promise<{ success: boolean; user?: any; error?: string }> {
    if (!isSupabaseConfigured) {
      return { success: false, error: 'Database not configured' };
    }

    try {
      const email = params.email.trim();
      const password = params.password || 'StudioPass@2026';

      // 1. Try Supabase Auth Sign In
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authData?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        return {
          success: true,
          user: profile || {
            id: authData.user.id,
            name: authData.user.user_metadata?.name || email.split('@')[0],
            email: email,
            phone: authData.user.user_metadata?.phone || '+91 90252 53695',
            role: 'Studio Client',
            isAdmin: false,
          },
        };
      }

      // 2. If signInWithPassword fails or email isn't verified in Supabase auth, check profiles table
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.${email},phone.ilike.${email}`)
        .limit(1)
        .single();

      if (existingProfile) {
        return {
          success: true,
          user: existingProfile,
        };
      }

      if (authError) {
        return { success: false, error: authError.message };
      }

      return { success: false, error: 'Invalid email or password' };
    } catch (err: any) {
      console.error('[Supabase] Error logging in user:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * Get all registered user profiles from Supabase database
   */
  async getAllProfiles(): Promise<any[]> {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase] Error fetching profiles:', error.message);
        return [];
      }
      return data || [];
    } catch (err) {
      console.warn('[Supabase] Exception fetching profiles:', err);
      return [];
    }
  },

  /**
   * Subscribe to live Real-Time WebSocket updates for user registrations
   */
  subscribeToProfiles(onChange: (profiles: any[]) => void) {
    if (!isSupabaseConfigured) return () => {};

    const channel = supabase
      .channel('public:profiles_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
        },
        async () => {
          const updated = await SupabaseStudioService.getAllProfiles();
          onChange(updated);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
