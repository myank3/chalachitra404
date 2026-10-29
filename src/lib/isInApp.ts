export function isInApp(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;

  // Custom marker — set "ChalachitraApp" in your wrapper's User Agent field
  if (ua.includes('ChalachitraApp')) return true;

  // Any Android WebView (Median, Capacitor, Cordova, TWA, plain WebView)
  if (/Android/.test(ua) && /wv\)/.test(ua)) return true;

  // iOS WKWebView inside an app (Safari includes "Safari/", WKWebView doesn't)
  if (/iPhone|iPad|iPod/.test(ua) && !/Safari\//.test(ua)) return true;

  return false;
}