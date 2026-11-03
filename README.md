# CASSATE BAND RECORDZ – ANDROID DEMO APPLICATION

> **Tagline:** *Your All-In-One Post Production House.*  
> **Package ID:** `com.cassatebandrecordz.studio`  
> **Platform:** Android (Expo / React Native / TypeScript)  
> **Theme:** Premium Black & Dark-Purple Studio Theme (#0A0813, #150E2A, #8B5CF6, #06B6D4)  

---

## 🎧 Overview

**CASSATE BAND RECORDZ** is a state-of-the-art post-production house mobile client app designed for film producers, musicians, sound engineers, voice talent, and agencies. 

This application provides a complete interactive simulation of modern post-production services—from booking physical Dolby Atmos suites and tracking booths to reviewing locked cuts, testing binaural spatial audio drafts, requesting timecode-accurate revisions, and downloading final broadcast masters and audio stems.

---

## 📱 Complete Screen & Feature Mapping (All 32 Screens)

| # | Screen / Feature | Route / Component | Description |
|---|---|---|---|
| **1** | **Splash Screen** | `app/index.tsx` | Animated studio entrance with rotating cassette reels, soundwave glow, and auto-transition to Welcome. |
| **2** | **Welcome Screen** | `app/welcome.tsx` | Studio feature highlights (Dolby Atmos, 4K Color, ADR), demo disclaimer banner, and quick-start actions. |
| **3** | **Login Screen** | `app/login.tsx` | Clearly labeled **DEMO LOGIN** with 1-tap auto-fill profiles (Producer, Director, Sound Engineer), password visibility toggle. |
| **4** | **Registration Screen** | `app/register.tsx` | Client onboarding form with name, company, scope pills, contact info, and demo account creation. |
| **5** | **Home Dashboard** | `app/(tabs)/index.tsx` | Client greeting, membership tier, active projects count, booked sessions, live draft player preview, service carousel, upcoming bookings. |
| **6** | **All Services Catalog** | `app/(tabs)/services.tsx` | Grid/list of all 9 post-production divisions with category filter pills and live search. |
| **7** | **Dubbing Studio** | `app/services/[id].tsx?id=dubbing` | Automated Dialogue Replacement (ADR) booth specs, dual 55" video reference displays, Lip-sync accuracy (<40ms). |
| **8** | **Voice-Over Recording** | `app/services/[id].tsx?id=voice-over` | Commercial, audiobook, and character VO specs; Neumann U87 Ai, WhisperRoom isolation (-70dBA noise floor). |
| **9** | **Audio Recording** | `app/services/[id].tsx?id=audio-recording` | Multi-track live tracking room, SSL Origin 32 console, 32-channel Burl converters, drum isolation booth. |
| **10** | **Mixing and Mastering** | `app/services/[id].tsx?id=mixing-mastering` | Dolby Atmos 7.1.4 certified room, Neve analog summing, EBU R128 loudness standards, Apple Digital Masters. |
| **11** | **Video Editing** | `app/services/[id].tsx?id=video-editing` | 4K/8K ProRes and RAW workflows, DaVinci Resolve & Premiere Pro suites, 100Gbps fiber SAN storage. |
| **12** | **Colour Grading** | `app/services/[id].tsx?id=colour-grading` | Flanders Scientific XMP310 HDR reference monitor, ACES 1.3 color management, Dolby Vision metadata. |
| **13** | **Sound Design and Foley** | `app/services/[id].tsx?id=sound-design` | Specialized 8-surface Foley pit (wood, gravel, tile, water), 500k+ SFX library, 7.1 surround world-building. |
| **14** | **Background Score** | `app/services/[id].tsx?id=background-score` | Custom orchestral & synth composition, timecode sync, Moog One, live string tracking integration. |
| **15** | **Subtitles and Translation** | `app/services/[id].tsx?id=subtitles` | Multilingual SRT/VTT/XML captions, Netflix/BBC SDH compliance, 17 CPS reading speed checks. |
| **16** | **Service Details & Pricing** | `app/services/[id].tsx` | Tier selection (Standard, Cinema, Multilingual) with deliverables list, interactive hours calculator, and lead engineer toggle. |
| **17** | **Studio Selection** | `app/(tabs)/booking.tsx` (Step 1) | Interactive selection: Studio A (Dolby Atmos), Studio B (Live Tracking), Studio C (ADR Booth), Studio D (Color Suite). |
| **18** | **Booking Calendar** | `app/(tabs)/booking.tsx` (Step 2) | 14-day upcoming calendar date picker with weekday, day number, and month cards. |
| **19** | **Time-Slot Selection** | `app/(tabs)/booking.tsx` (Step 2) | Morning (09:00-13:00), Afternoon (14:00-18:00), Evening Prime (18:30-22:30), Overnight Lock-in (23:00-05:00). |
| **20** | **Booking Summary** | `app/(tabs)/booking.tsx` (Step 3) | Line-item calculation: room rate + engineer fee × duration, line-item breakdown, special notes field. |
| **21** | **Manual Payment Selection** | `app/(tabs)/booking.tsx` (Step 3) | "Pay at Studio (Reception POS / Cash)", "Studio Cash on Arrival", "Corporate PO (Demo)" - strictly simulated. |
| **22** | **Booking Confirmation** | `app/booking/confirmation.tsx` | Confirmation pass screen with reference code (e.g. `CBR-2026-8841`), digital QR pass mockup, add to calendar demo. |
| **23** | **My Bookings** | `app/my-bookings.tsx` | Upcoming, Completed, and Rescheduled studio sessions with reschedule/modify demo actions. |
| **24** | **My Projects** | `app/(tabs)/projects.tsx` | Project catalog with search and status filtering (`All`, `Active`, `Review`, `Completed`). |
| **25** | **Project Progress Tracking** | `app/projects/[id].tsx` | Pipeline percentage bar and multi-stage milestone timeline with technical stage descriptions and dates. |
| **26** | **Editor Assignment Information** | `app/projects/[id]/editor.tsx` | Lead sound engineer/colorist bio, credits, rating, studio intercom demo dial, and direct console dispatch message. |
| **27** | **Draft Preview Screen** | `app/projects/[id]/draft.tsx` | Interactive audio/video draft player, play/pause controls, timeline scrubber, animated waveform visualizer, Binaural vs Stereo toggle. |
| **28** | **Revision Request Screen** | `app/projects/[id]/revision.tsx` | Interactive form: Timecode (`01:24`), category picker, priority (`Normal`/`High`/`Urgent`), notes, and mock reference attachment. |
| **29** | **Final Delivery Screen** | `app/projects/[id]/delivery.tsx` | Golden Master certified package, SHA256 checksum, commercial license number, and downloadable stems (ProRes 422, WAV, 5.1 ZIP, Cue Sheet). |
| **30** | **Customer Profile** | `app/(tabs)/profile.tsx` | Client name, company, Studio Pro VIP tier, $450 studio credits, session stats, inline profile edit, and format preferences. |
| **31** | **Notifications** | `app/notifications.tsx` | Activity feed with alerts for draft review ready, booking confirmed, and master stems ready. Tap-to-navigate. |
| **32** | **Contact Studio** | `app/contact.tsx` | Studio hotline, reception phone, bookings email, hours, location map mockup, WhatsApp quick chat, and inquiry dispatch form. |

---

## 🎛️ Project Architecture

```
cassate-band-recordz/
├── app/                           # Expo Router Typed Navigation
│   ├── _layout.tsx                # App root provider, status bar, and stack navigator
│   ├── index.tsx                  # Screen 1: Splash screen with cassette animation
│   ├── welcome.tsx                # Screen 2: Welcome screen
│   ├── login.tsx                  # Screen 3: Demo login screen
│   ├── register.tsx               # Screen 4: Registration screen
│   ├── (tabs)/                    # Bottom 5-Tab Navigation Layout
│   │   ├── _layout.tsx            # Custom tab bar with badge counts & violet highlights
│   │   ├── index.tsx              # Screen 5: Home dashboard
│   │   ├── services.tsx           # Screen 6: All services catalog
│   │   ├── booking.tsx            # Screens 17-21: Multi-step interactive booking wizard
│   │   ├── projects.tsx           # Screen 24: My projects listing
│   │   └── profile.tsx            # Screen 30: Customer profile & settings
│   ├── services/
│   │   └── [id].tsx               # Screens 7-16: Dedicated service details & dynamic tier pricing
│   ├── booking/
│   │   └── confirmation.tsx       # Screen 22: Booking confirmation & digital pass
│   ├── my-bookings.tsx            # Screen 23: My bookings management
│   ├── projects/
│   │   └── [id].tsx               # Screen 25: Project progress tracking & milestone timeline
│   ├── projects/[id]/
│   │   ├── editor.tsx             # Screen 26: Supervising editor assignment & contact
│   │   ├── draft.tsx              # Screen 27: Draft preview player & animated waveform
│   │   ├── revision.tsx           # Screen 28: Timecode revision request form
│   │   └── delivery.tsx           # Screen 29: Final delivery stems & commercial license
│   ├── notifications.tsx          # Screen 31: Studio notification center
│   └── contact.tsx                # Screen 32: Contact studio, directions, and inquiry
├── assets/                        # High-resolution studio branding assets
│   ├── icon.png                   # 1024x1024 Dark-purple studio logo
│   ├── android-icon-foreground.png# Adaptive icon foreground
│   └── splash-icon.png            # Branded splash icon
├── src/
│   ├── components/                # Reusable visual components
│   │   ├── CassetteLogo.tsx       # Animated vector cassette tape with spinning reels
│   │   ├── GlowCard.tsx           # Rounded dark-purple gradient card with border glow
│   │   ├── StatusBadge.tsx        # Status pill component for all 6 project statuses
│   │   ├── WaveformVisualizer.tsx # Interactive animated audio frequency visualizer
│   │   ├── Header.tsx             # Universal studio navigation header with badges
│   │   └── DemoNoticeBanner.tsx   # Persistent demo mode disclosure banner
│   ├── constants/
│   │   └── theme.ts               # Color palette, shadows, typography constants
│   ├── context/
│   │   └── AppContext.tsx         # Central reactive state (bookings, projects, revisions)
│   └── data/
│       └── mockData.ts            # Realistic studio dataset (services, studios, projects)
├── app.json                       # Expo configuration (Package: com.cassatebandrecordz.studio)
├── eas.json                       # EAS Build profile for Android APK generation
├── package.json                   # Dependencies (Expo SDK 58, React Native, TypeScript)
└── tsconfig.json                  # Strict TypeScript configuration
```

---

## 🚀 Running the Project Locally

### 1. Prerequisites
- Node.js (v18 or higher)
- npm / npx

### 2. Start the Development Server
```bash
cd cassate-band-recordz
npx expo start --port 8085
```

- Press **`a`** to open in a connected **Android Emulator** or physical device via USB debugging.
- Press **`w`** to open in a **Web Browser** for immediate responsive testing.
- Scan the on-screen QR code with the **Expo Go** Android app on your phone.

---

## 📦 How to Generate a Downloadable Android APK

We have pre-configured `eas.json` with an Android `apk` build profile. You can generate a standalone `.apk` using either **Expo Cloud (EAS)** or **Local Android Studio Build**.

### Method 1: EAS Cloud Build (Recommended – No Android SDK required locally)

Expo Application Services (EAS) compiles the Android APK in the cloud and provides a direct `.apk` download link:

1. **Install EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Log in to Expo:**
   ```bash
   eas login
   ```

3. **Trigger the APK Build:**
   ```bash
   eas build -p android --profile preview
   ```

4. When the build completes (usually 5–10 minutes), EAS provides a download URL in the terminal (e.g., `https://expo.dev/artifacts/eas/...apk`) which you can download directly to any Android device or Pixel emulator.

---

### Method 2: Local Gradle Build (If Android SDK / Studio is installed)

If you have Android Studio and the Android SDK installed on your machine:

1. **Generate native Android project:**
   ```bash
   npx expo prebuild --platform android
   ```

2. **Compile the Release APK:**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   *(On Windows PowerShell: `.\gradlew.bat assembleRelease`)*

3. **Locate your APK file:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

4. **Install on emulator or device:**
   ```bash
   adb install -r android/app/build/outputs/apk/release/app-release.apk
   ```

---

## 🔒 Demo Notice & Limitations

- **Simulated Transactions:** No real credit card, UPI, or payment gateway is integrated. Bookings use the **Pay at Studio** / **Manual Reservation** mode.
- **Simulated File Delivery:** Deliverables (ProRes 422, stems, license certificates) use simulated high-resolution file links with hash verification toasts for demonstration purposes.
- **Demo Accounts:** Authentication is pre-loaded with sample producer/filmmaker profiles to facilitate immediate review of active project workflows without requiring production credentials.
