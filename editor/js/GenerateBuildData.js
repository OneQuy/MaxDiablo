"use strict";
exports.__esModule = true;
exports.GenerateBuildData = void 0;
var fs = require('fs');
var tiersDirPath = './editor/builddata';
var GenerateBuildData = function (dir) {
    var items = fs.readdirSync(tiersDirPath);
    console.log(items);
};
exports.GenerateBuildData = GenerateBuildData;
