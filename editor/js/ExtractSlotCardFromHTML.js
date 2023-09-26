"use strict";
exports.__esModule = true;
exports.ExtractSlotCardFromHTML = void 0;
var node_html_parser_1 = require("node-html-parser");
var Types_1 = require("./Types");
var RemoveStatWithResistance = true;
function ExtractSlotCardFromHTML(htmlString, ignoreLineCantExtractStat) {
    var _a, _b;
    var root = (0, node_html_parser_1["default"])(htmlString);
    if (!root)
        return '[ne]';
    // extract name
    var itemPowerText = (_a = root.querySelector('.d4-color-gray')) === null || _a === void 0 ? void 0 : _a.text;
    if (!itemPowerText) {
        return 'missing d4-color-gray (item power)';
    }
    var itemPower = SplitNumberInText(itemPowerText);
    if (Number.isNaN(itemPower)) {
        return 'cant parse item power';
    }
    var name = (_b = root.querySelector('.d4t-sub-title')) === null || _b === void 0 ? void 0 : _b.text;
    if (!name) {
        return 'missing d4t-sub-title (slot name)';
    }
    var slotName = undefined;
    var names = Object.values(Types_1.SlotName);
    for (var i = 0; i < names.length; i++) {
        var namee = names[i];
        if (name.includes(namee)) {
            slotName = namee;
            break;
        }
    }
    if (slotName === undefined) {
        return 'cant extract slot name of: ' + name;
    }
    // extract stats
    var statRaws = root.querySelectorAll('.d4t-list-affix.d4-color-gray');
    if (statRaws.length <= 0) {
        return 'Zero stat, not enought stats line of .d4t-list-affix.d4-color-gray';
    }
    var stats = [];
    for (var i = 0; i < statRaws.length; i++) {
        // Example:
        // +2 Ranks of Hydra (Sorcerer Only) [1 - 2]
        // +4.5% Basic Skill Attack Speed  [2.1 - 4.5]%
        var line = statRaws[i].structuredText;
        // find first char
        var firstCharIdx = 0;
        for (firstCharIdx = 0; firstCharIdx < line.length; firstCharIdx++)
            if (IsChar(line[firstCharIdx]))
                break;
        // extract number
        var numberS = '';
        if (!line.includes('Inherit')) {
            for (var i_1 = firstCharIdx - 1; i_1 >= 0; i_1--) {
                if (IsNumOrDot(line[i_1])) {
                    numberS = line[i_1] + numberS;
                }
                else {
                    if (numberS === '')
                        continue;
                    else if (line[i_1] === ',')
                        continue;
                    else
                        break;
                }
            }
        }
        var value = line.includes('Inherit') ? SplitNumberInText(line) : Number.parseFloat(numberS);
        if (Number.isNaN(value)) {
            if (ignoreLineCantExtractStat)
                continue;
            else
                return 'cant extract value of stat of line: ' + line;
        }
        // extract name stat
        var nameStat = '';
        for (var i_2 = firstCharIdx; i_2 < line.length; i_2++) {
            if (IsChar(line[i_2]) || line[i_2] === ' ') {
                nameStat += line[i_2];
            }
            else
                break;
        }
        nameStat = nameStat.trim();
        if (nameStat.length <= 0) {
            if (ignoreLineCantExtractStat)
                continue;
            else
                return 'cant extract name of stat of line: ' + line;
        }
        // extract range
        var bracketPart = line.substring(line.indexOf('['));
        var rangeArrS = bracketPart.split('-');
        var min = -1;
        var max = -1;
        if (rangeArrS && rangeArrS.length === 2) {
            min = SplitNumberInText(rangeArrS[0]);
            max = SplitNumberInText(rangeArrS[1]);
        }
        else if (rangeArrS && rangeArrS.length === 1) {
            min = SplitNumberInText(rangeArrS[0]);
            max = SplitNumberInText(rangeArrS[0]);
        }
        if (min === -1 || max === -1 || min > max) {
            if (ignoreLineCantExtractStat)
                continue;
            else
                return 'cant extract range of stat of line: ' + line;
        }
        // validate & return
        stats.push({
            name: nameStat,
            isPercent: line.includes('%'),
            min: min,
            max: max,
            value: value
        });
    }
    if (ignoreLineCantExtractStat && stats.length <= 0)
        return 'cant extract any stats of this slot';
    stats = checkAndRemoveStats(stats);
    return {
        slotName: slotName,
        itemPower: itemPower,
        stats: stats
    };
}
exports.ExtractSlotCardFromHTML = ExtractSlotCardFromHTML;
var checkAndRemoveStats = function (stats) {
    if (!RemoveStatWithResistance)
        return stats;
    return stats.filter(function (stat) {
        var valid = !stat.name.includes('Resistance');
        return valid;
    });
};
var IsNumOrDot = function (c) {
    if (c === '.')
        return true;
    if (c >= '0' && c <= '9')
        return true;
    else
        return false;
};
var IsChar = function (c) {
    var cLower = c.toLowerCase();
    if (cLower >= 'a' && cLower <= 'z')
        return true;
    else
        return false;
};
var SplitNumberInText = function (text) {
    if (!text)
        return NaN;
    var numS = '';
    for (var index = 0; index < text.length; index++) {
        var char = text[index];
        if (char >= '0' && char <= '9') {
            numS += char;
        }
        else {
            if (numS === '')
                continue;
            else if (char === ',') {
                if (index + 1 < text.length && !Number.isNaN(Number.parseInt(text[index + 1])))
                    continue;
                else
                    break;
            }
            else if (char === '.') {
                if (index + 1 < text.length && !Number.isNaN(Number.parseInt(text[index + 1])))
                    numS += char;
                else
                    break;
            }
            else
                break;
        }
    }
    return Number.parseFloat(numS);
};
