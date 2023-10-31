import { SlotOfClasses, Tier } from "./Types";
import { LogGreen, LogRed } from "./Utils_NodeJS";

const fs = require('fs')

const weirdstatdir = './editor/weirdstat/'

const KnownWeirdStats = [
    'Blocked Damage Reduction',
    'Damage for X Seconds After Dodging an Attack',
    'Damage Reduction from Poisoned Enemies',
    'Damage to Healthy Enemies',
    'Main Hand Weapon Damage',
    'Max Evade Charges',
    'Max Evade Charge',
    'Mastery Skill Damage',
    'Maximum Life Socket',
    'Rank of Hammer of the Ancients',
    'Rank of Concealment',
    'Rank of the Endless Pyre Passive',
]

const SplitLine = (line: string): string[] => {
    const arr = line.split('][')

    const res: string[] = []

    arr.forEach(element => {
        element = element.replace('[', '')
        element = element.replace(']', '')
        res.push(element)
    });

    return res
}
const ReadWeirdStat = (): string[] => {
    const fileUris = fs.readdirSync(weirdstatdir)
    let arr: string[] = []

    for (let iFile = 0; iFile < fileUris.length; iFile++) {
        const filrUri = fileUris[iFile]

        const text = fs.readFileSync(weirdstatdir + filrUri)

        const obj = JSON.parse(text)

        var values: string[] = Object.values(obj)

        values.forEach(value => {
            arr = arr.concat(SplitLine(value))
        });
    }

    return arr
}

export const GenerateAllStatName = () => {
    const text = fs.readFileSync('./assets/ClassesData.json');

    const slots: SlotOfClasses[] = JSON.parse(text)
    let arr: string[] = []
    let loop = 0;

    for (let islot = 0; islot < slots.length; islot++) {
        const slot = slots[islot]

        for (let iclass = 0; iclass < slot.classes.length; iclass++) {
            const classs = slot.classes[iclass]

            for (let istat = 0; istat < classs.stats.length; istat++) {
                const stat = classs.stats[istat]

                loop++

                if (!arr.includes(stat.name)) {
                    arr.push(stat.name)
                }
            }
        }

    }

    // append KnownWeirdStats

    arr = arr.concat(KnownWeirdStats)

    const exports = ReadWeirdStat()

    for (let islot = 0; islot < exports.length; islot++) {
        if (arr.includes(exports[islot])) {
            LogRed(exports[islot])
            continue
        }

        arr.push(exports[islot])
    }

    // done

    fs.writeFileSync('./assets/AllStats.json', JSON.stringify(arr, null, 1));

    console.log('stat count', arr.length);
    console.log('loop', loop);
}