import { Platform, Alert } from 'react-native';

export const RAZORPAY_KEY_ID =
  process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ||
  process.env.RAZORPAY_KEY_ID ||
  'rzp_test_TwvwNefKNKM7Db';

const getApiBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && window.location?.origin) {
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5001/api';
      }
      return `${window.location.origin}/api`;
    }
  }
  return 'https://venerable-marigold-a035e7.netlify.app/api';
};

const API_BASE = getApiBaseUrl();

export interface CreateOrderParams {
  amount: number; // in paise (e.g. 100 paise = ₹1, 35000 paise = ₹350)
  currency?: string;
  receipt?: string;
  notes?: Record<string, any>;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  id?: string;
  amount: number;
  currency: string;
  receipt?: string;
  key_id?: string;
  error?: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  bookingId?: string;
  bookingData?: any;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message?: string;
  order_id?: string;
  payment_id?: string;
  signature_verified?: boolean;
  error?: string;
}

export interface RazorpayCheckoutOptions {
  amount: number; // in Rupees (e.g. 350) or in Paise (>= 100)
  isPaise?: boolean;
  currency?: string;
  receipt?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  bookingId?: string;
  onSuccess: (paymentResult: any, verifyResult: VerifyPaymentResponse) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Loads the Razorpay Standard Checkout SDK (<script>) on Web
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return resolve(false);
    }

    if ((window as any).Razorpay) {
      return resolve(true);
    }

    const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('[Razorpay] Failed to load checkout.js script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Step 1: Create an Order via Backend API
 */
export async function createRazorpayOrder(params: CreateOrderParams): Promise<CreateOrderResponse> {
  try {
    const res = await fetch(`${API_BASE}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: params.amount,
        currency: params.currency || 'INR',
        receipt: params.receipt || `rcpt_${Date.now()}`,
        notes: params.notes || {},
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Failed to create order (HTTP ${res.status})`);
    }

    return data;
  } catch (err: any) {
    console.error('[Razorpay createOrder Error]:', err);
    throw err;
  }
}

/**
 * Step 3: Verify Payment Signature via Backend API
 */
export async function verifyRazorpayPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResponse> {
  try {
    const res = await fetch(`${API_BASE}/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || `Payment verification failed (HTTP ${res.status})`);
    }

    return data;
  } catch (err: any) {
    console.error('[Razorpay verifyPayment Error]:', err);
    throw err;
  }
}

/**
 * Step 2: Full Standard Checkout Flow
 * Calls create-order, opens standard Razorpay modal, verifies signature on success
 */
export async function launchRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const {
    amount,
    isPaise = false,
    currency = 'INR',
    receipt,
    name = 'CBR Studio',
    description = 'Studio Session Reservation',
    prefill,
    notes,
    bookingId,
    onSuccess,
    onFailure,
    onDismiss,
  } = options;

  // Amount in paise (minimum 100 paise = ₹1)
  const amountInPaise = isPaise ? Math.round(amount) : Math.round(amount * 100);

  if (amountInPaise < 100) {
    const errMsg = 'Payment amount must be at least ₹1 (100 paise).';
    Alert.alert('Invalid Amount', errMsg);
    if (onFailure) onFailure(new Error(errMsg));
    return;
  }

  // Ensure Razorpay web script is loaded
  if (Platform.OS === 'web') {
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded || typeof (window as any).Razorpay === 'undefined') {
      const errMsg = 'Razorpay Checkout SDK failed to load. Please check your internet connection.';
      Alert.alert('Checkout Unavailable', errMsg);
      if (onFailure) onFailure(new Error(errMsg));
      return;
    }
  } else {
    // For React Native Android/iOS native app without web DOM
    Alert.alert(
      'Razorpay Web Checkout',
      'Standard Web Checkout runs in browser mode. To complete payment, please open CBR Studio in your web browser or use UPI payment.',
      [{ text: 'OK' }]
    );
    if (onFailure) onFailure(new Error('Razorpay Standard Web Checkout requires a web browser context.'));
    return;
  }

  try {
    // 1. Create order on backend
    const orderData = await createRazorpayOrder({
      amount: amountInPaise,
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      notes: notes || {},
    });

    const orderId = orderData.order_id || orderData.id;
    if (!orderId) {
      throw new Error('Backend failed to return an order_id');
    }

    // 2. Configure Razorpay modal options
    const razorpayOptions = {
      key: orderData.key_id || RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency || currency,
      name,
      description,
      order_id: orderId,
      image: 'https://venerable-marigold-a035e7.netlify.app/assets/icon.png',
      prefill: {
        name: prefill?.name || '',
        email: prefill?.email || '',
        contact: prefill?.contact || '',
      },
      notes: {
        ...(notes || {}),
        bookingId: bookingId || '',
      },
      theme: {
        color: '#EAB308',
      },
      modal: {
        ondismiss: () => {
          console.log('[Razorpay] Checkout modal dismissed by user');
          if (onDismiss) onDismiss();
        },
      },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          // 3. Verify signature on backend
          const verifyResult = await verifyRazorpayPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            bookingId,
          });

          if (verifyResult.success) {
            onSuccess(response, verifyResult);
          } else {
            throw new Error(verifyResult.error || 'Payment signature verification failed');
          }
        } catch (err: any) {
          console.error('[Razorpay Verification Failed]:', err);
          Alert.alert('Payment Verification Failed', err.message || 'Signature mismatch. Payment not marked as paid.');
          if (onFailure) onFailure(err);
        }
      },
    };

    const rzpInstance = new (window as any).Razorpay(razorpayOptions);

    // Handle payment.failed event
    rzpInstance.on('payment.failed', (resp: any) => {
      console.error('[Razorpay Payment Failed]:', resp.error);
      const errDescription = resp.error?.description || 'Payment was unsuccessful or rejected by bank.';
      Alert.alert('Payment Failed', `${errDescription} (Code: ${resp.error?.code || 'N/A'})`);
      if (onFailure) onFailure(resp.error);
    });

    // Open Razorpay Standard Checkout Modal
    rzpInstance.open();
  } catch (err: any) {
    console.error('[Razorpay Checkout Error]:', err);
    Alert.alert('Checkout Error', err.message || 'Could not initiate Razorpay payment.');
    if (onFailure) onFailure(err);
  }
}
