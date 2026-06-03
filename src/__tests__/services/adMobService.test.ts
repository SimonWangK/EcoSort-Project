import { getBannerAdUnitId, getInterstitialAdUnitId, initializeAdMob } from '../../services/adMobService';

describe('adMobService', () => {
  test('returns Google sample ad unit ids when production env vars are not provided', () => {
    delete process.env.EXPO_PUBLIC_ADMOB_BANNER_UNIT_ID;
    delete process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_UNIT_ID;

    expect(getBannerAdUnitId('android')).toMatch(/^ca-app-pub-/);
    expect(getInterstitialAdUnitId('ios')).toMatch(/^ca-app-pub-/);
  });

  test('initialization fails gracefully when native ads module is unavailable in Jest', async () => {
    const status = await initializeAdMob();
    expect(status.initialized).toBe(false);
  });
});
