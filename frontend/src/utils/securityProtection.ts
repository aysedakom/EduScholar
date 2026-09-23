// frontend/src/utils/securityProtection.ts
// DevTools & Right-Click Inspection ENABLED

export function initSecurityProtection() {
  if (typeof window === 'undefined') return;

  // Right-click context menu and Inspect Element are fully enabled for system users.
  try {
    const bannerStyle = 'color: #10b981; font-size: 16px; font-weight: bold; font-family: sans-serif;';
    console.log('%c✅ EduScholar Developer & Inspection Mode Enabled', bannerStyle);
  } catch (_) {}
}
