"use strict";
exports.__esModule = true;
exports.GenerateBuildData = void 0;
var ExtractSlotCardFromHTML_1 = require("./ExtractSlotCardFromHTML");
var Utils_NodeJS_1 = require("./Utils_NodeJS");
var fs = require('fs');
var tiersDirPath = './editor/builddata/';
var GenerateBuildData = function () {
    var tierDirs = fs.readdirSync(tiersDirPath);
    if (tierDirs.length <= 0)
        (0, Utils_NodeJS_1.LogRed)('not found any tier dir in ' + tiersDirPath);
    var tiers = [];
    for (var i = 0; i < tierDirs.length; i++) {
        // tier name
        var tierDirName = tierDirs[i];
        var arrTier = tierDirName.split(' ');
        if (arrTier.length !== 2)
            return 'this folder doesnt follow the rule of Tier + X name: ' + tiersDirPath + tierDirName;
        var tierName = arrTier[1];
        if (tierName.length !== 1)
            return 'name of tier exceed length of 1: ' + tierName;
        // builds
        var buildDirs = fs.readdirSync(tiersDirPath + tierDirName);
        if (tierDirs.length <= 0)
            (0, Utils_NodeJS_1.LogRed)('not found any build dirs in ' + tiersDirPath + tierDirName);
        var builds = [];
        for (var j = 0; j < buildDirs.length; j++) {
            var buildDirName = buildDirs[j]; // also build name
            var slotFileNames = fs.readdirSync(tiersDirPath + tierDirName + '/' + buildDirName);
            var slotCards = [];
            for (var a = 0; a < buildDirs.length; a++) {
                var slotFileName = slotFileNames[a];
                var path = tiersDirPath + tierDirName + '/' + buildDirName + '/' + slotFileName;
                var str = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
                var slotCardRes = (0, ExtractSlotCardFromHTML_1.ExtractSlotCardFromHTML)(str);
                if (typeof slotCardRes === 'string')
                    return 'can extract file: ' + path + ', error: ' + slotCardRes;
                else
                    slotCards.push(slotCardRes);
            }
            builds.push({
                name: buildDirName,
                slots: slotCards
            });
        }
        tiers.push({
            name: tierName,
            builds: builds
        });
    }
    return tiers;
};
exports.GenerateBuildData = GenerateBuildData;
