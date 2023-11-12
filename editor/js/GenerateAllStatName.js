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
    for (var iFile = 0; iFile < fileUris.length; iFile++) {
        var filrUri = fileUris[iFile];
        var text = fs.readFileSync(weirdstatdir + filrUri);
        var obj = JSON.parse(text);
        var values = Object.values(obj);
        values.forEach(function (value) {
            arr = arr.concat(SplitLine(value));
        });
    }
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
    for (var islot = 0; islot < exports.length; islot++) {
        if (arr.includes(exports[islot])) {
            // LogRed(exports[islot])
            continue;
        }
        arr.push(exports[islot]);
    }
    // done
    fs.writeFileSync('./assets/AllStats.json', JSON.stringify(arr, null, 1));
    console.log('stat count', arr.length);
    console.log('loop', loop);
};
exports.GenerateAllStatName = GenerateAllStatName;
