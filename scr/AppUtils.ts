import { UniqueBuild } from "./Types"

export const GetSuitBuildsForUnique = (resultTxt: string, uniqueBuilds: UniqueBuild[]): string[] => {
    resultTxt = resultTxt.toLowerCase()

    if (!resultTxt.includes('unique'))
        return []
    
    const arr: string[] = []

    for (let ibuild = 0; ibuild < uniqueBuilds.length; ibuild++) {
        const build = uniqueBuilds[ibuild]

        for (let iUpperName = 0; iUpperName < build.upperSlotNames.length; iUpperName++) {
            const upperNameLower = build.upperSlotNames[iUpperName].toLowerCase()

            // include whole name

            if (resultTxt.includes(upperNameLower)) {
                arr.push(build.name)
                break
            }

            // break in lines

            const words = upperNameLower.split(' ')
            let includeAll = true

            for (let iword = 0; iword < words.length; iword++) {
                if (!resultTxt.includes(words[iword])) {
                    includeAll = false
                    break
                }
            }

            if (includeAll) {                
                arr.push(build.name)
                break
            }
        }
    }

    return arr
}