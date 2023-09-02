import React, { useState } from 'react';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  Button,
  Platform,
  SafeAreaView,
  Text
} from 'react-native';

// @ts-ignore
import { openPicker } from '@baronha/react-native-multiple-image-picker'
import { FirebaseStorage_GetDownloadURLAsync, FirebaseStorage_UploadAsync } from './scr/common/Firebase/FirebaseStorage';
import { FirebaseInit } from './scr/common/Firebase/Firebase';
import { ToCanPrint } from './scr/common/UtilsTS';

function App(): JSX.Element {
  const [status, setStatus] = useState('')
  const [resultText, setResultText] = useState('')

  const onPressUpload = async () => {
    const response = await openPicker();

    if (!response || response.lenght > 0) {
      console.error('pls only pick 1 file');
    }
    else {
      const path = Platform.OS === 'android' ? 'file://' + response[0].realPath : response[0].path;

      setStatus('Uploading...')
      setResultText('')

      const tempFilePath = 'tmpfile-' + Date.now()
      FirebaseInit()
      const uplodaErr = await FirebaseStorage_UploadAsync(tempFilePath, path)


      if (uplodaErr) {
        console.error('upload file fail', uplodaErr);
        setStatus('Upload failed: ' + ToCanPrint(uplodaErr))
        return
      }
      else
        console.log('success upload', tempFilePath);

      const getURLRes = await FirebaseStorage_GetDownloadURLAsync(tempFilePath)

      if (getURLRes.error) {
        console.error('FirebaseStorage_GetDownloadURLAsync', getURLRes.error);
        setStatus('GetURL Failed: ' + ToCanPrint(getURLRes.error))
        return
      }
      else
        console.log('get file url success', getURLRes.url);

      await detectFromImgUrl(getURLRes.url)
    }
  };

  const detectFromImgUrl = async (imgUrl: string) => {
    const options = {
      method: 'POST',
      url: 'https://cloudlabs-image-ocr.p.rapidapi.com/ocr/recognizeUrl',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '693dd75456msh921c376e306158cp12c5dbjsn32ff82c9294a',
        'X-RapidAPI-Host': 'cloudlabs-image-ocr.p.rapidapi.com'
      },
      data: {
        url: imgUrl
      }
    };

    setStatus('Processing...')

    try {
      const response = await axios.request(options);
      console.log('-------------------');
      console.log(response.data);
      setStatus('SUCCESS')
      setResultText(ToCanPrint(response.data))
    } catch (error) {
      console.error(error);
      setStatus('OCR Failed: ' + ToCanPrint(error))
    }
  };

  return (
    <SafeAreaView style={{ gap: 20 }}>
      <Button onPress={onPressUpload} title='Select File' />
      <Text style={{ fontSize: 30 }}>{status}</Text>
      <Text style={{marginHorizontal: 10}}>{resultText}</Text>
      {
        resultText === '' ? undefined :
        <Button onPress={() => Clipboard.setString(resultText)} title='Copy Result for Quy ^^' />
      }
    </SafeAreaView>
  )
}

export default App;
