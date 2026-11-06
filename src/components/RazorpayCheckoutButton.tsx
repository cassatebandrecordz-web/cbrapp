import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { launchRazorpayCheckout, VerifyPaymentResponse } from '../services/razorpayService';

interface RazorpayCheckoutButtonProps {
  amount: number; // in Rupees, e.g. 350 or 700
  currency?: string;
  buttonText?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  bookingId?: string;
  notes?: Record<string, any>;
  disabled?: boolean;
  onPaymentSuccess?: (paymentRes: any, verifyRes: VerifyPaymentResponse) => void;
  onPaymentError?: (err: any) => void;
  style?: any;
}

export const RazorpayCheckoutButton: React.FC<RazorpayCheckoutButtonProps> = ({
  amount,
  currency = 'INR',
  buttonText,
  clientName,
  clientEmail,
  clientPhone,
  bookingId,
  notes,
  disabled = false,
  onPaymentSuccess,
  onPaymentError,
  style,
}) => {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (disabled || loading) return;

    if (amount <= 0) {
      Alert.alert('Invalid Amount', 'Please select a valid booking slot before paying.');
      return;
    }

    setLoading(true);

    try {
      await launchRazorpayCheckout({
        amount,
        currency,
        name: 'CBR Studio',
        description: `Studio Booking Session (₹${amount.toLocaleString('en-IN')})`,
        bookingId,
        prefill: {
          name: clientName || '',
          email: clientEmail || '',
          contact: clientPhone || '',
        },
        notes: notes || {},
        onSuccess: (paymentRes, verifyRes) => {
          setLoading(false);
          Alert.alert(
            'Payment Verified Successfully! 🎉',
            `Your payment of ₹${amount.toLocaleString('en-IN')} has been verified by Razorpay.\n\nPayment ID: ${paymentRes.razorpay_payment_id}\nOrder ID: ${paymentRes.razorpay_order_id}`,
            [{ text: 'View Pass' }]
          );
          if (onPaymentSuccess) {
            onPaymentSuccess(paymentRes, verifyRes);
          }
        },
        onFailure: (err) => {
          setLoading(false);
          if (onPaymentError) onPaymentError(err);
        },
        onDismiss: () => {
          setLoading(false);
        },
      });
    } catch (err: any) {
      setLoading(false);
      Alert.alert('Checkout Error', err.message || 'Failed to initialize payment.');
      if (onPaymentError) onPaymentError(err);
    }
  };

  const displayText = buttonText || `Pay ₹${amount.toLocaleString('en-IN')} with Razorpay`;

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={[styles.button, (disabled || loading) && styles.buttonDisabled]}
        onPress={handleCheckout}
        disabled={disabled || loading}
        activeOpacity={0.88}
      >
        <View style={styles.contentRow}>
          {loading ? (
            <ActivityIndicator size="small" color="#0A0A0E" />
          ) : (
            <Ionicons name="card" size={18} color="#0A0A0E" />
          )}

          <Text style={styles.buttonText}>{displayText}</Text>
        </View>
      </TouchableOpacity>

      {/* Security & Payment Badges */}
      <View style={styles.badgeRow}>
        <View style={styles.securityTag}>
          <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
          <Text style={styles.securityText}>Razorpay 256-bit Secure</Text>
        </View>
        <Text style={styles.methodsText}>Cards • UPI • NetBanking • Wallets</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  button: {
    backgroundColor: '#FACC15',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#EAB308',
    shadowColor: '#FACC15',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
    shadowOpacity: 0,
    elevation: 0,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#0A0A0E',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  securityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
  },
  methodsText: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
  },
});
