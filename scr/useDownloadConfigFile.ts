import { useState } from "react"
import { FirebaseStorage_DownloadByGetBytesAsync } from "./common/Firebase/FirebaseStorage"
import { IsExistedAsync, ReadTextAsync } from "./common/FileUtils"
import { ToCanPrint } from "./common/UtilsTS"
import { MMKVInstance } from "react-native-mmkv-storage"
import { UniqueBuild } from "./Types"

export type FileVersionConfig = {
    uniqueBuild: number | undefined
}

export var uniqueBuilds: UniqueBuild[]

export const useDownloadConfigFile = () => {
    const [isFinished, setIsFinihed] = useState(false)

    const checkAndDownloadAsync = async (remoteVersion: FileVersionConfig, storage: MMKVInstance) => {
        const savedVersionString = await storage.getStringAsync('file_version')

        const savedVersion = savedVersionString ? JSON.parse(savedVersionString) as FileVersionConfig : undefined

        console.log('remote ver:', remoteVersion);
        console.log('saved ver:', savedVersion);

        // unique build

        const localRLP = 'configs/UniqueBuilds.json'
        const defaultPath = '../assets/UniqueBuilds.json'
        const proper = 'uniqueBuild'

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
                remoteVersion[proper] = undefined
                console.error('error when dl', localRLP, ToCanPrint(res))
            }
            else
                console.log('dl success', localRLP);
        }
        else // dont need dl
            console.log('dont need to dl', localRLP);

        const res = await ReadTextAsync(localRLP, true)

        if (res.text) { // load local success
            uniqueBuilds = JSON.parse(res.text)
            console.log('load from local success', localRLP)
        }
        else { // failed => use default
            uniqueBuilds = require(defaultPath)
            console.error('load local file fail, use default in app', localRLP)
        }

        storage.setString('file_version', JSON.stringify(remoteVersion))
        setIsFinihed(true)
    }

    return [
        isFinished,
        checkAndDownloadAsync,
    ]
}