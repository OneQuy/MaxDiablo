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
import { ExtractSlotCard } from './scr/OCRUtils';


const text = "DIRE OMEN\nAncestral Rare Amulet\n733 Item Power\n• 17.4% Resistance to All Elements\n[17.4]%\n5.6% Cooldown Reduction [4.2-7.01%\n• 16.5% Mana Cost Reduction [9.5-\n16.51%\n+ +15.0% Movement Speed [10.5-17.51%\n5+2 Ranks of the Hoarfrost Passive [1-\n2] (Sorcerer Only)\nEmpty Vicious malignant socket\nRequires Level 80\nSell Value: 21,685"
const text1 = "DOOM CASQUE OF\nMIGHT\nAncestral Legendary Helm\n800+25 Item Power\n◆ Upgrades: 5/5\n1,031 Armor\nD\n+20 Maximum Essence [8 - 20]\n+1,211 Maximum Life [559 - 1,211]\n+7.2% Total Armor [3.0 - 7.2]%\n10.3 % Cooldown Reduction [6.2 -\n10.3]%\n★ Basic Skills grant 20% Damage\nReduction for 6.0 [2.0-6.0] seconds.\n◆\nD\n◆\nD\nAspect unlocked by completing\nDark Ravine in Dry Steppes\n4.0% Maximum Life\nRELATED P\nEndgame Bone Spear Build\n*A tier c\nSANCTU"
const text2 = "S\nfb\nX9gag\nORDER BURDEN\nAncestral Rare Amulet\n749 Item Power\n17.8% Resistance to All Elements\n[17.8]%\n◆ 5.2% Damage Reduction [3.1-7.3]%\n◆ +2 Ranks of All Companion Skills [1 -\n2]\n+7.7% Total Armor while in Werewolf\nForm [4.9-10.5]%\n◆ +2 Ranks of the Envenom Passive [1 -\n2] (Druid Only)\nEmpty Devious malignant socket\n1 dev\nRequires Level 80\n8\nG"
const text3 = "INTENTAR\nETERNITY OFFER\nAncestral Rare Ring\n795 Item Power\n◆ 25.0% Fire Resistance [25.0]%\n◆ 25.0% Poison Resistance [25.01%\n+ +17.5% Critical Strike Damage [10.5 -\n17.5]%\n+16.0% Fortify Generation [15.0-\n22.01%\n+ +6.0% Lucky Hit Chance [3.2-6.01%\n++3.8% Critical Strike Chance [1.8-\n5.01%\nEmpty Vicious malignant socket\nTake\nTimals\nRequires Level 80\nSell Value: 24,995"

function App(): JSX.Element {
  const [status, setStatus] = useState('')
  const [resultText, setResultText] = useState('')

  const onPressUpload = async (num: number) => {

    let res

    if (num === 0)
      res = ExtractSlotCard(text)
    if (num === 1)
      res = ExtractSlotCard(text1)
    if (num === 2)
      res = ExtractSlotCard(text2)
    if (num === 3)
      res = ExtractSlotCard(text3)
    console.log(JSON.stringify(res, null, 1));
    
    return

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
      <Button onPress={() => onPressUpload(0)} title='Select File' />
      <Button onPress={() => onPressUpload(1)} title='Select File' />
      <Button onPress={() => onPressUpload(2)} title='Select File' />
      <Button onPress={() => onPressUpload(3)} title='Select File' />
      <Text style={{ fontSize: 30 }}>{status}</Text>
      <Text style={{ marginHorizontal: 10 }}>{resultText}</Text>
      {
        resultText === '' ? undefined :
          <Button onPress={() => Clipboard.setString(resultText)} title='Copy Result for Quy ^^' />
      }
    </SafeAreaView>
  )
}

export default App;
