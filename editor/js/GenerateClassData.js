"use strict";
exports.__esModule = true;
exports.GenerateClassData = void 0;
var node_html_parser_1 = require("node-html-parser");
var fs = require('fs');
var sourceDataPath = '/Users/onequy/Documents/ReactNative/MaxDiablo/editor/ClassData/Data.html';
var desDataPath = '/Users/onequy/Documents/ReactNative/MaxDiablo/assets/ClassesData.json';
var GenerateClassData = function (printBeauty) {
    var _a;
    if (printBeauty === void 0) { printBeauty = false; }
    var str = fs.readFileSync(sourceDataPath, { encoding: 'utf8', flag: 'r' });
    var root = (0, node_html_parser_1["default"])(str);
    var slots = root.querySelectorAll('.stats__slot');
    for (var i = 0; i < slots.length; i++) {
        var slot = slots[i];
        var slotName = (_a = slot.querySelector('.stats__slot__name')) === null || _a === void 0 ? void 0 : _a.structuredText;
        console.log(slotName);
        var nodeAllValues = slot.querySelector('.stats__slot__all__values');
        if (!nodeAllValues)
            return '[ne]';
        // console.log(nodeAllValues.classList);
        // console.log(1111, nodeAllValues.classNames);
        console.log(222, nodeAllValues.getElementsByTagName('div')[0].innerText);
        // console.log(333, nodeAllValues?.structuredText);
        // for (let ichild = 0; i < nodeAllValues.childNodes.length; i++) {
        //     const childNode  = nodeAllValues.childNodes[ichild]
        //     console.log((childNode.parentNode.childNodes[0]))
        //     console.log((childNode.parentNode.childNodes[1]))
        //     break
        // }
        break;
    }
    return undefined;
};
exports.GenerateClassData = GenerateClassData;
