import { useState } from "react"
import { FirebaseStorage_DownloadByGetBytesAsync } from "./common/Firebase/FirebaseStorage"
import { IsExistedAsync } from "./common/FileUtils"
import { ToCanPrint } from "./common/UtilsTS"
import { MMKVInstance } from "react-native-mmkv-storage"

export type FileVersionConfig = {
    uniqueBuild: number | undefined
}

export const useDownloadConfigFile = () => {
    const [isFinished, setIsFinihed] = useState(false)

    const checkAndDownloadAsync = async (remoteVersion: FileVersionConfig, storage: MMKVInstance) => {
        const savedVersionString = await storage.getStringAsync('file_version')

        const savedVersion = savedVersionString ? JSON.parse(savedVersionString) as FileVersionConfig : undefined

        console.log('remote ver:', remoteVersion);

        console.log('saved ver:', savedVersion);

        // unique build

        let localRLP = 'configs/UniqueBuilds.json'
        let isExistFile = await IsExistedAsync(localRLP, true)

        console.log('is existed', localRLP, isExistFile);

        if (!savedVersion ||
            !isExistFile ||
            !savedVersion.uniqueBuild ||
            typeof remoteVersion.uniqueBuild !== 'number' ||
            savedVersion.uniqueBuild < remoteVersion.uniqueBuild) { // need download
            console.log('start download', localRLP);

            const res = await FirebaseStorage_DownloadByGetBytesAsync(
                'configs/UniqueBuilds.json',
                'configs/UniqueBuilds.json',
                true)

            if (res)
                console.error('error when dl', localRLP, ToCanPrint(res));
        }
        else // dont need dl
            console.log('dont need to dl', localRLP);

        isExistFile = await IsExistedAsync(localRLP, true)

        console.log('is existed after dl', localRLP, isExistFile);
    
        storage.setString('file_version', JSON.stringify(remoteVersion))
        setIsFinihed(true)
    }

    return [isFinished, checkAndDownloadAsync]
}