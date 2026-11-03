/**
 * CASSATE BAND RECORDZ - UPI Payment Configuration & Utilities
 * 
 * Standard NPCI UPI URI Specification:
 * upi://pay?pa={vpa}&pn={payeeName}&tr={refId}&am={amount}&cu=INR&tn={note}
 */

import { Linking, Platform } from 'react-native';

export const STUDIO_UPI_CONFIG = {
  upiId: '9025253695@hdfc',
  payeeName: 'Cassate Band Recordz',
  currency: 'INR',
  studioPhone: '+91 90252 53695',
  bankName: 'HDFC Bank',
} as const;

export interface UpiUriOptions {
  amount: number;
  transactionRef: string;
  transactionNote?: string;
}

export type UpiAppTarget = 'generic' | 'gpay' | 'phonepe' | 'paytm' | 'bhim';

export interface UpiLaunchResult {
  success: boolean;
  fallbackNeeded: boolean;
  message: string;
  isDesktopWeb?: boolean;
}

/**
 * Builds a strictly compliant NPCI UPI payment deep link URI.
 * Uses strict %20 space encoding (never '+' which breaks GPay and PhonePe on Android).
 */
export function generateUpiUri({
  amount,
  transactionRef,
  transactionNote = 'Studio Session Reservation',
}: UpiUriOptions, app: UpiAppTarget = 'generic'): string {
  const cleanPa = STUDIO_UPI_CONFIG.upiId.trim();
  const cleanPn = encodeURIComponent(STUDIO_UPI_CONFIG.payeeName);
  const cleanAm = amount.toFixed(2);
  const cleanCu = STUDIO_UPI_CONFIG.currency;
  const cleanTn = encodeURIComponent(transactionNote.replace(/[^a-zA-Z0-9 ]/g, ' '));
  const cleanTr = encodeURIComponent(transactionRef.replace(/[^a-zA-Z0-9]/g, ''));

  // Standard NPCI parameter string
  const query = `pa=${cleanPa}&pn=${cleanPn}&am=${cleanAm}&cu=${cleanCu}&tn=${cleanTn}&tr=${cleanTr}`;

  switch (app) {
    case 'gpay':
      return `tez://upi/pay?${query}`;
    case 'phonepe':
      return `phonepe://pay?${query}`;
    case 'paytm':
      return `paytmmp://pay?${query}`;
    case 'bhim':
      return `bhim://pay?${query}`;
    case 'generic':
    default:
      return `upi://pay?${query}`;
  }
}

/**
 * Generates an official, scannable QR code image URL for a given UPI URI.
 */
export function getUpiQrImageUrl(upiUri: string, size: number = 280): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&format=png&margin=10&data=${encodeURIComponent(
    upiUri
  )}`;
}

/**
 * Helper to copy text to system clipboard across both Web and Native environments.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // continue to fallback
  }

  // Fallback for web environments without secure context
  if (typeof document !== 'undefined') {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Launches an installed UPI app (Google Pay, PhonePe, Paytm, BHIM, CRED) via UPI Intent.
 * Supports:
 * - Native Android / iOS via Linking.openURL
 * - Mobile Web browsers (Chrome/Safari) via deep-link anchor click
 * - Graceful fallback to QR code / Copy UPI ID on Desktop Web browsers
 */
export async function launchUpiApp(
  upiUri: string,
  app: UpiAppTarget = 'generic'
): Promise<UpiLaunchResult> {
  // If in a Web environment (mobile web browser or desktop web browser)
  if (Platform.OS === 'web') {
    const isMobileBrowser =
      typeof navigator !== 'undefined' &&
      /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobileBrowser) {
      // On mobile browsers, directly trigger the UPI deep link!
      try {
        if (typeof window !== 'undefined') {
          // Open via a virtual link element which triggers Android/iOS intent chooser
          const link = document.createElement('a');
          link.href = upiUri;
          link.target = '_self';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          return {
            success: true,
            fallbackNeeded: false,
            message: 'Redirecting to your UPI app...',
            isDesktopWeb: false,
          };
        }
      } catch (err: any) {
        return {
          success: false,
          fallbackNeeded: true,
          message: 'Could not launch UPI app automatically. Please scan the QR code or copy the UPI ID.',
          isDesktopWeb: false,
        };
      }
    }

    // On Desktop Web browser (PCs / Laptops cannot run mobile UPI apps directly)
    return {
      success: false,
      fallbackNeeded: true,
      message: 'Desktop browsers cannot open mobile UPI apps directly. Please scan the QR code with your mobile phone or copy the UPI ID.',
      isDesktopWeb: true,
    };
  }

  // Native iOS / Android environment:
  try {
    // In Android 11+, canOpenURL often returns false due to package visibility filtering.
    // Try openURL directly so the OS opens the UPI chooser dialog!
    await Linking.openURL(upiUri);
    return {
      success: true,
      fallbackNeeded: false,
      message: 'Opening your UPI app...',
      isDesktopWeb: false,
    };
  } catch (error: any) {
    // If specific app (e.g. tez:// or phonepe://) is not installed, fallback to generic upi://
    if (app !== 'generic') {
      try {
        const genericUri = upiUri.replace(/^[a-z0-9]+:\/\//, 'upi://');
        await Linking.openURL(genericUri);
        return {
          success: true,
          fallbackNeeded: false,
          message: 'Opening your UPI app...',
          isDesktopWeb: false,
        };
      } catch {
        // Fall through
      }
    }

    return {
      success: false,
      fallbackNeeded: true,
      message: 'No supported UPI app found. Please copy the UPI ID or scan the QR code to complete payment.',
      isDesktopWeb: false,
    };
  }
}
