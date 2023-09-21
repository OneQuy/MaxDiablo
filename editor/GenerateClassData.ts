import { ExtractSlotCardFromHTML } from "./ExtractSlotCardFromHTML"
import { Build, SlotCard, Tier } from "./Types"
import { LogRed } from "./Utils_NodeJS"
import parse, { Node } from "node-html-parser";

const fs = require('fs')

const sourceDataPath = '/Users/onequy/Documents/ReactNative/MaxDiablo/editor/ClassData/Data.html'
const desDataPath = '/Users/onequy/Documents/ReactNative/MaxDiablo/assets/ClassesData.json'

export const GenerateClassData = (printBeauty = false): string | undefined => {
    const str = fs.readFileSync(sourceDataPath, { encoding: 'utf8', flag: 'r' });

    const root = parse(str);

    const slots = root.querySelectorAll('.stats__slot')

    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]

        const slotName = slot.querySelector('.stats__slot__name')?.structuredText
        
        console.log(slotName);
        
        const nodeAllValues = slot.querySelector('.stats__slot__all__values')
    
        if (!nodeAllValues)
            return '[ne]'
        
        // console.log(nodeAllValues.classList);
        // console.log(1111, nodeAllValues.classNames);
        
        console.log(222, nodeAllValues.getElementsByTagName('div')[0]);
        
        // console.log(333, nodeAllValues?.structuredText);
        
        // for (let ichild = 0; i < nodeAllValues.childNodes.length; i++) {
        //     const childNode  = nodeAllValues.childNodes[ichild]
            
        //     console.log((childNode.parentNode.childNodes[0]))
        //     console.log((childNode.parentNode.childNodes[1]))
            
        //     break
        // }
        
        break
    }

    return undefined
}