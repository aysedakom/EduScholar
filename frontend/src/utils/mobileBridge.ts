// frontend/src/utils/mobileBridge.ts
import api from '../api/axios';

/**
 * Checks if the application is currently running inside AppMySite or a mobile WebView
 */
export const isMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isAppMySite = /AppMySite/i.test(ua) || Boolean((window as any).appmysite) || Boolean((window as any).Android);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
  return isAppMySite || Boolean(isStandalone);
};

/**
 * Registers an FCM push notification token with the EduScholar backend
 */
export const registerDeviceFcmToken = async (fcmToken: string): Promise<boolean> => {
  if (!fcmToken) return false;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      // User is not logged in yet; store token in localStorage to register upon login
      localStorage.setItem('pending_fcm_token', fcmToken);
      return false;
    }
    await api.post('/auth/fcm-token', { fcmToken });
    localStorage.removeItem('pending_fcm_token');
    console.log('📱 [MobileBridge] FCM Token registered with EduScholar backend');
    return true;
  } catch (error) {
    console.warn('📱 [MobileBridge] Failed to register FCM token with backend:', error);
    return false;
  }
};

/**
 * Initializes listeners for AppMySite token transmission and native webview bridges
 */
export const initMobileBridge = (): void => {
  if (typeof window === 'undefined') return;

  // 1. Check for pending FCM token stored before login
  const pendingToken = localStorage.getItem('pending_fcm_token');
  if (pendingToken && localStorage.getItem('token')) {
    registerDeviceFcmToken(pendingToken);
  }

  // 2. Expose global handler for AppMySite Javascript bridge injection
  (window as any).onAppMySiteTokenReceived = (fcmToken: string) => {
    console.log('📱 [MobileBridge] Received token from AppMySite bridge');
    registerDeviceFcmToken(fcmToken);
  };

  // 3. Listen for custom DOM events dispatched by mobile wrapper
  window.addEventListener('appmysite_token', ((event: CustomEvent) => {
    if (event.detail?.token) {
      registerDeviceFcmToken(event.detail.token);
    }
  }) as EventListener);
};
