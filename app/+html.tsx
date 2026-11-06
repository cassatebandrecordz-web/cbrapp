import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * Custom Root HTML template for Expo Router Web
 * Preloads Razorpay Standard Checkout SDK
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <title>CBR Studio — Post Production Studio</title>
        {/* Razorpay Standard Web Checkout SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
