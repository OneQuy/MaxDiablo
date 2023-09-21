"use strict";
exports.__esModule = true;
exports.IsChar = exports.GenerateClassData = exports.GenerateSlot = void 0;
var Types_1 = require("./Types");
var Utils_NodeJS_1 = require("./Utils_NodeJS");
var node_html_parser_1 = require("node-html-parser");
var fs = require('fs');
var sourceDataPath = process.platform === 'win32' ? 'E:\\react-native\\DiabloSenpai\\editor\\ClassData\\Data.html' : '/Users/onequy/Documents/ReactNative/MaxDiablo/editor/ClassData/Data.html';
var desDataPath = process.platform === 'win32' ? 'E:\\react-native\\DiabloSenpai\\assets\\ClassesData.json' : '/Users/onequy/Documents/ReactNative/MaxDiablo/assets/ClassesData.json';
var GenerateSlot = function (text) {
    var lines = text.split('\n');
    var classes = [];
    var curClass = {
        name: Types_1.ClassName.AllClasses,
        stats: []
    };
    var isImpliciting = false;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line === 'Implicit') {
            isImpliciting = true;
            continue;
        }
        else if (line.includes('Crowd Control Duration Lucky Hit'))
            continue;
        var className = IsValidClassName(line);
        if (isImpliciting && className === undefined) {
            continue;
        }
        if (className !== undefined) { // this line is class name 
            isImpliciting = false;
            curClass = {
                name: className,
                stats: []
            };
            classes.push(curClass);
        }
        else { // this line is stat
            var stat = GetStat(line);
            if (stat)
                curClass.stats.push(stat);
            else {
                (0, Utils_NodeJS_1.LogRed)('can not extract stat of line: ' + line);
            }
        }
    }
    return classes;
};
exports.GenerateSlot = GenerateSlot;
var GenerateClassData = function () {
    var _a;
    var str = fs.readFileSync(sourceDataPath, { encoding: 'utf8', flag: 'r' });
    var root = (0, node_html_parser_1["default"])(str);
    var slots = root.querySelectorAll('.stats__slot');
    var slotsRes = [];
    for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        var slotNameTxt = (_a = slot.querySelector('.stats__slot__name')) === null || _a === void 0 ? void 0 : _a.structuredText;
        if (!slotNameTxt)
            return '[ne]';
        var slotName = IsValidSlotName(slotNameTxt);
        if (!slotName)
            return '[ne]';
        var nodeAllValues = slot.querySelector('.stats__slot__all__values');
        if (!nodeAllValues)
            return '[ne]';
        var classes = (0, exports.GenerateSlot)(nodeAllValues.structuredText);
        if (typeof classes !== 'string') {
            slotsRes.push({
                name: slotName,
                classes: classes
            });
        }
        else
            return classes;
    }
    if (true)
        fs.writeFileSync(desDataPath, JSON.stringify(slotsRes, null, 1));
    else
        fs.writeFileSync(desDataPath, JSON.stringify(slotsRes));
    return slotsRes;
};
exports.GenerateClassData = GenerateClassData;
var IsValidSlotName = function (name) {
    var names = Object.values(Types_1.SlotName);
    for (var i = 0; i < names.length; i++) {
        var namee = names[i];
        if (namee === name) {
            return namee;
        }
    }
    return undefined;
};
var IsValidClassName = function (name) {
    var names = Object.values(Types_1.ClassName);
    for (var i = 0; i < names.length; i++) {
        var namee = names[i];
        if (namee === name) {
            return namee;
        }
    }
    return undefined;
};
var IsChar = function (c) {
    if (typeof c !== 'string' || c.length !== 1)
        return false;
    var cLower = c.toLowerCase();
    if (cLower >= 'a' && cLower <= 'z')
        return true;
    else
        return false;
};
exports.IsChar = IsChar;
var FirstCharIdx = function (line) {
    var firstCharIdx = -1;
    for (firstCharIdx = 0; firstCharIdx < line.length; firstCharIdx++)
        if ((0, exports.IsChar)(line[firstCharIdx]))
            break;
    return firstCharIdx;
};
var GetStat = function (line) {
    // [4.4 - 10.0]% Lucky Hit Chance while You Have a Barrier
    // [358 - 776] Maximum Life
    // [7.0 - 14.0]% Damage for 4 Seconds After Picking Up a Blood Orb
    // Lucky Hit: Up to a 5% Chance to Restore [7.0 - 14.0]% Primary Resource 
    var openBracketIdx = line.indexOf('[');
    var closeBracketIdx = line.indexOf(']');
    if (openBracketIdx < 0 || closeBracketIdx < 0 || openBracketIdx >= closeBracketIdx)
        return undefined;
    // stats
    var statS = line.substring(openBracketIdx, closeBracketIdx + 1);
    var nums = (0, Utils_NodeJS_1.ExtractAllNumbersInText)(statS);
    if (nums.length !== 2)
        return undefined;
    // name stat
    var name = '';
    if (openBracketIdx === 0) { // case bracket at front of line
        var firstCharIdx = FirstCharIdx(line);
        if (firstCharIdx < 0)
            return undefined;
        name = line.substring(firstCharIdx);
        var innerNum = (0, Utils_NodeJS_1.ExtractAllNumbersInText)(name);
        if (innerNum.length === 1) {
            name = name.replace(innerNum[0].toString(), 'X');
        }
        else if (innerNum.length > 1) {
            return undefined;
        }
    }
    else { // case brackets in the between
        name = line.replace(statS, 'X');
    }
    return {
        name: name,
        min: nums[0],
        max: nums[1],
        isPercent: line.includes('%'),
        value: -1
    };
};
