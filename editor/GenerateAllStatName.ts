import { SlotOfClasses, Tier } from "./Types";

const fs = require('fs')

const KnownWeirdStats = [
    'Damage for X Seconds After Dodging an Attack',
    'Max Evade Charges',
    'Damage to Healthy Enemies',
    'Rank of Hammer of the Ancients'
]

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
    
    // done

    fs.writeFileSync('./assets/AllStats.json', JSON.stringify(arr, null, 1));

    console.log('stat count', arr.length);
    console.log('loop', loop);
}