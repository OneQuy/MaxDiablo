import { Check } from "./Checker";
import { GenerateAllStatName } from "./GenerateAllStatName";
import { GenerateBuildData } from "./GenerateBuildData";
import { GenerateClassData } from "./GenerateClassData";
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
    else if (IsParamExist('stats')) {
        const res = GenerateAllStatName()
        LogGreen('success')
    }
}

main()