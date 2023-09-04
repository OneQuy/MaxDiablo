// const { parse } = require('node-html-parser');

import parse from "node-html-parser";
import { SlotName } from "../scr/Types";

export function ExtractSlotCardFromHTML(htmlString: string) {

    const root = parse(htmlString);

     console.log(SlotName.Amulet, root.querySelectorAll('.d4t-list-affix.d4-color-gray')[1].text);
    
    return {
        slotName: '',
        stats: []
    }
}

// module.exports = {
//     ExtractSlotCardFromHTML
// }