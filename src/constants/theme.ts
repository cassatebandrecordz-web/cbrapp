// ─────────────────────────────────────────────────────────────────
// CASSATE BAND RECORDZ — Pearl & Gold Corporate Light Theme
// Background: Pearl White #FBFCF8 | Accent: Studio Amber #EAB308
// ─────────────────────────────────────────────────────────────────

export const COLORS = {
  // ── Backgrounds (Pearl white family) ──
  bgPrimary:        '#FBFCF8', // Pearl — main page canvas
  bgSecondary:      '#F5F6F1', // Slightly deeper pearl — page sections
  bgCard:           '#FFFFFF', // Pure white — card surfaces
  bgCardElevated:   '#FAFBF6', // Elevated card — slightly warm
  bgCardHover:      '#F0F1EC',
  bgInput:          '#F5F6F1', // Input fields

  // ── Studio Amber / Gold Palette (unchanged) ──
  primary:          '#EAB308', // Classic Studio Amber Yellow
  primaryLight:     '#FACC15', // Bright Golden Yellow
  primaryDark:      '#CA8A04', // Deep Amber
  primaryMuted:     'rgba(234, 179, 8, 0.12)',
  primaryGlow:      'rgba(234, 179, 8, 0.25)',

  // ── Typography (dark on light) ──
  white:            '#FFFFFF',
  textPrimary:      '#111827', // Deep charcoal — headings
  textSecondary:    '#374151', // Body text
  textMuted:        '#6B7280', // Labels, captions
  textDim:          '#9CA3AF', // Placeholder, sub-labels

  // ── Status Colors ──
  gold:             '#CA8A04', // Rich amber for review badges
  goldBadgeBg:      'rgba(234, 179, 8, 0.10)',
  goldBadgeBorder:  'rgba(202, 138, 4, 0.35)',

  cyan:             '#0284C7', // In Progress (professional blue)
  green:            '#16A34A', // Completed (forest green)
  red:              '#DC2626', // Alert / recording red

  // ── Structural Borders ──
  border:           '#E5E7EB', // Standard card border
  borderLight:      '#F3F4F6', // Subtle inner border
  borderActive:     '#EAB308', // Active / focused border
  divider:          '#E9EAE5', // Section dividers

  // ── Legacy mappings ──
  accentLilac:      '#FACC15',
  accentCyan:       '#0284C7',
  accentPink:       '#DC2626',
  accentAmber:      '#EAB308',
  accentGreen:      '#16A34A',
  statusAssigned:   '#0284C7',
  statusInProgress: '#0284C7',
  statusQualityCheck:    '#EAB308',
  statusClientReview:    '#CA8A04',
  statusRevisionRequired: '#DC2626',
  statusCompleted:  '#16A34A',
  borderGlow:       'rgba(234, 179, 8, 0.25)',

  // ── Hero banner inside cards (stays dark cinematic) ──
  heroCard:         '#0E0E14',
};

export const SHADOWS = {
  yellowGlow: {
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 4,
  },
  card: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
};
