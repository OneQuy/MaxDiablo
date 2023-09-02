import { Alert, NativeModules, Platform } from 'react-native';

export const ResultCode = {
    JustError: 'JustError',
    FileNotFound: 'FileNotFound',
    NoIdentity: 'NoIdentity',
}

// const

export const TempDirName = 'temp_dir';

// variable states

var _CountTimeInSeconds = 0.0;

// array

export const ArrayGroupElements = (array, property) => array.reduce((grouped, element) => ({
    ...grouped,
    [element[property]]: [...(grouped[element[property]] || []), element]
}), {})

// time

export function AddDayToDate(dateTime, daysToAdd) {
    var dateOffset = (24 * 60 * 60 * 1000) * daysToAdd;
    dateTime.setTime(dateTime.getTime() - dateOffset);
    return dateTime;
}

export function CountTimeInSeconds(isStart) {
    if (isStart) {
        _CountTimeInSeconds = new Date();
        return -1;
    }

    return RoundNumber(((new Date()) - _CountTimeInSeconds) / 1000, 1);
}

export function TimestampNow() {
    return (new Date()) * 1;
}

export function prependZero(number) {
    if (number < 10)
        return '0' + number;
    else
        return number;
}

export function SecondsToHourMinuteSecondString(number, hideHourIfZero = true) {
    let hour = Math.floor(number / 3600);
    let minute = Math.floor((number - (hour * 3600)) / 60);
    let second = Math.floor(number - hour * 3600 - minute * 60);

    if (hour > 0 || !hideHourIfZero)
        return prependZero(hour) + ':' + prependZero(minute) + ':' + prependZero(second);
    else
        return prependZero(minute) + ':' + prependZero(second);
}

// others

export function useCallbackFake(fn, _) {
    return fn;
}

export function GetPageStartAndEndItemIndex(totalNumber, pageIdx, maxItemPerPage) {
    let startIdx = pageIdx * maxItemPerPage;

    if (startIdx >= totalNumber) {
        return {
            startIdx: -1,
            endIdx: -1,
        };
    }

    let endIdx = (pageIdx + 1) * maxItemPerPage - 1;
    endIdx = Math.min(endIdx, totalNumber - 1);

    return {
        startIdx: startIdx,
        endIdx: endIdx,
    };
}

/**
* @Link: http://www.lingoes.net/en/translator/langcode.htm
* @Example result: en_US
*/
export function LocaleIdentifier() {
    const deviceLanguage =
        Platform.OS === 'ios'
            ? NativeModules.SettingsManager.settings.AppleLocale ||
            NativeModules.SettingsManager.settings.AppleLanguages[0] //iOS 13
            : NativeModules.I18nManager.localeIdentifier;

    return deviceLanguage;
}

export function ErrorObject(error, code) {
    return { error: error, code: code };
}

export function ErrorObject_JustError(error) {
    return { error: error, code: ResultCode.JustError };
}

export function ErrorObject_FileNotFound(error) {
    return { error: error, code: ResultCode.FileNotFound };
}

export function ErrorObject_NoIdentity(error) {
    return { error: error, code: ResultCode.NoIdentity };
}

export function IsErrorObject_Empty(errorObj) {
    return !errorObj || (errorObj.error == null && errorObj.code == null);
}

export function AlertOK(title, content, quitOutside = true) {
    Alert.alert(
        title,
        content,
        [{ text: 'OK' }],
        { cancelable: quitOutside });
}

export function AlertOKCancel(title, content, okCallback, showCancel = true, quitOutside = true) {
    if (showCancel) {
        Alert.alert(
            title, // title
            content, // content
            [
                { // cancel button
                    text: 'Cancel',
                    style: 'cancel',
                },
                { // okay button
                    text: 'Okay',
                    onPress: okCallback,
                },
            ],
            { // on click outside
                cancelable: quitOutside,
            }
        );
    }
    else // no show cancel
    {
        Alert.alert(
            title, // title
            content, // content
            [
                { // okay button
                    text: 'Okay',
                    onPress: okCallback,
                },
            ],
            { // on click outside
                cancelable: quitOutside,
            }
        );
    }
}

export async function DelayAsync(msTime) {
    return new Promise(resolve => setTimeout(resolve, msTime));
}

export function PickRandomElement(list, excludeElement) {
    while (true) {
        let idx = Math.floor(Math.random() * list.length);

        if (list.length <= 1 || excludeElement === undefined || excludeElement === null || !Object.is(list[idx], excludeElement))
            return list[idx];
    }
}

export function SortObject() {
    let list = {
        'you': 100,
        'me': 75,
        'foo': 116,
        'bar': 15,
    };

    let sorted = Object.entries(list).sort((a, b) => a[1] - b[1]);

    for (let element of sorted) {
        console.log(element[0] + ': ' + element[1]);
    }
}

// json

export function LoadJsonFromURL(jsonURL, jsonCallback, errorCallback) {
    // USAGE:
    // LoadJsonFromURL(url,
    //      (json) =>{
    //          console.log('JSON Text: ' + JSON.stringify(json));
    //      },
    //      (error) => {
    //          console.error(error);
    //      });

    fetch(jsonURL)
        .then((response) => response.json())
        .then((json) => jsonCallback(json))
        .catch((error) => {
            errorCallback(error);
        });
}

export async function LoadJsonFromURLAsync(jsonURL) {
    try {
        var respone = await fetch(jsonURL);
        var jsonObject = await respone.json();

        return {
            json: jsonObject,
            error: null,
        };
    }
    catch (err) {
        return {
            json: null,
            error: err,
        };
    }
}

// file / folder system

export function GetDirSepartorChar() {
    return '/';
}

export function IsValidFilename(filename) {
    let rg1 = /^[^\\/:\*\?"<>\|]+$/; // forbidden characters \ / : * ? " < > |
    let rg2 = /^\./; // cannot start with dot (.)
    let rg3 = /^(nul|prn|con|lpt[0-9]|com[0-9])(\.|$)/i; // forbidden file names

    return rg1.test(filename) && !rg2.test(filename) && !rg3.test(filename);
}

export function GetFileExtension(filename) {
    return filename.split('.').pop();
}

export function GetTempFileRLP(withTimestamp = false) {
    if (withTimestamp) { return [TempDirName, 'temp_file_' + ((new Date()) * 1) + '.file'].join(GetDirSepartorChar()); }
    else { return [TempDirName, 'temp_file.file'].join(GetDirSepartorChar()); }
}

// number

export function RoundNumber(value, places = 1) {
    var multiplier = Math.pow(10, places);

    return (Math.round(value * multiplier) / multiplier);
}

export function RandomInt(min, max) {
    if (max < min) {
        const tmp = min;
        min = max;
        max = tmp;
    }

    var rand = Math.round(Math.random() * (max - min));
    return min + rand;
}

export function RandomIntExcept(min, max, except) {
    for (; ;) {
        let r = RandomInt(min, max);

        if (r !== except)
            return r;
    }
}