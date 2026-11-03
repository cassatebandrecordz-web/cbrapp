import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { CreateBookingPayload, BookingResponse } from './api';

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
      const { data, error } = await supabase
        .from('studio_slots')
        .select('slot_time, status, expires_at')
        .eq('date', date);

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

    const channel = supabase
      .channel(`public:studio_slots:${date}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'studio_slots',
          filter: `date=eq.${date}`,
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
      const passId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;

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
          advance_amount: payload.advanceAmount,
          payment_method: payload.paymentMethod,
          payment_status: payload.advanceAmount >= payload.totalPrice ? 'PAID_IN_FULL' : 'ADVANCE_PAID',
          upi_ref_id: payload.upiRefId || `UPI-${Date.now().toString().slice(-8)}`,
          status: 'CONFIRMED',
          client_name: payload.clientName || 'Studio Client',
          client_phone: payload.clientPhone || '',
          client_email: payload.clientEmail || '',
        })
        .select()
        .single();

      if (bookingError) {
        throw new Error(bookingError.message);
      }

      // 2. Insert slot locks for each selected slot
      const slotsToInsert = payload.timeSlots.map((slot) => ({
        date: payload.date,
        slot_time: slot,
        service_id: payload.serviceId || 'dubbing',
        status: 'booked',
        client_name: payload.clientName,
        booking_id: passId,
      }));

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
   * Fetch all bookings for a client
   */
  async getUserBookings(clientEmail?: string): Promise<any[]> {
    if (!isSupabaseConfigured) return [];

    try {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (clientEmail) {
        query = query.eq('client_email', clientEmail);
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
};
