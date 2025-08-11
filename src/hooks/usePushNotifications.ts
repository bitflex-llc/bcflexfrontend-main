import { useState, useEffect, useCallback } from 'react';
import { isMobile, isAndroid, isIOS, isSafari, isChrome, isFirefox, isEdge } from 'react-device-detect';
import { BitflexOpenApi } from '../_helpers/BitflexOpenApi';
import { DeviceType } from '../api-wrapper';

// ====================================================================================
// TYPES
// ====================================================================================

interface PushNotificationState {
  permission: NotificationPermission;
  isSupported: boolean;
  isSetup: boolean;
  error?: string;
  deviceToken?: string;
}

interface PushSetupOptions {
  bitflexDeviceId: string;
  publicKey?: string;
  onPermissionChange?: (permission: NotificationPermission) => void;
  onError?: (error: string) => void;
  onSuccess?: () => void;
}

// ====================================================================================
// CONSTANTS
// ====================================================================================

const VAPID_PUBLIC_KEY = 'BEcW_3LIva4VWbNdnr7EGIVTYPTXdW3LiQQp3Bj7RAs01kL8tRvBPVHQyKaZvDYvkarKH3pZXGshwmEqUYIY2lE'; // Replace with your actual VAPID key

const SAFARI_CONFIG = {
  webServiceUrl: 'https://bcflex.com/push',
  websitePushId: 'web.com.bit-flex',
  userInfo: { deviceId: '' }
} as const;

const SERVICE_WORKER_PATH = '/sw.js';

// ====================================================================================
// UTILITY FUNCTIONS
// ====================================================================================

const getDeviceType = (): DeviceType => {
  if (isAndroid) return DeviceType.Android;
  if (isIOS) return DeviceType.IOs;
  if (isSafari) return DeviceType.Safari;
  if (isChrome) return DeviceType.Chrome;

  return DeviceType.Chrome; // Default fallback
};

const getBrowserName = (): string => {
  if (isSafari) return 'Safari';
  if (isChrome) return 'Chrome';
  if (isFirefox) return 'Firefox';
  if (isEdge) return 'Edge';
  return 'Unknown Browser';
};

const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

// ====================================================================================
// PUSH NOTIFICATION MANAGERS
// ====================================================================================

class SafariPushManager {
  static async requestPermission(deviceId: string): Promise<{ permission: NotificationPermission; deviceToken?: string }> {
    return new Promise((resolve) => {
      if (!window.safari?.pushNotification) {
        resolve({ permission: 'denied' });
        return;
      }

      const permissionData = window.safari.pushNotification.permission(SAFARI_CONFIG.websitePushId);
      
      if (permissionData.permission === 'default') {
        window.safari.pushNotification.requestPermission(
          SAFARI_CONFIG.webServiceUrl,
          SAFARI_CONFIG.websitePushId,
          { ...SAFARI_CONFIG.userInfo, deviceId },
          (permission) => {
            resolve({
              permission: permission.permission,
              deviceToken: permission.deviceToken
            });
          }
        );
      } else {
        resolve({
          permission: permissionData.permission,
          deviceToken: permissionData.deviceToken
        });
      }
    });
  }
}

class ServiceWorkerPushManager {
  static async requestPermission(): Promise<{ permission: NotificationPermission; registration?: ServiceWorkerRegistration }> {
    // Check if service workers are supported
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Workers not supported');
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      throw new Error('Push messaging not supported');
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      return { permission };
    }

    // Register service worker
    const registration = await navigator.serviceWorker.register(SERVICE_WORKER_PATH);
    await navigator.serviceWorker.ready;

    return { permission, registration };
  }

  static async getSubscription(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }
}

class MobilePushManager {
  static async requestPermission(): Promise<{ permission: NotificationPermission }> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    const permission = await Notification.requestPermission();
    return { permission };
  }
}

// ====================================================================================
// MAIN HOOK
// ====================================================================================

export const usePushNotifications = (options: PushSetupOptions) => {
  const [state, setState] = useState<PushNotificationState>({
    permission: 'default',
    isSupported: false,
    isSetup: false
  });

  const [isLoading, setIsLoading] = useState(false);

  // Check if push notifications are supported
  const checkSupport = useCallback((): boolean => {
    if (isSafari && window.safari?.pushNotification) return true;
    if ('serviceWorker' in navigator && 'PushManager' in window) return true;
    if (isMobile && 'Notification' in window) return true;
    return false;
  }, []);

  // Get current permission status
  const getCurrentPermission = useCallback((): NotificationPermission => {
    if (isSafari && window.safari?.pushNotification) {
      const permission = window.safari.pushNotification.permission(SAFARI_CONFIG.websitePushId);
      return permission.permission;
    }
    return Notification.permission;
  }, []);

  // Send device token to server
  const registerDeviceToken = useCallback(async (deviceToken: string, deviceType: DeviceType) => {
    try {
      await BitflexOpenApi.ApplicationApi.apiVversionApplicationSetpushtokenPost("1.0", {
        pushToken: deviceToken,
        description: `${getBrowserName()} - ${isMobile ? 'Mobile' : 'Desktop'}`,
        device: deviceType,
        publicKey: options.publicKey
      });

      // Also register device if not already done
      if (options.publicKey) {
        await BitflexOpenApi.ApplicationApi.apiVversionApplicationPublicKeyPut("1.0", {
          bitflexDeviceId: options.bitflexDeviceId,
          deviceType: deviceType,
          publicKeyPEM: options.publicKey
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to register device token:', error);
      throw error;
    }
  }, [options.bitflexDeviceId, options.publicKey]);

  // Request push notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      const error = 'Push notifications are not supported on this device/browser';
      setState(prev => ({ ...prev, error }));
      options.onError?.(error);
      return false;
    }

    setIsLoading(true);
    
    try {
      let result: { permission: NotificationPermission; deviceToken?: string; registration?: ServiceWorkerRegistration } = {
        permission: 'denied'
      };

      if (isSafari) {
        // Safari push notifications
        result = await SafariPushManager.requestPermission(options.bitflexDeviceId);
      } else if (isMobile) {
        // Mobile browsers
        result = await MobilePushManager.requestPermission();
      } else {
        // Desktop browsers with service workers
        const swResult = await ServiceWorkerPushManager.requestPermission();
        result = { ...swResult };

        if (swResult.registration && swResult.permission === 'granted') {
          const subscription = await ServiceWorkerPushManager.getSubscription(swResult.registration);
          if (subscription) {
            result.deviceToken = JSON.stringify(subscription);
          }
        }
      }

      const newState: PushNotificationState = {
        ...state,
        permission: result.permission,
        deviceToken: result.deviceToken,
        isSetup: result.permission === 'granted' && !!result.deviceToken,
        error: undefined
      };

      setState(newState);
      options.onPermissionChange?.(result.permission);

      if (result.permission === 'granted' && result.deviceToken) {
        await registerDeviceToken(result.deviceToken, getDeviceType());
        options.onSuccess?.();
        return true;
      } else if (result.permission === 'denied') {
        const error = 'Push notifications were denied by the user';
        setState(prev => ({ ...prev, error }));
        options.onError?.(error);
      }

      return false;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to setup push notifications';
      setState(prev => ({ ...prev, error: errorMessage }));
      options.onError?.(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [state, options, registerDeviceToken]);

  // Initialize on mount
  useEffect(() => {
    const isSupported = checkSupport();
    const permission = getCurrentPermission();
    
    setState(prev => ({
      ...prev,
      isSupported,
      permission,
      isSetup: permission === 'granted' // Will be updated when we verify token
    }));
  }, [checkSupport, getCurrentPermission]);

  // Auto-request permission if required
  useEffect(() => {
    if (state.isSupported && state.permission === 'default' && options.bitflexDeviceId) {
      // Auto-request can be enabled here if desired
      // requestPermission();
    }
  }, [state.isSupported, state.permission, options.bitflexDeviceId]);

  return {
    ...state,
    isLoading,
    requestPermission,
    canRequestPermission: state.isSupported && state.permission !== 'granted',
    needsUserAction: state.permission === 'default',
    getInstructions: () => getSetupInstructions(getBrowserName(), isMobile)
  };
};

// ====================================================================================
// SETUP INSTRUCTIONS
// ====================================================================================

const getSetupInstructions = (browser: string, mobile: boolean): string[] => {
  const baseInstructions = [
    'To receive push notifications from BCFLEX:'
  ];

  if (mobile) {
    return [
      ...baseInstructions,
      '1. Tap the "Enable Notifications" button',
      '2. Select "Allow" when prompted',
      '3. Notifications will appear even when the app is closed'
    ];
  }

  switch (browser) {
    case 'Safari':
      return [
        ...baseInstructions,
        '1. Click "Enable Notifications" button',
        '2. Click "Allow" in the Safari dialog',
        '3. Notifications will appear in your notification center'
      ];
    
    case 'Chrome':
      return [
        ...baseInstructions,
        '1. Click the "Enable Notifications" button',
        '2. Click "Allow" in the browser popup',
        '3. If blocked, click the 🔒 icon in address bar',
        '4. Change Notifications to "Allow"'
      ];
    
    case 'Firefox':
      return [
        ...baseInstructions,
        '1. Click "Enable Notifications" button',
        '2. Select "Allow" in the Firefox dialog',
        '3. If needed, check Firefox notification settings',
        '4. Ensure site permissions allow notifications'
      ];
    
    case 'Edge':
      return [
        ...baseInstructions,
        '1. Click the "Enable Notifications" button',
        '2. Click "Allow" when prompted',
        '3. Check Edge notification settings if needed',
        '4. Verify site permissions are correct'
      ];
    
    default:
      return [
        ...baseInstructions,
        '1. Click "Enable Notifications" button',
        '2. Allow notifications when prompted',
        '3. Check browser settings if notifications don\'t work'
      ];
  }
};

export default usePushNotifications;