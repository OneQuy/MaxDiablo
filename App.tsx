import React, { useCallback, useRef, useState } from 'react';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';

import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// @ts-ignore
import { openPicker } from '@baronha/react-native-multiple-image-picker'
import { FirebaseStorage_GetDownloadURLAsync, FirebaseStorage_UploadAsync } from './scr/common/Firebase/FirebaseStorage';
import { FirebaseInit } from './scr/common/Firebase/Firebase';
import { RequestCameraPermissionAsync, ToCanPrint } from './scr/common/UtilsTS';
import { FontSize, Outline, windowSize } from './scr/AppConstant';
import { CameraOptions, launchCamera } from 'react-native-image-picker';
import { ExtractSlotCard } from './scr/OCRUtils';
import { SlotCard } from './scr/Types';

// const OcrApiKey = '693dd75456msh921c376e306158cp12c5dbjsn32ff82c9294a' // onequy
const OcrApiKey = 'cb787495e0msh402608403c87171p1d1da6jsn08135e305d01' // mquy

function App(): JSX.Element {
  const [status, setStatus] = useState('')
  const userImgUri = useRef('')
  const slotCardRef = useRef<SlotCard | undefined>()
  const ocrResult = useRef('')

  const tmparr = [1, 2, 3, 4, 5, 6]

  const onPressUpload = useCallback(async () => {
    try {
      const response = await openPicker({
        mediaType: 'mediaType',
        singleSelectedMode: true,
        selectedColor: '#000000',
      });

      if (!response) {
        Alert.alert('Hãy chọn lại', 'Vui lòng chọn một hình!')
      }
      else {
        if ((Platform.OS === 'android' && !response.realPath) || (Platform.OS !== 'android' && !response.path)) {
          Alert.alert('Hãy chọn lại', 'Vui lòng chọn một hình!')
          return
        }

        const path = Platform.OS === 'android' ? 'file://' + response.realPath : response.path;
        onSelectedImg(path)
      }
    }
    catch (e) {
    }
  }, [])

  const onPressLogStatsFromTextOCRInClipboard = useCallback(async () => {
    const res = ExtractSlotCard(await Clipboard.getString())

    console.log(JSON.stringify(res, null, 1));

  }, [])

  const onPressTakeCamera = useCallback(async () => {
    const camRequestRes = await RequestCameraPermissionAsync()

    if (camRequestRes !== true) {
      Clipboard.setString('cam req ' + ToCanPrint(camRequestRes))
      return
    }

    const result = await launchCamera({
      saveToPhotos: false,
      cameraType: 'back',
      mediaType: 'photo'
    } as CameraOptions)

    Clipboard.setString(ToCanPrint(result))

    if (!result || !result.assets)
      return

    const path = result.assets[0].uri

    if (!path)
      return

    onSelectedImg(path)
  }, [])

  const onPressCopyOCRResult = useCallback(async () => {
    if (!ocrResult.current)
      return

    Clipboard.setString(ocrResult.current)
  }, [])

  const onSelectedImg = useCallback(async (path: string) => {
    slotCardRef.current = undefined
    userImgUri.current = path
    ocrResult.current = ''

    setStatus('Uploading...')

    const tempFilePath = 'tmpfile-' + Date.now()
    FirebaseInit()
    const uplodaErr = await FirebaseStorage_UploadAsync(tempFilePath, path)

    if (uplodaErr) {
      console.error('upload file fail', uplodaErr);
      setStatus('Upload failed: ' + ToCanPrint(uplodaErr))
      return
    }

    const getURLRes = await FirebaseStorage_GetDownloadURLAsync(tempFilePath)

    if (getURLRes.error) {
      console.error('FirebaseStorage_GetDownloadURLAsync', getURLRes.error);
      setStatus('GetURL Failed: ' + ToCanPrint(getURLRes.error))
      return
    }

    await detectFromImgUrl(getURLRes.url)
  }, [])

  const detectFromImgUrl = useCallback(async (imgUrl: string) => {
    const options = {
      method: 'POST',
      url: 'https://cloudlabs-image-ocr.p.rapidapi.com/ocr/recognizeUrl',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': OcrApiKey,
        'X-RapidAPI-Host': 'cloudlabs-image-ocr.p.rapidapi.com'
      },
      data: {
        url: imgUrl
      }
    };

    setStatus('Processing...')

    try {
      const response = await axios.request(options);
      ocrResult.current = response.data
      const result = response.data?.result

      if (!result)
        throw 'No have result'

      const extractRes = ExtractSlotCard(result)

      if (typeof extractRes === 'object') {
        slotCardRef.current = extractRes

        await Clipboard.setString(JSON.stringify(extractRes, null, 1))

        setStatus('SUCCESS')
      }
      else
        setStatus('FAIL: ' + extractRes)
    } catch (error) {
      console.error(error);
      setStatus('OCR Failed: ' + ToCanPrint(error))
    }
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, gap: Outline.Gap, backgroundColor: 'black' }}>
      <StatusBar barStyle={'light-content'} backgroundColor={'black'} />
      {/* title */}
      <View style={{ marginHorizontal: Outline.Margin, flexDirection: 'row', marginTop: 10, gap: Outline.Gap, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 20, color: 'tomato', fontWeight: 'bold' }}>Diablo [IV] Senpai</Text>
        <Text style={{ fontSize: 15, color: 'white' }}>(version 0.0.1)</Text>
      </View>
      <ScrollView style={{ marginHorizontal: Outline.Margin }}>
        {/* select photo btns */}
        <Text style={{ fontSize: 15, color: 'white', marginBottom: Outline.Margin }}>Chọn hình để rate:</Text>
        <View style={{ flexDirection: 'row', gap: Outline.Gap, justifyContent: 'center' }}>
          <TouchableOpacity onPress={onPressUpload} style={{ flex: 1, borderRadius: 5, padding: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'black', fontSize: FontSize.Normal }}> Chọn từ thư viện</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressTakeCamera} style={{ flex: 1, borderRadius: 5, padding: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'black', fontSize: FontSize.Normal }}>Chụp hình</Text>
          </TouchableOpacity>
        </View>
        {/* user upload image info */}
        <View style={{ height: windowSize.height * 0.4, marginTop: Outline.Gap, flexDirection: 'row' }}>
          {/* image */}
          <View style={{ flex: 1 }}>
            {
              userImgUri.current === '' ? undefined :
                <Image style={{ width: '100%', height: '100%' }} resizeMode='contain' source={{ uri: userImgUri.current }} />
            }
          </View>
          {/* info */}
          {
            !slotCardRef.current ? undefined :
              <View style={{ marginLeft: Outline.Margin, flex: 1 }}>
                <Text style={{ color: 'tomato', fontSize: FontSize.Normal }}>{slotCardRef.current.slotName}</Text>
                <ScrollView contentContainerStyle={{ gap: Outline.Gap, marginTop: Outline.Margin }}>
                  {
                    slotCardRef.current.stats.map((item, index) => {
                      return <View key={index}>
                        <Text style={{ color: 'white' }}>{item.name}</Text>
                        <Text style={{ color: 'white' }}>
                          {item.value}{item.isPercent ? '%' : ''}
                          <Text style={{ color: 'gray' }}>
                            {'  '}[{item.min}-{item.max}]
                          </Text>
                        </Text>
                      </View>
                    })
                  }
                </ScrollView>
              </View>
          }
        </View>
        {/* status */}
        {
          userImgUri.current === '' || ocrResult.current ? undefined :
            <View style={{ gap: Outline.Gap, marginTop: Outline.Gap, alignItems: 'center' }}>
              <ActivityIndicator color={'tomato'} />
              <Text style={{ color: 'white' }}>{status}</Text>
            </View>
        }
        {
          <View style={{ marginTop: Outline.Gap, alignItems: 'center' }}>
            <View style={{ backgroundColor: 'tomato', padding: 10, borderRadius: 10 }} >
              <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>GOOD</Text>
            </View>
          </View>
        }
        {
          <View style={{ marginTop: Outline.Gap, alignItems: 'center', gap: Outline.Gap }}>
            {
              tmparr.map((item, index) => {
                return <View key={item} style={{ gap: Outline.Gap, width: '100%', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: 'white' }}>
                  <Text style={{ color: 'yellow', fontSize: FontSize.Big }}>Build Name</Text>
                  <View style={{ gap: Outline.Gap }}>
                    <Text style={{ color: 'white' }}>15% Damage [5-10]%</Text>
                    <Text style={{ color: 'white' }}>15% Damage [5-10]%</Text>
                    <Text style={{ color: 'white' }}>15% Damage [5-10]%</Text>
                  </View>
                </View>
              })
            }
          </View>
        }
        {/* dev btns */}
        <TouchableOpacity style={{ marginTop: Outline.Gap * 5 }} onPress={onPressLogStatsFromTextOCRInClipboard}>
          <Text style={{ color: 'gray' }}>[dev] log stats from text OCR in Clipboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ marginTop: Outline.Gap }} onPress={onPressCopyOCRResult}>
          <Text style={{ color: 'gray' }}>[dev] copy ocr result</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default App;
