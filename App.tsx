import {
  ActivityIndicator,
  Alert,
  Animated,
  AppState,
  Button,
  GestureResponderEvent,
  Image,
  LayoutChangeEvent,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
  ViewProps
} from 'react-native';

// @ts-ignore
import { openPicker } from '@baronha/react-native-multiple-image-picker'
import { FirebaseStorage_DeleteAsync, FirebaseStorage_GetDownloadURLAsync, FirebaseStorage_UploadAsync } from './scr/common/Firebase/FirebaseStorage';
import { FirebaseInit } from './scr/common/Firebase/Firebase';
import { RequestCameraPermissionAsync, ToCanPrint } from './scr/common/UtilsTS';
import { FontSize, FontWeight, Outline, windowSize } from './scr/AppConstant';
import { CameraOptions, launchCamera } from 'react-native-image-picker';
import { ExtractSlotCard } from './scr/OCRUtils';
import { Build, Classs, IgnoredStatsOfSlot, SlotCard, SlotName, SlotOfClasses, Stat, Tier } from './scr/Types';
import { IsExistedAsync } from './scr/common/FileUtils';
import { RoundNumber } from './scr/common/Utils';
import { FirebaseDatabase_GetValueAsync, FirebaseDatabase_IncreaseNumberAsync, FirebaseDatabase_SetValueAsync } from './scr/common/Firebase/FirebaseDatabase';
import { CachedMeassure, CachedMeassureResult, IsPointInRectMeasure } from './scr/common/PreservedMessure';
import { CheckAndInitAdmobAsync } from './scr/common/Admob';
import { InterstitialAd, AdEventType, TestIds, BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
import { Track } from './scr/common/ForageAnalytic';
import { StorageLog_ClearAsync, StorageLog_GetAsync } from './scr/common/StorageLog';
import { Image as ImageCompressor } from 'react-native-compressor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Clipboard from '@react-native-clipboard/clipboard';
import { getUniqueId } from 'react-native-device-info';

const adID_Interstitial = Platform.OS === 'android' ?
  'ca-app-pub-9208244284687724/6474432133' :
  'ca-app-pub-9208244284687724/4249911866'
// TestIds.INTERSTITIAL

const interstitial = InterstitialAd.createForAdRequest(adID_Interstitial, {
  requestNonPersonalizedAdsOnly: true,
  // keywords: ['fashion', 'clothing'],
});

const adID_Banner = Platform.OS === 'android' ?
  'ca-app-pub-9208244284687724/5493652375' :
  'ca-app-pub-9208244284687724/4776043942'
// TestIds.BANNER

const today = new Date();
const todayString = 'd' + today.getDate() + '_m' + (today.getMonth() + 1) + '_' + today.getFullYear()

const upArrowIcon = require('./assets/images/up-arrow.png')
const starIcon = require('./assets/images/star-icon.png')

const googleStoreOpenLink = "market://details?id=com.maxdiablo"
const appleStoreOpenLink = "https://apps.apple.com/us/app/d4-tool/id6469034531"

const version = require('./package.json')['version']
const buildsData: Tier[] = require('./assets/BuildsData.json') // for find suit builds
const classesData: SlotOfClasses[] = require('./assets/ClassesData.json') // for rating
const ignoredStats: IgnoredStatsOfSlot[] = require('./assets/IgnoredStats.json') // for ignoring stats

const allStatsData: string[] = require('./assets/AllStats.json') // for valid stat name
const allStatsData_IgnoredCase: string[] = allStatsData.map(name => name.toLowerCase())

const DefaultGoodStats = [
  'core skill damage',
  'critical strike damage',
  'all stats',
  'vulnerable damage',
]

const storage = new MMKVLoader().initialize();

const TouchableOpacityAnimated = Animated.createAnimatedComponent(TouchableOpacity)

export var isDevDevice = false

function App(): JSX.Element {
  const [status, setStatus] = useState('')
  const [showCheat, setShowCheat] = useState(false)
  const [rateSuccessCount, setRateSuccessCount] = useMMKVStorage('rateSuccessCount', storage, 0)
  const [firstOpenApp, setFirstOpenApp] = useMMKVStorage('firstOpenApp', storage, true)
  const rateSuccessCountRef = useRef(0)
  const rateSuccessCountPerInterstitialConfig = useRef(2)
  const userImgUri = useRef('')
  const slotCardRef = useRef<SlotCard | undefined>()
  const ocrResult = useRef('')
  const rateText = useRef<[string, string]>(['...', 'black']) // rate text, rate box bg color
  const suitBuilds = useRef<[Tier, Build, SlotCard, number][]>()
  const statsForRating = useRef<[Stat, Classs | undefined, Stat | undefined, number][]>([]) // user stat, class, class data stat, rate score
  const rateScore_Class = useRef(-1)
  const rateScore_Class_BuildAbove3Stats = useRef(-1)
  const rateLimitText = useRef('')
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollViewCurrentOffsetY = useRef(0)
  const scrollTopBtnAnimatedY = useRef(new Animated.Value(Platform.OS === 'android' ? 50 : 300)).current
  const loadedInterstitial = useRef(false)
  const reallyNeedToShowInterstitial = useRef(false)
  const showingInterstitial = useRef(false)
  const cachedAlert = useRef<[string, string] | undefined>(undefined)
  const tmpUploadFirebasePath = useRef('')
  const cheatPasteOCRResultCount = useRef(0)
  const showCheatTapCount = useRef(0)
  const isOpeningCameraOrPhotoPicker = useRef(false)
  const sessionSelectedImgCount = useRef(0)
  const sessionExtractedCount = useRef(0)
  const sessionStartTime = useRef(0)

  const remoteConfig = useRef({
    auto_delete_file_if_extract_success: true,
    show_rate_app: false,
    save_ocr_result: false,
    ios_show_ads: false,
    dev_devices: ''
  })

  const [isTouchingImg, setIsTouchingImg] = useState(false)
  const imgScale = useRef(new Animated.Value(1)).current
  const imgMove = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const initialImg2TouchesDistance = useRef(-1)
  const initialImgTouch1Event = useRef<NativeTouchEvent | undefined>(undefined)
  const imgViewMeasure = useRef<CachedMeassure>(new CachedMeassure(false))
  const imgViewMeasureResult = useRef<CachedMeassureResult | undefined>(undefined)

  rateSuccessCountRef.current = rateSuccessCount

  const imageResponse = useRef<ViewProps>({
    onMoveShouldSetResponder: (event: GestureResponderEvent) => {
      const touches = event.nativeEvent.touches

      if (touches.length !== 2 ||
        !imgViewMeasureResult.current ||
        scrollViewCurrentOffsetY.current > 100)
        return false

      const t1 = touches[0]
      const t2 = touches[1]

      if (!IsPointInRectMeasure(t1.pageX, t1.pageY, imgViewMeasureResult.current) &&
        !IsPointInRectMeasure(t2.pageX, t2.pageY, imgViewMeasureResult.current))
        return false

      // can be moved!

      setIsTouchingImg(true)

      // move img

      initialImgTouch1Event.current = t1

      // scale

      initialImg2TouchesDistance.current = Math.sqrt(
        Math.pow(t1.pageX - t2.pageX, 2) +
        Math.pow(t1.pageY - t2.pageY, 2))

      Track('move_pic')
      return true
    },

    onResponderMove: (event: GestureResponderEvent) => {
      const touches = event.nativeEvent.touches

      if (touches.length !== 2) {
        return
      }

      // move img

      const t1 = touches[0]

      if (initialImgTouch1Event.current) {
        const x = t1.pageX - initialImgTouch1Event.current.pageX
        const y = t1.pageY - initialImgTouch1Event.current.pageY

        imgMove.setValue({
          x,
          y
        })
      }

      // scale

      const t2 = touches[1]

      const currentDistance = Math.sqrt(
        Math.pow(t1.pageX - t2.pageX, 2) +
        Math.pow(t1.pageY - t2.pageY, 2))

      const maxScale = 20

      const scale = currentDistance / initialImg2TouchesDistance.current;

      imgScale.setValue(Math.max(1, Math.min(maxScale, scale)))
    },

    onResponderEnd: (_: GestureResponderEvent) => {
      onMoveImgEnd()
    },
  })

  const onMoveImgEnd = useCallback(() => {
    imgScale.setValue(1)
    imgMove.setValue({ x: 0, y: 0 })
    setIsTouchingImg(false)
  }, [])

  const onPressPickPhoto = useCallback(async () => {
    try {
      isOpeningCameraOrPhotoPicker.current = true

      const response = await openPicker(
        {
          usedCameraButton: false,
          tapHereToChange: 'Thay album',
          maxSelectedAssets: 1,
          allowedVideo: false,
          emptyMessage: 'Hãy chọn 1 tấm để phân tích',
          selectedColor: '#000000',
        });

      if (!response || response.length <= 0) {
        Alert.alert('Hãy chọn lại', 'Vui lòng chọn một hình!')
      }
      else {
        const img = response[0]

        if ((Platform.OS === 'android' && !img) || (Platform.OS !== 'android' && !img.path)) {
          Alert.alert('Hãy chọn lại', 'Vui lòng chọn một hình!')
          return
        }

        const path = Platform.OS === 'android' ? 'file://' + img.realPath : img.path;
        onSelectedImg(path)
        Track('pick_photo')
      }
    }
    catch (e: any) {
      if (e.toString().includes('User has canceled'))
        return

      console.error('pick img error: ' + e);
    }
  }, [])

  const generateImgID = useCallback(() => {
    let now = Date.now().toString()
    let s = now.substring(now.length - 3) + '_' + Math.random().toString().substring(2, 5)
    // console.log(s, now);
    return s
  }, [])

  const onPressTakeCamera = useCallback(async () => {
    const camRequestRes = await RequestCameraPermissionAsync()

    if (camRequestRes !== true) {
      Alert.alert('Thiếu quyền truy cập Camera!', 'Vui lòng cấp quyền truy cập')
      return
    }

    isOpeningCameraOrPhotoPicker.current = true

    const result = await launchCamera({
      saveToPhotos: false,
      cameraType: 'back',
      mediaType: 'photo',
      quality: Platform.OS === 'android' ? 0.5 : 0.1,
    } as CameraOptions)

    if (!result || !result.assets)
      return

    const path = result.assets[0].uri

    if (!path)
      return

    onSelectedImg(path)
    Track('take_camera')
  }, [])

  const onPressTotalScore = useCallback(async () => {
    if (cheatPasteOCRResultCount.current < 5) {
      cheatPasteOCRResultCount.current++
      return
    }

    cheatPasteOCRResultCount.current = 0

    const txt = await Clipboard.getString()
    await onGotOcrResultTextAsync(txt, true)
  }, [])

  const OnPressed_CopyStorageLog = useCallback(async () => {
    const t = await StorageLog_GetAsync()
    Clipboard.setString(t === '' ? 'No Logs' : t)
  }, [])

  const OnPressed_ClearStorageLog = useCallback(async () => {
    await StorageLog_ClearAsync()
  }, [])

  const OnPressed_CloseCheat = useCallback(() => {
    setShowCheat(false)
  }, [])

  const OnPressed_ShowCheat = useCallback(() => {
    if (showCheatTapCount.current < 5) {
      showCheatTapCount.current++
      return
    }

    showCheatTapCount.current = 0
    setShowCheat(true)
  }, [])

  const onPressCopyOCRResult = useCallback(async () => {
    if (!ocrResult.current)
      return

    Clipboard.setString(ocrResult.current)
  }, [])

  const checkAndShowAdsInterstitial = useCallback(() => {
    if (Platform.OS === 'ios' && !remoteConfig.current.ios_show_ads)
      return

    console.log('cur rate success count', rateSuccessCountRef.current, '/ ' + rateSuccessCountPerInterstitialConfig.current);

    if (rateSuccessCountRef.current < rateSuccessCountPerInterstitialConfig.current)
      return

    showAdsInterstitial()
  }, [])

  const showAdsInterstitial = useCallback(() => {
    if (Platform.OS === 'ios' && !remoteConfig.current.ios_show_ads)
      return

    reallyNeedToShowInterstitial.current = true
    Track('fire_show_ads', loadedInterstitial.current)

    if (loadedInterstitial.current) {
      loadedInterstitial.current = false
      interstitial.show()
    }
    else {
      loadAdsInterstitial()
    }
  }, [])

  const loadAdsInterstitial = useCallback(() => {
    if (Platform.OS === 'ios' && !remoteConfig.current.ios_show_ads)
      return

    console.log('loading interstitial')
    loadedInterstitial.current = false
    interstitial.load()
  }, [])

  const onSelectedImg = useCallback(async (path: string) => {
    slotCardRef.current = undefined
    ocrResult.current = ''
    suitBuilds.current = undefined
    rateText.current = ['...', 'black']
    rateScore_Class.current = 0
    rateScore_Class_BuildAbove3Stats.current = 0
    userImgUri.current = path

    sessionSelectedImgCount.current++

    if (!await IsExistedAsync(path, false)) {
      setStatus('')

      Alert.alert(
        'File không tồn tại để upload',
        'Path: ' + path)

      return
    }

    path = await CompressImageAsync(path)

    userImgUri.current = path

    if (!isDevDevice) {
      FirebaseDatabase_IncreaseNumberAsync('selected_img_count/' + todayString, 0)
    }

    tmpUploadFirebasePath.current = generateImgID()

    setStatus('Đang upload...')

    const fbpath = (isDevDevice ? 'dev_file/' : 'user_file/') + tmpUploadFirebasePath.current
    const uplodaErr = await FirebaseStorage_UploadAsync(fbpath, path)

    Track('uploaded_done', {
      success: uplodaErr === null,
      fileID: tmpUploadFirebasePath.current
    })

    if (uplodaErr) {
      setStatus('')

      Alert.alert(
        'Lỗi không thể upload hình để xử lý',
        'Vui lòng kiểm tra internet của bạn.\nMã lỗi: ' + ToCanPrint(uplodaErr))

      console.error(ToCanPrint(uplodaErr))

      return
    }

    const getURLRes = await FirebaseStorage_GetDownloadURLAsync(fbpath)

    if (getURLRes.error) {
      setStatus('')

      Alert.alert(
        'Lỗi lấy url ảnh',
        'Mã lỗi: ' + ToCanPrint(getURLRes.error))

      return
    }

    await detectFromImgUrlAsync_ImageToText(getURLRes.url)
  }, [])

  const scrollToTop = useCallback(() => {
    if (!scrollViewRef.current)
      return

    scrollViewRef.current.scrollTo({ x: 0, y: 0, animated: true })
    Track('scroll_top')
  }, [])

  const imgOnLayout = useCallback((_: LayoutChangeEvent) => {
    imgViewMeasure.current.GetOrMessure((res) => {
      imgViewMeasureResult.current = res
    })
  }, [])

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const thresholdScrollHide = 100
    const hideTop = Platform.OS === 'android' ? 50 : 300

    const native = event.nativeEvent

    const nowY = native.contentOffset.y
    scrollViewCurrentOffsetY.current = nowY

    const value = nowY > thresholdScrollHide ? 0 : hideTop

    Animated.spring(
      scrollTopBtnAnimatedY,
      {
        toValue: value,
        useNativeDriver: false,
      }
    ).start()
  }, [])

  const findSuitBuilds = useCallback(() => {
    if (!slotCardRef.current)
      return

    const userSlot = slotCardRef.current

    // find suits

    suitBuilds.current = []
    const linesMatchIsGood = 1

    for (let itier = 0; itier < buildsData.length; itier++) {
      const tier = buildsData[itier]

      for (let ibuild = 0; ibuild < tier.builds.length; ibuild++) {
        const build = tier.builds[ibuild]

        for (let islot = 0; islot < build.slots.length; islot++) {
          const slot = build.slots[islot]

          if (slot.slotName !== userSlot.slotName)
            continue

          const statEquals = slot.stats.filter(stat => userSlot.stats.findIndex(a => a.name.toLowerCase() === stat.name.toLowerCase()) >= 0)

          if (statEquals.length >= linesMatchIsGood) {
            suitBuilds.current.push([tier, build, slot, statEquals.length])
            break
          }
        }
      }
    }

    // sort

    if (suitBuilds.current.length > 0) {
      suitBuilds.current.sort((a, b) => {
        if (a[3] < b[3]) {
          return 1;
        } else if (a[3] > b[3]) {
          return -1;
        }

        return 0;
      })
    }
  }, [])

  const rate = useCallback(() => {
    if (!slotCardRef.current)
      return

    const userSlot = slotCardRef.current

    // find in DefaultGoodStats 

    const userGoodStats: Stat[] = userSlot.stats.filter(stat => DefaultGoodStats.includes(stat.name.toLowerCase()))

    // find in class data

    let slotOfClasses = classesData.find(slot => slot.name === userSlot.slotName)

    if (!slotOfClasses) {
      const convertName = ConvertSlotNameToShortSlotName(userSlot.slotName)

      slotOfClasses = classesData.find(slot => slot.name === convertName)
    }

    if (slotOfClasses === undefined) {
      FirebaseDatabase_SetValueAsync('error_report/whattheheathy/' + Date.now(), userSlot.slotName)

      return
    }

    // start find

    statsForRating.current = []

    for (let istat = 0; istat < userSlot.stats.length; istat++) {
      const stat = userSlot.stats[istat]

      // ingored stat

      if (IsIgnoredStat(stat, userSlot)) {
        continue
      }

      // find in classes

      for (let iclass = 0; iclass < slotOfClasses.classes.length; iclass++) {
        const classs = slotOfClasses.classes[iclass]

        const findStats = classs.stats.filter(istat => stat.name.toLowerCase() === istat.name.toLowerCase())

        if (findStats.length > 0) {
          statsForRating.current.push([stat, classs, findStats[0], -1])

          break
        }
      }
    }

    // append default good stats

    userGoodStats.forEach(stat => {
      if (statsForRating.current.findIndex(tuple => tuple[0].name.toLowerCase() === stat.name.toLowerCase()) < 0) {
        statsForRating.current.push([stat, undefined, undefined, -1])
      }
    })

    // rate

    let totalScore_Class = 0

    for (let i = 0; i < statsForRating.current.length; i++) {
      const [userStat, classs, classStat, score] = statsForRating.current[i]

      // this stat score

      let curScore = 0

      if (userStat.max === userStat.min)
        curScore = 0
      else
        curScore = (userStat.value - userStat.min) / (userStat.max - userStat.min)

      // sum score

      totalScore_Class += curScore
      statsForRating.current[i][3] = curScore
    };

    // calc rateScore_Class

    rateScore_Class.current = totalScore_Class / 4
    let valuedStatsScore = (totalScore_Class + (statsForRating.current.length / 4)) / 5

    // calc rateScore_Class_BuildAbove3Stats

    if (suitBuilds.current && suitBuilds.current.length > 0) {
      // count

      let totalScore_above3stats = 0

      let count_above3stats = 0

      for (let i = 0; i < suitBuilds.current.length; i++) {
        let matchStatCount = suitBuilds.current[i][3]
        let score = Math.min(1, matchStatCount / 4)

        if (matchStatCount >= 3) { // from and above 3
          totalScore_above3stats += score
          count_above3stats++
        }
      }

      // calc rateScore_Class_BuildAbove3Stats

      rateScore_Class_BuildAbove3Stats.current = (totalScore_above3stats + totalScore_Class) / (count_above3stats + 4)
      valuedStatsScore = (totalScore_above3stats + totalScore_Class + (statsForRating.current.length / 4)) / (count_above3stats + 4 + 1)
    }
    else {
      rateScore_Class_BuildAbove3Stats.current = rateScore_Class.current
    }

    // rate final

    const finalScore = Math.max(rateScore_Class.current, rateScore_Class_BuildAbove3Stats.current, valuedStatsScore)
    rateScore_Class_BuildAbove3Stats.current = finalScore
    const resultRate = getRateTypeByScore(finalScore)
    rateText.current = [resultRate[1], resultRate[0]]

    Track('rated', {
      finalScore,
      stats: statsForRating.current.length,
      result: resultRate[1],
      fileID: tmpUploadFirebasePath.current,
    })
  }, [])

  const getStatNameColorCompareWithBuild = useCallback((stat: string) => {
    if (!slotCardRef.current)
      return 'white'

    const idx = slotCardRef.current.stats.findIndex(i => i.name.toLowerCase() === stat.toLowerCase())

    return idx >= 0 ? 'white' : 'gray'
  }, [])

  const getRateTypeByScore = useCallback((rawFloatScore: number) => {
    rawFloatScore = RoundNumber(rawFloatScore, 2)

    if (rawFloatScore >= 1) // perfect
      return ['tomato', 'TUYỆT PHẨM!']
    else if (rawFloatScore >= 0.75) // good
      return ['gold', 'RẤT TỐT']
    else if (rawFloatScore >= 0.5) // fair
      return ['moccasin', 'TỐT']
    else if (rawFloatScore >= 0.25) // normal
      return ['paleturquoise', 'BÌNH THƯỜNG']
    else // trash
      return ['dodgerblue', 'RÁC RƯỞI']
  }, [])

  const getScoreOfStat = useCallback((statName: string, x10: boolean) => {
    if (!statsForRating.current || statsForRating.current.length === 0)
      return 0

    const stat = statsForRating.current.find(i => i[0].name.toLowerCase() === statName.toLowerCase())

    if (stat !== undefined) {
      if (x10)
        return RoundNumber(stat[3] * 10, 1)
      else
        return stat[3]
    }
    else
      return -1
  }, [])

  const getRateStatColor = useCallback((statName: string) => {
    if (!slotCardRef.current)
      return 'green'

    if (!statsForRating.current || statsForRating.current.length === 0)
      return 'green'

    const stat = statsForRating.current.find(i => i[0].name.toLowerCase() === statName.toLowerCase())

    if (stat !== undefined) {
      return getRateTypeByScore(stat[3])[0]
    }
    else
      return 'gray'
  }, [])

  const onGotOcrResultTextAsync = useCallback(async (result: string, stringifyResult: boolean) => {
    sessionExtractedCount.current++
    ocrResult.current = JSON.stringify(result)
    let extractRes = ExtractSlotCard(result, stringifyResult)
    const isSuccess = typeof extractRes === 'object'

    if (!isDevDevice) {
      if (isSuccess)
        FirebaseDatabase_IncreaseNumberAsync('extracted_count/' + todayString + '/success', 0)
      else
        FirebaseDatabase_IncreaseNumberAsync('extracted_count/' + todayString + '/fail', 0)

      if (!isDevDevice && remoteConfig.current.save_ocr_result && tmpUploadFirebasePath.current !== '') {
        FirebaseDatabase_SetValueAsync((isSuccess ? 'ocr_result/success/' : 'ocr_result/fail/') + tmpUploadFirebasePath.current, {
          result: ocrResult.current,
          version
        })
      }
    }

    if (typeof extractRes === 'object') { // success
      if (stringifyResult) {
        console.log(JSON.stringify(extractRes))
        console.log(JSON.stringify(extractRes, null, 1));
      }

      if (remoteConfig.current.auto_delete_file_if_extract_success === true)
        FirebaseStorage_DeleteAsync(tmpUploadFirebasePath.current)

      extractRes = HandleWeirdStatNames(extractRes)
      slotCardRef.current = FilterStats(extractRes)

      findSuitBuilds()
      rate()

      rateSuccessCountRef.current++
      setRateSuccessCount(rateSuccessCountRef.current)

      // done

      setStatus(Math.random().toString())
    }
    else { // fail
      setStatus('')

      if (extractRes === 'miss brackets') {
        cacheOrShowAlert(
          'Lỗi không thể rate hình',
          'Vui lòng bật setting hiển thị range [min-max] cho các thông số.\n\n' +
          'Vào option -> chọn thẻ gameplay -> tick vào 2 ô:\n' +
          '* Advanced Tooltip Compare\n' +
          '* Advanced Tooltip Information')
      }
      else if (extractRes === 'unique') {
        cacheOrShowAlert(
          'Ooops!',
          'Không thể rate item UNIQUE. Vui lòng chọn hình khác!')
      }
      else { // other errors
        cacheOrShowAlert(
          'Lỗi không thể phân tích hình',
          'Vui lòng chụp lại hay chọn ảnh khác!\n\nExtract result:\n' + extractRes)
      }

      Track('extract_failed')
    }
  }, [])

  const cacheOrShowAlert = useCallback((title: string, content: string) => {
    if (showingInterstitial.current) { // showing ads
      cachedAlert.current = [title, content]
    }
    else // not showing ads
      AlertWithCopy(title, content)
  }, [])

  const detectFromImgUrlAsync_ImageToText = useCallback(async (imgUrl: string) => {
    const options = {
      method: 'GET',
      url: 'https://image-to-text9.p.rapidapi.com/ocr',
      params: {
        url: imgUrl
      },
      headers: {
        'X-RapidAPI-Key': '693dd75456msh921c376e306158cp12c5dbjsn32ff82c9294a',
        'X-RapidAPI-Host': 'image-to-text9.p.rapidapi.com'
      }
    };

    setStatus('Đang phân tích...')

    checkAndShowAdsInterstitial() // show ads

    try {
      Track('call_api', {
        fileID: tmpUploadFirebasePath.current
      })

      const response = await axios.request(options);

      rateLimitText.current = `${response.headers['x-ratelimit-requests-remaining']}/${response.headers['x-ratelimit-requests-limit']}`

      const result = response.data?.text

      if (!result)
        throw 'ImageToText API have no result. Response:\n\n' + ToCanPrint(response)

      onGotOcrResultTextAsync(result, false)
    } catch (error) {
      cacheOrShowAlert(
        'Lỗi không thể phân tích hình',
        'Vui lòng chụp lại hay chọn ảnh khác!\n\nMã lỗi:\n' + ToCanPrint(error))

      userImgUri.current = ''
      setStatus('')
      Track('call_api_failed')

      if (!isDevDevice)
        FirebaseDatabase_IncreaseNumberAsync('call_api_failed_count/' + todayString, 0)
    }
  }, [])

  const getFirebaseConfigAsync = useCallback(async () => {
    const res = await FirebaseDatabase_GetValueAsync('app_config')

    if (!res.value) {
      Alert.alert('Không thể download remote config!', 'Có lỗi gì đó hoặc bạn vui lòng kiểm tra internet.\n\nLỗi:\n' + ToCanPrint(res.error))
      return
    }

    remoteConfig.current = res.value

    isDevDevice = remoteConfig.current.dev_devices.includes(getUniqueId())

    rateSuccessCountPerInterstitialConfig.current = res.value.rate_success_count_per_interstitial

    const configVersion = Platform.OS === 'android' ? res.value.android_version : res.value.ios_version

    if (!isDevDevice && configVersion && version !== configVersion) {
      const storeLink = Platform.OS === 'android' ? googleStoreOpenLink : appleStoreOpenLink

      Alert.alert(
        'Có bản cập nhật mới!',
        'Vui lòng lên app store cập nhật phiên bản mới nhất.',
        [
          {
            text: 'Cập nhật',
            onPress: () => Linking.openURL(storeLink)
          }
        ])
    }
    else { // đag là version mới rồi
      const last_installed_version = await storage.getStringAsync('last_installed_version')
      const ver = (version as string).replaceAll('.', '_')

      if (last_installed_version !== version) { // new install or updated
        if (!isDevDevice)
          await FirebaseDatabase_IncreaseNumberAsync('new_version_user_count/' + ver, 0)

        await storage.setStringAsync('last_installed_version', version)
      }
    }
  }, [])

  // init once 

  useEffect(() => {
    const initAsync = async () => {
      // firebase

      FirebaseInit()

      // remote config

      await getFirebaseConfigAsync()

      // ads

      await CheckAndInitAdmobAsync();

      loadAdsInterstitial()

      // app state

      if (!isDevDevice) {
        sessionStartTime.current = Date.now()

        AppState.addEventListener('change', (e) => {
          // console.log(ToCanPrint(e));

          if (e === 'active') { // start session

            if (isOpeningCameraOrPhotoPicker.current) {
              isOpeningCameraOrPhotoPicker.current = false
              return
            }

            sessionExtractedCount.current = 0
            sessionSelectedImgCount.current = 0
            sessionStartTime.current = Date.now()
          }
          else if (e === 'background') { // end session
            if (isOpeningCameraOrPhotoPicker.current) {
              return
            }

            const fbpath = 'sessions/' + todayString + '/' + getUniqueId() + '/' + Date.now()

            FirebaseDatabase_SetValueAsync(fbpath, {
              extracted_count: sessionExtractedCount.current,
              selected_img: sessionSelectedImgCount.current,
              duration: (Date.now() - sessionStartTime.current) / 1000,
              version,
              os: Platform.OS,
              start_time: new Date(sessionStartTime.current).toString()
            })
          }
        })
      }

      // tracking

      TrackOnOpenApp()

      if (firstOpenApp) {
        setFirstOpenApp(false)
        Track('first_open_app', { os: Platform.OS })
      }
    }

    initAsync()

    const unsubscribe_ads_interstitial_loaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('loaded interstitial')
      loadedInterstitial.current = true

      if (reallyNeedToShowInterstitial.current)
        showAdsInterstitial()
    });

    const unsubscribe_ads_interstitial_opened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
      console.log('open interstitial')
      showingInterstitial.current = true
      Track('ads_opened')
    });

    const unsubscribe_ads_interstitial_closed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('closed interstitial')
      reallyNeedToShowInterstitial.current = false
      showingInterstitial.current = false
      loadAdsInterstitial()

      setRateSuccessCount(0)
      rateSuccessCountRef.current = 0

      // show cached alert

      if (cachedAlert.current !== undefined) {
        AlertWithCopy(cachedAlert.current[0], cachedAlert.current[1])
        cachedAlert.current = undefined
      }

      Track('ads_closed')
    });

    const unsubscribe_ads_interstitial_error = interstitial.addAdEventListener(AdEventType.ERROR, (e) => {
      console.log('error interstitial', e)

      if (reallyNeedToShowInterstitial.current)
        loadAdsInterstitial()

      Track('ads_error', ToCanPrint(e))
    })

    return () => {
      unsubscribe_ads_interstitial_loaded()
      unsubscribe_ads_interstitial_opened()
      unsubscribe_ads_interstitial_closed()
      unsubscribe_ads_interstitial_error()
    }
  }, [])

  const notShowSuitBuilds = !suitBuilds.current || suitBuilds.current.length === 0

  return (
    <SafeAreaView {...imageResponse.current} style={{ flex: 1, gap: Outline.Gap, backgroundColor: 'black' }}>
      <StatusBar barStyle={'light-content'} backgroundColor={'black'} />
      {
        Platform.OS === 'ios' && !remoteConfig.current.ios_show_ads ? undefined :
          <BannerAd unitId={adID_Banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true, }} />
      }
      {/* app name */}
      <View style={{ marginHorizontal: Outline.Margin, flexDirection: 'row', gap: Outline.Gap, alignItems: 'center', justifyContent: 'space-between' }}>
        <Text onPress={showAdsInterstitial} style={{ fontSize: FontSize.Big, color: 'tomato', fontWeight: 'bold' }}>Diablo 4 Tool</Text>
        <Text onPress={remoteConfig.current.show_rate_app ? OnPressed_StoreRate : undefined} style={{ fontStyle: 'italic', fontSize: FontSize.Normal, color: remoteConfig.current.show_rate_app ? 'white' : 'black' }}>Đánh giá App</Text>
      </View>
      {/* the rest */}
      <ScrollView
        scrollEnabled={!isTouchingImg}
        ref={scrollViewRef}
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{ marginHorizontal: Outline.Margin }}>
        {/* select photo btns */}
        <Text onPress={OnPressed_ShowCheat} style={{ fontSize: 15, color: 'white', marginBottom: Outline.Margin }}>Chọn hình để rate:</Text>
        <View style={{ flexDirection: 'row', gap: Outline.Gap, justifyContent: 'center' }}>
          <TouchableOpacity onPress={onPressPickPhoto} style={{ flex: 1, borderRadius: 5, padding: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'black', fontSize: FontSize.Normal }}> Chọn từ thư viện</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onPressTakeCamera} style={{ flex: 1, borderRadius: 5, padding: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'black', fontSize: FontSize.Normal }}>Chụp hình</Text>
          </TouchableOpacity>
        </View>
        {/* user upload image & info */}
        <View style={{ marginTop: Outline.Gap, flexDirection: 'row' }}>
          {/* image */}
          <View
            ref={imgViewMeasure.current.theRef}
            onLayout={imgOnLayout}
            style={{ flex: 0.8 }}>
            {
              userImgUri.current === '' ? undefined :
                <Animated.Image
                  style={[
                    { width: '100%', height: windowSize.height * 0.4, },
                    imgMove.getLayout(),
                    {
                      transform: [{ scale: imgScale }]
                    }]}
                  resizeMode='contain'
                  source={{ uri: userImgUri.current }} />
            }
            {
              userImgUri.current === '' ? undefined :
                <Text style={{ opacity: isTouchingImg ? 0 : 1, fontSize: 15, color: 'gray' }}>ID: {tmpUploadFirebasePath.current}</Text>
            }
          </View>
          {/* loading & info */}
          {
            // loading
            !slotCardRef.current ?
              <View style={{ opacity: isTouchingImg ? 0 : 1, marginLeft: Outline.Margin, flex: 1 }}>
                {
                  userImgUri.current === '' || ocrResult.current ? undefined :
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Outline.Gap }}>
                      <ActivityIndicator color={'tomato'} />
                      <Text style={{ color: 'white' }}>{status}</Text>
                    </View>
                }
              </View> :
              // user stats info
              <View style={{ opacity: isTouchingImg ? 0 : 1, marginLeft: Outline.Margin, flex: 1 }}>
                {/* slot name  */}
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontWeight: FontWeight.B500, color: 'white', borderColor: 'white', borderRadius: 5, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>
                    {slotCardRef.current.slotName}
                  </Text>
                  <View style={{ flex: 1 }} />
                </View>
                {/* item power */}
                <Text style={{ marginTop: Outline.Gap / 2, color: 'white' }}>
                  Item Power: {slotCardRef.current.itemPower}
                </Text>
                {/* stats */}
                <View style={{ gap: Outline.Gap, marginTop: Outline.Gap }}>
                  {
                    slotCardRef.current.stats.map((stat, index) => {
                      const color = getRateStatColor(stat.name)
                      const scoreX10 = getScoreOfStat(stat.name, true)

                      return <View key={index}>
                        <Text style={{ color, fontWeight: FontWeight.B500 }}>{'{' + (index + 1) + '} ' + stat.name}</Text>
                        <Text style={{ color }}>
                          {stat.value}{stat.isPercent ? '%' : ''}
                          <Text style={{ color }}>
                            {'  '}[{stat.min}-{stat.max}]{stat.isPercent ? '%  ' : '  '}
                          </Text>
                          <Text style={{ color: 'black', backgroundColor: color }}>
                            {scoreX10 >= 0 ? `${scoreX10}/10` : ''}
                          </Text>
                        </Text>
                      </View>
                    })
                  }
                </View>
              </View>
          }
        </View>
        {/* rating result box */}
        {
          <View style={{ opacity: isTouchingImg ? 0 : 1, marginTop: Outline.Gap, alignItems: 'center', gap: Outline.Gap }}>
            <View style={{ minWidth: windowSize.width * 0.4, alignItems: 'center', borderWidth: rateText.current[0] === '...' ? 1 : 0, borderColor: 'white', backgroundColor: rateText.current[1], padding: 10, borderRadius: 10 }} >
              <Text style={{ color: rateText.current[0] === '...' ? 'white' : 'black', fontSize: 30, fontWeight: 'bold' }}>{rateText.current[0]}</Text>
            </View>
            <Text onPress={onPressTotalScore} style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>{rateScore_Class_BuildAbove3Stats.current >= 0 ? RoundNumber(rateScore_Class_BuildAbove3Stats.current * 10, 1) : 0}/10</Text>
          </View>
        }
        {/* builds suit */}
        {
          notShowSuitBuilds ? undefined :
            <View style={{ opacity: isTouchingImg ? 0 : 1, marginTop: Outline.Gap * 2, alignItems: 'center', gap: Outline.Gap }}>
              <Text style={{ color: 'white', fontSize: FontSize.Normal }}>Danh sách build thích hợp ({suitBuilds.current?.length} build):</Text>
              {
                suitBuilds.current?.map(([tier, build, slot, statsMatchedCount], index) => {
                  return <View key={build.name + index} style={{ gap: Outline.Gap, width: '100%', padding: 10, borderRadius: 5, borderWidth: 1, borderColor: 'white' }}>
                    {/* build name  */}
                    <Text style={{ color: 'tomato', fontSize: FontSize.Big }}>{(index + 1) + '. ' + build.name}</Text>
                    {/* tier & slot name */}
                    <View style={{ flexDirection: 'row', gap: Outline.Gap }}>
                      <Text style={{ color: 'gray', borderColor: 'gray', borderRadius: 5, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>{slot.slotName}</Text>
                      <Text style={{ color: 'gray', borderColor: 'gray', borderRadius: 5, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>{'Tier ' + tier.name}</Text>
                      {
                        statsMatchedCount < 3 ? undefined :
                          <View style={{ gap: 3, flexDirection: 'row', backgroundColor: 'gold', borderRadius: 5, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Outline.Margin }} >
                            <Image source={starIcon} style={{ width: 14, height: 14 }} />
                            <Text style={{ color: 'black', fontWeight: FontWeight.B500 }}>{statsMatchedCount > 3 ? 'Quá ngon' : 'Ngon'}</Text>
                          </View>
                      }
                      <View style={{ flex: 1 }} />
                    </View>
                    <View style={{ gap: Outline.Gap }}>
                      {
                        slot.stats.map((stat, index) => {
                          return <Text key={stat.name + index} style={{ color: getStatNameColorCompareWithBuild(stat.name) }}>{stat.value}{stat.isPercent ? '%' : ''} {stat.name} [{stat.min}-{stat.max}]{stat.isPercent ? '%' : ''}</Text>
                        })
                      }
                    </View>
                  </View>
                })
              }
            </View>
        }
        {/* debug text, version, remain ocr count */}
        <Text onPress={onPressCopyOCRResult} style={{ opacity: isTouchingImg ? 0 : 1, marginTop: Outline.Gap, color: 'gray' }}>v{version}{rateLimitText.current ? ' - ' : ''}{rateLimitText.current}</Text>
      </ScrollView>
      {/* scrollToTop btn */}
      <View pointerEvents='box-none' style={{ position: 'absolute', width: '100%', height: '100%', justifyContent: 'flex-end', alignItems: 'flex-end' }}>
        <TouchableOpacityAnimated
          onPress={scrollToTop}
          style={{ top: scrollTopBtnAnimatedY, justifyContent: 'center', alignItems: 'center', width: 35, height: 35, marginRight: 15, marginBottom: 15, borderRadius: 17, backgroundColor: 'white' }}>
          <Image style={{ width: 20, height: 20 }} source={upArrowIcon} />
        </TouchableOpacityAnimated>
      </View>
      {
        !showCheat ? undefined :
          <View style={{ backgroundColor: 'white', position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' }}>
            <Button title='copy storage log' onPress={OnPressed_CopyStorageLog} />
            <Button title='clear storage log' onPress={OnPressed_ClearStorageLog} />
            <Button title='copy device id' onPress={() => Clipboard.setString(getUniqueId())} />
            <Button title='close' onPress={OnPressed_CloseCheat} />
          </View>
      }
    </SafeAreaView>
  )
}

export default App;

// report fb & remove from stats
const HandleWeirdStatNames = (slot: SlotCard): SlotCard => {
  let listWeirdTxt = ''

  for (let i = 0; i < slot.stats.length; i++) {
    const stat = slot.stats[i]

    if (allStatsData_IgnoredCase.includes(stat.name.toLowerCase()))
      continue

    listWeirdTxt += ('[' + stat.name + ']')
    stat.name = 'hihi'
  }

  if (listWeirdTxt !== '') {
    // remove stat

    slot.stats = slot.stats.filter(i => i.name !== 'hihi')

    // send firebase

    FirebaseDatabase_SetValueAsync('error_report/weird_stats/' + Date.now(), listWeirdTxt)
  }

  return slot
}

// remove from stats
const FilterStats = (slot: SlotCard): SlotCard => {
  for (let i = 0; i < slot.stats.length; i++) {
    // remove 1 range stats

    if (slot.stats[i].min === slot.stats[i].max) {
      slot.stats[i].name = 'hihi'
      continue
    }

    // remove duplicate stats

    for (let a = i + 1; a < slot.stats.length; a++) {
      if (slot.stats[i].name.toLowerCase() === slot.stats[a].name.toLowerCase()) {
        slot.stats[i].name = 'hihi'
        break
        // console.log('remmmm', slot.stats[a].name, slot.stats[i].min, slot.stats[i].max);
      }
    }
  }

  // console.log('a', slot.stats.length);

  slot.stats = slot.stats.filter(i => i.name !== 'hihi')

  // console.log('b', slot.stats.length);

  return slot
}

const IsIgnoredStat = (stat: Stat, slot: SlotCard): boolean => {
  const statNameLower = stat.name.toLowerCase()

  if (statNameLower.includes('resistance')) {
    return true
  }

  let dataIdx = ignoredStats.findIndex(i => i.name === slot.slotName)

  if (dataIdx < 0) {
    const shortSlotName = ConvertSlotNameToShortSlotName(slot.slotName)
    dataIdx = ignoredStats.findIndex(i => i.name === shortSlotName)
  }

  if (dataIdx >= 0) {
    const idx = ignoredStats[dataIdx].statNames.indexOf(statNameLower)

    return idx >= 0
  }
  else {
    const theRestIgnoredStats = ignoredStats.find(i => i.name === SlotName.None)

    if (!theRestIgnoredStats)
      throw new Error('[ne]')

    const idx = theRestIgnoredStats.statNames.indexOf(statNameLower)

    return idx >= 0
  }
}

const ConvertSlotNameToShortSlotName = (name: SlotName): SlotName => {
  //   1 hand weapon : wand, sword, dagger, axe, mace
  //   2 hand weapon: crossbow, twohandedmace, twohandedsword, staff, bow, scythe, polearm, twohandedaxe
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
    case SlotName.TwoHandedAxe:
      return SlotName.H2Weapon

    case SlotName.Focus:
    case SlotName.Shield:
    case SlotName.Totem:
      return SlotName.Offhand

    default:
      return name
  }
}

const AlertWithCopy = (title: string, content: string) => {
  Alert.alert(
    title,
    content,
    [
      {
        text: 'Copy',
        onPress: () => {
          Clipboard.setString(title + '\n\n' + content)
        }
      },
      { text: "OK" },
    ])
}

const OnPressed_StoreRate = () => {
  const storeLink = Platform.OS === 'android' ? googleStoreOpenLink : appleStoreOpenLink
  Linking.openURL(storeLink)
  Track('pressed_ratestore')
}

const TrackOnOpenApp = async () => {
  const tracked_user_unique_open_app_count = await storage.getStringAsync('tracked_user_unique_open_app_count')

  if (tracked_user_unique_open_app_count !== todayString) {
    await storage.setStringAsync('tracked_user_unique_open_app_count', todayString)

    if (!isDevDevice)
      await FirebaseDatabase_IncreaseNumberAsync('user_unique_open_count/' + todayString, 0)
  }

  if (!isDevDevice)
    await FirebaseDatabase_IncreaseNumberAsync('open_total_count/' + todayString, 0)

  Track('app_open')
}

const CompressImageAsync = async (fileURI: string): Promise<string> => {
  return await ImageCompressor.compress(
    fileURI, {
    maxHeight: 1000,
    maxWidth: 1000,
    output: 'png'
  })
}