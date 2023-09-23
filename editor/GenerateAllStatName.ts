import { SlotOfClasses, Tier } from "./Types";

const fs = require('fs')

// export const GenerateAllStatName = () => {
//     const text = fs.readFileSync('./assets/BuildsData.json');

//     const buildsData: Tier[] = JSON.parse(text)
//     const arr: string[] = []
//     let loop = 0;

//     for (let itier = 0; itier < buildsData.length; itier++) {
//         const tier = buildsData[itier]

//         for (let ibuild = 0; ibuild < tier.builds.length; ibuild++) {
//             const build = tier.builds[ibuild]

//             for (let islot = 0; islot < build.slots.length; islot++) {
//                 const slot = build.slots[islot]

//                 for (let istat = 0; istat < slot.stats.length; istat++) {
//                     const stat = slot.stats[istat]

//                     loop++

//                     if (!arr.includes(stat.name)) {
//                         arr.push(stat.name)
//                     }
//                 }
//             }
//         }
//     }

//     if (true)
//         fs.writeFileSync('./assets/AllStats.json', JSON.stringify(arr, null, 1));
//     else
//         fs.writeFileSync('./assets/AllStats.json', JSON.stringify(arr));

//     console.log('stat count', arr.length);
//     console.log('loop', loop);
// }

export const GenerateAllStatName = () => {
    const text = fs.readFileSync('./assets/ClassesData.json');

    const slots: SlotOfClasses[] = JSON.parse(text)
    const arr: string[] = []
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

    // if (true)
        fs.writeFileSync('./assets/AllStats.json', JSON.stringify(arr, null, 1));
    // else
    //     fs.writeFileSync('./assets/AllStats.json', JSON.stringify(arr));

    console.log('stat count', arr.length);
    console.log('loop', loop);
}