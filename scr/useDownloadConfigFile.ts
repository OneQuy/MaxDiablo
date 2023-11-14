import { useState } from "react"
import { FirebaseStorage_DownloadByGetBytesAsync } from "./common/Firebase/FirebaseStorage"
import { IsExistedAsync, ReadTextAsync } from "./common/FileUtils"
import { ToCanPrint } from "./common/UtilsTS"
import { MMKVInstance } from "react-native-mmkv-storage"
import { UniqueBuild } from "./Types"

const files = [
    [
        'configs/UniqueBuilds.json',
        '../assets/UniqueBuilds.json',
        'uniqueBuild',
    ],

    [
        'configs/AllStats.json',
        '../assets/AllStats.json',
        'allStat',
    ],
]

export type FileVersionConfig = {
    uniqueBuild: number | undefined,
    allStat: number | undefined,
}

export var uniqueBuilds: UniqueBuild[]

export var allStatsData_IgnoredCase: string[] // for valid stat name

export const useDownloadConfigFile = () => {
    const [isFinished, setIsFinihed] = useState(false)

    const checkAndDownloadAsync = async (remoteVersion: FileVersionConfig, storage: MMKVInstance) => {
        const savedVersionString = await storage.getStringAsync('file_version')

        const savedVersion = savedVersionString ? JSON.parse(savedVersionString) as FileVersionConfig : undefined

        console.log('remote ver:', remoteVersion);
        console.log('saved ver:', savedVersion);

        for (let i = 0; i < files.length; i++) {
            console.log('-------------------------------------');

            const [localRLP, defaultPath, prop] = files[i]
            const proper = prop as keyof typeof savedVersion

            let isExistFile = await IsExistedAsync(localRLP, true)

            if (!savedVersion ||
                !isExistFile ||
                !savedVersion[proper] ||
                typeof remoteVersion[proper] !== 'number' ||
                savedVersion[proper] < remoteVersion[proper]) { // need download
                console.log('start download', localRLP);

                const res = await FirebaseStorage_DownloadByGetBytesAsync(
                    localRLP,
                    localRLP,
                    true)

                if (res) { // error
                    remoteVersion[proper as keyof typeof remoteVersion] = undefined
                    console.error('error when dl', localRLP, ToCanPrint(res))
                }
                else
                    console.log('dl success', localRLP);
            }
            else // dont need dl
                console.log('dont need to dl', localRLP);

            const res = await ReadTextAsync(localRLP, true)

            if (res.text) { // load local success
                if (prop === 'uniqueBuild')
                    uniqueBuilds = JSON.parse(res.text)
                else if (prop === 'allStat') {
                    allStatsData_IgnoredCase = JSON.parse(res.text)
                    allStatsData_IgnoredCase = allStatsData_IgnoredCase.map(name => name.toLowerCase())
                }
                else
                    throw '[ne]' + prop

                console.log('load from local success', localRLP)
            }
            else { // failed => use default
                if (prop === 'uniqueBuild')
                    uniqueBuilds = require('../assets/UniqueBuilds.json')
                else if (prop === 'allStat') {
                    allStatsData_IgnoredCase = require('../assets/AllStats.json')
                    allStatsData_IgnoredCase = allStatsData_IgnoredCase.map(name => name.toLowerCase())
                }
                else
                    throw '[ne] ' + prop

                console.error('load local file fail, use default in app', localRLP)
            }
        }

        storage.setString('file_version', JSON.stringify(remoteVersion))
        setIsFinihed(true)
    }

    return [
        isFinished,
        checkAndDownloadAsync,
    ]
}