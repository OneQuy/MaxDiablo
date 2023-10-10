// https://docs.page/invertase/react-native-google-mobile-ads/displaying-ads#rewarded-interstitial-ads

import mobileAds from 'react-native-google-mobile-ads';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { CheckAndRequestTrackingTransparencyAsync } from './iOSTrackingTransparency';

var inited = false

export const CheckAndInitAdmobAsync = async () => {
    if (inited)
        return

    inited = true

    await CheckAndRequestTrackingTransparencyAsync()

    await mobileAds().initialize()
}