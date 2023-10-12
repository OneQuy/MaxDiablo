// @ts-ignore
import Forage from 'react-native-forage';
import { AppState } from 'react-native';

if (!__DEV__)
    Forage.start('b1d41c41-a4a1-4da7-bd59-a5dac96b32e2', AppState);

export const Track = (event: string, value: any = undefined) => {
    if (value !== undefined) {
        if (!__DEV__)
            Forage.trackEvent(event, value);

        // console.log('tracking: ' + event, value);
    }
    else {
        if (!__DEV__)
            Forage.trackEvent(event);

        // console.log('tracking: ' + event);
    }
}