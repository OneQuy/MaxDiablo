"use strict";
exports.__esModule = true;
exports.GenerateIgnoredStats = void 0;
var GenerateClassData_1 = require("./GenerateClassData");
var Utils_NodeJS_1 = require("./Utils_NodeJS");
var fs = require('fs');
var GenerateIgnoredStats = function () {
    var str = fs.readFileSync('./editor/IgnoredStats/RawIgnoredStats.txt', { encoding: 'utf8', flag: 'r' });
    var lines = str.split('\n');
    var arr = [];
    var curSlot = undefined;
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line.trim().length === 0)
            continue;
        if (line.startsWith('#')) { // slot name line
            var slotS = line.substring(1);
            var slott = (0, GenerateClassData_1.IsValidSlotName)(slotS);
            if (slott !== undefined) {
                curSlot = {
                    name: slott,
                    statNames: []
                };
                arr.push(curSlot);
            }
            else {
                (0, Utils_NodeJS_1.LogRed)('cant get slot name of this line: ' + line);
                return;
            }
            continue;
        }
        if (!curSlot)
            continue;
        var stat = (0, GenerateClassData_1.GetStatFromTypeOfClassData)(line);
        if (stat) {
            curSlot.statNames.push(stat.name.toLowerCase());
        }
        else {
            (0, Utils_NodeJS_1.LogRed)('can not extract stat of line: ' + line);
        }
    }
    fs.writeFileSync('./assets/IgnoredStats.json', JSON.stringify(arr, null, 1));
    (0, Utils_NodeJS_1.LogGreen)('success');
};
exports.GenerateIgnoredStats = GenerateIgnoredStats;
