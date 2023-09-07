// const { parse } = require('node-html-parser');

import parse from "node-html-parser";
import { SlotCard, SlotName, Stat } from "./Types";

export function ExtractSlotCardFromHTML(htmlString: string): SlotCard | string {
    const root = parse(htmlString);

    if (!root)
        return '[ne]'

    // extract name

    const itemPowerText = root.querySelector('.d4-color-gray')?.text;

    if (!itemPowerText) {
        return 'missing d4-color-gray (item power)'
    }

    const itemPower = SplitNumberInText(itemPowerText)

    if (Number.isNaN(itemPower)) {
        return 'cant parse item power'
    }

    const name = root.querySelector('.d4t-sub-title')?.text;

    if (!name) {
        return 'missing d4t-sub-title (slot name)'
    }

    let slotName: SlotName | undefined = undefined

    for (let i in SlotName) {
        if (name.includes(i)) {
            slotName = i as SlotName
            break
        }
    }

    if (slotName === undefined) {
        return 'cant extract slot name of: ' + name
    }

    // extract stats

    const statRaws = root.querySelectorAll('.d4t-list-affix.d4-color-gray')

    if (statRaws.length < 2) {
        return 'not enought stats line of .d4t-list-affix.d4-color-gray'
    }

    const stats: Stat[] = []

    for (let i = 0; i < statRaws.length; i++) {
        // Example:
        // +2 Ranks of Hydra (Sorcerer Only) [1 - 2]
        // +4.5% Basic Skill Attack Speed  [2.1 - 4.5]%

        const line = statRaws[i].structuredText

        // find first char

        let firstCharIdx = 0

        for (firstCharIdx = 0; firstCharIdx < line.length; firstCharIdx++)
            if (IsChar(line[firstCharIdx]))
                break

        // extract number

        let numberS = ''

        if (!line.includes('Inherit')) {
            for (let i = firstCharIdx - 1; i >= 0; i--) {
                if (IsNumOrDot(line[i])) {
                    numberS = line[i] + numberS
                }
                else {
                    if (numberS === '')
                        continue
                    else if (line[i] === ',')
                        continue
                    else
                        break
                }
            }
        }

        const value = line.includes('Inherit') ? SplitNumberInText(line) : Number.parseFloat(numberS)

        if (Number.isNaN(value)) {
            return 'cant extract value of stat of line: ' + line
        }

        // extract name stat

        let nameStat = ''

        for (let i = firstCharIdx; i < line.length; i++) {
            if (IsChar(line[i]) || line[i] === ' ') {
                nameStat += line[i]
            }
            else
                break
        }

        nameStat = nameStat.trim()

        if (nameStat.length <= 0) {
            return 'cant extract name of stat of line: ' + line
        }

        // extract range

        const bracketPart = line.substring(line.indexOf('['))
        const rangeArrS = bracketPart.split('-')
        let min = -1
        let max = -1

        if (rangeArrS && rangeArrS.length === 2) {
            min = SplitNumberInText(rangeArrS[0])
            max = SplitNumberInText(rangeArrS[1])
        }

        if (min === -1 || max === -1 || min > max) {
            return 'cant extract range of stat of line: ' + line
        }

        // validate & return

        stats.push({
            name: nameStat,
            isPercent: line.includes('%'),
            min,
            max,
            value
        })
    }

    return {
        slotName,
        itemPower,
        stats: stats
    } as SlotCard
}


const IsNumOrDot = (c: string) => {
    if (c === '.')
        return true

    if (c >= '0' && c <= '9')
        return true
    else
        return false
}

const IsChar = (c: string) => {
    const cLower = c.toLowerCase()

    if (cLower >= 'a' && cLower <= 'z')
        return true
    else
        return false
}

const SplitNumberInText = (text: string) => {
    if (!text)
        return NaN

    let numS = ''

    for (let index = 0; index < text.length; index++) {
        const char = text[index]

        if (char >= '0' && char <= '9') {
            numS += char
        }
        else {
            if (numS === '')
                continue
            else if (char === ',') {
                if (index + 1 < text.length && !Number.isNaN(Number.parseInt(text[index + 1])))
                    continue
                else
                    break
            }
            else if (char === '.') {
                if (index + 1 < text.length && !Number.isNaN(Number.parseInt(text[index + 1])))
                    numS += char
                else
                    break
            }
            else
                break
        }
    }

    return Number.parseFloat(numS)
}