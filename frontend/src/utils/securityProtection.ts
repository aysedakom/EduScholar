// frontend/src/utils/securityProtection.ts
// Anti-Inspection & DevTools Security Protection

export function initSecurityProtection() {
  if (typeof window === 'undefined') return;

  // 1. Disable Right-Click Context Menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  }, { capture: true });

  // 2. Disable DevTools and Source Code Inspection Hotkeys
  document.addEventListener('keydown', (e) => {
    // F12 key
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    const isCtrlOrMeta = e.ctrlKey || e.metaKey;

    // Ctrl+Shift+I / Cmd+Option+I (Inspect)
    // Ctrl+Shift+J / Cmd+Option+J (Console)
    // Ctrl+Shift+C / Cmd+Option+C (Elements)
    // Ctrl+Shift+K / Cmd+Option+K (Firefox Console)
    if (
      isCtrlOrMeta &&
      e.shiftKey &&
      (e.key === 'I' || e.key === 'i' ||
       e.key === 'J' || e.key === 'j' ||
       e.key === 'C' || e.key === 'c' ||
       e.key === 'K' || e.key === 'k')
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+U / Cmd+U (View Page Source)
    if (isCtrlOrMeta && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }

    // Ctrl+S / Cmd+S (Save Page)
    if (isCtrlOrMeta && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, { capture: true });

  // 3. Security Warning in Console
  try {
    const bannerStyle = 'color: #ef4444; font-size: 24px; font-weight: bold; font-family: sans-serif;';
    const bodyStyle = 'color: #3b82f6; font-size: 13px; font-weight: 600; font-family: sans-serif;';
    console.log('%c🛑 GOVSERVE SECURITY PROTECTION ACTIVE', bannerStyle);
    console.log(
      '%cThis is an official Quezon City Youth Development Office (QCYDO) government portal. Unauthorized source code inspection, scraping, or network interception is monitored and strictly prohibited.',
      bodyStyle
    );
  } catch (_) {}

  // 4. In Production: Sanitize debug logs and prevent DevTools inspection loops
  if (import.meta.env.PROD) {
    try {
      console.log = () => {};
      console.debug = () => {};
      console.info = () => {};
    } catch (_) {}

    // Subtle DevTools open detection
    setInterval(() => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        try {
          console.clear();
        } catch (_) {}
      }
    }, 1500);
  }
}
