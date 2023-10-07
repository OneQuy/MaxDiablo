import parse from "node-html-parser";
import { SlotCard, SlotName, Stat } from "./Types";

export function ExtractSlotCardFromHTML(htmlString: string, ignoreLineCantExtractStat: boolean): SlotCard | string {
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

    const names = Object.values(SlotName)

    for (let i = 0; i < names.length; i++) {
        const namee = names[i]

        if (name.includes(namee)) {
            slotName = namee as SlotName
            break
        }
    }

    if (slotName === undefined) {
        return 'cant extract slot name of: ' + name
    }

    // extract stats

    const statRaws = root.querySelectorAll('.d4t-list-affix.d4-color-gray')

    if (statRaws.length <= 0) {
        return 'Zero stat, not enought stats line of .d4t-list-affix.d4-color-gray'
    }

    let stats: Stat[] = []

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
            if (ignoreLineCantExtractStat)
                continue
            else
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
            if (ignoreLineCantExtractStat)
                continue
            else
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
        else if (rangeArrS && rangeArrS.length === 1) {
            min = SplitNumberInText(rangeArrS[0])
            max = SplitNumberInText(rangeArrS[0])
        }

        if (min === -1 || max === -1 || min > max) {
            if (ignoreLineCantExtractStat)
                continue
            else
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

    if (ignoreLineCantExtractStat && stats.length <= 0)
        return 'cant extract any stats of this slot'

    stats = checkAndRemoveStats(stats)

    return {
        slotName,
        itemPower,
        stats: stats
    } as SlotCard
}

const checkAndRemoveStats = (stats: Stat[]): Stat[] => {
    // remove 'Resistance'

    stats = stats.filter(stat => {
        const valid = !stat.name.includes('Resistance')
        return valid
    })

    // remove duplicate stats

    for (let i = 0; i < stats.length; i++) {
        for (let a = i + 1; a < stats.length; a++) {
            if (stats[i].name === stats[a].name) {
                stats[i].name = 'hihi'
                // console.log('remmmm', stats[a].name, stats[i].min, stats[i].max);
            }
        }
    }

    stats = stats.filter(i => i.name !== 'hihi')

    // remove same value range stats

    while (true) {
        if (stats.length <= 4)
            break

        if (stats[0].min === stats[0].max) {
            stats = stats.slice(1)
        }
    }

    return stats
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