import { ExtractSlotCardFromHTML } from "./ExtractSlotCardFromHTML"
import { Build, SlotCard, Tier } from "./Types"
import { LogRed } from "./Utils_NodeJS"

const fs = require('fs')

const tiersDirPath = './editor/builddata/'

export const GenerateBuildData = (printBeauty = true): string | undefined => {
    const tierDirs = fs.readdirSync(tiersDirPath)

    if (tierDirs.length <= 0)
        LogRed('not found any tier dir in ' + tiersDirPath)

    const tiers: Tier[] = []

    let countBuilds = 0
    let countSlots = 0
    let countError = 0

    for (let i = 0; i < tierDirs.length; i++) {
        // tier name

        const tierDirName = tierDirs[i]

        if (tierDirName.includes('.')) // this is file
            continue

        const arrTier = tierDirName.split(' ')

        if (arrTier.length !== 2)
            return 'this folder doesnt follow the rule of Tier + X name: ' + tiersDirPath + tierDirName

        const tierName = arrTier[1]

        if (tierName.length !== 1)
            return 'name of tier exceed length of 1: ' + tierName

        // builds

        const buildDirs = fs.readdirSync(tiersDirPath + tierDirName)

        if (tierDirs.length <= 0)
            LogRed('not found any build dirs in ' + tiersDirPath + tierDirName)

        const builds: Build[] = []

        for (let j = 0; j < buildDirs.length; j++) {
            const buildDirName = buildDirs[j] // also build raw name

            if (buildDirName.includes('.')) // this is file
                continue

            const slotFileNames = fs.readdirSync(tiersDirPath + tierDirName + '/' + buildDirName)

            const slotCards: SlotCard[] = []

            for (let a = 0; a < buildDirs.length; a++) {
                const slotFileName = slotFileNames[a]

                if (!slotFileName || !slotFileName.includes('.txt'))
                    continue

                const path = tiersDirPath + tierDirName + '/' + buildDirName + '/' + slotFileName
                const str = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
                const slotCardRes = ExtractSlotCardFromHTML(str, true)

                if (typeof slotCardRes === 'string') {
                    countError++
                    LogRed('can extract file: ' + path + ', error: ' + slotCardRes)
                }
                else {
                    // find same build

                    const sameIdx = slotCards.findIndex(i => IsSameSlotCard(i, slotCardRes))

                    if (sameIdx < 0)
                        slotCards.push(slotCardRes)
                    else {
                        LogRed('same slot: ' + slotCardRes.slotName, 'build : ' + buildDirName)
                    }
                }
            }

            countSlots += slotCards.length

            // fix build name

            let buildName = buildDirName.replace('Endgame', '')
            buildName = buildName.replace('Guide', '')
            buildName = buildName.replace('Build', '')

            buildName = buildName.replace('endgame', '')
            buildName = buildName.replace('guide', '')
            buildName = buildName.replace('build', '')

            buildName = buildName.trim()

            builds.push({
                name: buildName,
                slots: slotCards
            })
        }

        countBuilds += builds.length

        tiers.push({
            name: tierName,
            builds
        })
    }

    console.log('slot error count: ' + countError);
    console.log('slot count: ' + countSlots);
    console.log('build count: ' + countBuilds);
    console.log('tier count: ' + tiers.length);

    fs.writeFileSync('./assets/BuildsData.json', JSON.stringify(tiers, null, 1));

    return
}

const IsSameSlotCard = (card1: SlotCard, card2: SlotCard): boolean => {    
    const s1 = JSON.stringify(card1)
    const s2 = JSON.stringify(card2)

    const slot1: SlotCard = JSON.parse(s1)
    const slot2: SlotCard = JSON.parse(s2)

    slot1.stats.sort((a, b) => a.name.localeCompare(b.name))
    slot2.stats.sort((a, b) => a.name.localeCompare(b.name))

    const ss1 = JSON.stringify(slot1)
    const ss2 = JSON.stringify(slot2)

    return ss1 === ss2
}