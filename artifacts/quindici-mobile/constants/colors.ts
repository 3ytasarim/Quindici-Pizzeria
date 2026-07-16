/**
 * Quindici brand design tokens — synced from artifacts/quindici/src/index.css
 *
 * Light-only palette (the web app has no dark mode).
 */

const colors = {
  light: {
    // Legacy aliases
    text: '#3B3320',
    tint: '#D9A520',

    // Core surfaces — warm ivory
    background: '#F7F5ED',
    foreground: '#3B3320',

    // Cards — slightly lighter cream
    card: '#FAF8F3',
    cardForeground: '#3B3320',

    // Primary action — gold (hsl 43, 74%, 49%)
    primary: '#D9A520',
    primaryForeground: '#FFFFFF',

    // Secondary — warmer cream
    secondary: '#E0D5C5',
    secondaryForeground: '#3B3320',

    // Muted
    muted: '#EBE7E1',
    mutedForeground: '#706658',

    // Accent — same gold
    accent: '#D9A520',
    accentForeground: '#FFFFFF',

    // Destructive
    destructive: '#E53E3E',
    destructiveForeground: '#FFFFFF',

    // Borders + inputs
    border: '#E1DAD1',
    input: '#E1DAD1',
  },

  // Elegant sharp corners — matches web --radius: 0rem
  radius: 0,
};

export default colors;
