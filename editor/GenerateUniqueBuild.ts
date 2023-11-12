import { UniqueBuild } from "./Types";
import { LogGreen, SplitSectionsFromText } from "./Utils_NodeJS";

const fs = require('fs')

export const GenerateUniqueBuild = () => {
    const text = fs.readFileSync('./editor/Unique/Unique.txt', 'utf-8');

    const arrSessions = SplitSectionsFromText(text)

    const builds: UniqueBuild[] = []

    for (let i = 0; i < arrSessions.length; i++) {
        const section = arrSessions[i]

        if (section[1].toLowerCase().includes('none'))
            continue

        const buildName = section[0].substring(1)
            .replace('Build', '')
            .replace('build', '')
            .trim()

        let build: UniqueBuild | undefined
        const upperSlotNames = section.slice(1)

        for (let j = 0; j < upperSlotNames.length; j++) {
            upperSlotNames[j] = upperSlotNames[j].trim()
        }

        build = builds.find(i => i.name === buildName)

        if (build) {
            upperSlotNames.forEach(element => {
                // @ts-ignore
                const idx = build.upperSlotNames.findIndex(e => e.toLowerCase() === element.toLowerCase())

                if (idx < 0)
                    build?.upperSlotNames.push(element)
            });

            // console.log('(no worry) duplicateddd');
        }
        else {
            build = {
                name: buildName,
                upperSlotNames,
            } as UniqueBuild

            builds.push(build)
        }
    }

    builds.sort((a, b) => a.name.localeCompare(b.name))

    fs.writeFileSync('./assets/UniqueBuilds.json', JSON.stringify(builds, null, 1));

    LogGreen('success')
}