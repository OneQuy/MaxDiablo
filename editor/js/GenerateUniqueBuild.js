"use strict";
exports.__esModule = true;
exports.GenerateUniqueBuild = void 0;
var Utils_NodeJS_1 = require("./Utils_NodeJS");
var fs = require('fs');
var GenerateUniqueBuild = function () {
    var text = fs.readFileSync('./editor/Unique/Unique.txt', 'utf-8');
    var arrSessions = (0, Utils_NodeJS_1.SplitSectionsFromText)(text);
    var builds = [];
    for (var i = 0; i < arrSessions.length; i++) {
        var section = arrSessions[i];
        if (section[1].toLowerCase().includes('none'))
            continue;
        var build = {
            name: section[0].substring(1),
            upperSlotNames: section.slice(1)
        };
        builds.push(build);
    }
    fs.writeFileSync('./assets/UniqueBuilds.json', JSON.stringify(builds, null, 1));
    (0, Utils_NodeJS_1.LogGreen)('success');
};
exports.GenerateUniqueBuild = GenerateUniqueBuild;
