// https://firebase.google.com/docs/storage/web/download-files

import { getStorage, ref, getDownloadURL, getBytes, uploadBytes, deleteObject } from "firebase/storage";
import { ErrorObject_FileNotFound, GetTempFileRLP } from "../Utils"
import { DeleteFileAsync, DownloadFileAsync, DownloadFile_GetJsonAsync, GetFLPFromRLP, IsExistedAsync, WriteTextAsync } from "../FileUtils";
import { ArrayBufferToBase64String, GetBlobFromFLPAsync, TimeOutError } from "../UtilsTS";

var storage = null;

function CheckAndInit() {
    if (!storage)
        storage = getStorage();
}

const DefaultGetDownloadURLTimeOut = 10000;

// Usage:  
// FirebaseStorage_GetDownloadURL('data/warm/content/0/33.mp4', (url)=>{ console.log(url); }, (error)=>{ console.error(error); }); 
export function FirebaseStorage_GetDownloadURL(relativePath, urlCallback, errorCallback) {
    CheckAndInit();
    const starsRef = ref(storage, relativePath);

    getDownloadURL(starsRef)
        .then((url) => {
            if (urlCallback) {
                urlCallback(url);
            }
        })
        .catch((error) => {
            // https://firebase.google.com/docs/storage/web/handle-errors
            if (errorCallback) {
                errorCallback(error);
            }
        });
}

/**
return { url, error };
*/
export async function FirebaseStorage_GetDownloadURLAsync(relativePath, getDownloadURLTimeOut = DefaultGetDownloadURLTimeOut) {
    try {
        CheckAndInit();
        let starsRef = ref(storage, relativePath);
        let url;

        if (getDownloadURLTimeOut > 0) {
            const timeOutPromise = new Promise((resolve) => setTimeout(resolve, getDownloadURLTimeOut, TimeOutError))
            url = await Promise.any([getDownloadURL(starsRef), timeOutPromise]);
        }
        else
            url = await getDownloadURL(starsRef);

        if (url === TimeOutError)
            throw TimeOutError
        else {
            return {
                url,
                error: null,
            };
        }
    }
    catch (error) {
        return {
            url: null,
            error
        };;
    }
}

/**
 * @returns null if sucess, otherwise error
 */
export async function FirebaseStorage_DeleteAsync(relativePath) {
    try {
        CheckAndInit();
        const starsRef = ref(storage, relativePath);
        await deleteObject(starsRef);
        return null;
    }
    catch (error) {
        return error;
    }
}

/**
 * @returns null if success, otherwise error
 */
export async function FirebaseStorage_DownloadByGetBytesAsync(relativeFirebasePath, savePath, isRLP) {
    try {
        CheckAndInit();
        const theRef = ref(storage, relativeFirebasePath);
        const res = await getBytes(theRef)
        const str = ArrayBufferToBase64String(res);
    
        await WriteTextAsync(savePath, str, isRLP, 'base64');        
        
        return null
    } catch (error) {
        return error;
    }
}

/**
 * @returns null if success, otherwise error
 * @MAYBE error could be unknown type OR look like this: {\"code\":\"storage/retry-limit-exceeded\",\"customData\":{\"serverResponse\":null},\"name\":\"FirebaseError\",\"status_\":0,\"_baseMessage\":\"Firebase Storage: Max retry time for operation exceeded, please try again. (storage/retry-limit-exceeded)\"}"
 */
export async function FirebaseStorage_DownloadByGetURLAsync(relativeFirebasePath, savePath, isRLP, process = any, getDownloadURLTimeOut = DefaultGetDownloadURLTimeOut) {
    try {
        // get url

        let urlResult = await FirebaseStorage_GetDownloadURLAsync(relativeFirebasePath, getDownloadURLTimeOut);

        if (urlResult.error) {
            return urlResult.error;
        }

        // downoad

        let result = await DownloadFileAsync(urlResult.url, savePath, isRLP, process);
        return result;
    }
    catch (error) {
        return error;
    }
}

/**
 * @returns null if success, error if fail
 */
export async function FirebaseStorage_UploadAsync(relativeFirebasePath, fileFLP) // main 
{
    try {
        let fileExists = await IsExistedAsync(fileFLP, false);

        if (!fileExists) {
            return ErrorObject_FileNotFound("Local file not found: " + fileFLP);
        }

        CheckAndInit();
        const theRef = ref(storage, relativeFirebasePath);
        const blob = await GetBlobFromFLPAsync(fileFLP);
        await uploadBytes(theRef, blob);

        return null;
    }
    catch (error) {
        return error
    }
}

/**
 * 
 * @returns ErrorObject_Empty if success, ErrorObject_NoIdentity(error) if fail
 */
export async function FirebaseStorage_UploadTextAsFileAsync(relativeFirebasePath, text) // sub 
{
    // write to local file

    let tempRLP = GetTempFileRLP(true);
    let res = await WriteTextAsync(tempRLP, text);

    // upload this file

    if (res) // failed
    {
        return res;
    }

    let tempFLP = GetFLPFromRLP(tempRLP, true);
    res = await FirebaseStorage_UploadAsync(relativeFirebasePath, tempFLP);

    // delete file

    var delErr = await DeleteFileAsync(tempFLP, false)

    if (delErr)
        console.error('delete tempFLP after upload error: ' + delErr);

    // return

    return res;
}

export async function FirebaseStorage_DownloadAndReadJsonAsync(firebaseRelativePath, saveLocalRelativePath, getDownloadURLTimeOut = DefaultGetDownloadURLTimeOut) {
    // get full URL

    var result = await FirebaseStorage_GetDownloadURLAsync(firebaseRelativePath, getDownloadURLTimeOut);

    if (!result.url) {
        return {
            json: null,
            error: result.error
        };
    }

    // download json & read 

    result = await DownloadFile_GetJsonAsync(result.url, saveLocalRelativePath)

    if (!result.json) {
        return {
            json: null,
            error: result.error
        };
    }

    return {
        json: result.json,
        error: null
    };
}