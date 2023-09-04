const { parse } = require('node-html-parser');
const { SlotName } = require('../scr/Types');

function ExtractSlotCardFromHTML(htmlString) {

    const root = parse(htmlString);

    console.log(SlotName.Amulet);
    // console.log(root.querySelectorAll('.d4t-list-affix.d4-color-gray')[1].text);
    
    return {
        slotName: '',
        stats: []
    }
}

module.exports = {
    ExtractSlotCardFromHTML
}