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
    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        var stat = (0, GenerateClassData_1.GetStatFromTypeOfClassData)(line);
        if (stat) {
            arr.push(stat.name);
        }
        else {
            (0, Utils_NodeJS_1.LogRed)('can not extract stat of line: ' + line);
        }
    }
    // if (true)
    fs.writeFileSync('./assets/IgnoredStats.json', JSON.stringify(arr, null, 1));
    // else
    //     fs.writeFileSync('./assets/IgnoredStats.json', JSON.stringify(arr));
};
exports.GenerateIgnoredStats = GenerateIgnoredStats;
