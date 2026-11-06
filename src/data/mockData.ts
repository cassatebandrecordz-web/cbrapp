export interface ServiceItem {
  id: string;
  name: string;
  category: 'Audio & Music' | 'Film & Video' | 'Localization' | 'Creative Design' | 'Next-Gen Creative' | 'Additional Services';
  tagline: string;
  description: string;
  icon: string;
  basePrice: number; // in INR ₹
  priceUnit: string;
  turnaround: string;
  specs: string[];
  gear: string[];
  featured?: boolean;
  imageThumbnail: string;
  isComingSoon?: boolean;
  status?: 'active' | 'coming-soon';
  tiers: {
    name: string;
    price: number;
    description: string;
    deliverables: string[];
  }[];
}

export interface StudioRoom {
  id: string;
  name: string;
  badge: string;
  capacity: string;
  hourlyRate: number; // in INR ₹ (e.g. 2000/hr)
  monitoring: string;
  acoustics: string;
  features: string[];
  available: boolean;
  imageIcon: string;
}

export interface BookingItem {
  id: string;
  referenceCode: string;
  serviceId: string;
  serviceName: string;
  studioId: string;
  studioName: string;
  date: string;
  timeSlot: string;
  timeSlots?: string[];
  durationHours: number;
  studioCharges: number;
  gstAmount: number;
  totalPrice: number;
  advanceAmount: number;
  paymentMethod: string;
  transactionId?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string;
  status: 'Confirmed' | 'Completed' | 'In Session' | 'Rescheduled';
  notes?: string;
  createdAt: string;
}

export type ProjectStatus =
  | 'Assigned'
  | 'In Progress'
  | 'Quality Check'
  | 'Review'
  | 'Client Review'
  | 'Revision Required'
  | 'Completed';

export interface ProjectFile {
  id: string;
  name: string;
  size: string;
  duration?: string;
  format: string;
  type?: 'master' | 'stems' | 'cuesheet' | 'license';
}

export interface EditorInfo {
  id: string;
  name: string;
  role: string;
  experience: string;
  credits: string[];
  avatar: string;
  email: string;
  phone: string;
  rating: number;
}

export interface RevisionItem {
  id: string;
  timestamp: string;
  timecode: string;
  category: string;
  priority: 'Normal' | 'High' | 'Urgent';
  note: string;
  status: 'Pending' | 'In Review' | 'Resolved';
  createdAt: string;
}

export interface ProjectItem {
  id: string;
  code: string;
  title: string;
  clientName: string;
  serviceType: string;
  category?: string;
  status: ProjectStatus;
  statusColor: string; // 'gold' | 'cyan' | 'green' | 'purple'
  currentStepIndex: number; // 0 to 4 (Booked, Recording, Editing, Review, Delivery)
  files: ProjectFile[];
  progressPercent: number;
  deadline: string;
  createdAt: string;
  editor: EditorInfo;
  currentDraft: {
    version: string;
    mediaType: 'audio' | 'video';
    duration: string;
    durationSeconds: number;
    sampleUrl: string;
    waveformLevels: number[];
    notes: string;
    uploadedAt: string;
  };
  revisions: RevisionItem[];
  finalDelivery?: {
    deliveredDate: string;
    packageTitle: string;
    licenseNumber: string;
    checksum: string;
    files: {
      name: string;
      format: string;
      size: string;
      type: 'master' | 'stems' | 'cuesheet' | 'license';
    }[];
  };
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'project' | 'booking' | 'system' | 'delivery';
  timestamp: string;
  read: boolean;
  targetId?: string;
}

export const EDITORS: EditorInfo[] = [
  {
    id: 'ed-1',
    name: 'Vikram "Sonic" Rao',
    role: 'Chief Sound Designer & Dolby Atmos Engineer',
    experience: '14+ Years in Feature Films & Spatial Audio',
    credits: ['The Midnight Horizon (Feature Film)', 'Shadows of Silk (Netflix Series)', 'Arcadia Soundtrack (Dolby Atmos)'],
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    email: 'vikram.rao@cassatebandrecordz.com',
    phone: '+91 98765 43210',
    rating: 4.98,
  },
  {
    id: 'ed-2',
    name: 'Maya Chen',
    role: 'Senior Colorist & Finishing Artist',
    experience: '11+ Years in High-Fashion Commercials & Cinema',
    credits: ['Vogue International Autumn campaign', 'Cyber District 2088 (Indie Feature)', 'Aurora Music Video (MTV Award Nominee)'],
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    email: 'maya.chen@cassatebandrecordz.com',
    phone: '+91 98765 43211',
    rating: 4.95,
  },
];

export const SERVICES: ServiceItem[] = [
  {
    id: 'dubbing',
    name: 'Dubbing Studio',
    category: 'Localization',
    tagline: 'Film, Web, OTT, Ads',
    description: 'Precision automated dialogue replacement (ADR) and lip-sync foreign language dubbing in sound-isolated recording rooms.',
    icon: 'headset-outline',
    basePrice: 350,
    priceUnit: 'per Slot (1 Hr)',
    turnaround: '2-3 Business Days',
    imageThumbnail: 'mic',
    featured: true,
    isComingSoon: false,
    status: 'active',
    specs: ['Sync Accuracy: < 1 Frame (< 40ms)', 'Dual 55-inch Cinema Video Reference Displays', 'Full ADR Beep / Visual Cue System', 'Source-Connect Pro Enabled'],
    gear: ['Neumann TLM 103 & Sennheiser MKH 416', 'Grace Design Preamp', 'Avid Pro Tools HDX', 'Genelec 8341A SAM Studio Monitors'],
    tiers: [
      { name: 'Standard Voice Over (1 Slot / 1 Hr)', price: 350, description: 'Single talent booth session', deliverables: ['Raw 24-bit/48kHz WAV stems', 'Basic de-breath cleanup'] },
      { name: 'Cinema Lip-Sync Dub (2 Slots / 2 Hrs)', price: 700, description: 'Timecoded dialogue replacement with director feed', deliverables: ['Time-aligned broadcast WAV', 'Lip-sync matched dialogue track', 'ADR session logs'] },
      { name: 'Half Day Dubbing (4 Slots / 4 Hrs)', price: 1400, description: 'Multi-character voice session', deliverables: ['Complete localized dialogue submix', 'M&E balance check', 'QC report'] },
      { name: 'Full Day Lock-in (8 Slots / 8 Hrs)', price: 2800, description: 'Full feature film dubbing marathon', deliverables: ['Master dialogue tracks', 'Pro Tools session export'] },
    ],
  },
  {
    id: 'voice-over',
    name: 'Voice Over',
    category: 'Audio & Music',
    tagline: 'Commercial, Narration, IVR',
    description: 'Broadcast-grade commercial, character, and corporate voice tracking in whisper-quiet isolation booths with zero ambient noise floor.',
    icon: 'mic-outline',
    basePrice: 2500,
    priceUnit: 'per hour',
    turnaround: '24-48 Hours',
    imageThumbnail: 'mic',
    featured: true,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['Noise Floor: Under -70 dBA', 'NRC > 0.95 Acoustic Absorption', 'Dedicated Talent Talkback', 'Live Remote Director Link'],
    gear: ['Neumann U87 Ai Multi-Pattern Mic', 'Universal Audio LA-610 Tube Strip', 'Apollo x8p Interface', 'Sennheiser HD 650 Reference Cans'],
    tiers: [
      { name: 'Commercial Spot (30s/60s)', price: 2500, description: 'Radio & TV punchy vocal tracks', deliverables: ['Full raw takes + best comp', 'Broadcast normalized WAV'] },
      { name: 'Audiobook & Longform (3 Hours)', price: 6500, description: 'Endurance session with real-time QC', deliverables: ['ACX compliant master files', 'Chapter-divided 24-bit audio'] },
    ],
  },
  {
    id: 'mixing-mastering',
    name: 'Mixing & Mastering',
    category: 'Audio & Music',
    tagline: 'Broadcast & OTT Ready',
    description: 'Dolby Atmos 7.1.4 immersive mixing and analog hybrid stereo masters tuned to radio and streaming loudness targets.',
    icon: 'options-outline',
    basePrice: 6000,
    priceUnit: 'per track',
    turnaround: '3-4 Business Days',
    imageThumbnail: 'options',
    featured: true,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['Dolby Atmos Certified 7.1.4 Architecture', 'Neve 8816 Analog Summing', 'EBU R128 / -14 LUFS Strict Loudness Standards'],
    gear: ['ATC SCM45A Pro Active Monitors', 'Shadow Hills Mastering Compressor', 'Pultec EQP-1A Tube EQs', 'Crane Song Converters'],
    tiers: [
      { name: 'Stereo Master', price: 3000, description: 'Single track mastering for streaming & vinyl', deliverables: ['24-bit/96kHz WAV + CD 16-bit WAV', 'Loudness optimization'] },
      { name: 'Full Multi-Track Stem Mix', price: 6000, description: 'Up to 48 stems balanced to perfection', deliverables: ['Final Stereo Mix + Instrumental + A Cappella', '2 Rounds of Revisions'] },
      { name: 'Dolby Atmos Spatial Audio', price: 11000, description: '3D immersive spatial bed mix', deliverables: ['Dolby Atmos ADM BWF', 'Binaural headphone mix', 'Surround stems'] },
    ],
  },
  {
    id: 'video-editing',
    name: 'Video Editing',
    category: 'Film & Video',
    tagline: 'Cut, Sync, VFX, Final Output',
    description: 'From offline rough cut to picture lock. Narrative pacing, rhythm montage, audio-video sync, and final ProRes deliverables.',
    icon: 'film-outline',
    basePrice: 5000,
    priceUnit: 'per project day',
    turnaround: '3-5 Business Days',
    imageThumbnail: 'film',
    featured: true,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['Native Support for RED RAW, ARRI ProRes & Sony X-OCN', '100 Gbps High-Speed NAS Storage', 'Frame-Accurate XML Roundtrips'],
    gear: ['Mac Studio M2 Ultra 128GB Suites', 'DaVinci Resolve Studio & Premiere Pro 2026', 'Dual EIZO ColorEdge 4K Displays'],
    tiers: [
      { name: 'Commercial / Promo Cut', price: 5000, description: 'Punchy edit with rhythm cutting', deliverables: ['Assembly, Rough Cut, Locked Master', '16:9 and 9:16 social exports'] },
      { name: 'Documentary / Short Film', price: 12000, description: 'Narrative structuring and dialogue pass', deliverables: ['Picture Locked Master', 'EDL/XML for color & sound'] },
    ],
  },
  {
    id: 'colour-grading',
    name: 'Color Grading',
    category: 'Film & Video',
    tagline: 'Cinematic Look & Feel',
    description: 'Transform raw footage into rich cinematic visuals. Calibrated color palettes, exposure balancing, natural skin tones, and HDR masters.',
    icon: 'color-palette-outline',
    basePrice: 4500,
    priceUnit: 'per session',
    turnaround: '2-3 Business Days',
    imageThumbnail: 'color-palette',
    featured: false,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['Flanders Scientific XMP310 4K HDR Monitor', 'ACES 1.3 Color Management', 'DCI-P3, Rec.2020 & Rec.709 Gamuts'],
    gear: ['DaVinci Resolve Advanced Panel', 'SpectraCal Calman Professional Colorimeter', 'Blackmagic Ultrastudio 4K Extreme'],
    tiers: [
      { name: 'Commercial Grade (30-60s)', price: 4500, description: 'Vibrant product sheen & lighting match', deliverables: ['Rec.709 Master', 'Custom LUT Export'] },
      { name: 'Short Film Cinema Grade', price: 9500, description: 'Shot-by-shot continuity and mood sculpt', deliverables: ['DCI-P3 Cinema Master (DCP)', 'Dolby Vision HDR pass'] },
    ],
  },
  {
    id: 'sound-design',
    name: 'Sound Design & Foley',
    category: 'Audio & Music',
    tagline: 'SFX, Ambience, Foley',
    description: 'Organic footsteps, cloth textures, mechanical impacts, and cinematic sub-bass created in our custom 8-surface Foley pit.',
    icon: 'volume-high-outline',
    basePrice: 4000,
    priceUnit: 'per reel',
    turnaround: '3-4 Business Days',
    imageThumbnail: 'volume-high',
    featured: false,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['Dedicated Foley Pit with 8 Variable Surfaces (Wood, Gravel, Tile, Concrete, Grass, Water)', '500k+ Private SFX Library', '5.1 & 7.1 Surround Panning'],
    gear: ['Schoeps Colette Stereo Matched Mics', 'Sound Devices Scorpio 32-Track Field Recorder', 'Eventide H9000 Harmonizer'],
    tiers: [
      { name: 'Commercial SFX & Stings', price: 3500, description: 'Impacts, whooshes, UI textures', deliverables: ['Stereo sound design stem', 'High-impact SFX assets'] },
      { name: 'Full Film Foley Pass', price: 8500, description: 'Footsteps, props, clothing, body falls', deliverables: ['Discrete Foley tracks (Feet, Props, Cloth)', 'Noise-reduced stems'] },
    ],
  },
  {
    id: 'background-score',
    name: 'Background Score',
    category: 'Audio & Music',
    tagline: 'Original Scoring & OST',
    description: 'Emotionally resonant musical themes custom written to lock precisely to picture timecode. Hybrid orchestra and analog synths.',
    icon: 'musical-notes-outline',
    basePrice: 8000,
    priceUnit: 'per main cue',
    turnaround: '4-7 Business Days',
    imageThumbnail: 'musical-notes',
    featured: false,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['SMPTE Timecode Sync', 'Hybrid Orchestral & Modular Rig', 'Worldwide Synchronization License Included'],
    gear: ['Moog One Synthesizer', 'Nord Stage 4', 'Spitfire Audio Symphony Orchestra', 'Bricasti M7 Reverb'],
    tiers: [
      { name: 'Main Theme / Audio Identity', price: 8000, description: 'Signature 60s theme + 15s sting + 5s logo', deliverables: ['Full theme master', 'Orchestration stems & MIDI'] },
      { name: 'Complete Short Film Score', price: 18000, description: 'Custom cues matching dramatic emotional arcs', deliverables: ['Score cues synced to locked picture', 'Mixed stereo & 5.1 stems'] },
    ],
  },
  {
    id: 'subtitles',
    name: 'Subtitles & Translation',
    category: 'Localization',
    tagline: 'Multilingual & CC',
    description: 'Frame-accurate closed captions (CC) and human translation meeting strict Netflix, Amazon Prime, and theatrical SDH standards.',
    icon: 'chatbubble-ellipses-outline',
    basePrice: 1500,
    priceUnit: 'per 10 minutes',
    turnaround: '24-48 Hours',
    imageThumbnail: 'chatbubble-ellipses',
    featured: false,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['Netflix / BBC / EBU-TT Caption Compliance', 'Reading Speed: Max 17 CPS', 'Export in SRT, VTT, PAC, SCC, XML'],
    gear: ['EZTitles Subtitling Software Enterprise', 'Whisper AI ASR Alignment Engine (Human-Verified)', 'Pro Tools Video Caption Sync Suite'],
    tiers: [
      { name: 'English SDH Closed Captions', price: 1500, description: 'For deaf and hard-of-hearing with sound cues', deliverables: ['Timecoded SRT and VTT files', 'Strict punctuation and speaker IDs'] },
      { name: 'Multilingual Translation (Hindi/Regional)', price: 3000, description: 'Accurate human translation and cultural adaptation', deliverables: ['Localized subtitle files', 'Cultural adaptation review'] },
    ],
  },
  {
    id: 'poster-design',
    name: 'Poster Design',
    category: 'Creative Design',
    tagline: 'Theatrical Key Art & Publicity',
    description: 'High-impact cinematic film posters, title logos, digital publicity banners, and streaming thumbnails.',
    icon: 'color-palette-outline',
    basePrice: 2500,
    priceUnit: 'per poster',
    turnaround: '2-3 Days',
    imageThumbnail: 'color-palette',
    featured: false,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['Print-ready 300 DPI CMYK Masters', 'High-res RGB Digital Banners', 'Layered PSD / AI Source Files'],
    gear: ['Adobe Photoshop CC Master Suite', 'Adobe Illustrator Vector Art', 'Wacom Cintiq Pro Display Tablets'],
    tiers: [
      { name: 'Standard Film Poster', price: 2500, description: 'Full theatrical key-art poster design', deliverables: ['Print-ready CMYK master', 'Web social banners'] },
      { name: 'Complete Publicity Kit', price: 5000, description: 'Poster + Character Posters + Social Media Kit', deliverables: ['Full poster package', 'Character teasers', 'Layered PSDs'] },
    ],
  },
  {
    id: 'ai-works',
    name: 'AI Works',
    category: 'Next-Gen Creative',
    tagline: 'AI Audio & Visual Labs',
    description: 'Cutting-edge AI-assisted audio enhancement, voice synthesis, stem separation, and generative visual ideation.',
    icon: 'hardware-chip-outline',
    basePrice: 2000,
    priceUnit: 'per project',
    turnaround: '24-48 Hours',
    imageThumbnail: 'hardware-chip',
    featured: false,
    isComingSoon: true,
    status: 'coming-soon',
    specs: ['AI De-reverb & Denoise Cleaning', 'Neural Stem Separation', 'Voice Cloning & Resynthesis Prototyping'],
    gear: ['iZotope RX AI Spectral Repair', 'ElevenLabs Neural Speech Lab', 'RipX DeepAudio Stem Isolator'],
    tiers: [
      { name: 'AI Audio Restoration', price: 2000, description: 'Neural dialogue enhancement & noise removal', deliverables: ['Cleaned audio master', 'Spectral noise report'] },
      { name: 'AI Creative Suite', price: 4500, description: 'Full generative audio & concept visual bundle', deliverables: ['Cleaned stems', 'Generated concept art'] },
    ],
  },
];

export const STUDIOS: StudioRoom[] = [
  {
    id: 'studio-a',
    name: 'Studio A',
    badge: 'Dubbing & VO (Acoustic Treated)',
    capacity: '4-6 People',
    hourlyRate: 350, // ₹350/slot (per hour)
    monitoring: 'Genelec SAM 8341A + Dual Subwoofers',
    acoustics: 'Floating WhisperRoom isolation booth, -75dB noise floor, tuned diffusers',
    features: ['Acoustic Treated Booth', 'Dual 55" Lip-Sync Displays', 'Source-Connect Pro Link', 'Private Client Lounge'],
    available: true,
    imageIcon: 'mic-outline',
  },
  {
    id: 'studio-b',
    name: 'Studio B',
    badge: 'Live Tracking Room',
    capacity: '15-20 Musicians',
    hourlyRate: 2500,
    monitoring: 'ATC SCM45A Pro + Yamaha NS10M',
    acoustics: 'Floating oak acoustic floor, 18ft high ceiling, variable acoustic baffles',
    features: ['32 In / 32 Out Burl Converters', 'Neve 1073 Mic Preamps', 'Yamaha C7 Concert Grand Piano', 'Drum Isolation Room'],
    available: true,
    imageIcon: 'musical-notes-outline',
  },
  {
    id: 'studio-c',
    name: 'Studio C',
    badge: 'Dolby Atmos 7.1.4 Suite',
    capacity: '8-10 People',
    hourlyRate: 3000,
    monitoring: 'Genelec SAM 7.1.4 Immersive Array',
    acoustics: 'Certified Dolby Atmos calibrated listening position, tuned bass traps',
    features: ['Dolby Atmos Certified', 'Avid S6 Modular 32-Fader Console', 'SSL 4000 Outboard', 'Espresso Lounge'],
    available: true,
    imageIcon: 'options-outline',
  },
  {
    id: 'studio-d',
    name: 'Studio D',
    badge: '8K Color & Finishing Suite',
    capacity: '4-6 People',
    hourlyRate: 2200,
    monitoring: 'Flanders Scientific XMP310 HDR + 85" OLED',
    acoustics: 'Neutral dark-grey cinema grading environment with 6500K backlighting',
    features: ['DaVinci Resolve Advanced Panel', 'Mac Studio M2 Ultra 128GB', '100G Fiber SAN Storage', 'Dolby Vision Mastering'],
    available: true,
    imageIcon: 'color-palette-outline',
  },
];

// Exact projects shown in the user's uploaded reference image
export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'prj-1087',
    code: '#PRJ-1087',
    title: 'VO – Product Ad',
    clientName: 'Nexus Consumer Brands',
    serviceType: 'Voice Over',
    status: 'In Progress',
    statusColor: 'cyan',
    currentStepIndex: 2, // Editing
    progressPercent: 55,
    deadline: '22 Nov 2026',
    createdAt: '15 Nov 2026',
    editor: EDITORS[0],
    currentDraft: {
      version: 'v1.4 VO Comp Master',
      mediaType: 'audio',
      duration: '00:45',
      durationSeconds: 45,
      sampleUrl: 'https://sample-audio-stream.com/nexus-vo.wav',
      waveformLevels: [35, 60, 75, 85, 90, 70, 80, 65, 55, 75, 90, 95, 80, 70, 60, 50, 65, 80, 70, 60],
      notes: 'Voice talent tracked in WhisperRoom Booth. Compression leveled for broadcast.',
      uploadedAt: 'Today at 11:30',
    },
    revisions: [],
    files: [
      { id: 'f-1', name: 'Nexus_VO_Take3_Comp.wav', size: '24.2 MB', duration: '00:45', format: '24-bit / 48kHz WAV', type: 'master' },
      { id: 'f-2', name: 'Rough_Cut_Preview.mp3', size: '12.8 MB', duration: '00:45', format: '320kbps MP3', type: 'stems' },
    ],
  },
  {
    id: 'prj-1082',
    code: '#PRJ-1082',
    title: 'Short Film Dubbing',
    clientName: 'Starlight Indie Productions',
    serviceType: 'Dubbing Studio',
    status: 'Review',
    statusColor: 'gold', // Warm Gold/Yellow as in image!
    currentStepIndex: 3, // Review
    progressPercent: 80,
    deadline: '25 Nov 2026',
    createdAt: '10 Nov 2026',
    editor: EDITORS[0],
    currentDraft: {
      version: 'v2.0 Locked Dubbing Pass',
      mediaType: 'audio',
      duration: '14:20',
      durationSeconds: 860,
      sampleUrl: 'https://sample-audio-stream.com/short-film-dub.wav',
      waveformLevels: [40, 65, 80, 95, 75, 85, 60, 70, 85, 90, 65, 50, 75, 90, 85, 65, 50, 70, 80, 60],
      notes: 'Lip-sync dialogue checked on dual reference displays. Climax ADR balanced.',
      uploadedAt: 'Yesterday at 18:20',
    },
    revisions: [
      {
        id: 'rev-1',
        timestamp: 'Nov 18, 2026',
        timecode: '01:24',
        category: 'Lip Sync Flap',
        priority: 'Normal',
        note: 'Check mouth closure timing around scene 2 transition.',
        status: 'In Review',
        createdAt: '2026-11-18 14:10',
      },
    ],
    files: [
      { id: 'f-3', name: 'Rough_Cut_v1.mp3', size: '42.5 MB', duration: '14:20', format: '320kbps MP3', type: 'stems' },
      { id: 'f-4', name: 'Final_Mix_v2.wav', size: '328 MB', duration: '14:20', format: '24-bit / 48kHz Broadcast WAV', type: 'master' },
    ],
  },
  {
    id: 'prj-1079',
    code: '#PRJ-1079',
    title: 'Podcast Edit',
    clientName: 'AudioCrafters Network',
    serviceType: 'Audio Editing',
    status: 'Completed',
    statusColor: 'green',
    currentStepIndex: 4, // Delivery
    progressPercent: 100,
    deadline: '18 Nov 2026',
    createdAt: '08 Nov 2026',
    editor: EDITORS[1],
    currentDraft: {
      version: 'vFinal Golden Master',
      mediaType: 'audio',
      duration: '48:10',
      durationSeconds: 2890,
      sampleUrl: 'https://sample-audio-stream.com/podcast-final.mp3',
      waveformLevels: [50, 70, 80, 85, 75, 80, 85, 80, 75, 80, 85, 75, 70, 80, 85, 80, 75, 80, 85, 80],
      notes: 'Mastered to -16 LUFS podcast streaming standard. De-clicked and normalized.',
      uploadedAt: 'Nov 18',
    },
    revisions: [],
    finalDelivery: {
      deliveredDate: 'November 18, 2026',
      packageTitle: 'Podcast Ep42 – Master Audio Archive',
      licenseNumber: 'CBR-LIC-2026-PC1079',
      checksum: 'SHA256: 9e4f2b1a03c8d765e1293a0f882b147d',
      files: [
        { name: 'Podcast_Ep42_Mastered.mp3', format: 'Broadcast MP3 (-16 LUFS)', size: '68.4 MB', type: 'master' },
        { name: 'Podcast_Ep42_Raw_Stems.zip', format: 'WAV Multi-track Stems', size: '480 MB', type: 'stems' },
        { name: 'Production_Release_Certificate.pdf', format: 'Commercial Release License', size: '1.2 MB', type: 'license' },
      ],
    },
    files: [
      { id: 'f-5', name: 'Podcast_Ep42_Mastered.mp3', size: '68.4 MB', duration: '48:10', format: 'Broadcast MP3 (-16 LUFS)', type: 'master' },
      { id: 'f-6', name: 'Episode_42_Audio_Stems.zip', size: '480 MB', duration: '48:10', format: 'ZIP Stem Archive', type: 'stems' },
    ],
  },
];

// Initial bookings matching the reference image's Fri, 20 Nov 2026, Dubbing Studio ₹4,720
export const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: 'b-2026-88',
    referenceCode: 'CBR-2026-8841',
    serviceId: 'dubbing',
    serviceName: 'Dubbing Studio',
    studioId: 'studio-a',
    studioName: 'Dubbing Studio',
    date: 'Fri, 20 Nov 2026',
    timeSlot: '02:00 PM - 04:00 PM (2 Hours)',
    durationHours: 2,
    studioCharges: 4000,
    gstAmount: 720,
    totalPrice: 4720,
    advanceAmount: 4720,
    paymentMethod: 'UPI Full Payment',
    status: 'Confirmed',
    notes: 'Film dialogue ADR with 2 lead actors in Dubbing Studio.',
    createdAt: '2026-11-01',
  },
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Draft Review Ready',
    message: 'New dubbing draft v2.0 uploaded for Short Film Dubbing (#PRJ-1082).',
    type: 'project',
    timestamp: '15 mins ago',
    read: false,
    targetId: 'prj-1082',
  },
  {
    id: 'n-2',
    title: 'Studio Session Confirmed',
    message: 'Dubbing Studio reservation confirmed for Fri, 20 Nov 2026.',
    type: 'booking',
    timestamp: '2 hours ago',
    read: false,
    targetId: 'b-2026-88',
  },
  {
    id: 'n-3',
    title: 'Master Stems Archived',
    message: 'All master files for Podcast Edit (#PRJ-1079) are ready for high-speed download.',
    type: 'delivery',
    timestamp: 'Yesterday',
    read: true,
    targetId: 'prj-1079',
  },
];

export const ADMIN_STATS = {
  todayBookings: 12,
  inProgress: 8,
  completed: 36,
  adminUser: {
    name: 'Vikram Soundarajan',
    role: 'Studio Operations Head',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    status: 'Online',
  },
  menuItems: [
    { id: 'm1', title: 'Manage Bookings', icon: 'calendar-outline', count: '12 Today' },
    { id: 'm2', title: 'Clients', icon: 'people-outline', count: '148 Active' },
    { id: 'm3', title: 'Projects & Files', icon: 'folder-outline', count: '24 Files' },
    { id: 'm4', title: 'Invoice & Payments', icon: 'cash-outline', count: '₹2.4L MTD' },
    { id: 'm5', title: 'Studio & Slot Settings', icon: 'settings-outline', count: '4 Rooms' },
    { id: 'm6', title: 'Reports & Analytics', icon: 'bar-chart-outline', count: '98% On-Time' },
  ],
};

export const STUDIO_INFO = {
  name: 'CASSATE BAND RECORDZ',
  tagline: "YOUR IDEAS, WE'VE DONE IT.",
  subTagline: 'Your All In One Post Production House.',
  address: 'Annai Illam, 104, Krishna St, Palaniappa Nagar, Chennai, Tamil Nadu 600087',
  primaryPhone: '9025253695',
  phone: '+91 90252 53695',
  whatsapp: '+91 90252 53695',
  email: 'postproduction@cassatebandrecordz.com',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Annai+Illam,+104,+Krishna+St,+Palaniappa+Nagar,+Chennai,+Tamil+Nadu+600087',
  coordinates: {
    lat: '13.0475° N',
    lng: '80.1764° E',
  },
  hours: {
    weekdays: '09:00 AM – 12:00 AM',
    weekends: '09:00 AM – 12:00 AM',
  },
  socials: {
    instagram: 'https://www.instagram.com/cassatebandrecordz?utm_source=ig_web_button_share_sheet&cplk=ZDNlZDc0MzIxNw==',
    linkedin: 'https://in.linkedin.com/in/cassate-band-recordz-6a4b112a1',
    googleMyBusiness: 'https://www.google.com/maps/search/?api=1&query=Annai+Illam,+104,+Krishna+St,+Palaniappa+Nagar,+Chennai,+Tamil+Nadu+600087',
  },
};
