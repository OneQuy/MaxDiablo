import { SlotCard, SlotName, Stat } from "./Types";
import { ExtractAllNumbersInText, IsChar, IsNumOrDotChar, IsNumType, SplitNumberInText, StringReplaceCharAt } from "./common/UtilsTS";

const isLog = true

function MergeLines(lines: string[]): string[] { // (logic: merge current line to previous line)
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
            lines[index - 1] += ' ' + line
            lines[index] = ''
        }
    }

    return lines;
}

function ExtractRange(line: string): [number, number] | undefined {
    const openSqrBracketIdx = line.indexOf('[')
    const closeSqrBracketIdx = line.indexOf(']')
    let min = -1
    let max = -1

    if (openSqrBracketIdx >= 0 && closeSqrBracketIdx >= 0) {
        const s = line.substring(openSqrBracketIdx)
        const floats = ExtractAllNumbersInText(s)

        if (floats.length >= 2) {
            min = floats[0]
            max = Math.abs(floats[1])

            console.log('floats.lengthhhhh ' + floats.length);
        }
        else if (floats.length === 1) {
            min = floats[0]
            max = min
        }
    }

    if (!IsNumType(min) || !IsNumType(max) || min === -1 || max === -1 || min > max) {
        if (isLog)
            console.log('[log extract] cant get range of line: ' + line);

        return undefined
    }

    return [min, max]
}

function FixCloseSqrBracket(text: string): string {
    for (let index = 1; index < text.length; index++) {
        if (text[index] === '1' &&
            text[index + 1] === '%' &&
            text[index - 1] >= '0' && text[index - 1] <= '9') {
            text = StringReplaceCharAt(text, index, ']')
            // console.log('fix bracket', index);
        }
    }

    return text
}

export function ExtractSlotCard(text: string): SlotCard | string {
    // console.log('----------------');
    // console.log(text);
    // console.log('----------------');

    if (!text)
        return 'text to regconize is null'

    // fix miss close sqr bracket line

    text = FixCloseSqrBracket(text)

    // split lines

    let lines = text.split('\n')

    if (lines.length <= 1)
        lines = text.split('\\n')

    if (lines.length <= 1)
        return 'text to regconize is not enough lines: ' + lines.length


    // console.log('================');

    // for (let index = 0; index < lines.length; index++) {
    //     const line = lines[index]
    //     console.log(line);
    // }

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

    // console.log('trước find name================');

    // for (let index = 0; index < lines.length; index++) {
    //     const line = lines[index]
    //     console.log(line);
    // }

    // find name slot

    let slotName: SlotName | undefined = undefined
    const names = Object.values(SlotName)

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
        }

        if (slotName)
            break

        // loop all names

        for (let i = 0; i < names.length; i++) {
            const namee = names[i]

            if (line.includes(namee)) {
                slotName = namee as SlotName
                break
            }
        }

        if (slotName)
            break
    }

    if (!slotName) {
        return 'cant extract SlotName'
    }

    console.log('trước merge================');

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index]
        console.log(line);
    }

    // merge square bracket line

    lines = MergeLines(lines)

    console.log('sau mergeeeee================');

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index]
        console.log(line);
    }

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
                    else if (line[i] === ',')
                        continue
                    else
                        break
                }
            }
        }

        const value = line.includes('Inherit') ? SplitNumberInText(line) : Number.parseFloat(numberS)

        if (!IsNumType(value)) {
            if (isLog)
                console.log('[log extract] cant get value of line: ' + line);

            continue
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
            if (isLog)
                console.log('[log extract] cant get name stat of line: ' + line);

            continue
        }
        else if (nameStat.includes('Damage Per Second')) {
            continue
        }

        // range

        const range = ExtractRange(line)

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


// fix miss close sqr bracket line

// for (let index = 1; index < lines.length; index++) {
//     // +12.5% Vulnerable Damage [7.0- 14.01%

//     const line = lines[index];

//     const openSqrBracketIdx = line.indexOf('[')
//     const closeSqrBracketIdx = line.indexOf(']')

//     if (openSqrBracketIdx >= 0 && closeSqrBracketIdx < 0) { // need to fix
//         let fixed = false

//         for (let i = line.length - 1; i > openSqrBracketIdx; i--) {
//             if (line[i] === '1') { // this '1' is close bracket
//                 fixed = true
//                 lines[index] = StringReplaceCharAt(line, i, ']')
//                 break
//             }
//         }

//         if (!fixed) {
//             return 'this line can not be fixed close bracket: ' + line
//         }
//     }
// }