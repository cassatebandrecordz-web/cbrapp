import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../src/constants/theme';
import { GlowCard } from '../../src/components/GlowCard';
import { useApp } from '../../src/context/AppContext';
import { SERVICE_IMAGES } from '../../src/constants/serviceImages';
import { soundEffects } from '../../src/utils/soundEffects';
import {
  STUDIO_UPI_CONFIG,
  generateUpiUri,
  launchUpiApp,
  getUpiQrImageUrl,
  copyToClipboard,
  UpiAppTarget,
} from '../../src/utils/upiPayment';
import {
  getWorkingWeekDays,
  getCycleRangeLabel,
  WorkingDayOption,
} from '../../src/utils/dateUtils';
import { StudioApi } from '../../src/services/api';

export type DayOption = WorkingDayOption;

// Full studio operating hours (09:00 AM to 12:00 AM)
export const ALL_STUDIO_TIMINGS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '01:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
  '06:00 PM',
  '07:00 PM',
  '08:00 PM',
  '09:00 PM',
  '10:00 PM',
  '11:00 PM',
  '12:00 AM',
];

// 09:00 AM and 10:00 AM are always booked across all dates
export const isAlwaysBookedSlot = (slot: string) => {
  return slot === '09:00 AM' || slot === '10:00 AM';
};

export const isSlotPermanentlyLocked = isAlwaysBookedSlot;

// 01:00 PM is Lunch Break (Strictly not allowed for booking)
export const isLunchBreakSlot = (slot: string) => {
  return slot === '01:00 PM';
};

// Fast Booking Slots: 2:00 PM to 6:00 PM are highly booked slots (styled in red for urgency, but open to book)
export const isFastBookingSlot = (slot: string) => {
  return (
    slot === '02:00 PM' ||
    slot === '03:00 PM' ||
    slot === '04:00 PM' ||
    slot === '05:00 PM' ||
    slot === '06:00 PM'
  );
};

// Reset all booked slots: start with empty booked list so all slots are available
const getInitialBookedSlots = (): Record<string, string[]> => {
  return {};
};

// Official Studio Disclaimer & Terms for Booking Agreement
export const STUDIO_DISCLAIMER_TERMS = [
  { num: '1', heading: 'Arrival:', text: 'Arrive 15 minutes before your booking.' },
  { num: '2', heading: 'Booking:', text: 'Subject to studio availability and confirmation.' },
  { num: '3', heading: 'Delivery:', text: 'Timelines depend on project requirements and approvals.' },
  { num: '4', heading: 'Backup:', text: 'Keep copies of original and final files.' },
  { num: '5', heading: 'Copyright:', text: 'Clients are responsible for content permissions.' },
  { num: '6', heading: 'Dubbing:', text: '30 minutes is charged as a 1-hour slot.' },
  { num: '7', heading: 'Delays:', text: 'Client delays and breaks count towards booked time.' },
  { num: '8', heading: 'Lunch:', text: 'Lunch-time dubbing requires approval and a minimum 1-hour charge.' },
  { num: '9', heading: 'Technical Issues:', text: 'Studio handles its own technical issues; clients are responsible for problems caused by their files or instructions.' },
  { num: '10', heading: 'Payment & Refunds:', text: 'Full payment is required before work begins. Eligible refunds depend on completed work and are credited within 7 working days after approval.' },
];

export default function SlotBookingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, bookingDraft, updateBookingDraft, confirmBooking } = useApp();
  const scrollRef = useRef<any>(null);

  // Wizard steps: 1: Date & Time Slots, 2: Booking Summary & Payment
  const [step, setStep] = useState<1 | 2>(1);

  // Preload custom slot timing audio SFX on mount
  useEffect(() => {
    soundEffects.preloadSlotSound();
  }, []);

  // Transition Animations
  const slotFadeAnim = useRef(new Animated.Value(1)).current;

  // Active week offset (0 = current week, 1 = next week, etc. Strictly never negative to block past weeks)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Maximum 6-day Monday to Saturday active cycle (Sunday is strictly a holiday; resets to next Monday after Sunday)
  const workingDays = useMemo(() => getWorkingWeekDays(0), []);

  // Default day: today if within this week and not past, or first non-past working day
  const defaultDay = useMemo(() => {
    return workingDays.find((d) => d.isToday && !d.isPast) || workingDays.find((d) => !d.isPast) || workingDays[0];
  }, [workingDays]);

  // Selected Day ID
  const [selectedDayId, setSelectedDayId] = useState<string>(defaultDay.id);

  // Booked slots registry per date
  const [bookedSlotsByDate, setBookedSlotsByDate] = useState<Record<string, string[]>>(getInitialBookedSlots);

  // Selected Day Object
  const selectedDayObj = workingDays.find((d) => d.id === selectedDayId) || defaultDay;

  // Real-time backend slot synchronization: fetch latest booked slots from server on date change
  useEffect(() => {
    let isMounted = true;
    StudioApi.getSlots(selectedDayObj.fullDate).then((res) => {
      if (isMounted && res && Array.isArray(res.bookedSlots)) {
        setBookedSlotsByDate((prev) => ({
          ...prev,
          [selectedDayId]: res.bookedSlots,
        }));
      }
    }).catch(() => {
      // offline fallback
    });

    // Real-time WebSocket subscription (updates screen instantly when another client books)
    const unsubscribe = StudioApi.subscribeToDateSlots(selectedDayObj.fullDate, (latestBooked) => {
      if (isMounted && Array.isArray(latestBooked)) {
        setBookedSlotsByDate((prev) => ({
          ...prev,
          [selectedDayId]: latestBooked,
        }));
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [selectedDayId, selectedDayObj.fullDate]);

  // Selected time slots tracked strictly per date (each date starts with no selected buttons until user selects)
  const [selectedSlotsByDate, setSelectedSlotsByDate] = useState<Record<string, string[]>>({});
  const selectedSlots = selectedSlotsByDate[selectedDayId] || [];

  // Check if a slot is booked/unavailable on the currently selected day
  const isSlotBooked = (slot: string, dayId: string) => {
    if (isAlwaysBookedSlot(slot)) return true;
    if (isLunchBreakSlot(slot)) return true;
    const bookedList = bookedSlotsByDate[dayId] || [];
    return bookedList.includes(slot);
  };

  // Switch Selected Date Handler
  const handleSelectDate = (day: WorkingDayOption) => {
    // Strictly prevent selecting past dates
    if (day.isPast) {
      soundEffects.playClick(440, 0.05);
      Alert.alert(
        'Past Date Unavailable',
        `${day.fullDate} has already passed. Studio bookings cannot be scheduled for past dates. Please select today or an upcoming day.`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (day.id === selectedDayId) return;

    soundEffects.playClick(850, 0.03);

    Animated.sequence([
      Animated.timing(slotFadeAnim, { toValue: 0.15, duration: 80, useNativeDriver: true }),
      Animated.timing(slotFadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();

    setSelectedDayId(day.id);
    const daySlots = selectedSlotsByDate[day.id] || [];

    updateBookingDraft({
      date: day.fullDate,
      durationHours: daySlots.length,
      durationLabel: `${daySlots.length} ${daySlots.length === 1 ? 'Hour' : 'Hours'}`,
      timeSlot:
        daySlots.length === 0
          ? 'No slot selected'
          : `${daySlots.join(', ')} (${daySlots.length} ${daySlots.length === 1 ? 'Hour' : 'Hours'})`,
    });
  };

  // Toggle multiple slot selection
  const handleToggleSlot = (slot: string) => {
    // Past date protection: Strictly cannot select slots on past days
    if (selectedDayObj.isPast) {
      soundEffects.playClick(440, 0.05);
      Alert.alert(
        'Past Date Unavailable',
        'Slots cannot be booked on past dates. Please select today or an upcoming day.',
        [{ text: 'OK' }]
      );
      return;
    }

    // 1:00 PM Lunch Break protection
    if (isLunchBreakSlot(slot)) {
      soundEffects.playClick(440, 0.05);
      Alert.alert(
        '🍽️ Lunch Break (1:00 PM – 2:00 PM)',
        'Studio engineers and technicians are on lunch break between 1:00 PM and 2:00 PM.\n\nSlot booking is strictly unavailable during lunch time. Please choose an available morning (11 AM, 12 PM) or afternoon/evening slot (2 PM – 12 AM).',
        [{ text: 'Understood' }]
      );
      return;
    }

    // 9:00 AM & 10:00 AM Always Booked protection
    if (isAlwaysBookedSlot(slot)) {
      soundEffects.playClick(440, 0.05);
      Alert.alert(
        '🔒 Always Booked (Studio Calibration)',
        `${slot} is permanently reserved every day for sound equipment tuning, acoustic checks, and engineering calibration.\n\nPlease choose an available green slot.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Already booked by another client
    if (isSlotBooked(slot, selectedDayId)) {
      soundEffects.playClick(440, 0.05);
      Alert.alert(
        'Slot Booked',
        `${slot} is already booked on ${selectedDayObj.fullDate}.\n\nPlease select an available green slot.`,
        [{ text: 'OK' }]
      );
      return;
    }

    // Play the user's authentic uploaded slot selection SFX!
    soundEffects.playSlotTimingClick();

    const currentSlots = selectedSlotsByDate[selectedDayId] || [];
    let updated: string[];

    if (currentSlots.includes(slot)) {
      // Allow deselecting slot (even if it's the last selected slot)
      updated = currentSlots.filter((s) => s !== slot);
    } else {
      updated = [...currentSlots, slot].sort(
        (a, b) => ALL_STUDIO_TIMINGS.indexOf(a) - ALL_STUDIO_TIMINGS.indexOf(b)
      );
    }

    setSelectedSlotsByDate((prev) => ({
      ...prev,
      [selectedDayId]: updated,
    }));

    updateBookingDraft({
      date: selectedDayObj.fullDate,
      durationHours: updated.length,
      durationLabel: `${updated.length} ${updated.length === 1 ? 'Hour' : 'Hours'}`,
      timeSlot:
        updated.length === 0
          ? 'No slot selected'
          : `${updated.join(', ')} (${updated.length} ${updated.length === 1 ? 'Hour' : 'Hours'})`,
    });
  };

  // Pricing Calculations: ₹350 per slot (Full Amount Only)
  // Mega Offer: 10% discount for bookings above ₹2,000 across all services
  const RATE_PER_SLOT = 350;
  const hoursCount = selectedSlots.length;
  const studioCharges = hoursCount * RATE_PER_SLOT;
  const isOfferApplicable = studioCharges > 2000;
  const discountAmount = isOfferApplicable ? Math.round(studioCharges * 0.10) : 0;
  // Automatically add ₹200 Engineer Conveyance charge if booked more than 3 slots (> 3 slots)
  const engineerConvenienceFee = hoursCount > 3 ? 200 : 0;
  const totalPrice = studioCharges - discountAmount + engineerConvenienceFee;

  const formattedSlotsString =
    hoursCount === 0
      ? 'No slot selected'
      : `${selectedSlots.join(', ')} (${hoursCount} ${hoursCount === 1 ? 'Hour' : 'Hours'})`;

  // Proceed to Step 2
  const handleProceedToSummary = () => {
    if (selectedDayObj.isPast) {
      Alert.alert(
        'Past Date Unavailable',
        'Cannot proceed with a reservation for a past date. Please select today or an upcoming day.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (selectedSlots.length === 0) {
      Alert.alert('Select a Slot', 'Please select at least 1 time slot for your dubbing reservation.');
      return;
    }

    updateBookingDraft({
      serviceId: 'dubbing',
      serviceName: 'Dubbing Studio',
      studioId: 'studio-dubbing',
      studioName: 'Dubbing Studio',
      date: selectedDayObj.fullDate,
      timeSlot: formattedSlotsString,
      durationHours: hoursCount,
      durationLabel: `${hoursCount} ${hoursCount === 1 ? 'Hour' : 'Hours'}`,
      studioCharges,
      gstAmount: 0,
      totalPrice,
      advanceAmount: totalPrice,
      paymentMethod: 'Studio Reservation (Full Payment)',
    });
    setStep(2);
    setTimeout(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, 10);
  };

  const handleBackNavigation = () => {
    soundEffects.playClick(850, 0.03);
    if (step === 2) {
      setStep(1);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 10);
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  const [hasAgreedTerms, setHasAgreedTerms] = useState<boolean>(false);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);

  const bookingReferenceCode = useMemo(() => {
    return `CBR-${Math.floor(1000 + Math.random() * 9000)}`;
  }, [step]);

  const upiUri = useMemo(() => {
    return generateUpiUri({
      amount: totalPrice,
      transactionRef: bookingReferenceCode,
      transactionNote: `Studio Booking ${bookingReferenceCode}`,
    });
  }, [totalPrice, bookingReferenceCode]);

  const handleLaunchUpi = async (targetApp: UpiAppTarget = 'generic') => {
    if (!hasAgreedTerms) {
      soundEffects.playClick(440, 0.05);
      Alert.alert(
        'Studio Disclaimer & Terms Required',
        'Please review the Studio Disclaimer and check the agreement box before proceeding to payment.',
        [{ text: 'OK' }]
      );
      return;
    }

    soundEffects.playClick(600, 0.05);
    const targetUri = generateUpiUri(
      {
        amount: totalPrice,
        transactionRef: bookingReferenceCode,
        transactionNote: `Studio Booking ${bookingReferenceCode}`,
      },
      targetApp
    );

    const res = await launchUpiApp(targetUri, targetApp);

    if (res.isDesktopWeb) {
      setShowQrCode(true);
      Alert.alert(
        'UPI Payment (Desktop Mode)',
        `${res.message}\n\n1. Scan the QR code shown below with Google Pay, PhonePe, or Paytm.\n2. Or copy the UPI ID (${STUDIO_UPI_CONFIG.upiId}) and pay ₹${totalPrice.toLocaleString('en-IN')}.\n3. Then tap "I Have Paid • Get Pass".`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (!res.success) {
      setShowQrCode(true);
      Alert.alert(
        'UPI Payment',
        `${res.message}\n\nPlease scan the QR code or copy the UPI ID (${STUDIO_UPI_CONFIG.upiId}) to complete payment, then tap "I Have Paid • Get Pass".`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'UPI Payment Started',
        `Please complete the payment of ₹${totalPrice.toLocaleString('en-IN')} in your UPI app, then tap "Confirm Payment & Get Pass".`,
        [
          {
            text: 'Confirm Payment & Get Pass',
            onPress: handleFinalPayment,
          },
          { text: 'Pay Later / Cancel', style: 'cancel' },
        ]
      );
    }
  };

  const handleCopyUpiId = async () => {
    soundEffects.playClick(850, 0.03);
    await copyToClipboard(STUDIO_UPI_CONFIG.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 3000);
    Alert.alert(
      'UPI ID Copied',
      `${STUDIO_UPI_CONFIG.upiId} copied to clipboard!\n\nOpen Google Pay, PhonePe, or Paytm and paste the UPI ID to pay ₹${totalPrice.toLocaleString('en-IN')}.`,
      [{ text: 'OK' }]
    );
  };

  const handleFinalPayment = () => {
    try {
      if (!hasAgreedTerms) {
        Alert.alert(
          'Studio Terms & Disclaimer Required',
          'Please read the Studio Disclaimer & Terms above and manually check the agreement box before proceeding with payment.',
          [{ text: 'OK' }]
        );
        return;
      }

      setBookedSlotsByDate((prev) => ({
        ...prev,
        [selectedDayId]: [...(prev[selectedDayId] || []), ...selectedSlots],
        [selectedDayObj.fullDate]: [...(prev[selectedDayObj.fullDate] || []), ...selectedSlots],
      }));

      // Post to live backend for permanent multi-device slot locking (Full Payment Auto-Booking)
      const booking = confirmBooking({
        serviceId: 'dubbing',
        serviceName: 'Dubbing Studio',
        studioName: 'Dubbing Studio (Acoustic Treated)',
        date: selectedDayObj.fullDate,
        timeSlots: selectedSlots,
        timeSlotLabel: formattedSlotsString,
        totalPrice: totalPrice,
        advanceAmount: totalPrice,
        paymentMethod: 'UPI Full Payment',
        clientName: user?.name || (user?.isGuest ? 'Guest Producer' : 'Studio Client'),
        clientPhone: user?.phone || '+91 90252 53695',
        clientEmail: user?.email || (user?.isGuest ? 'guest@cassate.local' : 'client@cassatebandrecordz.com'),
        userId: user?.id || (user?.isGuest ? 'guest' : 'client-user'),
      });

      router.push({
        pathname: '/booking/confirmation',
        params: { bookingId: booking.id, code: booking.referenceCode },
      });
    } catch (err) {
      console.error('Error during final payment confirmation:', err);
      // Fallback navigation so user ALWAYS receives their pass
      router.push('/(tabs)/booking');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={handleBackNavigation}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {step === 1 ? 'Select Date & Time Slots' : 'Booking Summary & Payment'}
        </Text>

        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ width: '100%' }}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 28 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexGrow: 1 }}>
          {/* ================= STEP 1: DATE & TIME SLOTS ================= */}
          {step === 1 && (
            <View>
              {/* Active Reservation Suite Hero Card */}
              <GlowCard style={styles.studioHeroCard}>
                <View style={styles.studioHeroRow}>
                  <Image
                    source={SERVICE_IMAGES.dubbing}
                    style={styles.studioHeroThumb}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={styles.activePillRow}>
                      <View style={styles.liveGreenDot} />
                      <Text style={styles.activePillText}>ACTIVE</Text>
                    </View>
                    <Text style={styles.studioHeroTitle}>Dubbing Studio</Text>
                    <Text style={styles.studioHeroRate}>
                      ₹350 <Text style={styles.studioHeroPerHr}>/ Slot</Text>
                    </Text>
                  </View>
                </View>
              </GlowCard>

              {/* Monday to Saturday Dates Selector Header */}
              <View style={styles.calendarControlRow}>
                <View style={styles.calendarHeaderTop}>
                  <View style={styles.sectionHeaderRow}>
                    <Ionicons name="calendar" size={16} color={COLORS.primary} />
                    <Text style={styles.sectionTitle}>1. Select Date</Text>
                  </View>
                  <Text style={styles.selectedDateBadge}>{selectedDayObj.fullDate}</Text>
                </View>

                {/* Range Badge for 6-Day Monday to Saturday Cycle */}
                <View style={styles.calendarSubRow}>
                  <View style={styles.weekCycleBadge}>
                    <Ionicons name="calendar-outline" size={12} color="#92400E" />
                    <Text style={styles.weekCycleBadgeText}>
                      {getCycleRangeLabel(workingDays)} • Mon – Sat (Sunday Holiday)
                    </Text>
                  </View>
                </View>
              </View>

              {/* Horizontal Monday-to-Saturday Day Pill Strip */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.sevenDaysContainer}
              >
                {workingDays.map((day) => {
                  const isSelected = selectedDayId === day.id;
                  const isPast = day.isPast;

                  return (
                    <TouchableOpacity
                      key={day.id}
                      disabled={isPast}
                      style={[
                        styles.dayCard,
                        isSelected && styles.dayCardActive,
                        isPast && styles.dayCardPast,
                      ]}
                      onPress={() => handleSelectDate(day)}
                      activeOpacity={isPast ? 1 : 0.75}
                    >
                      {day.isToday && !isPast && (
                        <View style={styles.todayTag}>
                          <Text style={styles.todayTagText}>TODAY</Text>
                        </View>
                      )}
                      {isPast && (
                        <View style={styles.pastTag}>
                          <Ionicons name="lock-closed" size={7} color="#6B7280" />
                          <Text style={styles.pastTagText}>CLOSED</Text>
                        </View>
                      )}
                      <Text
                        style={[
                          styles.dayCardMonth,
                          isSelected && styles.dayCardMonthActive,
                          isPast && styles.dayCardMonthPast,
                        ]}
                      >
                        {day.month}
                      </Text>
                      <Text
                        style={[
                          styles.dayCardNumber,
                          isSelected && styles.dayCardNumberActive,
                          isPast && styles.dayCardNumberPast,
                        ]}
                      >
                        {day.dayNumber}
                      </Text>
                      <Text
                        style={[
                          styles.dayCardName,
                          isSelected && styles.dayCardNameActive,
                          isPast && styles.dayCardNamePast,
                        ]}
                      >
                        {day.dayName}
                      </Text>
                      {isSelected && !isPast && <View style={styles.activeDayIndicator} />}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Time Slots Section Header with Legend */}
              <View style={styles.slotsHeaderContainer}>
                <View style={styles.sectionHeaderRow}>
                  <Ionicons name="time" size={16} color={COLORS.primary} />
                  <Text style={styles.sectionTitle}>2. Select Time Slots (₹350 / Slot)</Text>
                </View>

                {/* Status Legend Pill */}
                <View style={styles.legendContainer}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#16A34A' }]} />
                    <Text style={styles.legendText}>Available</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#E11D48' }]} />
                    <Text style={[styles.legendText, { color: '#BE123C', fontWeight: '800' }]}>Peak Hour</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
                    <Text style={styles.legendText}>Booked</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                    <Text style={styles.legendText}>Selected</Text>
                  </View>
                </View>
              </View>

              {/* 16 Hourly Time Slots Grid (09:00 AM – 12:00 AM) */}
              <Animated.View style={[styles.slotsGrid, { opacity: slotFadeAnim }]}>
                {ALL_STUDIO_TIMINGS.map((slot) => {
                  const isAlwaysBooked = isAlwaysBookedSlot(slot);
                  const isLunch = isLunchBreakSlot(slot);
                  const isDateBooked = isSlotBooked(slot, selectedDayId);
                  const isSelected = selectedSlots.includes(slot);
                  const isFastBooking = isFastBookingSlot(slot);

                  let slotContainerStyle: any = styles.slotAvailable;
                  let slotTextStyle: any = styles.slotAvailableText;
                  let statusLabel = 'Available';
                  let statusDotColor: string | null = '#16A34A';
                  let statusIcon: React.ReactNode = null;

                  if (isLunch) {
                    slotContainerStyle = styles.slotLunch;
                    slotTextStyle = styles.slotLunchText;
                    statusLabel = 'Lunch Break';
                    statusDotColor = '#D97706';
                    statusIcon = (
                      <Ionicons name="restaurant-outline" size={11} color="#D97706" style={{ marginRight: 3 }} />
                    );
                  } else if (isAlwaysBooked || isDateBooked) {
                    slotContainerStyle = styles.slotBooked;
                    slotTextStyle = styles.slotBookedText;
                    statusLabel = 'Booked';
                    statusDotColor = '#9CA3AF';
                    statusIcon = null;
                  } else if (isSelected) {
                    slotContainerStyle = styles.slotSelected;
                    slotTextStyle = styles.slotSelectedText;
                    statusLabel = 'Selected';
                    statusDotColor = '#FEF08A';
                    statusIcon = (
                      <Ionicons name="checkmark-circle" size={11} color="#FEF08A" style={{ marginRight: 3 }} />
                    );
                  } else if (isFastBooking) {
                    // 2:00 PM to 6:00 PM: Blended soft red peak hour slots with red dot (same like Available)
                    slotContainerStyle = styles.slotFastBooking;
                    slotTextStyle = styles.slotFastBookingText;
                    statusLabel = 'Peak Hour';
                    statusDotColor = '#E11D48';
                  }

                  const isClickable = !selectedDayObj.isPast && !isDateBooked && !isAlwaysBooked && !isLunch;

                  return (
                    <TouchableOpacity
                      key={slot}
                      disabled={!isClickable}
                      style={[styles.slotItemBase, slotContainerStyle]}
                      onPress={() => handleToggleSlot(slot)}
                      activeOpacity={isClickable ? 0.7 : 0.85}
                    >
                      <Text style={[styles.slotTimeText, slotTextStyle]}>{slot}</Text>
                      <View style={styles.slotStatusRow}>
                        {statusIcon ? (
                          statusIcon
                        ) : statusDotColor ? (
                          <View style={[styles.statusDot, { backgroundColor: statusDotColor }]} />
                        ) : null}
                        <Text style={[styles.slotStatusLabel, slotTextStyle]}>{statusLabel}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </Animated.View>

              {/* Live Dubbing Summary Card */}
              <GlowCard style={styles.liveSummaryCard}>
                <View style={styles.liveSummaryRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.liveSummaryLabel}>Selected Studio Slot(s)</Text>
                    <Text style={styles.liveSummaryDateText}>
                      {selectedDayObj.fullDate} • {formattedSlotsString}
                    </Text>
                    <View style={styles.liveSummaryRateRow}>
                      <Text style={styles.liveSummaryRate}>
                        {hoursCount === 0
                          ? '₹350 / Slot • Tap an available slot to select'
                          : `₹350 × ${hoursCount} ${hoursCount === 1 ? 'Slot' : 'Slots'} = ₹${studioCharges.toLocaleString('en-IN')}`}
                      </Text>
                      {discountAmount > 0 && (
                        <Text style={{ color: '#16A34A', fontSize: 11, fontWeight: '700', marginLeft: 6 }}>
                          • 10% OFF (-₹{discountAmount.toLocaleString('en-IN')})
                        </Text>
                      )}
                    </View>
                    {engineerConvenienceFee > 0 && (
                      <View style={styles.conveyanceChargeRow}>
                        <Ionicons name="car-outline" size={12} color="#D97706" />
                        <Text style={styles.conveyanceChargeText}>
                          Engineer Conveyance Charge: +₹{engineerConvenienceFee}
                        </Text>
                      </View>
                    )}
                    <View style={styles.engineerIncludedBadge}>
                      <Ionicons name="checkmark-circle" size={13} color="#16A34A" />
                      <Text style={styles.engineerIncludedBadgeText}>Dubbing Engineer Included</Text>
                    </View>
                  </View>

                  <View style={styles.liveSummaryPayBox}>
                    <Text style={styles.payTotalTag}>Total Amount</Text>
                    <Text style={styles.liveTotalVal}>₹{totalPrice.toLocaleString('en-IN')}</Text>
                  </View>
                </View>

                {/* Continue to Payment Button */}
                <TouchableOpacity
                  style={[styles.continueBtn, hoursCount === 0 && { opacity: 0.65 }]}
                  onPress={handleProceedToSummary}
                  activeOpacity={0.85}
                >
                  <View style={styles.continueBtnContent}>
                    <Text style={styles.continueBtnText}>
                      {hoursCount === 0
                        ? 'Select a Time Slot to Continue  →'
                        : `Continue to Payment (${hoursCount} ${hoursCount === 1 ? 'Slot' : 'Slots'} • ₹${totalPrice.toLocaleString('en-IN')})  →`}
                    </Text>
                  </View>
                </TouchableOpacity>
              </GlowCard>
            </View>
          )}

          {/* ================= STEP 2: SUMMARY & FULL PAYMENT ================= */}
          {step === 2 && (
            <View>
              {/* Service & Studio Header Card */}
              <GlowCard style={styles.summaryCard}>
                <View style={styles.summaryTopRow}>
                  <View style={styles.micThumbnail}>
                    <Ionicons name="mic" size={24} color={COLORS.primary} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.summaryServiceName}>Dubbing Studio</Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                {/* Dubbing Engineer Included Callout */}
                <View style={styles.engineerCalloutRow}>
                  <Ionicons name="checkmark-circle" size={17} color="#16A34A" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.engineerCalloutTitle}>Dubbing Engineer Included</Text>
                    <Text style={styles.engineerCalloutSub}>
                      A qualified sound recording engineer is allocated to assist your full booking session.
                    </Text>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                {/* Date & Timings */}
                <View style={styles.summaryInfoRow}>
                  <View style={styles.summaryIconCol}>
                    <Ionicons name="calendar-outline" size={16} color="#4B5563" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryLabel}>Reserved Date</Text>
                    <Text style={styles.summaryValue}>{selectedDayObj.fullDate}</Text>
                  </View>
                </View>

                <View style={[styles.summaryInfoRow, { marginTop: 10 }]}>
                  <View style={styles.summaryIconCol}>
                    <Ionicons name="time-outline" size={16} color="#4B5563" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.summaryLabel}>Selected Slot(s)</Text>
                    <Text style={styles.summaryValue}>{formattedSlotsString}</Text>
                  </View>
                </View>
              </GlowCard>

              {/* Price Breakdown Card */}
              <GlowCard style={styles.priceCard}>
                <Text style={styles.priceSectionHeader}>Session Charges</Text>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>
                    Studio Charges ({hoursCount} {hoursCount === 1 ? 'Slot' : 'Slots'} @ ₹350/slot)
                  </Text>
                  <Text style={styles.priceValue}>₹{studioCharges.toLocaleString('en-IN')}</Text>
                </View>

                {discountAmount > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={[styles.priceLabel, { color: '#16A34A', fontWeight: '700' }]}>
                      🎉 10% Offer (Above ₹2K Booking)
                    </Text>
                    <Text style={[styles.priceValue, { color: '#16A34A', fontWeight: '700' }]}>
                      -₹{discountAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                {engineerConvenienceFee > 0 && (
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                      Engineer Conveyance Charge (More than 3 Slots)
                    </Text>
                    <Text style={[styles.priceValue, { color: '#111827', fontWeight: '700' }]}>
                      +₹{engineerConvenienceFee.toLocaleString('en-IN')}
                    </Text>
                  </View>
                )}

                <View style={styles.priceDivider} />

                <View style={styles.priceRow}>
                  <Text style={styles.totalLabel}>Total Payable Amount</Text>
                  <Text style={styles.totalValue}>₹{totalPrice.toLocaleString('en-IN')}</Text>
                </View>
              </GlowCard>

              {/* Studio Terms & Disclaimer Card (Mandatory Checkbox Agreement) */}
              <GlowCard style={styles.disclaimerSectionCard} borderColor="#EAB308">
                {/* Header */}
                <View style={styles.disclaimerHeaderRow}>
                  <View style={styles.disclaimerIconBox}>
                    <Ionicons name="shield-checkmark" size={16} color="#CA8A04" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.disclaimerCardTitle}>
                      DISCLAIMER – CASSATE BAND RECORDZ
                    </Text>
                    <Text style={styles.disclaimerCardSub}>
                      By using our services, you agree to the following:
                    </Text>
                  </View>
                </View>

                {/* 10 Numbered Terms */}
                <View style={styles.disclaimerTermsList}>
                  {STUDIO_DISCLAIMER_TERMS.map((item) => (
                    <View key={item.num} style={styles.disclaimerTermRow}>
                      <View style={styles.disclaimerNumberPill}>
                        <Text style={styles.disclaimerNumberText}>{item.num}</Text>
                      </View>
                      <Text style={styles.disclaimerTermText}>
                        <Text style={styles.disclaimerTermHeading}>{item.heading} </Text>
                        {item.text}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Studio Branding */}
                <View style={styles.disclaimerBrandFooter}>
                  <Text style={styles.disclaimerBrandTitle}>CASSATE BAND RECORDZ</Text>
                  <Text style={styles.disclaimerBrandTagline}>Your Ideas, We've Done It.</Text>
                </View>

                <View style={styles.disclaimerDivider} />

                {/* Interactive Checkbox Agreement */}
                <TouchableOpacity
                  style={[
                    styles.disclaimerCheckboxRow,
                    hasAgreedTerms && styles.disclaimerCheckboxRowActive,
                  ]}
                  onPress={() => {
                    soundEffects.playClick(hasAgreedTerms ? 600 : 850, 0.04);
                    setHasAgreedTerms(!hasAgreedTerms);
                  }}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.disclaimerCheckboxBox,
                      hasAgreedTerms && styles.disclaimerCheckboxBoxChecked,
                    ]}
                  >
                    {hasAgreedTerms && (
                      <Ionicons name="checkmark" size={15} color="#0A0A0E" />
                    )}
                  </View>
                  <Text style={styles.disclaimerCheckboxLabel}>
                    I have read and agree to the{' '}
                    <Text style={styles.disclaimerCheckboxLabelBold}>
                      CASSATE BAND RECORDZ Studio Terms & Disclaimer
                    </Text>
                  </Text>
                </TouchableOpacity>
              </GlowCard>

              {/* UPI Direct Payment Card */}
              <GlowCard style={styles.upiOptionsCard} borderColor="#EAB308">
                <View style={styles.upiCardHeader}>
                  <View style={styles.upiBadgeRow}>
                    <Ionicons name="card-outline" size={16} color="#92400E" />
                    <Text style={styles.upiCardTitle}>UPI PAYMENT</Text>
                  </View>
                  <Text style={styles.upiPayeeSub}>
                    Payee: <Text style={styles.upiPayeeBold}>{STUDIO_UPI_CONFIG.payeeName}</Text>
                  </Text>
                </View>

                {/* Studio UPI ID & One-Tap Copy */}
                <View style={styles.upiIdCopyContainer}>
                  <View style={styles.upiIdBox}>
                    <Text style={styles.upiIdLabel}>Studio UPI ID</Text>
                    <Text style={styles.upiIdText}>{STUDIO_UPI_CONFIG.upiId}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.copyUpiBtn, copiedUpi && styles.copyUpiBtnSuccess]}
                    onPress={handleCopyUpiId}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={copiedUpi ? 'checkmark-circle' : 'copy-outline'}
                      size={14}
                      color={copiedUpi ? '#16A34A' : '#111827'}
                    />
                    <Text style={[styles.copyUpiBtnText, copiedUpi && { color: '#16A34A' }]}>
                      {copiedUpi ? 'Copied!' : 'Copy ID'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Specific UPI Apps Quick Launch */}
                <Text style={styles.upiAppsSectionTitle}>
                  Select UPI App to Pay ₹{totalPrice.toLocaleString('en-IN')}:
                </Text>
                <View style={styles.upiAppsRow}>
                  <TouchableOpacity
                    style={styles.upiAppPill}
                    onPress={() => handleLaunchUpi('gpay')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.appDot, { backgroundColor: '#4285F4' }]} />
                    <Text style={styles.upiAppPillText}>Google Pay</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.upiAppPill}
                    onPress={() => handleLaunchUpi('phonepe')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.appDot, { backgroundColor: '#5F259F' }]} />
                    <Text style={styles.upiAppPillText}>PhonePe</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.upiAppPill}
                    onPress={() => handleLaunchUpi('paytm')}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.appDot, { backgroundColor: '#00BAF2' }]} />
                    <Text style={styles.upiAppPillText}>Paytm</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.upiAppPill}
                    onPress={() => handleLaunchUpi('generic')}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flash" size={11} color="#D97706" />
                    <Text style={styles.upiAppPillText}>Any UPI</Text>
                  </TouchableOpacity>
                </View>

                {/* Main Launch UPI Button */}
                <TouchableOpacity
                  style={[styles.payBtn, { marginTop: 6 }]}
                  onPress={() => handleLaunchUpi('generic')}
                  activeOpacity={0.85}
                >
                  <View style={styles.payBtnContent}>
                    <Ionicons
                      name="open-outline"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.payBtnText}>
                      Pay ₹{totalPrice.toLocaleString('en-IN')} via UPI App →
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* QR Code Toggle Button */}
                <TouchableOpacity
                  style={styles.toggleQrBtn}
                  onPress={() => setShowQrCode(!showQrCode)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showQrCode ? 'chevron-up-circle-outline' : 'qr-code-outline'}
                    size={16}
                    color="#4B5563"
                  />
                  <Text style={styles.toggleQrText}>
                    {showQrCode ? 'Hide QR Code' : 'Or Scan UPI QR Code to Pay'}
                  </Text>
                </TouchableOpacity>

                {/* Dynamic QR Code Display */}
                {showQrCode && (
                  <View style={styles.qrCodeWrapper}>
                    <Image
                      source={{ uri: getUpiQrImageUrl(upiUri, 220) }}
                      style={styles.qrCodeImage}
                      resizeMode="contain"
                    />
                    <Text style={styles.qrAmountText}>
                      Scan to Pay ₹{totalPrice.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.qrSubText}>
                      Works with Google Pay, PhonePe, Paytm, BHIM & CRED
                    </Text>
                  </View>
                )}

                {/* Confirm Paid Button */}
                {!hasAgreedTerms && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, paddingHorizontal: 4 }}>
                    <Ionicons name="information-circle-outline" size={16} color="#F59E0B" />
                    <Text style={{ color: '#D97706', fontSize: 11, fontWeight: '700' }}>
                      Please check the Studio Terms box above to proceed
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.payBtn,
                    {
                      marginTop: hasAgreedTerms ? 12 : 8,
                      backgroundColor: hasAgreedTerms ? '#059669' : '#6B7280',
                    },
                  ]}
                  onPress={handleFinalPayment}
                  activeOpacity={0.85}
                >
                  <View style={styles.payBtnContent}>
                    <Ionicons
                      name={hasAgreedTerms ? "checkmark-circle" : "checkbox-outline"}
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.payBtnText}>
                      {hasAgreedTerms
                        ? `I Have Paid ₹${totalPrice.toLocaleString('en-IN')} • Get Pass →`
                        : `Check Terms & Confirm Payment`}
                    </Text>
                  </View>
                </TouchableOpacity>
              </GlowCard>

              {/* Payment Logos Pill Row */}
              <View style={styles.paymentMethodsPillRow}>
                <View style={styles.paymentLogoPill}>
                  <Text style={styles.upiText}>UPI</Text>
                </View>

                <View style={styles.paymentLogoPill}>
                  <Text style={styles.visaText}>VISA</Text>
                </View>

                <View style={styles.paymentLogoPill}>
                  <View style={styles.mcCircles}>
                    <View style={[styles.mcCircle, { backgroundColor: '#EB001B' }]} />
                    <View style={[styles.mcCircle, { backgroundColor: '#F79E1B', marginLeft: -6 }]} />
                  </View>
                </View>

                <View style={styles.paymentLogoPill}>
                  <Ionicons name="flash" size={12} color="#06B6D4" />
                  <Text style={styles.razorText}>Razorpay</Text>
                </View>
              </View>

              {/* Back Button to Modify Timing */}
              <TouchableOpacity
                style={styles.modifySlotsBtn}
                onPress={handleBackNavigation}
                activeOpacity={0.7}
              >
                <Ionicons name="arrow-back" size={14} color="#A1A1AA" />
                <Text style={styles.modifySlotsText}>Modify Selected Date & Slots</Text>
              </TouchableOpacity>

              <Text style={styles.demoNoticeText}>
                Instant confirmation • Studio pass with QR entry generated upon reservation
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
    alignItems: 'center',
  },
  topHeader: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FBFCF8',
    borderBottomWidth: 1,
    borderBottomColor: '#E9EAE5',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  scrollContent: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  studioHeroCard: {
    padding: 12,
    marginBottom: 16,
  },
  studioHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  studioHeroThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  activePillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
  },
  studioHeroTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  studioHeroRate: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  studioHeroPerHr: {
    fontSize: 11,
    fontWeight: '500',
    color: '#6B7280',
  },
  calendarControlRow: {
    marginBottom: 8,
  },
  calendarHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    width: '100%',
  },
  calendarSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  weekNavBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F5F5F0',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekNavBtnDisabled: {
    opacity: 0.3,
    backgroundColor: '#F9FAFB',
    borderColor: '#F3F4F6',
  },
  weekCycleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  weekCycleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#92400E',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  selectedDateBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FDE68A',
    flexShrink: 0,
  },
  sevenDaysContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingVertical: 6,
    paddingRight: 8,
    marginBottom: 14,
    minWidth: '100%',
  },
  dayCard: {
    flex: 1,
    minWidth: 46,
    maxWidth: 58,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FAFBF6',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    position: 'relative',
  },
  dayCardActive: {
    backgroundColor: COLORS.primary,
    borderColor: '#FEF08A',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 3,
  },
  dayCardPast: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
    opacity: 0.45,
  },
  pastTag: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#E5E7EB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    zIndex: 2,
  },
  pastTagText: {
    fontSize: 6.5,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 0.3,
  },
  dayCardMonthPast: {
    color: '#9CA3AF',
  },
  dayCardNumberPast: {
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  dayCardNamePast: {
    color: '#9CA3AF',
  },
  todayTag: {
    position: 'absolute',
    top: -6,
    backgroundColor: '#EAB308',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1,
    elevation: 1,
  },
  todayTagText: {
    fontSize: 7.5,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 0.3,
  },
  dayCardMonth: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: 2,
  },
  dayCardMonthActive: {
    color: '#FFFFFF',
  },
  dayCardNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  dayCardNumberActive: {
    color: '#FFFFFF',
  },
  dayCardName: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
  },
  dayCardNameActive: {
    color: '#FFFFFF',
  },
  activeDayIndicator: {
    position: 'absolute',
    bottom: 3,
    width: 14,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
  },
  slotsHeaderContainer: {
    marginBottom: 10,
  },
  slotsSubNotice: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FAFBF6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#4B5563',
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  slotItemBase: {
    width: '48.5%',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotAvailable: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  slotAvailableText: {
    color: '#15803D',
    fontWeight: '700',
  },
  slotBooked: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    opacity: 0.7,
  },
  slotBookedText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  slotLocked: {
    backgroundColor: '#F5F6F1',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    opacity: 0.6,
  },
  slotLockedText: {
    color: '#6B7280',
    fontWeight: '600',
  },
  slotLunch: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    opacity: 0.95,
  },
  slotLunchText: {
    color: '#B45309',
    fontWeight: '700',
  },
  slotSelected: {
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: '#FEF08A',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
    elevation: 3,
  },
  slotSelectedText: {
    color: '#FBFCF8',
    fontWeight: '900',
  },
  slotFastBooking: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    position: 'relative',
  },
  slotFastBookingText: {
    color: '#BE123C',
    fontWeight: '700',
  },
  fastBookingPill: {
    position: 'absolute',
    top: -5,
    right: 5,
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FDA4AF',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    zIndex: 10,
  },
  fastBookingPillText: {
    color: '#BE123C',
    fontSize: 7.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  urgencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF1F2',
    borderWidth: 1,
    borderColor: '#FECDD3',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 8,
    marginBottom: 4,
  },
  urgencyBannerText: {
    color: '#9F1239',
    fontSize: 10.5,
    lineHeight: 14,
    flex: 1,
    fontWeight: '600',
  },
  slotTimeText: {
    fontSize: 12,
    marginBottom: 4,
  },
  slotStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  slotStatusLabel: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  liveSummaryCard: {
    padding: 14,
    marginTop: 4,
  },
  liveSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liveSummaryLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  liveSummaryDateText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  liveSummaryRateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  liveSummaryRate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  zeroGstBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  zeroGstBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#92400E',
  },
  conveyanceChargeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  conveyanceChargeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  engineerIncludedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    marginTop: 4,
  },
  engineerIncludedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16A34A',
  },
  liveSummaryPayBox: {
    alignItems: 'flex-end',
  },
  payTotalTag: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#6B7280',
  },
  liveTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  continueBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 3,
  },
  continueBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: {
    color: '#FBFCF8',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 14,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  micThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryServiceName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  summaryStudioName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  engineerCalloutRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#F0FDF4',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  engineerCalloutTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#15803D',
  },
  engineerCalloutSub: {
    fontSize: 10,
    color: '#166534',
    marginTop: 2,
    lineHeight: 14,
  },
  summaryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryIconCol: {
    width: 24,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 1,
  },
  priceCard: {
    padding: 16,
    marginBottom: 16,
  },
  priceSectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 10,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: '#4B5563',
  },
  priceValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  priceDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#16A34A',
  },
  payBtn: {
    backgroundColor: '#16A34A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  payBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  payBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  paymentMethodsPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
  },
  paymentLogoPill: {
    backgroundColor: '#FAFBF6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 3,
  },
  upiText: {
    color: '#0D9488',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  visaText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '900',
    fontStyle: 'italic',
  },
  mcCircles: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mcCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  razorText: {
    color: '#06B6D4',
    fontSize: 10,
    fontWeight: '800',
  },
  modifySlotsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
  },
  modifySlotsText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  upiOptionsCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EAB308',
  },
  upiCardHeader: {
    marginBottom: 12,
  },
  upiBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  upiCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  upiPayeeSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 3,
  },
  upiPayeeBold: {
    fontWeight: '800',
    color: '#111827',
  },
  upiIdCopyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 14,
  },
  upiIdBox: {
    flex: 1,
  },
  upiIdLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  upiIdText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  copyUpiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  copyUpiBtnSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  copyUpiBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  upiAppsSectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  upiAppsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  upiAppPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 9,
    paddingHorizontal: 3,
    borderRadius: 10,
  },
  appDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  upiAppPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1F2937',
  },
  toggleQrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingVertical: 6,
  },
  toggleQrText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#4B5563',
    textDecorationLine: 'underline',
  },
  qrCodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  qrAmountText: {
    fontSize: 13.5,
    fontWeight: '900',
    color: '#111827',
    marginTop: 10,
  },
  qrSubText: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
    textAlign: 'center',
  },
  disclaimerSectionCard: {
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#EAB308',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  disclaimerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  disclaimerIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerCardTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.4,
  },
  disclaimerCardSub: {
    fontSize: 10.5,
    color: '#6B7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  disclaimerTermsList: {
    gap: 7,
    marginTop: 10,
    marginBottom: 12,
  },
  disclaimerTermRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 7,
  },
  disclaimerNumberPill: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1,
    borderColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  disclaimerNumberText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#854D0E',
  },
  disclaimerTermText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 16,
    flex: 1,
  },
  disclaimerTermHeading: {
    fontWeight: '800',
    color: '#111827',
  },
  disclaimerBrandFooter: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 10,
    gap: 1,
  },
  disclaimerBrandTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#111827',
    letterSpacing: 0.5,
  },
  disclaimerBrandTagline: {
    fontSize: 10,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#CA8A04',
  },
  disclaimerDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  disclaimerCheckboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAFBF6',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  disclaimerCheckboxRowActive: {
    backgroundColor: '#FEF9C3',
    borderColor: '#EAB308',
  },
  disclaimerCheckboxBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.8,
    borderColor: '#9CA3AF',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disclaimerCheckboxBoxChecked: {
    backgroundColor: '#EAB308',
    borderColor: '#CA8A04',
  },
  disclaimerCheckboxLabel: {
    fontSize: 11.5,
    color: '#374151',
    lineHeight: 16,
    flex: 1,
  },
  disclaimerCheckboxLabelBold: {
    fontWeight: '800',
    color: '#111827',
  },
  payBtnDisabled: {
    opacity: 0.55,
  },
  agreeReminderNotice: {
    color: '#B45309',
    fontSize: 10.5,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 7,
  },
  demoNoticeText: {
    color: '#9CA3AF',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 14,
  },
});
