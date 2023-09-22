import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Build, Classs, SlotCard, SlotName, SlotOfClasses, Stat, Tier } from './scr/Types';
import { IsExistedAsync } from './scr/common/FileUtils';
// import { CheckAndInitAdmobAsync } from './scr/common/Admob';
// import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// const adUnitId = true ? TestIds.INTERSTITIAL : (Platform.OS === 'android' ? 'ca-app-pub-9208244284687724/8105396391' : 'ca-app-pub-9208244284687724/4249911866');

// const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
//   requestNonPersonalizedAdsOnly: true,
//   keywords: ['fashion', 'clothing'],
// });

// const OcrApiKey = '693dd75456msh921c376e306158cp12c5dbjsn32ff82c9294a' // onequy
// const OcrApiKey = 'cb787495e0msh402608403c87171p1d1da6jsn08135e305d01' // mquy
const OcrApiKey = 'b0212db20fmshab56ffa20297e43p19cf45jsn285094cfd071' // phuong ly

const jsonPackage = require('./package.json')
const buildsData: Tier[] = require('./assets/BuildsData.json')
const classesData: SlotOfClasses[] = require('./assets/ClassesData.json')

// core skill
// crit dam
// all stat
// vernerbla

const DefaultGoodStats = [
  'Core Skill Damage',
  'Critical Strike Damage',
  'All Stats',
  'Vulnerable Damage',
]

function App(): JSX.Element {
  const [status, setStatus] = useState('')
  const userImgUri = useRef('')
  const slotCardRef = useRef<SlotCard | undefined>()
  const ocrResult = useRef('')
  const rateText = useRef('...')
  const suitBuilds = useRef<[Tier, Build, SlotCard, number][]>()

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
      console.error('catch' + e);
    }
  }, [])

  const onPressLogStatsFromTextOCRInClipboard = useCallback(async () => {
    const txt = await Clipboard.getString()
    const res = ExtractSlotCard(txt)

    console.log(JSON.stringify(res))
    console.log(JSON.stringify(res, null, 1));

    onGotOcrResultText(txt)
  }, [])

  const onPressTakeCamera = useCallback(async () => {
    const camRequestRes = await RequestCameraPermissionAsync()

    if (camRequestRes !== true) {
      Alert.alert('Thiếu quyền truy cập Camera!', 'Vui lòng cấp quyền truy cập')
      return
    }

    const result = await launchCamera({
      saveToPhotos: false,
      cameraType: 'back',
      mediaType: 'photo'
    } as CameraOptions)

    if (!result || !result.assets)
      return

    const path = result.assets[0].uri

    if (!path)
      return

    onSelectedImg(path)
  }, [])

  const onPressShowAds = useCallback(async () => {
    // interstitial.show()
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
    suitBuilds.current = undefined
    rateText.current = '...'

    if (!await IsExistedAsync(path, false)) {
      setStatus('')

      Alert.alert(
        'File không tồn tại để upload',
        'Path: ' + path)

      return
    }

    setStatus('Uploading...')

    const tempFilePath = 'tmpfile-' + Date.now()
    FirebaseInit()
    const uplodaErr = await FirebaseStorage_UploadAsync(tempFilePath, path)

    if (uplodaErr) {
      setStatus('')

      Alert.alert(
        'Lỗi không thể upload hình để xử lý',
        'Vui lòng kiểm tra internet của bạn.\nMã lỗi: ' + ToCanPrint(uplodaErr))

      return
    }

    const getURLRes = await FirebaseStorage_GetDownloadURLAsync(tempFilePath)

    if (getURLRes.error) {
      setStatus('')

      Alert.alert(
        'Lỗi lấy url ảnh',
        'Mã lỗi: ' + ToCanPrint(getURLRes.error))

      return
    }

    await detectFromImgUrl(getURLRes.url)
  }, [])

  const findSuitBuilds = useCallback(() => {
    if (!slotCardRef.current)
      return

    // find suits

    suitBuilds.current = []
    const linesMatchIsGood = 3

    for (let itier = 0; itier < buildsData.length; itier++) {
      const tier = buildsData[itier]

      for (let ibuild = 0; ibuild < tier.builds.length; ibuild++) {
        const build = tier.builds[ibuild]

        for (let islot = 0; islot < build.slots.length; islot++) {
          const slot = build.slots[islot]

          if (slot.slotName !== slotCardRef.current.slotName)
            continue

          // @ts-ignore
          const statEquals = slot.stats.filter(stat => slotCardRef.current.stats.findIndex(a => a.name === stat.name) >= 0)

          if (statEquals.length >= linesMatchIsGood) {
            // console.log('statEquals: ' + statEquals.length, ', suit build: ' + build.name, ', tier: ' + tier.name);

            suitBuilds.current.push([tier, build, slot, statEquals.length])
          }
        }
      }
    }

    // rate

    if (suitBuilds.current.length > 0) {

      // sort 

      suitBuilds.current.sort((a, b) => {
        if (a[3] < b[3]) {
          return 1;
        } else if (a[3] > b[3]) {
          return -1;
        }

        return 0;
      })

      // rate

      const idx = suitBuilds.current.findIndex(i => i[3] > linesMatchIsGood)

      if (idx >= 0) {
        rateText.current = 'PERFECT'
      }
      else {
        rateText.current = 'GOOD'
      }
    }
    else {
      rateText.current = 'TRASH'
    }
  }, [])

  const rate = useCallback(() => {
    if (!slotCardRef.current)
      return

    const userSlot = slotCardRef.current

    let slotOfClasses = classesData.find(slot => slot.name === userSlot.slotName)

    if (!slotOfClasses) {
      const convertName = ConvertSlotNameToShortSlotName(userSlot.slotName)

      slotOfClasses = classesData.find(slot => slot.name === convertName)
    }

    if (slotOfClasses === undefined) {
      Alert.alert(
        'Lỗi không rate',
        'Không thể rate cho slot: ' + userSlot.slotName)

      return
    }

    // start find

    const resultArr: [Stat, Classs, Stat][] = []

    for (let istat = 0; istat < userSlot.stats.length; istat++) {
      const stat = userSlot.stats[istat]

      for (let iclass = 0; iclass < slotOfClasses.classes.length; iclass++) {
        const classs = slotOfClasses.classes[iclass]

        const findStats = classs.stats.filter(istat => stat.name === istat.name)

        if (findStats.length > 0) {
          resultArr.push([stat, classs, findStats[0]])

          if (findStats.length > 1) {
            Alert.alert('lollllll woowwwww   ' + stat.name + ', ' + classs.name)
          }
        }
      }
    }

    // rate

    resultArr.forEach(element => {
      console.log(element[0].name, element[1].name, element[2].length);
    });
  }, [])

  const GetStatNameColorCompareWithBuild = useCallback((stat: string) => {
    if (!slotCardRef.current)
      return 'white'

    const idx = slotCardRef.current.stats.findIndex(i => i.name === stat)

    return idx >= 0 ? 'tomato' : 'white'
  }, [])

  const GetRateTextColor = useCallback(() => {
    if (rateText.current === 'PERFECT')
      return 'tomato'

    if (rateText.current === 'GOOD')
      return 'gold'

    return 'gray'
  }, [])

  const onGotOcrResultText = useCallback(async (result: string) => {
    ocrResult.current = JSON.stringify(result)
    const extractRes = ExtractSlotCard(result)

    if (typeof extractRes === 'object') { // success
      slotCardRef.current = extractRes
      findSuitBuilds()
      rate()
      setStatus('SUCCESS')
    }
    else { // fail
      setStatus('')

      Alert.alert(
        'Lỗi không thể phân tích hình',
        'Vui lòng chụp lại hay chọn ảnh khác!\nMã lỗi: ' + extractRes)
    }
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
      const result = response.data?.result

      if (!result)
        throw 'OCR have no result'

      onGotOcrResultText(result)
    } catch (error) {
      Alert.alert(
        'Lỗi không thể phân tích hình',
        'Vui lòng chụp lại hay chọn ảnh khác!\nMã lỗi: ' + ToCanPrint(error))
    }
  }, [])

  // init once 

  useEffect(() => {
    // onGotOcrResultText(demoText)

    // CheckAndInitAdmobAsync();

    // const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
    //   console.log('loaded ads')
    // });

    // // Start loading the interstitial straight away
    // interstitial.load();

    // // Unsubscribe from events on unmount
    // return unsubscribe;
  }, [])

  return (
    <SafeAreaView style={{ flex: 1, gap: Outline.Gap, backgroundColor: 'black' }}>
      <StatusBar barStyle={'light-content'} backgroundColor={'black'} />
      {/* title */}
      <View style={{ marginHorizontal: Outline.Margin, flexDirection: 'row', marginTop: 10, gap: Outline.Gap, alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 20, color: 'tomato', fontWeight: 'bold' }}>Diablo [IV] Senpai</Text>
        <Text style={{ fontSize: 15, color: 'white' }}>(v{jsonPackage['version']})</Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: Outline.Margin }}>
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
        <View style={{ marginTop: Outline.Gap, flexDirection: 'row' }}>
          {/* image */}
          <View style={{ flex: 1 }}>
            {
              userImgUri.current === '' ? undefined :
                <Image style={{ width: '100%', height: windowSize.height * 0.4, }} resizeMode='contain' source={{ uri: userImgUri.current }} />
            }
          </View>
          {/* info */}
          {
            !slotCardRef.current ? undefined :
              <View style={{ marginLeft: Outline.Margin, flex: 1 }}>
                {/* title */}
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ color: 'tomato', borderColor: 'tomato', borderRadius: 5, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>{slotCardRef.current.slotName}</Text>
                  <View style={{ flex: 1 }} />
                </View>
                {/* stats */}
                <View style={{ gap: Outline.Gap, marginTop: Outline.Gap }}>
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
                </View>
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
        {/* rating result text */}
        {
          // !suitBuilds.current || suitBuilds.current.length === 0 ? undefined :
          <View style={{ marginTop: Outline.Gap, alignItems: 'center' }}>
            <View style={{ minWidth: windowSize.width * 0.4, alignItems: 'center', borderWidth: rateText.current === '...' ? 1 : 0, borderColor: 'white', backgroundColor: rateText.current === '...' ? 'black' : GetRateTextColor(), padding: 10, borderRadius: 10 }} >
              <Text style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>{rateText.current}</Text>
            </View>
          </View>
        }
        {/* builds suit */}
        {
          !suitBuilds.current || suitBuilds.current.length === 0 ? undefined :
            <View style={{ marginTop: Outline.Gap, alignItems: 'center', gap: Outline.Gap }}>
              {
                suitBuilds.current.map(([tier, build, slot, statsMatchedCount], index) => {
                  return <View key={build.name + index} style={{ gap: Outline.Gap, width: '100%', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: 'white' }}>
                    {/* build name  */}
                    <Text style={{ color: 'yellow', fontSize: FontSize.Big }}>{build.name}</Text>
                    {/* tier & slot name */}
                    <View style={{ flexDirection: 'row', gap: Outline.Gap }}>
                      <Text style={{ color: 'tomato', borderColor: 'tomato', borderRadius: 5, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>{slot.slotName}</Text>
                      <Text style={{ color: 'white', borderColor: 'white', borderRadius: 5, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>{'Tier ' + tier.name}</Text>
                      <View style={{ flex: 1 }} />
                    </View>
                    <View style={{ gap: Outline.Gap }}>
                      {
                        slot.stats.map((stat, index) => {
                          return <Text key={stat.name + index} style={{ color: GetStatNameColorCompareWithBuild(stat.name) }}>{stat.value}{stat.isPercent ? '%' : ''} {stat.name} [{stat.min}-{stat.max}]%</Text>
                        })
                      }
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
        <TouchableOpacity style={{ marginTop: Outline.Gap }} onPress={onPressShowAds}>
          <Text style={{ color: 'gray' }}>[dev] show ads</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

export default App;

const ConvertSlotNameToShortSlotName = (name: SlotName): SlotName => {
  //   1 hand weapon : wand, sword, dagger, axe, mace
  //   2 hand weapon: crossbow, twohandedmace, twohandedsword, staff, bow, scythe, polearm
  //   offhand: focus, shield, totem

  switch (name) {
    case SlotName.Wand:
    case SlotName.Sword:
    case SlotName.Dagger:
    case SlotName.Axe:
    case SlotName.Mace:
      return SlotName.H1Weapon

    case SlotName.Crossbow:
    case SlotName.TwoHandedMace:
    case SlotName.TwoHandedSword:
    case SlotName.Staff:
    case SlotName.Bow:
    case SlotName.Scythe:
    case SlotName.Polearm:
      return SlotName.H2Weapon

    case SlotName.Focus:
    case SlotName.Shield:
    case SlotName.Totem:
      return SlotName.Offhand

    default:
      return name
  }
}