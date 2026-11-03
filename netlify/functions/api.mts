import type { Config, Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// ── In-Memory / Fallback Store for Local Dev & Resiliency ──
interface AppDataStore {
  bookedSlotsByDate: Record<string, string[]>; // "2026-11-04": ["02:00 PM", "03:00 PM"]
  lockedSlotsByDate: Record<string, { slot: string; userId: string; expiresAt: number }[]>;
  bookings: Record<string, any>;
  users: Record<string, any>;
}

// Initial seed data with demo bookings
const localMemoryStore: AppDataStore = {
  bookedSlotsByDate: {},
  lockedSlotsByDate: {},
  bookings: {
    'CB-7821': {
      id: 'CB-7821',
      serviceId: 'dubbing',
      serviceName: 'Dubbing Studio',
      studioName: 'Dubbing Studio (Acoustic Treated)',
      date: 'Fri, 20 Nov 2026',
      timeSlot: '02:00 PM - 04:00 PM (2 Slots)',
      timeSlots: ['02:00 PM', '03:00 PM'],
      totalPrice: 700,
      advanceAmount: 350,
      paymentMethod: 'Pay at Studio',
      paymentStatus: 'ADVANCE_PAID',
      status: 'CONFIRMED',
      clientName: 'Devon Vance',
      clientPhone: '+91 98765 43210',
      clientEmail: 'client@cassaterecordz.com',
      createdAt: new Date().toISOString(),
    },
  },
  users: {
    'usr-1': {
      id: 'usr-1',
      name: 'Devon Vance',
      email: 'client@cassaterecordz.com',
      phone: '+91 98765 43210',
      company: 'Vance Audio Visual Works',
      role: 'Studio Client',
      isAdmin: false,
    },
    'admin-1': {
      id: 'admin-1',
      name: 'Cassate Studio Admin',
      email: 'admin@cassaterecordz.com',
      phone: '+91 99999 00000',
      role: 'Super Admin',
      isAdmin: true,
    },
  },
};

// Helper: Safely access Netlify Blobs or fallback to memory
async function getBlobStore() {
  try {
    return getStore("cassate-studio-live");
  } catch {
    return null;
  }
}

async function readStoreKey<T>(key: string, defaultValue: T): Promise<T> {
  const store = await getBlobStore();
  if (store) {
    try {
      const data = await store.get(key, { type: "json" });
      if (data !== null && data !== undefined) {
        return data as T;
      }
    } catch {
      // Netlify Blobs not available in environment; use memory
    }
  }
  return (localMemoryStore as any)[key] ?? defaultValue;
}

async function writeStoreKey(key: string, value: any): Promise<void> {
  (localMemoryStore as any)[key] = value;
  const store = await getBlobStore();
  if (store) {
    try {
      await store.setJSON(key, value);
    } catch {
      // Netlify Blobs write failed, in-memory updated
    }
  }
}

// Standard JSON response with CORS headers
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    },
  });
}

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/^\/api/, '');
  const method = req.method;

  // Handle CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      },
    });
  }

  try {
    // ── 1. GET /api/health ──
    if (path === "/health" || path === "") {
      return jsonResponse({
        status: "online",
        service: "Cassate Band Recordz Studio Backend",
        version: "1.0.0",
        timestamp: new Date().toISOString(),
      });
    }

    // ── 2. GET /api/slots?date=YYYY-MM-DD ──
    if (path === "/slots" && method === "GET") {
      const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];
      const bookedSlotsMap = await readStoreKey<Record<string, string[]>>("bookedSlotsByDate", {});
      const lockedSlotsMap = await readStoreKey<Record<string, any[]>>("lockedSlotsByDate", {});

      const now = Date.now();
      const currentLocked = (lockedSlotsMap[date] || []).filter(
        (lock) => lock.expiresAt > now
      );

      const booked = bookedSlotsMap[date] || [];
      const locked = currentLocked.map((l) => l.slot);

      return jsonResponse({
        date,
        bookedSlots: booked,
        lockedSlots: locked,
        permanentlyLocked: ["09:00 AM", "10:00 AM"],
        lunchBreak: "01:00 PM",
        fastBooking: ["02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"],
      });
    }

    // ── 3. POST /api/slots/lock (Temporary 10-Min Hold) ──
    if (path === "/slots/lock" && method === "POST") {
      const body = await req.json();
      const { date, slots, userId } = body;

      if (!date || !slots || !Array.now) {
        return jsonResponse({ error: "Missing required fields" }, 400);
      }

      const bookedSlotsMap = await readStoreKey<Record<string, string[]>>("bookedSlotsByDate", {});
      const lockedSlotsMap = await readStoreKey<Record<string, any[]>>("lockedSlotsByDate", {});

      const alreadyBooked = bookedSlotsMap[date] || [];
      const now = Date.now();
      const currentLocked = (lockedSlotsMap[date] || []).filter((l) => l.expiresAt > now);

      // Check if any slot is already booked or locked by someone else
      for (const slot of slots) {
        if (alreadyBooked.includes(slot)) {
          return jsonResponse({ error: `Slot ${slot} is already booked on ${date}` }, 409);
        }
        const lockedByOther = currentLocked.find(
          (l) => l.slot === slot && l.userId !== userId
        );
        if (lockedByOther) {
          return jsonResponse({ error: `Slot ${slot} is currently held by another user` }, 409);
        }
      }

      // Add temporary 10-minute hold
      const expiresAt = now + 10 * 60 * 1000;
      const updatedLocked = [
        ...currentLocked.filter((l) => !slots.includes(l.slot)),
        ...slots.map((slot: string) => ({ slot, userId, expiresAt })),
      ];

      lockedSlotsMap[date] = updatedLocked;
      await writeStoreKey("lockedSlotsByDate", lockedSlotsMap);

      return jsonResponse({ success: true, date, lockedSlots: slots, expiresAt });
    }

    // ── 4. POST /api/bookings (Create Confirmed Studio Booking) ──
    if (path === "/bookings" && method === "POST") {
      const body = await req.json();
      const {
        serviceId = "dubbing",
        serviceName = "Dubbing Studio",
        studioName = "Dubbing Studio (Acoustic Treated)",
        date,
        timeSlots = [],
        timeSlotLabel,
        totalPrice = 700,
        advanceAmount = 350,
        paymentMethod = "UPI Payment",
        upiRefId,
        clientName = "Guest Client",
        clientPhone = "",
        clientEmail = "",
        userId = "guest",
      } = body;

      if (!date || timeSlots.length === 0) {
        return jsonResponse({ error: "Date and at least one time slot are required." }, 400);
      }

      // Check slot availability in DB
      const bookedSlotsMap = await readStoreKey<Record<string, string[]>>("bookedSlotsByDate", {});
      const existingDateBooked = bookedSlotsMap[date] || [];

      for (const slot of timeSlots) {
        if (existingDateBooked.includes(slot)) {
          return jsonResponse({ error: `Slot ${slot} has already been reserved.` }, 409);
        }
      }

      // Generate Unique Studio Pass ID
      const passId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;

      const newBooking = {
        id: passId,
        serviceId,
        serviceName,
        studioName,
        date,
        timeSlots,
        timeSlot: timeSlotLabel || timeSlots.join(", "),
        totalPrice,
        advanceAmount,
        paymentMethod,
        paymentStatus: advanceAmount >= totalPrice ? "PAID_IN_FULL" : "ADVANCE_PAID",
        upiRefId: upiRefId || `UPI-${Date.now().toString().slice(-8)}`,
        status: "CONFIRMED",
        clientName,
        clientPhone,
        clientEmail,
        userId,
        createdAt: new Date().toISOString(),
      };

      // 1. Mark slots as permanently booked for that date
      bookedSlotsMap[date] = [...existingDateBooked, ...timeSlots];
      await writeStoreKey("bookedSlotsByDate", bookedSlotsMap);

      // 2. Remove any temporary locks on these slots
      const lockedSlotsMap = await readStoreKey<Record<string, any[]>>("lockedSlotsByDate", {});
      if (lockedSlotsMap[date]) {
        lockedSlotsMap[date] = lockedSlotsMap[date].filter(
          (l) => !timeSlots.includes(l.slot)
        );
        await writeStoreKey("lockedSlotsByDate", lockedSlotsMap);
      }

      // 3. Save booking to store
      const bookingsMap = await readStoreKey<Record<string, any>>("bookings", {});
      bookingsMap[passId] = newBooking;
      await writeStoreKey("bookings", bookingsMap);

      return jsonResponse({
        success: true,
        message: "Booking confirmed successfully!",
        booking: newBooking,
      }, 201);
    }

    // ── 5. GET /api/bookings (List User or All Bookings) ──
    if (path === "/bookings" && method === "GET") {
      const userId = url.searchParams.get("userId");
      const bookingsMap = await readStoreKey<Record<string, any>>("bookings", {});
      let list = Object.values(bookingsMap);

      if (userId && userId !== "admin") {
        list = list.filter((b) => b.userId === userId || b.userId === "guest");
      }

      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return jsonResponse({ bookings: list });
    }

    // ── 6. POST /api/bookings/cancel (Cancel & Release Slots) ──
    if (path === "/bookings/cancel" && method === "POST") {
      const { bookingId } = await req.json();
      const bookingsMap = await readStoreKey<Record<string, any>>("bookings", {});
      const booking = bookingsMap[bookingId];

      if (!booking) {
        return jsonResponse({ error: "Booking not found" }, 404);
      }

      booking.status = "CANCELLED";
      bookingsMap[bookingId] = booking;
      await writeStoreKey("bookings", bookingsMap);

      // Release the booked slots in the calendar
      const bookedSlotsMap = await readStoreKey<Record<string, string[]>>("bookedSlotsByDate", {});
      if (bookedSlotsMap[booking.date]) {
        bookedSlotsMap[booking.date] = bookedSlotsMap[booking.date].filter(
          (slot) => !booking.timeSlots?.includes(slot)
        );
        await writeStoreKey("bookedSlotsByDate", bookedSlotsMap);
      }

      return jsonResponse({ success: true, message: "Booking cancelled and slots released." });
    }

    // ── 7. POST /api/auth/login ──
    if (path === "/auth/login" && method === "POST") {
      const { identifier, password } = await req.json();
      const usersMap = await readStoreKey<Record<string, any>>("users", {});

      const foundUser = Object.values(usersMap).find(
        (u: any) =>
          u.email?.toLowerCase() === identifier?.toLowerCase() ||
          u.phone?.replace(/\s+/g, '') === identifier?.replace(/\s+/g, '')
      );

      if (foundUser) {
        return jsonResponse({
          success: true,
          user: foundUser,
          token: `token-${foundUser.id}-${Date.now()}`,
        });
      }

      // Auto-register guest if not found
      const newUserId = `usr-${Date.now().toString().slice(-5)}`;
      const newUser = {
        id: newUserId,
        name: identifier?.includes('@') ? identifier.split('@')[0] : 'Studio Artist',
        email: identifier?.includes('@') ? identifier : '',
        phone: !identifier?.includes('@') ? identifier : '',
        role: 'Studio Client',
        isAdmin: false,
      };

      usersMap[newUserId] = newUser;
      await writeStoreKey("users", usersMap);

      return jsonResponse({
        success: true,
        user: newUser,
        token: `token-${newUserId}-${Date.now()}`,
      });
    }

    // ── 8. GET /api/admin/stats ──
    if (path === "/admin/stats" && method === "GET") {
      const bookingsMap = await readStoreKey<Record<string, any>>("bookings", {});
      const list = Object.values(bookingsMap);

      const confirmed = list.filter((b) => b.status === "CONFIRMED");
      const totalRevenue = confirmed.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
      const totalAdvance = confirmed.reduce((acc, b) => acc + (b.advanceAmount || 0), 0);

      return jsonResponse({
        totalBookings: confirmed.length,
        totalRevenue,
        totalAdvanceCollected: totalAdvance,
        occupancyRate: "82%",
        recentBookings: list.slice(0, 5),
      });
    }

    return jsonResponse({ error: "Endpoint not found", path }, 404);
  } catch (error: any) {
    return jsonResponse(
      { error: "Internal Server Error", message: error?.message || String(error) },
      500
    );
  }
};

export const config: Config = {
  path: ["/api/*", "/.netlify/functions/api/*"],
};
