// https://github.com/itinance/react-native-fs

// install:
// npm install react-native-fs
// npx pod-install ios

import RNFS, { DownloadProgressCallbackResult } from "react-native-fs";
import { LoadJsonFromURLAsync, TempDirName } from "./Utils";
import { Platform } from "react-native";

/**
 * @returns null if success, otherwise error
 */
async function CheckAndMkDirOfFilepathAsync(fullFilepath: string): Promise<null | NonNullable<any>> {
  try {
    var idx = fullFilepath.lastIndexOf('/');
    var dirFullPath = fullFilepath.substring(0, idx);
    var dirIsExist = await RNFS.exists(dirFullPath);

    if (!dirIsExist)
      await RNFS.mkdir(dirFullPath);

    return null;
  } catch (e) {
    return e;
  }
}

/**
 * usage: const res = await WriteTextAsync('dataDir/file.txt', 'losemp text losemp text');
 * @returns null if success, otherwise error
 */
export async function WriteTextAsync(path: string, text: string | null, isRLP: boolean = true, encode?: string): Promise<null | any> {
  try {
    if (!path) {
      throw 'url or saveLocalPath is invalid to WriteTextAsync';
    }

    path = isRLP ? RNFS.DocumentDirectoryPath + '/' + path : path;

    // check & create dir first

    var res = await CheckAndMkDirOfFilepathAsync(path);

    if (res)
      throw 'can not write file, error when CheckAndMkDirOfFilepathAsync: ' + res;

    // write
    
    await RNFS.writeFile(path, text ? text : '', encode);

    return null;
  }
  catch (e) {
    return e;
  }
}

/**
 * usage: const res = await ReadTextAsync('dataDir/file.txt');
 * @success return {text: text, error: null}
 * @error return {text: null, error: error}
 */
export async function ReadTextAsync(path: string, isRLP: boolean = true): Promise<{ text: string | null, error: null | any }> {
  try {
    if (!path) {
      throw 'path is invalid to ReadTextAsync';
    }

    path = isRLP ? RNFS.DocumentDirectoryPath + '/' + path : path;

    if (!await RNFS.exists(path)) {
      return {
        text: null,
        error: 'file not found'
      }
    }

    var text = await RNFS.readFile(path);

    return {
      text,
      error: null
    }
  }
  catch (e) {
    return {
      text: null,
      error: e
    }
  }
}

/**
 * usage: const res = await DeleteAsync('dataDir/file.txt');
 * @work both dir & file
 * @returns null if not existed or deleted success, otherwise error
 * @note: recursively deletes directories
 */
export async function DeleteFileAsync(path: string, isRLP: boolean = true): Promise<null | any> {
  try {
    if (!path) {
      throw 'path is null/underfined';
    }

    path = isRLP ? RNFS.DocumentDirectoryPath + '/' + path : path;
    var isExist = await RNFS.exists(path);

    if (isExist)
      await RNFS.unlink(path);

    return null;
  }
  catch (e) {
    return e;
  }
}

/**
 * @returns null if not existed or deleted success, otherwise error
 */
export async function DeleteTempDirAsync() {
  return await DeleteFileAsync(TempDirName, true);
}

export async function IsExistedAsync(path: string, isRLP: boolean = true): Promise<boolean> {
  try {
    if (!path) {
      throw 'path is null/underfined';
    }

    path = isRLP ? RNFS.DocumentDirectoryPath + '/' + path : path;
    return await RNFS.exists(path);
  }
  catch (e) {
    throw 'check IsExisted failed at path: ' + path;
  }
}

/**
 * usage: const res = await DownloadFileAsync('fileurl', 'dataDir/file.txt');
 * @returns null if success, otherwise error
 */
export async function DownloadFileAsync(
  url: string,
  saveLocalPath: string,
  isRLP: boolean = true,
  progress?: (p: DownloadProgressCallbackResult) => void): Promise<null | NonNullable<any>> {
  try {
    if (!url || !saveLocalPath) {
      throw 'url or saveLocalPath is invalid to download';
    }

    saveLocalPath = isRLP ? RNFS.DocumentDirectoryPath + '/' + saveLocalPath : saveLocalPath;

    // check & create dir first

    var res = await CheckAndMkDirOfFilepathAsync(saveLocalPath);

    if (res)
      throw 'can not download file, error when CheckAndMkDirOfFilepathAsync: ' + res;

    // download
    
    res = await RNFS.downloadFile({
      fromUrl: url,
      toFile: saveLocalPath,
      begin: () => {},
      progress
    }).promise;

    if (res.statusCode !== 200) {
      throw '[' + url + ']' + ' downloaded failed, code: ' + res.statusCode;
    }

    return null;
  }
  catch (e) {
    return e;
  }
}

export async function DownloadFile_GetJsonAsync(url: string, saveLocalRelativeFilepath: string) {
  // get json from url

  var res = await LoadJsonFromURLAsync(url);

  if (res.json) // sucess
  {
    // write to local

    var s = JSON.stringify(res.json);
    var writeFileResObj = await WriteTextAsync(saveLocalRelativeFilepath, s);

    if (writeFileResObj === null) // success
    {
      return {
        json: res.json,
        error: null
      };
    }
    else // failed
    {
      return {
        json: res.json,
        error: writeFileResObj
      };
    }
  }
  else // failed
  {
    return {
      json: null,
      error: res.error
    };
  }
}

export function GetFLPFromRLP(rlp: string, checkAddFileAndSplashIfAndroid?: boolean): string {
  if (Platform.OS === 'android' && checkAddFileAndSplashIfAndroid === true)
    return 'file://' + RNFS.DocumentDirectoryPath + '/' + rlp;
  else
    return RNFS.DocumentDirectoryPath + '/' + rlp;
}