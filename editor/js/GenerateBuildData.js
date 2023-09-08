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
    var countBuilds = 0;
    var countSlots = 0;
    var countError = 0;
    for (var i = 0; i < tierDirs.length; i++) {
        // tier name
        var tierDirName = tierDirs[i];
        if (tierDirName.includes('.')) // this is file
            continue;
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
            if (buildDirName.includes('.')) // this is file
                continue;
            var slotFileNames = fs.readdirSync(tiersDirPath + tierDirName + '/' + buildDirName);
            var slotCards = [];
            for (var a = 0; a < buildDirs.length; a++) {
                var slotFileName = slotFileNames[a];
                if (!slotFileName || !slotFileName.includes('.txt'))
                    continue;
                var path = tiersDirPath + tierDirName + '/' + buildDirName + '/' + slotFileName;
                var str = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
                var slotCardRes = (0, ExtractSlotCardFromHTML_1.ExtractSlotCardFromHTML)(str, true);
                if (typeof slotCardRes === 'string') {
                    countError++;
                    (0, Utils_NodeJS_1.LogRed)('can extract file: ' + path + ', error: ' + slotCardRes);
                }
                else
                    slotCards.push(slotCardRes);
            }
            countSlots += slotCards.length;
            builds.push({
                name: buildDirName,
                slots: slotCards
            });
        }
        countBuilds += builds.length;
        tiers.push({
            name: tierName,
            builds: builds
        });
    }
    console.log('slot error count: ' + countError);
    console.log('slot count: ' + countSlots);
    console.log('build count: ' + countBuilds);
    console.log('tier count: ' + tiers.length);
    fs.writeFileSync('./editor/builddata/Data.json', JSON.stringify(tiers, null, 1));
    return;
};
exports.GenerateBuildData = GenerateBuildData;
