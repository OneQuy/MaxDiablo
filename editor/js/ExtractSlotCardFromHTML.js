"use strict";
// const { parse } = require('node-html-parser');
exports.__esModule = true;
exports.ExtractSlotCardFromHTML = void 0;
var node_html_parser_1 = require("node-html-parser");
var Types_1 = require("./Types");
function ExtractSlotCardFromHTML(htmlString) {
    var _a;
    var root = (0, node_html_parser_1["default"])(htmlString);
    if (!root)
        return '[ne]';
    // extract name
    var name = (_a = root.querySelector('.d4t-sub-title')) === null || _a === void 0 ? void 0 : _a.text;
    if (!name) {
        return 'missing d4t-sub-title';
    }
    var slotName = undefined;
    for (var i in Types_1.SlotName) {
        if (name.includes(i)) {
            slotName = i;
            break;
        }
    }
    if (slotName === undefined) {
        return 'cant extract slot name of: ' + name;
    }
    // extract stats
    var statRaws = root.querySelectorAll('.d4t-list-affix.d4-color-gray');
    if (statRaws.length < 2) {
        return 'not enought stats line of .d4t-list-affix.d4-color-gray';
    }
    var stats = [];
    for (var i = 0; i < statRaws.length; i++) {
        var line = statRaws[i].structuredText;
        // +2 Ranks of Hydra (Sorcerer Only) [1 - 2]
        // +4.5% Basic Skill Attack Speed  [2.1 - 4.5]%
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
        if (min === -1 || max === -1) {
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
    return {
        slotName: slotName,
        stats: stats
    };
}
exports.ExtractSlotCardFromHTML = ExtractSlotCardFromHTML;
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
