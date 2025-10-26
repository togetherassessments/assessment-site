// Cookie consent management utilities
// Handles localStorage persistence and expiry checking for GDPR compliance

export interface ConsentData {
  consent: 'accepted' | 'rejected';
  timestamp: string; // ISO date string
  version: '1.0';
}

const STORAGE_KEY = 'cookie-consent';
const CONSENT_VERSION = '1.0';
const EXPIRY_MONTHS = 6;

/**
 * Get current consent state from localStorage
 * Returns null if no consent stored or if consent has expired
 */
export function getConsent(): ConsentData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data: ConsentData = JSON.parse(stored);

    // Check if consent has expired (6 months)
    const consentDate = new Date(data.timestamp);
    const now = new Date();
    const monthsDiff = (now.getFullYear() - consentDate.getFullYear()) * 12 + (now.getMonth() - consentDate.getMonth());

    if (monthsDiff >= EXPIRY_MONTHS) {
      // Consent expired - clear it
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Check version compatibility
    if (data.version !== CONSENT_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading consent data:', error);
    return null;
  }
}

/**
 * Check if user has given consent for analytics
 */
export function hasAnalyticsConsent(): boolean {
  const consent = getConsent();
  return consent?.consent === 'accepted';
}

/**
 * Save consent choice to localStorage
 */
export function saveConsent(choice: 'accepted' | 'rejected'): void {
  if (typeof window === 'undefined') return;

  const data: ConsentData = {
    consent: choice,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving consent data:', error);
  }
}

/**
 * Clear consent data (for testing or manual reset)
 */
export function clearConsent(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if consent banner should be shown
 * Shows if: no consent stored OR consent has expired
 */
export function shouldShowBanner(): boolean {
  return getConsent() === null;
}
