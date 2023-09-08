import { Tier } from "./Types";

const fs = require('fs')

export const Check = () => {
    const text = fs.readFileSync('./assets/BuildsData.json');

    const buildsData: Tier[] = JSON.parse(text)
    
    for (let itier = 0; itier < buildsData.length; itier++) {
        const tier = buildsData[itier]

        for (let ibuild = 0; ibuild < tier.builds.length; ibuild++) {
            const build = tier.builds[ibuild]

            for (let islot = 0; islot < build.slots.length; islot++) {
                const slot = build.slots[islot]

                for (let istat = 0; istat < slot.stats.length; istat++) {
                    const stat = slot.stats[istat]

                    countDecimal(stat.min)
                    countDecimal(stat.max)
                    countDecimal(stat.value)
                }
            }
        }
    }

    console.log('done');
    
}

const countDecimal = (n: number) => {
    let txt = n.toString()
    let arr = txt.split('.')

    if (arr.length === 2 && arr[1].length > 1)
        console.log(txt);
}