"use strict";
// const { parse } = require('node-html-parser');
exports.__esModule = true;
exports.ExtractSlotCardFromHTML = void 0;
var node_html_parser_1 = require("node-html-parser");
var Types_1 = require("../scr/Types");
function ExtractSlotCardFromHTML(htmlString) {
    var root = (0, node_html_parser_1["default"])(htmlString);
    console.log(Types_1.SlotName.Amulet, root.querySelectorAll('.d4t-list-affix.d4-color-gray')[1].text);
    return {
        slotName: '',
        stats: []
    };
}
exports.ExtractSlotCardFromHTML = ExtractSlotCardFromHTML;
// module.exports = {
//     ExtractSlotCardFromHTML
// }
