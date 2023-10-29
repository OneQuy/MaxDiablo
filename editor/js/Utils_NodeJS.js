"use strict";
exports.__esModule = true;
exports.SplitSectionsFromText = exports.ExtractAllNumbersInText = exports.GetParamExcludesDefaults = exports.GetParam = exports.IsParamExist = exports.LogYellow = exports.LogGreen = exports.LogRed = void 0;
// https://en.m.wikipedia.org/wiki/ANSI_escape_code#Colors:~:text=Eclipse%20Terminal-,30,-40
function LogRed() {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    var code = process.platform === 'win32' ? 91 : 31;
    console.log("\u001B[".concat(code, "m ").concat(msg.join(', '), " \u001B[0m"));
}
exports.LogRed = LogRed;
function LogGreen() {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    var code = process.platform === 'win32' ? 92 : 32;
    console.log("\u001B[".concat(code, "m ").concat(msg.join(', '), " \u001B[0m"));
}
exports.LogGreen = LogGreen;
function LogYellow() {
    var msg = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        msg[_i] = arguments[_i];
    }
    var code = process.platform === 'win32' ? 93 : 33;
    console.log("\u001B[".concat(code, "m ").concat(msg.join(', '), " \u001B[0m"));
}
exports.LogYellow = LogYellow;
function IsParamExist(key) {
    return typeof GetParam(key) === 'string';
}
exports.IsParamExist = IsParamExist;
function GetParam(key, asStringOrNumber) {
    if (asStringOrNumber === void 0) { asStringOrNumber = true; }
    var value;
    key = key.toLowerCase();
    for (var i = 0; i < process.argv.length; i++) {
        var param = process.argv[i];
        var paramLower = param.toLowerCase();
        if (paramLower.startsWith(key + '=')) {
            value = param.substring(key.length + 1);
            break;
        }
        else if (key === paramLower) {
            value = '';
            break;
        }
    }
    if (value === undefined) // not found
        return undefined;
    if (asStringOrNumber === undefined || asStringOrNumber === true) // return as string
        return value;
    else // return as number
        return Number.parseFloat(value);
}
exports.GetParam = GetParam;
function GetParamExcludesDefaults(excludeKey) {
    for (var i = 0; i < process.argv.length; i++) {
        var cur = process.argv[i].toLowerCase();
        if (cur.includes('.js') ||
            cur.includes('node') ||
            cur === excludeKey)
            continue;
        return cur;
    }
}
exports.GetParamExcludesDefaults = GetParamExcludesDefaults;
var ExtractAllNumbersInText = function (text) {
    var _a;
    var regex = /[+-]?\d+(\.\d+)?/g;
    var floats = (_a = text.match(regex)) === null || _a === void 0 ? void 0 : _a.map(function (v) { return parseFloat(v); });
    if (!floats)
        return [];
    return floats;
};
exports.ExtractAllNumbersInText = ExtractAllNumbersInText;
function SplitSectionsFromText(wholeTxt) {
    var lines = wholeTxt.split('\n');
    var arrRes = [];
    var curElement = undefined;
    for (var iline = 0; iline < lines.length; iline++) {
        var lineTrim = lines[iline].trim();
        if (!lineTrim) {
            curElement = undefined;
            continue;
        }
        if (!curElement) {
            curElement = [];
            arrRes.push(curElement);
        }
        curElement.push(lineTrim);
    }
    return arrRes;
}
exports.SplitSectionsFromText = SplitSectionsFromText;
