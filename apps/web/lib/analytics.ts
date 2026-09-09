/**
 * GA4 analytics utilities — gtag loader + UTM parameter capture.
 *
 * UTM params are read from the URL on first visit, stored in sessionStorage,
 * and retrieved at form-submit time so they survive client-side navigation.
 */

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
] as const;

const STORAGE_KEY = "cef_utm_params";

type UtmParams = Record<(typeof UTM_KEYS)[number], string>;

/**
 * Read UTM params from the current URL and persist them to sessionStorage.
 * Call this once on first client-side load (e.g. in a layout effect).
 * Existing stored values are NOT overwritten — first-touch attribution wins.
 */
export function captureUtmParams(): void {
  if (typeof window === "undefined") return;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) return; // first-touch attribution: keep the first set

    const params = new URLSearchParams(window.location.search);
    const captured: Partial<UtmParams> = {};

    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) captured[key] = value;
    }

    if (Object.keys(captured).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(captured));
    }
  } catch {
    // sessionStorage may be unavailable (private mode) — fail silently
  }
}

/**
 * Retrieve stored UTM params from sessionStorage.
 * Returns an object with all 5 keys (empty strings if not captured).
 */
export function getUtmParams(): UtmParams {
  const empty: UtmParams = {
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  };

  if (typeof window === "undefined") return empty;

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return empty;
    return { ...empty, ...JSON.parse(stored) };
  } catch {
    return empty;
  }
}

/**
 * Fire a GA4 event via gtag. No-op if gtag is not loaded.
 */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...args: unknown[]) => void };
  if (typeof w.gtag === "function") {
    w.gtag("event", eventName, params ?? {});
  }
}