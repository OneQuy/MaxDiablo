import AsyncStorage from "@react-native-async-storage/async-storage"

const Key = 'storage_log'

var lines: string | undefined = undefined

export const StorageLog_LogAsync = async (...args: any[]) => {
    // args.unshift(new Date())
    const s = args.join(' | ')

    await StorageLog_GetAsync() // load

    if (lines)
        lines += ('\n' + s)
    else
        lines = s

    await AsyncStorage.setItem(Key, lines)
}

export const StorageLog_GetAsync = async (): Promise<string> => {
    if (lines !== undefined) // loaded
        return (new Date() + '\n\n' + lines)

    const res = await AsyncStorage.getItem(Key)
    lines = res === null ? '' : res

    return (new Date() + '\n\n' + lines)
}

export const StorageLog_ClearAsync = async () => {
    await AsyncStorage.removeItem(Key)
    lines = ''
}

