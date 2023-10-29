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

        const build: UniqueBuild = {
            name: section[0].substring(1),
            upperSlotNames: section.slice(1)
        }

        builds.push(build)
    }

    fs.writeFileSync('./assets/UniqueBuilds.json', JSON.stringify(builds, null, 1));
    
    LogGreen('success')
}