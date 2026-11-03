/**
 * Local Development Backend Server for Cassate Band Recordz
 * Runs on http://localhost:5001/api/...
 */
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 5001;

// ── Persistent/In-Memory Local Database ──
const db = {
  bookedSlotsByDate: {}, // e.g. { "2026-11-04": ["02:00 PM", "03:00 PM"] }
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

const sendJson = (res, data, statusCode = 200) => {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  });
  res.end(JSON.stringify(data));
};

const parseBody = (req) => {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname.replace(/^\/api/, '');
  const method = req.method;

  // Handle CORS Preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    });
    return res.end();
  }

  try {
    // 1. Health
    if (path === '/health' || path === '') {
      return sendJson(res, {
        status: 'online',
        service: 'Cassate Band Recordz Local Dev Backend',
        port: PORT,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. GET /api/slots?date=YYYY-MM-DD
    if (path === '/slots' && method === 'GET') {
      const date = parsedUrl.query.date || new Date().toISOString().split('T')[0];
      const now = Date.now();
      const currentLocked = (db.lockedSlotsByDate[date] || []).filter((l) => l.expiresAt > now);

      return sendJson(res, {
        date,
        bookedSlots: db.bookedSlotsByDate[date] || [],
        lockedSlots: currentLocked.map((l) => l.slot),
        permanentlyLocked: ['09:00 AM', '10:00 AM'],
        lunchBreak: '01:00 PM',
        fastBooking: ['02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'],
      });
    }

    // 3. POST /api/slots/lock (Temporary 10-minute hold)
    if (path === '/slots/lock' && method === 'POST') {
      const body = await parseBody(req);
      const { date, slots, userId } = body;

      if (!date || !slots) {
        return sendJson(res, { error: 'Date and slots required' }, 400);
      }

      const booked = db.bookedSlotsByDate[date] || [];
      for (const slot of slots) {
        if (booked.includes(slot)) {
          return sendJson(res, { error: `Slot ${slot} is already booked` }, 409);
        }
      }

      const now = Date.now();
      const expiresAt = now + 10 * 60 * 1000;
      const currentLocked = (db.lockedSlotsByDate[date] || []).filter((l) => l.expiresAt > now);

      db.lockedSlotsByDate[date] = [
        ...currentLocked.filter((l) => !slots.includes(l.slot)),
        ...slots.map((slot) => ({ slot, userId, expiresAt })),
      ];

      return sendJson(res, { success: true, date, lockedSlots: slots, expiresAt });
    }

    // 4. POST /api/bookings (Create Confirmed Booking)
    if (path === '/bookings' && method === 'POST') {
      const body = await parseBody(req);
      const {
        serviceId = 'dubbing',
        serviceName = 'Dubbing Studio',
        studioName = 'Dubbing Studio (Acoustic Treated)',
        date,
        timeSlots = [],
        timeSlotLabel,
        totalPrice = 700,
        advanceAmount = 350,
        paymentMethod = 'UPI Payment',
        upiRefId,
        clientName = 'Devon Vance',
        clientPhone = '+91 98765 43210',
        clientEmail = 'client@cassaterecordz.com',
        userId = 'usr-1',
      } = body;

      if (!date || timeSlots.length === 0) {
        return sendJson(res, { error: 'Date and at least 1 slot are required' }, 400);
      }

      const existingBooked = db.bookedSlotsByDate[date] || [];
      for (const slot of timeSlots) {
        if (existingBooked.includes(slot)) {
          return sendJson(res, { error: `Slot ${slot} has already been reserved.` }, 409);
        }
      }

      const passId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
      const newBooking = {
        id: passId,
        serviceId,
        serviceName,
        studioName,
        date,
        timeSlots,
        timeSlot: timeSlotLabel || timeSlots.join(', '),
        totalPrice,
        advanceAmount,
        paymentMethod,
        paymentStatus: advanceAmount >= totalPrice ? 'PAID_IN_FULL' : 'ADVANCE_PAID',
        upiRefId: upiRefId || `UPI-${Date.now().toString().slice(-8)}`,
        status: 'CONFIRMED',
        clientName,
        clientPhone,
        clientEmail,
        userId,
        createdAt: new Date().toISOString(),
      };

      // 1. Mark slots as booked
      db.bookedSlotsByDate[date] = [...existingBooked, ...timeSlots];

      // 2. Remove lock
      if (db.lockedSlotsByDate[date]) {
        db.lockedSlotsByDate[date] = db.lockedSlotsByDate[date].filter(
          (l) => !timeSlots.includes(l.slot)
        );
      }

      // 3. Save booking
      db.bookings[passId] = newBooking;

      return sendJson(res, {
        success: true,
        message: 'Booking confirmed successfully!',
        booking: newBooking,
      }, 201);
    }

    // 5. GET /api/bookings
    if (path === '/bookings' && method === 'GET') {
      const userId = parsedUrl.query.userId;
      let list = Object.values(db.bookings);

      if (userId && userId !== 'admin') {
        list = list.filter((b) => b.userId === userId || b.userId === 'guest');
      }

      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return sendJson(res, { bookings: list });
    }

    // 6. POST /api/bookings/cancel
    if (path === '/bookings/cancel' && method === 'POST') {
      const { bookingId } = await parseBody(req);
      const booking = db.bookings[bookingId];

      if (!booking) {
        return sendJson(res, { error: 'Booking not found' }, 404);
      }

      booking.status = 'CANCELLED';

      if (db.bookedSlotsByDate[booking.date]) {
        db.bookedSlotsByDate[booking.date] = db.bookedSlotsByDate[booking.date].filter(
          (s) => !booking.timeSlots?.includes(s)
        );
      }

      return sendJson(res, { success: true, message: 'Booking cancelled & slots released' });
    }

    // 7. POST /api/auth/login
    if (path === '/auth/login' && method === 'POST') {
      const { identifier } = await parseBody(req);
      const foundUser = Object.values(db.users).find(
        (u) =>
          u.email?.toLowerCase() === identifier?.toLowerCase() ||
          u.phone?.replace(/\s+/g, '') === identifier?.replace(/\s+/g, '')
      );

      if (foundUser) {
        return sendJson(res, {
          success: true,
          user: foundUser,
          token: `token-${foundUser.id}-${Date.now()}`,
        });
      }

      const newUserId = `usr-${Date.now().toString().slice(-5)}`;
      const newUser = {
        id: newUserId,
        name: identifier?.includes('@') ? identifier.split('@')[0] : 'Studio Artist',
        email: identifier?.includes('@') ? identifier : '',
        phone: !identifier?.includes('@') ? identifier : '',
        role: 'Studio Client',
        isAdmin: false,
      };

      db.users[newUserId] = newUser;
      return sendJson(res, {
        success: true,
        user: newUser,
        token: `token-${newUserId}-${Date.now()}`,
      });
    }

    // 8. GET /api/admin/stats
    if (path === '/admin/stats' && method === 'GET') {
      const list = Object.values(db.bookings);
      const confirmed = list.filter((b) => b.status === 'CONFIRMED');
      const totalRevenue = confirmed.reduce((acc, b) => acc + (b.totalPrice || 0), 0);
      const totalAdvance = confirmed.reduce((acc, b) => acc + (b.advanceAmount || 0), 0);

      return sendJson(res, {
        totalBookings: confirmed.length,
        totalRevenue,
        totalAdvanceCollected: totalAdvance,
        occupancyRate: '85%',
        recentBookings: list.slice(0, 5),
      });
    }

    return sendJson(res, { error: 'Endpoint not found', path }, 404);
  } catch (err) {
    return sendJson(res, { error: 'Internal Error', message: err.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`[Cassate Backend API] Server listening on http://localhost:${PORT}/api/health`);
});
