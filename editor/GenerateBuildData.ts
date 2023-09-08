import { ExtractSlotCardFromHTML } from "./ExtractSlotCardFromHTML"
import { Build, SlotCard, Tier } from "./Types"
import { LogRed } from "./Utils_NodeJS"

const fs = require('fs')

const tiersDirPath = './editor/builddata/'

export const GenerateBuildData = (): string | undefined => {
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
            const buildDirName = buildDirs[j] // also build name

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
                else
                    slotCards.push(slotCardRes)
            }

            countSlots += slotCards.length

            builds.push({
                name: buildDirName,
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
    
    fs.writeFileSync('./editor/builddata/Data.json', JSON.stringify(tiers, null, 1));
    return
}