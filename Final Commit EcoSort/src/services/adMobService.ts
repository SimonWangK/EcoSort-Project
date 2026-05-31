/**
 * AdMob Service — EcoSort
 * -----------------------
 * Keeps AdMob implemented without changing UI. In Expo Go the native
 * RNGoogleMobileAdsModule is not available, so this service safely skips
 * initialization there. In a development/EAS build it loads the native module
 * and initializes Google Mobile Ads.
 */

import Constants from 'expo-constants';
import { Platform } from 'react-native';

declare const require: (name: string) => any;

const GOOGLE_SAMPLE_ANDROID_BANNER = 'ca-app-pub-3940256099942544/6300978111';
const GOOGLE_SAMPLE_IOS_BANNER = 'ca-app-pub-3940256099942544/2934735716';
const GOOGLE_SAMPLE_ANDROID_INTERSTITIAL = 'ca-app-pub-3940256099942544/1033173712';
const GOOGLE_SAMPLE_IOS_INTERSTITIAL = 'ca-app-pub-3940256099942544/4411468910';

export interface AdMobInitStatus {
  available: boolean;
  initialized: boolean;
  reason?: string;
}

let initPromise: Promise<AdMobInitStatus> | null = null;

function isExpoGoRuntime(): boolean {
  return Constants.appOwnership === 'expo';
}

function loadGoogleMobileAds(): any | null {
  if (Platform.OS === 'web') return null;

  // Expo Go does not contain the native RNGoogleMobileAdsModule. Do not even
  // require the package here, otherwise TurboModuleRegistry can throw.
  if (isExpoGoRuntime()) return null;

  try {
    return require('react-native-google-mobile-ads');
  } catch {
    return null;
  }
}

export function getBannerAdUnitId(platform: 'android' | 'ios' = Platform.OS === 'ios' ? 'ios' : 'android'): string {
  return (
    process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID ||
    (platform === 'ios' ? GOOGLE_SAMPLE_IOS_BANNER : GOOGLE_SAMPLE_ANDROID_BANNER)
  );
}

export function getInterstitialAdUnitId(platform: 'android' | 'ios' = Platform.OS === 'ios' ? 'ios' : 'android'): string {
  return (
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID ||
    (platform === 'ios' ? GOOGLE_SAMPLE_IOS_INTERSTITIAL : GOOGLE_SAMPLE_ANDROID_INTERSTITIAL)
  );
}

export async function initializeAdMob(): Promise<AdMobInitStatus> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (isExpoGoRuntime()) {
      return {
        available: false,
        initialized: false,
        reason: 'Expo Go does not include RNGoogleMobileAdsModule. Use a development/EAS build to test AdMob.',
      };
    }

    const module = loadGoogleMobileAds();
    const mobileAds = module?.default;

    if (typeof mobileAds !== 'function') {
      return {
        available: false,
        initialized: false,
        reason: 'react-native-google-mobile-ads is not available in this native runtime.',
      };
    }

    try {
      await mobileAds().initialize();
      return { available: true, initialized: true };
    } catch (error) {
      return {
        available: true,
        initialized: false,
        reason: error instanceof Error ? error.message : 'AdMob initialization failed.',
      };
    }
  })();

  return initPromise;
}

export async function preloadInterstitialAd(platform: 'android' | 'ios' = Platform.OS === 'ios' ? 'ios' : 'android'): Promise<boolean> {
  if (isExpoGoRuntime()) return false;

  const module = loadGoogleMobileAds();
  if (!module?.InterstitialAd || !module?.AdEventType) return false;

  try {
    const ad = module.InterstitialAd.createForAdRequest(getInterstitialAdUnitId(platform), {
      requestNonPersonalizedAdsOnly: true,
    });

    return await new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => resolve(false), 5000);

      const unsubscribeLoaded = ad.addAdEventListener(module.AdEventType.LOADED, () => {
        clearTimeout(timeout);
        unsubscribeLoaded();
        unsubscribeError();
        resolve(true);
      });

      const unsubscribeError = ad.addAdEventListener(module.AdEventType.ERROR, () => {
        clearTimeout(timeout);
        unsubscribeLoaded();
        unsubscribeError();
        resolve(false);
      });

      ad.load();
    });
  } catch {
    return false;
  }
}
