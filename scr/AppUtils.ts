import { UniqueBuild } from "./Types"

export const GetSuitBuildsForUnique = (resultTxt: string, uniqueBuilds: UniqueBuild[]): string[] => {
    resultTxt = resultTxt.toLowerCase()

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
        }
    }

    return arr
}