// https://docs.page/invertase/react-native-google-mobile-ads/displaying-ads#rewarded-interstitial-ads

import mobileAds from 'react-native-google-mobile-ads';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

var inited = false

export const CheckAndInitAdmobAsync = async () => {
    if (inited)
        return

    inited = true

    // const result = await check(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);

    // if (result === RESULTS.DENIED) {
    //     // The permission has not been requested, so request it.
    //     await request(PERMISSIONS.IOS.APP_TRACKING_TRANSPARENCY);
    // }

    await mobileAds().initialize()
}