import { SlotCard, SlotName, Stat } from "./Types";
import { IsChar, IsNumOrDotChar, IsNumType, SplitNumberInText, StringReplaceCharAt } from "./common/UtilsTS";

export function ExtractSlotCard(text: string): SlotCard | string {
    // console.log('----------------');
    // console.log(text);
    // console.log('----------------');

    const isLog = false

    if (!text)
        return 'text to regconize is null'

    let lines = text.split('\n')

    if (lines.length <= 1)
        lines = text.split('\\n')

    if (lines.length <= 1)
        return 'text to regconize is not enough lines: ' + lines.length

    // find name slot

    let slotName: SlotName | undefined = undefined
    const names  = Object.values(SlotName)

    for (let index = 1; index < lines.length; index++) {
       
        for (let i = 0; i < names.length; i++) {
            const namee  = names[i]
            
            if (lines[index].includes(namee)) {
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

    // merge close bracket line

    for (let index = 1; index < lines.length; index++) {
        const line = lines[index];

        const openSqrBracketIdx = line.indexOf('[')
        const closeSqrBracketIdx = line.indexOf(']')

        const openSqrBracketIdx_PreviousLine = lines[index - 1].indexOf('[')
        const closeSqrBracketIdx_PreviousLine = lines[index - 1].indexOf(']')

        let needMerge = false

        if (openSqrBracketIdx < 0 && closeSqrBracketIdx >= 0) // -0.8]
            needMerge = true
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

    // fix miss close sqr bracket line

    for (let index = 1; index < lines.length; index++) {
        // +12.5% Vulnerable Damage [7.0- 14.01%

        const line = lines[index];

        const openSqrBracketIdx = line.indexOf('[')
        const closeSqrBracketIdx = line.indexOf(']')

        if (openSqrBracketIdx >= 0 && closeSqrBracketIdx < 0) { // need to fix
            let fixed = false

            for (let i = line.length - 1; i > openSqrBracketIdx; i--) {
                if (line[i] === '1') { // this '1' is close bracket
                    fixed = true
                    lines[index] = StringReplaceCharAt(line, i, ']')
                    break
                }
            }

            if (!fixed) {
                return 'this line can not be fixed close bracket: ' + line
            }
        }
    }

    // for (let index = 0; index < lines.length; index++) {
    //     const line = lines[index]
    //     console.log(line);
    // }

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

        // range

        const openSqrBracketIdx = line.indexOf('[')
        const closeSqrBracketIdx = line.indexOf(']')
        let min = -1
        let max = -1

        if (openSqrBracketIdx >= 0 && closeSqrBracketIdx >= 0) {
            const s = line.substring(openSqrBracketIdx)
            const rangeArrS = s.split('-')

            if (rangeArrS && rangeArrS.length === 2) {
                min = SplitNumberInText(rangeArrS[0])
                max = SplitNumberInText(rangeArrS[1])
            }
            else if (rangeArrS && rangeArrS.length === 1) {
                min = SplitNumberInText(rangeArrS[0])
                max = SplitNumberInText(rangeArrS[0])
            }
        }

        if (!IsNumType(min) || !IsNumType(max) || min === -1 || max === -1 || min > max) {
            if (isLog)
                console.log('[log extract] cant get range of line: ' + line);

            continue
        }

        // parse and return

        stats.push({
            name: nameStat,
            min,
            max,
            isPercent: line.includes('%'),
            value
        })
    }

    // result 

    if (stats.length > 0) {
        return {
            slotName,
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