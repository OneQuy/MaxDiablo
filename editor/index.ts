import { Check } from "./Checker";
import { GenerateBuildData } from "./GenerateBuildData";
import { GenerateClassData } from "./GenerateClassData";
import { IsParamExist, LogGreen, LogRed } from "./Utils_NodeJS";

const main = () => {
    if (IsParamExist('build')) {
        const res = GenerateBuildData(IsParamExist('beauty'));

        if (typeof res === 'string')
            LogRed('error: ' + res)
        else
            LogGreen('Success')

    }
    else if (IsParamExist('check')) {
        Check()
    }
    else if (IsParamExist('class')) {
        GenerateClassData()
    }
}

main()