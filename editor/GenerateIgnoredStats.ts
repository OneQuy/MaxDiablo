import { GetStatFromTypeOfClassData } from "./GenerateClassData";
import { LogRed } from "./Utils_NodeJS";

const fs = require('fs')

export const GenerateIgnoredStats = () => {
    const str: string = fs.readFileSync('./editor/IgnoredStats/RawIgnoredStats.txt', { encoding: 'utf8', flag: 'r' });

    const lines: string[] = str.split('\n')
    const arr: string[] = [] 

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()    

        const stat = GetStatFromTypeOfClassData(line)

        if (stat) { 
            arr.push(stat.name.toLowerCase())
        }
        else {
            LogRed('can not extract stat of line: ' + line)
        }
    }

    // if (true)
    fs.writeFileSync('./assets/IgnoredStats.json', JSON.stringify(arr, null, 1));
    // else
    //     fs.writeFileSync('./assets/IgnoredStats.json', JSON.stringify(arr));
}