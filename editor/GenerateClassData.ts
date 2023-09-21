import { ExtractSlotCardFromHTML } from "./ExtractSlotCardFromHTML"
import { Build, ClassName, Classs, SlotCard, SlotName, SlotOfClasses, Stat, Tier } from "./Types"
import { ExtractAllNumbersInText, LogRed } from "./Utils_NodeJS"
import parse, { Node } from "node-html-parser";

const fs = require('fs')

const sourceDataPath = process.platform === 'win32' ? 'E:\\react-native\\DiabloSenpai\\editor\\ClassData\\Data.html' : '/Users/onequy/Documents/ReactNative/MaxDiablo/editor/ClassData/Data.html'
const desDataPath = process.platform === 'win32' ? 'E:\\react-native\\DiabloSenpai\\assets\\ClassesData.json' : '/Users/onequy/Documents/ReactNative/MaxDiablo/assets/ClassesData.json'

export const GenerateSlot = (text: string): Classs[] | string => {
    const lines = text.split('\n')

    const classes: Classs[] = []

    let curClass: Classs = {
        name: ClassName.AllClasses,
        stats: []
    }

    let isImpliciting = false

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (line === 'Implicit') {
            isImpliciting = true
            continue
        }
        else if (line.includes('Crowd Control Duration Lucky Hit'))
            continue

        const className = IsValidClassName(line)

        if (isImpliciting && className === undefined) {
            continue
        }

        if (className !== undefined) { // this line is class name 
            isImpliciting = false

            curClass = {
                name: className,
                stats: []
            }

            classes.push(curClass)
        }
        else { // this line is stat
            const stat = GetStat(line)

            if (stat)
                curClass.stats.push(stat)
            else {
                LogRed('can not extract stat of line: ' + line)
            }
        }
    }

    return classes
}

export const GenerateClassData = (): SlotOfClasses[] | string => {
    const str = fs.readFileSync(sourceDataPath, { encoding: 'utf8', flag: 'r' });

    const root = parse(str);

    const slots = root.querySelectorAll('.stats__slot')
    const slotsRes: SlotOfClasses[] = []

    for (let i = 0; i < slots.length; i++) {
        const slot = slots[i]

        const slotNameTxt = slot.querySelector('.stats__slot__name')?.structuredText

        if (!slotNameTxt)
            return '[ne]'

        const slotName = IsValidSlotName(slotNameTxt)

        if (!slotName)
            return '[ne]'

        const nodeAllValues = slot.querySelector('.stats__slot__all__values')

        if (!nodeAllValues)
            return '[ne]'

        const classes = GenerateSlot(nodeAllValues.structuredText);

        if (typeof classes !== 'string') {
            slotsRes.push({
                name: slotName,
                classes
            } as SlotOfClasses);
        }
        else
            return classes
    }

    if (true)
        fs.writeFileSync(desDataPath, JSON.stringify(slotsRes, null, 1));
    else
        fs.writeFileSync(desDataPath, JSON.stringify(slotsRes));

    return slotsRes
}

const IsValidSlotName = (name: string): SlotName | undefined => {
    const names = Object.values(SlotName)

    for (let i = 0; i < names.length; i++) {
        const namee = names[i]

        if (namee === name) {
            return namee
        }
    }

    return undefined
}

const IsValidClassName = (name: string): ClassName | undefined => {
    const names = Object.values(ClassName)

    for (let i = 0; i < names.length; i++) {
        const namee = names[i]

        if (namee === name) {
            return namee
        }
    }

    return undefined
}

export const IsChar = (c: string) => {
    if (typeof c !== 'string' || c.length !== 1)
        return false

    const cLower = c.toLowerCase()

    if (cLower >= 'a' && cLower <= 'z')
        return true
    else
        return false
}

const FirstCharIdx = (line: string): number => {
    let firstCharIdx = -1

    for (firstCharIdx = 0; firstCharIdx < line.length; firstCharIdx++)
        if (IsChar(line[firstCharIdx]))
            break

    return firstCharIdx
}

const GetStat = (line: string): Stat | undefined => {
    // [4.4 - 10.0]% Lucky Hit Chance while You Have a Barrier
    // [358 - 776] Maximum Life
    // [7.0 - 14.0]% Damage for 4 Seconds After Picking Up a Blood Orb
    // Lucky Hit: Up to a 5% Chance to Restore [7.0 - 14.0]% Primary Resource 

    const openBracketIdx = line.indexOf('[')
    const closeBracketIdx = line.indexOf(']')

    if (openBracketIdx < 0 || closeBracketIdx < 0 || openBracketIdx >= closeBracketIdx)
        return undefined

    // stats

    const statS = line.substring(openBracketIdx, closeBracketIdx + 1)

    const nums = ExtractAllNumbersInText(statS)

    if (nums.length !== 2)
        return undefined

    // name stat

    let name = ''

    if (openBracketIdx === 0) { // case bracket at front of line
        const firstCharIdx = FirstCharIdx(line)

        if (firstCharIdx < 0)
            return undefined

        name = line.substring(firstCharIdx)
        const innerNum = ExtractAllNumbersInText(name)

        if (innerNum.length === 1) {
            name = name.replace(innerNum[0].toString(), 'X')
        }
        else if (innerNum.length > 1) {
            return undefined
        }
    }
    else { // case brackets in the between
        name = line.replace(statS, 'X')
    }

    return {
        name: name,
        min: nums[0],
        max: nums[1],
        isPercent: line.includes('%'),
        value: -1,
    } as Stat
}