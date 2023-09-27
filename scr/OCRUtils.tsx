import { SlotCard, SlotName, Stat } from "./Types";
import { ExtractAllNumbersInText, IsChar, IsNumOrDotChar, IsNumType, SplitNumberInText, StringReplaceCharAt } from "./common/UtilsTS";

var isLog = false

function RemoveTextAfterCloseSquareBracket(lines: string[]): string[] {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i]

        let idxCloseBracket = line.indexOf(']%')
        const isPercent = idxCloseBracket >= 0

        if (idxCloseBracket < 0)
            idxCloseBracket = line.indexOf(']')

        if (idxCloseBracket < 0)
            continue

        lines[i] = line.substring(0, idxCloseBracket + (isPercent ? 2 : 1))
    }

    return lines
}

function FixLinesBeforeMerge(lines: string[]): string[] {
    for (let index = 1; index < lines.length; index++) {
        let line = lines[index].trim();

        // fix ( to [
        // Ex: Bone Skills (21.0-35.0%
        // Ex: +82 Intelligence +(76-104
        // Ex: +33.0 % Critical Strike Damage (21.0- 35.0]%
        const openBracketIdx = line.indexOf('(')

        if (openBracketIdx >= 0 && openBracketIdx + 1 < line.length) {
            if (IsNumOrDotChar(line[openBracketIdx + 1])) {
                line = StringReplaceCharAt(line, openBracketIdx, '[')
                lines[index] = line
            }
        }

        // fix miss close sqr bracket: ']'
        // Ex: +82 Intelligence +(76-104
        // Ex:  ...Bone Skills (21.0-35.0%

        const openSqrBracketIdx = line.indexOf('[')
        const closeSqrBracketIdx = line.indexOf(']')

        if (openSqrBracketIdx > 0 && closeSqrBracketIdx < 0) {
            const sub = line.substring(openSqrBracketIdx)

            const nums = ExtractAllNumbersInText(sub)

            if (nums.length === 2) {
                line += ']'
                lines[index] = line
            }
            if (line.includes('•'))
                console.warn(line);


            // remove these loz: ⚫, •

            line = line.replaceAll('⚫', '\n')
            line = line.replaceAll('•', '\n')
            lines[index] = line

        }
    }

    return lines;
}

function FixLinesAfterMerge(lines: string[]): string[] {
    for (let index = 1; index < lines.length; index++) {
        let line = lines[index].trim();

        const openSqrBracketIdx = line.indexOf('[')
        const closeSqrBracketIdx = line.indexOf(']')
        const openBracketIdx = line.indexOf('(')

        // +30.0% Critical Strike Damage with Imbued Skills (21.0-35.0]% (wrong bracket)

        if (openSqrBracketIdx < 0 &&
            closeSqrBracketIdx > 0 &&
            openBracketIdx > 0 &&
            openBracketIdx < closeSqrBracketIdx) {
            line = StringReplaceCharAt(line, openBracketIdx, '[')
            lines[index] = line
        }

        // o +36.0% Vulnerable Damage [21.0- 42.0]% (remove first o)

        if (line.startsWith('o')) {
            line = line.substring(1)
            lines[index] = line
        }

        if (line.includes('\\u26ab')) {
            line = line.replace('\\u26ab', '')
            lines[index] = line
        }

        // final

        lines[index] = line.trim()
    }

    return lines;
}

function MergeLines(lines: string[]): string[] { // (logic: merge previous line to current line)
    for (let index = 1; index < lines.length; index++) {
        let line = lines[index];

        const openSqrBracketIdx = line.indexOf('[')
        const closeSqrBracketIdx = line.indexOf(']')

        const openSqrBracketIdx_PreviousLine = lines[index - 1].indexOf('[')
        const closeSqrBracketIdx_PreviousLine = lines[index - 1].indexOf(']')

        let needMerge = false

        if (openSqrBracketIdx < 0 && closeSqrBracketIdx >= 0) { // -0.8] // 17.5]% (miss - sign: [10.5 17.5]%)
            needMerge = true
        }
        else if (openSqrBracketIdx >= 0) { // Form [0.7-0.8] // [0.7-0.8]%
            let haveAnyNumBefore = false

            for (let i = openSqrBracketIdx - 1; i >= 0; i--) {
                if (!Number.isNaN(Number.parseFloat(line[i]))) {
                    haveAnyNumBefore = true
                    break
                }
            }

            if (!haveAnyNumBefore)
                needMerge = true
        }
        else if (openSqrBracketIdx_PreviousLine >= 0 && closeSqrBracketIdx_PreviousLine < 0) {
            needMerge = true
        }

        if (needMerge) {
            lines[index] = lines[index - 1] + ' ' + line
            lines[index - 1] = ''
        }
    }

    return lines;
}

function ExtractNameStat(firstCharIdx: number, line: string): string | undefined {
    let nameStat = ''

    for (let i = firstCharIdx; i < line.length; i++) {
        if (line[i] !== '[' && line[i] !== '(') {
            nameStat += line[i]
        }
        else
            break
    }

    // trim 

    nameStat = nameStat.trim()

    // remove others but char after name. Ex: Strength +

    for (let i = nameStat.length - 1; i >= 0; i--) {
        if (IsChar(nameStat[i])) {
            break
        }

        nameStat = StringReplaceCharAt(nameStat, i, '')
    }

    // trim 

    nameStat = nameStat.trim()

    // others

    if (nameStat.length <= 0) {
        if (isLog)
            console.log('[log extract] cant get name stat of line: ' + line);

        return undefined
    }
    else if (nameStat.includes('Damage Per Second')) {
        return undefined
    }
    else if (nameStat === 'Life') { // +15% Life [10-20]%
        return undefined
    }

    // Golems Inherit +4.4% of Your Thorns []%

    const innerNum = ExtractAllNumbersInText(nameStat)

    if (innerNum.length > 0) {
        nameStat = nameStat.replace('+' + innerNum[0].toString(), 'X')
        nameStat = nameStat.replace(innerNum[0].toString(), 'X')
    }

    // fix Thom

    if (nameStat.includes('Your Thom')) {
        nameStat = nameStat.replace('Your Thom', 'Your Thorn')
    }

    // fix Sike

    if (nameStat.includes('Sike')) {
        nameStat = nameStat.replace('Sike', 'Strike')
    }

    return nameStat
}

function ExtractRange(line: string, value: number): [number, number] | undefined {
    // Ex:
    // +32.0% Critical Strike Damage with Bone Skills [21.0-35.0%

    const openSqrBracketIdx = line.indexOf('[')
    let min = -1
    let max = -1

    if (openSqrBracketIdx >= 0) {
        const s = line.substring(openSqrBracketIdx)
        const floats = ExtractAllNumbersInText(s)

        if (floats.length >= 2) {
            min = floats[0]
            max = Math.abs(floats[1])
        }
        else if (floats.length === 1) {
            min = floats[0]
            max = min

            // value not between range & range only have 1 value, must split the range. 
            // Ex: +2 Ranks of Incinerate [23] (to [2-3])
            // Ex: [2.310] (to [2.3-10]) // ?? todo
            // Ex: [710.5] (to [7-10.5]) // ?? todo

            if (value !== min && min >= 11) {
                const numS = min.toString()

                const minS = numS.substring(0, Math.floor(numS.length / 2))
                const maxS = numS.substring(minS.length)

                min = parseFloat(minS)
                max = parseFloat(maxS)
            }
        }
    }

    if (!IsNumType(min) ||
        !IsNumType(max) ||
        min === -1 ||
        max === -1 ||
        min > max ||
        value < min ||
        value > max) {
        if (isLog)
            console.log('[log extract] cant get range of line: ' + line);

        return undefined
    }

    return [min, max]
}

function FixCloseSqrBracket(wholeText: string): string {
    for (let index = 1; index + 1 < wholeText.length; index++) {
        let curChar = wholeText[index]

        if (curChar === '1' &&
            wholeText[index + 1] === '%' &&
            wholeText[index - 1] >= '0' && wholeText[index - 1] <= '9') {
            curChar = ']'
            wholeText = StringReplaceCharAt(wholeText, index, curChar)
        }
    }

    return wholeText
}

export function ExtractSlotCard(text: string, forceLog = false): SlotCard | string {
    if (forceLog)
        isLog = true

    if (!text)
        return 'text to regconize is null'

    if (text.indexOf('[') < 0)
        return 'miss brackets'

    // fix miss close sqr bracket line

    text = FixCloseSqrBracket(text)

    // split lines

    let lines = text.split('\n')

    if (lines.length <= 1)
        lines = text.split('\\n')

    if (lines.length <= 1)
        return 'text to regconize is not enough lines: ' + lines.length

    if (isLog) {
        console.log('================');

        for (let index = 0; index < lines.length; index++) {
            const line = lines[index]
            console.log(line);
        }
    }

    // extract item power

    let itemPower: number = NaN

    for (let index = 1; index < lines.length; index++) {
        const line = lines[index]

        if (line.includes('Item Power') || line.includes('Itern Power')) {
            itemPower = SplitNumberInText(line)
            break
        }
    }

    if (Number.isNaN(itemPower)) {
        return 'cant extract ItemPower'
    }

    // find name slot

    let slotName: SlotName | undefined = undefined
    let indexLineOfSlotName = -1

    for (let index = 1; index < lines.length; index++) {
        const line = lines[index]

        // check hard code when name in two lines

        if (index < lines.length - 1) {
            // Ancestral Legendary Two-
            // Handed Mace

            if (line.includes('Two') && lines[index + 1].includes('Sword'))
                slotName = SlotName.TwoHandedSword
            else if (line.includes('Two') && lines[index + 1].includes('Mace'))
                slotName = SlotName.TwoHandedMace
            else if (line.includes('Chest') && lines[index + 1].includes('Armor'))
                slotName = SlotName.ChestArmor
            else if (line.includes('Two') && lines[index + 1].includes('Axe'))
                slotName = SlotName.TwoHandedAxe
        }

        if (slotName) {
            indexLineOfSlotName = index
            break
        }

        // loop all names

        const allSlotNames = Object.values(SlotName)

        for (let i = 0; i < allSlotNames.length; i++) {
            const namee = allSlotNames[i]

            if (line.includes(namee)) {
                slotName = namee as SlotName
                break
            }
        }

        if (slotName) {
            indexLineOfSlotName = index
            break
        }
    }

    if (!slotName) {
        return 'cant extract SlotName'
    }

    // is Unique?

    if (lines[indexLineOfSlotName].toLowerCase().includes('unique') ||
        (indexLineOfSlotName > 0 && lines[indexLineOfSlotName - 1].toLowerCase().includes('unique')) ||
        (indexLineOfSlotName + 1 < lines.length && lines[indexLineOfSlotName + 1].toLowerCase().includes('unique'))) {
        return 'unique'
    }

    // log

    if (isLog) {
        console.log('trước merge================');

        for (let index = 0; index < lines.length; index++) {
            const line = lines[index]
            console.log(line);
        }
    }

    // fix lines after merge

    lines = FixLinesBeforeMerge(lines)

    // remove [4]. Ex: +16.0% Damage for 4 Seconds After Dodging an Attack [14.0-21.0]% [4]

    lines = RemoveTextAfterCloseSquareBracket(lines)

    // merge square bracket line

    lines = MergeLines(lines)

    if (isLog) {
        console.log('sau mergeeeee================');

        for (let index = 0; index < lines.length; index++) {
            const line = lines[index]
            console.log(line);
        }
    }

    // fix lines after merge

    lines = FixLinesAfterMerge(lines)

    // remove empty lines 

    lines = lines.filter(line => line && line.trim() !== '')

    // remove ignored lines

    lines = lines.filter(i => !IsIgnoredLine(i))

    if (lines.length <= 1)
        return 'text to regconize doesnt follow requires'

    // extract each line

    let stats: Stat[] = []

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index]

        // find first char

        let firstCharIdx = 0

        for (firstCharIdx = 0; firstCharIdx < line.length; firstCharIdx++)
            if (IsChar(line[firstCharIdx]))
                break

        // extract number

        let numberS = ''

        if (!line.includes('Inherit')) {
            for (let i = firstCharIdx - 1; i >= 0; i--) {
                if (IsNumOrDotChar(line[i])) {
                    numberS = line[i] + numberS
                }
                else {
                    if (numberS === '')
                        continue
                    else if (line[i] === ',') {
                        numberS = '.' + numberS
                    }
                    else
                        break
                }
            }
        }

        /* Golems Inherit +4.4% of Your Thorns []% */
        const value = line.includes('Inherit') ? SplitNumberInText(line) : Number.parseFloat(numberS)

        if (!IsNumType(value)) {
            if (isLog)
                console.log('[log extract] cant get value of line: ' + line, ', numberS: ' + numberS);

            continue
        }

        // extract name stat

        let nameStat = ExtractNameStat(firstCharIdx, line)

        if (!nameStat)
            continue

        // range

        const range = ExtractRange(line, value)

        if (!range) {
            continue
        }

        // parse and return

        stats.push({
            name: nameStat,
            min: range[0],
            max: range[1],
            isPercent: line.includes('%'),
            value
        })
    }

    // result 

    if (stats.length > 0) {
        return {
            slotName,
            itemPower,
            stats
        } as SlotCard
    }
    else
        return 'cant extract any stats'
}

const IsOnlyCharAndSpaceLine = (line: string) => {
    for (let index = 0; index < line.length; index++) {
        const charLower = line[index].toLowerCase();

        if (charLower === ' ')
            continue

        if (charLower < 'a' || charLower > 'z')
            return false
    }

    return true
}

const IsNotIncludesAnyCharUpperLine = (line: string) => {
    for (let index = 0; index < line.length; index++) {
        // const charLower = line[index].toLowerCase();

        const c = line[index]

        if (c >= 'A' && c <= 'Z')
            return false
    }

    return true
}

const IsIgnoredLine = (line: string) => {
    if (!line || line.trim() === '')
        return true

    if (line.indexOf('[') < 0 && line.indexOf(']') >= 0) // 2] (Sorcerer Only)
        return true

    if (line.toLowerCase().includes('requires level') ||
        line.toLowerCase().includes('sell value') ||
        line.toLowerCase().includes('item power') ||
        line.toLowerCase().includes('upgrades:') ||
        IsNotIncludesAnyCharUpperLine(line) || // 1 dev // [7-8]% // 7.9]%
        IsOnlyCharAndSpaceLine(line))
        return true
    else
        return false
}