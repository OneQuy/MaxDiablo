import { Check } from "./Checker";
import { GenerateAllStatName } from "./GenerateAllStatName";
import { GenerateBuildData } from "./GenerateBuildData";
import { GenerateClassData } from "./GenerateClassData";
import { GenerateIgnoredStats } from "./GenerateIgnoredStats";
import { GenerateUniqueBuild } from "./GenerateUniqueBuild";
import { IsParamExist, LogGreen, LogRed } from "./Utils_NodeJS";

const main = () => {
    if (IsParamExist('build')) {
        const res = GenerateBuildData(IsParamExist('beauty'));

        if (typeof res === 'string')
            LogRed('error: ' + res)
        else
            LogGreen('success')
    }
    else if (IsParamExist('check')) {
        Check()
    }
    else if (IsParamExist('class')) {
        const res = GenerateClassData()

        if (typeof res === 'string')
            LogRed(res)
        else
            LogGreen('success')
    }
    else if (IsParamExist('allstat')) {
        GenerateAllStatName()
        LogGreen('success')
    }
    else if (IsParamExist('ignorestat')) {
        GenerateIgnoredStats()
    }
    else if (IsParamExist('unique')) {
        GenerateUniqueBuild()
    }
}

main()