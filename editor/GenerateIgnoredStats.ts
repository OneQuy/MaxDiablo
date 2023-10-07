import { GetStatFromTypeOfClassData, IsValidSlotName } from "./GenerateClassData";
import { IgnoredStatsOfSlot, SlotName } from "./Types";
import { LogGreen, LogRed } from "./Utils_NodeJS";

const fs = require('fs')

export const GenerateIgnoredStats = () => {
    const str: string = fs.readFileSync('./editor/IgnoredStats/RawIgnoredStats.txt', { encoding: 'utf8', flag: 'r' });

    const lines: string[] = str.split('\n')
    const arr: IgnoredStatsOfSlot[] = []
    let curSlot: IgnoredStatsOfSlot | undefined = undefined

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()

        if (line.trim().length === 0)
            continue

        if (line.startsWith('#')) { // slot name line
            const slotS = line.substring(1)

            const slott = IsValidSlotName(slotS)

            if (slott !== undefined) {
                curSlot = {
                    name: slott,
                    statNames: []
                }

                arr.push(curSlot)
            }
            else {
                LogRed('cant get slot name of this line: ' + line)
                return
            }

            continue
        }

        if (!curSlot)
            continue

        const stat = GetStatFromTypeOfClassData(line)

        if (stat) {
            const statname = stat.name.toLowerCase()

            // check duplicate stat

            const idx = curSlot.statNames.indexOf(statname)

            if (idx >= 0) {
                // LogRed(curSlot.name + ', same stat: ' + statname)
            }
            else
                curSlot.statNames.push(statname)
        }
        else {
            LogRed('can not extract stat of line: ' + line)
        }
    }

    fs.writeFileSync('./assets/IgnoredStats.json', JSON.stringify(arr, null, 1));
    LogGreen('success')
}