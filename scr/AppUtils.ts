import { Lang } from "./Language"
import { UniqueBuild } from "./Types"
import { RoundNumber } from "./common/Utils"

export const defineRateType_Unique = (lang: Lang) => GetRateTypeByScore(0.8, lang)
export const defineRateType_UberUnique = (lang: Lang) => GetRateTypeByScore(1, lang)

/**
 * @returns [color, text]
 */
export const GetRateTypeByScore = (rawFloatScore: number, lang: Lang) => {
    rawFloatScore = RoundNumber(rawFloatScore, 2)

    if (rawFloatScore >= 1) // perfect
        return ['tomato', lang.perfect]
    else if (rawFloatScore >= 0.75) // very good
        return ['gold', lang.very_good]
    else if (rawFloatScore >= 0.5) // good
        return ['moccasin', lang.good]
    else if (rawFloatScore >= 0.25) // normal
        return ['paleturquoise', lang.normal]
    else // trash
        return ['dodgerblue', lang.trash]
}

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

const uberUniqueUpperNames = [
    'Doombringer',

    'The Grandfather',

    'Melted Heart of Selig',

    "Andariel's Visage",

    'Harlequin Crest',

    'Ring of Starless Skies',

    'Ahavarion, Spear of Lycander',
]

export const IsUberUnique = (resultTxt: string): boolean => {
    resultTxt = resultTxt.toLowerCase()

    if (!resultTxt.includes('unique'))
        return false

    for (let iUpperName = 0; iUpperName < uberUniqueUpperNames.length; iUpperName++) {
        const upperNameLower = uberUniqueUpperNames[iUpperName].toLowerCase()

        // include whole name

        if (resultTxt.includes(upperNameLower)) {
           return true
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
            return true
        }
    }

    return false
}