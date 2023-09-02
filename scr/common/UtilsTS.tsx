// file / dir

import { Alert, Platform, AlertButton } from "react-native";

const colorNameToHexDefines = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "grey": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred ": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370d8",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#d87093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "rebeccapurple": "#663399",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
}

export type ColorName = keyof typeof colorNameToHexDefines;

export const TimeOutError = '[time_out]';

export function ColorNameToHex(name: ColorName): string {
    return colorNameToHexDefines[name];
}

export function ColorNameToRgb(name: ColorName, opacity?: number): string {
    const hex = ColorNameToHex(name);
    return HexToRgb(hex, opacity);
}

export function HexToRgb(hex: string, opacity?: number): string {
    // @ts-ignore
    const arr = ['0x' + hex[1] + hex[2] | 0, '0x' + hex[3] + hex[4] | 0, '0x' + hex[5] + hex[6] | 0];
    const res = 'rgb(' + arr[0] + "," + arr[1] + "," + arr[2] + ')';

    if (opacity !== undefined)
        return RGBToRGBAText(res, opacity);
    else
        return res;
}

/**
 * @usage RGBToRGBAText('rgb(0, 0, 0)', 0.5)
 */
export function RGBToRGBAText(colorText: string, opacity: number): string {
    return colorText.replace(')', ', ' + opacity + ')').replace('rgb', 'rgba');
}

export function GetFileExtensionByFilepath(filepath: string): string {
    var dotIdx = filepath.lastIndexOf('.');

    if (dotIdx == -1)
        return '';

    return filepath.substring(dotIdx + 1, filepath.length);
}


export function GetBlobFromFLPAsync(flp: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
        if (!flp) {
            reject(new Error('GetBlobFromFLPAsync: flp is null/empty'));
            return;
        }

        if (Platform.OS === 'android' && !flp.startsWith('file://')) {
            flp = 'file://' + flp;
        }

        const xhr = new XMLHttpRequest();

        // If successful -> return with blob
        xhr.onload = function () {
            resolve(xhr.response);
        };

        // reject on error
        xhr.onerror = function () {
            reject(new Error('GetBlobFromFLPAsync failed, flp: ' + flp));
        };

        // Set the response type to 'blob' - this means the server's response 
        // will be accessed as a binary object
        xhr.responseType = 'blob';

        // Initialize the request. The third argument set to 'true' denotes 
        // that the request is asynchronous
        xhr.open('GET', flp, true);

        // Send the request. The 'null' argument means that no body content is given for the request
        xhr.send(null);
    });
};

/**
 * @usage const isPressRight = await AlertAsync('title', 'message', 'cancel', 'OK');
 */
export const AlertAsync = async (
    title: string,
    msg?: string,
    rightText?: string,
    leftText?: string,
) => new Promise((resolve) => {
    const rightBtn: AlertButton = {
        text: rightText ?? 'OK',
        onPress: () => resolve(true)
    }

    Alert.alert(
        title,
        msg,
        leftText ?
            [ // case 2 btns
                {
                    text: leftText,
                    onPress: () => resolve(false)
                },
                rightBtn
            ] :
            [ // case 1 btn
                rightBtn
            ],
        {
            cancelable: false,
        }
    );
})

export const ToCanPrint = (something: any) => {
    if (typeof something === 'object') {
        const res = JSON.stringify(something);

        if (res === '{}') {
            return '' + something;
        }
        else
            return res;
    }

    return something;
}

/**
 * binary string to base64 string
 */
export const btoa = (input: string) => {
    let output = '';

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    for (let block = 0, charCode, i = 0, map = chars;
        input.charAt(i | 0) || (map = '=', i % 1);
        output += map.charAt(63 & block >> 8 - i % 1 * 8)) {

        charCode = input.charCodeAt(i += 3 / 4);

        if (charCode > 0xFF) {
            throw new Error("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }

        block = block << 8 | charCode;
    }

    return output;
}

export function ArrayBufferToBase64String(buffer: ArrayBuffer) {
    var binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}