/**
 * Local Development Backend Server for Cassate Band Recordz
 * Runs on http://localhost:5001/api/...
 */
const http = require('http');
const url = require('url');
const fs = require('fs');
const pathModule = require('path');
const crypto = require('crypto');

// Load environment variables from .env
function loadEnv() {
  try {
    const envPath = pathModule.resolve(__dirname, '../.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const idx = trimmed.indexOf('=');
          if (idx !== -1) {
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  } catch (e) {
    // ignore
  }
}
loadEnv();

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TwvwNefKNKM7Db';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'I9H4NEhAuvnMSKgzxN7M6hnj';

let razorpay = null;
try {
  const Razorpay = require('razorpay');
  razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
} catch (e) {
  console.warn('[Razorpay SDK] Loaded fallback:', e.message);
}

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
      advanceAmount: 700,
      paymentMethod: 'UPI Full Payment',
      paymentStatus: 'PAID_IN_FULL',
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
        advanceAmount,
        paymentMethod = 'UPI Full Payment',
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
        advanceAmount: totalPrice, // Full payment term
        paymentMethod,
        paymentStatus: 'PAID_IN_FULL',
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

    // 5. GET /api/bookings (User-Specific Filtered Passes)
    if (path === '/bookings' && method === 'GET') {
      const userId = parsedUrl.query.userId;
      const email = parsedUrl.query.email ? parsedUrl.query.email.toLowerCase().trim() : null;
      let list = Object.values(db.bookings);

      if (email) {
        // Strictly return only bookings matching this user's email
        list = list.filter(
          (b) =>
            (b.clientEmail && b.clientEmail.toLowerCase().trim() === email) ||
            (b.client_email && b.client_email.toLowerCase().trim() === email)
        );
      } else if (userId && userId !== 'admin') {
        if (userId.startsWith('guest')) {
          // Guests start with zero prior passes
          list = [];
        } else {
          list = list.filter((b) => b.userId === userId);
        }
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

    // 7. POST /api/auth/register
    if (path === '/auth/register' && method === 'POST') {
      const body = await parseBody(req);
      const { name, email, phone, device, loginLocation } = body;
      const newUserId = `usr-${Date.now().toString().slice(-5)}`;
      const newUser = {
        id: newUserId,
        name: name || 'Studio Producer',
        email: email || '',
        phone: phone || '',
        device: device || 'Android 14',
        login_location: loginLocation || 'Chennai Studio, TN, India',
        role: 'Studio Client',
        isAdmin: false,
        created_at: new Date().toISOString(),
      };
      db.users[newUserId] = newUser;
      return sendJson(res, {
        success: true,
        user: newUser,
        token: `token-${newUserId}-${Date.now()}`,
      });
    }

    // 8. GET /api/admin/users
    if (path === '/admin/users' && method === 'GET') {
      return sendJson(res, {
        success: true,
        users: Object.values(db.users),
      });
    }

    // 9. POST /api/auth/login
    if (path === '/auth/login' && method === 'POST') {
      const { identifier, device, loginLocation } = await parseBody(req);
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
        device: device || 'Android 14',
        login_location: loginLocation || 'Chennai Studio, TN, India',
        role: 'Studio Client',
        isAdmin: false,
        created_at: new Date().toISOString(),
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

    // ── 9. POST /api/create-order (Razorpay Standard Web Checkout) ──
    if ((path === '/create-order' || path === '/api/create-order') && method === 'POST') {
      const body = await parseBody(req);
      const { amount, currency, receipt, notes } = body;

      // Validate amount >= 100 paise (₹1)
      const parsedAmount = Math.round(Number(amount));
      if (!amount || isNaN(parsedAmount) || parsedAmount < 100) {
        return sendJson(res, {
          success: false,
          error: 'Invalid amount. Minimum amount is 100 paise (₹1).',
        }, 400);
      }

      // Handle auth failures / missing credentials
      if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
        return sendJson(res, {
          success: false,
          error: 'Razorpay authentication failed: Missing or invalid API credentials',
        }, 401);
      }

      try {
        let order;
        if (razorpay) {
          order = await razorpay.orders.create({
            amount: parsedAmount,
            currency: currency || 'INR',
            receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            notes: notes || {},
          });
        } else {
          // Direct HTTPS call fallback
          const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
          const apiRes = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': authHeader,
            },
            body: JSON.stringify({
              amount: parsedAmount,
              currency: currency || 'INR',
              receipt: receipt || `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              notes: notes || {},
            }),
          });
          const data = await apiRes.json();
          if (!apiRes.ok) {
            return sendJson(res, {
              success: false,
              error: data.error?.description || 'Razorpay order creation failed',
              details: data,
            }, apiRes.status === 401 ? 401 : 500);
          }
          order = data;
        }

        return sendJson(res, {
          success: true,
          order_id: order.id,
          id: order.id,
          amount: order.amount,
          currency: order.currency,
          receipt: order.receipt,
          status: order.status,
          key_id: RAZORPAY_KEY_ID,
        }, 200);
      } catch (err) {
        console.error('[Razorpay Error] Order creation error:', err);
        const statusCode = err.statusCode === 401 ? 401 : 500;
        return sendJson(res, {
          success: false,
          error: err.error?.description || err.message || 'Razorpay order creation failed',
          details: err,
        }, statusCode);
      }
    }

    // ── 10. POST /api/verify-payment (Razorpay Signature Verification) ──
    if ((path === '/verify-payment' || path === '/api/verify-payment') && method === 'POST') {
      const body = await parseBody(req);
      const orderId = body.razorpay_order_id || body.order_id;
      const paymentId = body.razorpay_payment_id || body.payment_id;
      const signature = body.razorpay_signature || body.signature;

      // Missing fields: return 400
      if (!orderId || !paymentId || !signature) {
        return sendJson(res, {
          success: false,
          error: 'Missing required signature verification fields (order_id, payment_id, signature)',
        }, 400);
      }

      if (!RAZORPAY_KEY_SECRET) {
        return sendJson(res, {
          success: false,
          error: 'Razorpay authentication failed: Missing secret key',
        }, 401);
      }

      // Allow simulated test verification in dev mode
      if (body.isSimulation || signature === 'simulated_test_signature') {
        if (body.bookingId && db.bookings[body.bookingId]) {
          db.bookings[body.bookingId].paymentStatus = 'PAID_IN_FULL';
          db.bookings[body.bookingId].paymentMethod = 'Razorpay Test Simulation';
          db.bookings[body.bookingId].razorpayPaymentId = paymentId;
          db.bookings[body.bookingId].razorpayOrderId = orderId;
          db.bookings[body.bookingId].status = 'CONFIRMED';
        }
        return sendJson(res, {
          success: true,
          message: 'Simulated payment verified successfully (Dev Mode)',
          order_id: orderId,
          payment_id: paymentId,
          signature_verified: true,
          isSimulation: true,
        }, 200);
      }

      // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
      const dataToSign = `${orderId}|${paymentId}`;
      const generatedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(dataToSign)
        .digest('hex');

      // Compare generated signature with razorpay_signature
      let isMatch = false;
      try {
        if (generatedSignature.length === signature.length) {
          isMatch = crypto.timingSafeEqual(
            Buffer.from(generatedSignature, 'utf8'),
            Buffer.from(signature, 'utf8')
          );
        }
      } catch (err) {
        isMatch = false;
      }

      // Signature mismatch: return 400, do NOT mark as paid
      if (!isMatch) {
        return sendJson(res, {
          success: false,
          error: 'Payment verification failed: Signature mismatch',
        }, 400);
      }

      // If valid and bookingId provided, mark booking as paid
      if (body.bookingId && db.bookings[body.bookingId]) {
        db.bookings[body.bookingId].paymentStatus = 'PAID_IN_FULL';
        db.bookings[body.bookingId].paymentMethod = 'Razorpay Standard Checkout';
        db.bookings[body.bookingId].razorpayPaymentId = paymentId;
        db.bookings[body.bookingId].razorpayOrderId = orderId;
        db.bookings[body.bookingId].status = 'CONFIRMED';
      }

      return sendJson(res, {
        success: true,
        message: 'Payment verified successfully',
        order_id: orderId,
        payment_id: paymentId,
        signature_verified: true,
      }, 200);
    }

    return sendJson(res, { error: 'Endpoint not found', path }, 404);
  } catch (err) {
    return sendJson(res, { error: 'Internal Error', message: err.message }, 500);
  }
});

server.listen(PORT, () => {
  console.log(`[Cassate Backend API] Server listening on http://localhost:${PORT}/api/health`);
});
