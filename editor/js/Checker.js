"use strict";
exports.__esModule = true;
exports.Check = void 0;
var fs = require('fs');
var Check = function () {
    var text = fs.readFileSync('./assets/BuildsData.json');
    var buildsData = JSON.parse(text);
    for (var itier = 0; itier < buildsData.length; itier++) {
        var tier = buildsData[itier];
        for (var ibuild = 0; ibuild < tier.builds.length; ibuild++) {
            var build = tier.builds[ibuild];
            for (var islot = 0; islot < build.slots.length; islot++) {
                var slot = build.slots[islot];
                for (var istat = 0; istat < slot.stats.length; istat++) {
                    var stat = slot.stats[istat];
                    countDecimal(stat.min);
                    countDecimal(stat.max);
                    countDecimal(stat.value);
                }
            }
        }
    }
    console.log('done');
};
exports.Check = Check;
var countDecimal = function (n) {
    var txt = n.toString();
    var arr = txt.split('.');
    if (arr.length === 2 && arr[1].length > 1)
        console.log(txt);
    else
        console.log(n);
};
