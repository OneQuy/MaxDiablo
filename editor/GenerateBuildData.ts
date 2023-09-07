const fs = require('fs')

const tiersDirPath = './editor/builddata'

export const GenerateBuildData = () => {
    const items = fs.readdirSync(tiersDirPath)

    console.log(items);
    
}