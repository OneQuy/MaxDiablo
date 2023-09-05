import { SlotCard, SlotName, Stat } from "./Types";

export function ExtractSlotCard(text: string): SlotCard | string {
    // console.log('----------------');
    // console.log(text);
    // console.log('----------------');

    if (!text)
        return 'text to regconize is null'

    let lines = text.split('\n')

    if (lines.length <= 1)
        lines = text.split('\\n')

    if (lines.length <= 1)
        return 'text to regconize is not enough lines: ' + lines.length

    // merge line

    for (let index = 1; index < lines.length; index++) {
        const line = lines[index];

        const openSqrBracketIdx = line.indexOf('[')
        const closeSqrBracketIdx = line.indexOf(']')

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

        if (needMerge) {
            lines[index - 1] += ' ' + line
            lines[index] = ''
        }
    }

    // remove empty lines 

    lines = lines.filter(line => line !== '')

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

        if (!IsNum(value)) {
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
            continue
        }

        // range

        const sqrbracketidx = line.indexOf('[')
        let min = -1
        let max = -1

        if (sqrbracketidx >= 0) {
            const s = line.substring(sqrbracketidx)
            const rangeArrS = s.split('-')

            if (rangeArrS && rangeArrS.length === 2) {
                min = SplitNumberInText(rangeArrS[0])
                max = SplitNumberInText(rangeArrS[1])
            }
        }

        if (!IsNum(min) || !IsNum(max) || min === -1 || max === -1 || min > max) {
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
            slotName: SlotName.Amulet,
            stats
        } as SlotCard
    }
    else
        return 'cant extract any stats'
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

const IsNum = (o: any) => {
    return typeof o === 'number' && !Number.isNaN(o)
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