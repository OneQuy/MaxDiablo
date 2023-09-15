import mobileAds from 'react-native-google-mobile-ads';

var inited = false

export const CheckAndInitAdmob = () => {
    if (inited)
        return

    inited = true

    mobileAds()
        .initialize()
        .then(adapterStatuses => {
            console.log('Initialization complete!')
        });
}