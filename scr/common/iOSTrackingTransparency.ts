// https://www.npmjs.com/package/react-native-tracking-transparency

import { Platform } from 'react-native';
import { getTrackingStatus, requestTrackingPermission } from 'react-native-tracking-transparency';

export const CheckAndRequestTrackingTransparencyAsync = async (): Promise<boolean> => {
    if (Platform.OS === 'android')
        return true
    
    let trackingStatus = await getTrackingStatus();
   
    // console.log('CheckAndRequestTrackingTransparencyAsync', trackingStatus);

    if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') {
        // enable tracking features
        return true
    }

    trackingStatus = await requestTrackingPermission();

    // console.log('CheckAndRequestTrackingTransparencyAsync', trackingStatus);

    if (trackingStatus === 'authorized' || trackingStatus === 'unavailable') {
        // enable tracking features
        return true
    }

    return false
}