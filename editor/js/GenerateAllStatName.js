"use strict";
exports.__esModule = true;
exports.GenerateAllStatName = void 0;
var fs = require('fs');
var weirdstatdir = './editor/weirdstat/';
var KnownWeirdStats = [
    'Blocked Damage Reduction',
    'Damage for X Seconds After Dodging an Attack',
    'Damage Reduction from Poisoned Enemies',
    'Damage to Healthy Enemies',
    'Main Hand Weapon Damage',
    'Max Evade Charges',
    'Max Evade Charge',
    'Mastery Skill Damage',
    'Maximum Life Socket',
    'Rank of Hammer of the Ancients',
    'Rank of Concealment',
    'Rank of the Endless Pyre Passive',
];
var RemovedStat = [
    'x',
    'seconds',
    'second',
];
var IncludedRemovedStat = [
    'socket',
];
var SplitLine = function (line) {
    var arr = line.split('][');
    var res = [];
    arr.forEach(function (element) {
        element = element.replace('[', '');
        element = element.replace(']', '');
        res.push(element);
    });
    return res;
};
var ReadWeirdStat = function () {
    var fileUris = fs.readdirSync(weirdstatdir);
    var arr = [];
    var countFile = 0;
    for (var iFile = 0; iFile < fileUris.length; iFile++) {
        var filrUri = fileUris[iFile];
        if (!filrUri.includes('json'))
            continue;
        countFile++;
        var text = fs.readFileSync(weirdstatdir + filrUri);
        var obj = JSON.parse(text);
        var values = Object.values(obj);
        values.forEach(function (value) {
            arr = arr.concat(SplitLine(value));
        });
    }
    console.log('count file export', countFile);
    arr = arr.filter(function (s) { return !RemovedStat.includes(s.toLowerCase()); });
    arr = arr.filter(function (s) { return IncludedRemovedStat.findIndex(function (i) { return s.toLowerCase().includes(i); }) < 0; });
    return arr;
};
var GenerateAllStatName = function () {
    var text = fs.readFileSync('./assets/ClassesData.json');
    var slots = JSON.parse(text);
    var arr = [];
    var loop = 0;
    for (var islot = 0; islot < slots.length; islot++) {
        var slot = slots[islot];
        for (var iclass = 0; iclass < slot.classes.length; iclass++) {
            var classs = slot.classes[iclass];
            for (var istat = 0; istat < classs.stats.length; istat++) {
                var stat = classs.stats[istat];
                loop++;
                if (!arr.includes(stat.name)) {
                    arr.push(stat.name);
                }
            }
        }
    }
    // append KnownWeirdStats
    arr = arr.concat(KnownWeirdStats);
    var exports = ReadWeirdStat();
    var countDuplicated = 0;
    for (var islot = 0; islot < exports.length; islot++) {
        if (arr.includes(exports[islot])) {
            countDuplicated++;
            continue;
        }
        arr.push(exports[islot]);
    }
    // done
    arr.sort();
    fs.writeFileSync('./assets/AllStats.json', JSON.stringify(arr, null, 1));
    console.log('stat duplicated count', countDuplicated);
    console.log('stat count', arr.length);
    console.log('loop', loop);
};
exports.GenerateAllStatName = GenerateAllStatName;
