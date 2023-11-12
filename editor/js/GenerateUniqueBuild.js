"use strict";
exports.__esModule = true;
exports.GenerateUniqueBuild = void 0;
var Utils_NodeJS_1 = require("./Utils_NodeJS");
var fs = require('fs');
var GenerateUniqueBuild = function () {
    var text = fs.readFileSync('./editor/Unique/Unique.txt', 'utf-8');
    var arrSessions = (0, Utils_NodeJS_1.SplitSectionsFromText)(text);
    var builds = [];
    var _loop_1 = function (i) {
        var section = arrSessions[i];
        if (section[1].toLowerCase().includes('none'))
            return "continue";
        var buildName = section[0].substring(1);
        var build;
        var upperSlotNames = section.slice(1);
        for (var j = 0; j < upperSlotNames.length; j++) {
            upperSlotNames[j] = upperSlotNames[j].trim();
        }
        build = builds.find(function (i) { return i.name === buildName; });
        if (build) {
            upperSlotNames.forEach(function (element) {
                // @ts-ignore
                var idx = build.upperSlotNames.findIndex(function (e) { return e.toLowerCase() === element.toLowerCase(); });
                if (idx < 0)
                    build === null || build === void 0 ? void 0 : build.upperSlotNames.push(element);
            });
            console.log('(no worry) duplicateddd');
        }
        else {
            build = {
                name: buildName,
                upperSlotNames: upperSlotNames
            };
            builds.push(build);
        }
    };
    for (var i = 0; i < arrSessions.length; i++) {
        _loop_1(i);
    }
    fs.writeFileSync('./assets/UniqueBuilds.json', JSON.stringify(builds, null, 1));
    (0, Utils_NodeJS_1.LogGreen)('success');
};
exports.GenerateUniqueBuild = GenerateUniqueBuild;
