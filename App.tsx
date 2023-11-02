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
  NativeEventSubscription,
  NativeScrollEvent,
  NativeSyntheticEvent,
  NativeTouchEvent,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewProps
} from 'react-native';

import { FirebaseStorage_DeleteAsync, FirebaseStorage_GetDownloadURLAsync, FirebaseStorage_UploadAsync } from './scr/common/Firebase/FirebaseStorage';
import { FirebaseInit } from './scr/common/Firebase/Firebase';
import { ColorNameToRgb, GetHourMinSecFromMs, RequestCameraPermissionAsync, ToCanPrint, VersionToNumber } from './scr/common/UtilsTS';
import { BorderRadius, FontSize, FontWeight, NotifyInMinArr, Outline, limitMultiImage, windowSize } from './scr/AppConstant';
import { Asset, CameraOptions, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ExtractSlotCard } from './scr/OCRUtils';
import { Build, Event, IgnoredStatsOfSlot, ImgItemData, NotificationData, NotificationState, RateResult, SlotCard, SlotName, SlotOfClasses, Stat, StatForRatingType, SuitBuildType, Tier, UniqueBuild } from './scr/Types';
import { IsExistedAsync } from './scr/common/FileUtils';
import { RoundNumber, prependZero } from './scr/common/Utils';
import { FirebaseDatabase_GetValueAsync, FirebaseDatabase_IncreaseNumberAsync, FirebaseDatabase_SetValueAsync } from './scr/common/Firebase/FirebaseDatabase';
import { CachedMeassure, CachedMeassureResult, IsPointInRectMeasure } from './scr/common/PreservedMessure';
import { CheckAndInitAdmobAsync } from './scr/common/Admob';
import { InterstitialAd, AdEventType, BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { MMKVLoader, useMMKVStorage } from 'react-native-mmkv-storage';
import { Track } from './scr/common/ForageAnalytic';
import { StorageLog_ClearAsync, StorageLog_GetAsync, StorageLog_LogAsync } from './scr/common/StorageLog';
import { Image as ImageCompressor } from 'react-native-compressor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import { getUniqueId, getBrand } from 'react-native-device-info';
import MultiImagePage from './scr/MultiImagePage';
import { GetItemState } from './scr/GridItem';
import { GetLang, LangContext } from './scr/Language';
import { useForceUpdate } from './scr/common/useForceUpdate';
import { GetRateTypeByScore, GetSuitBuildsForUnique, IsUberUnique, defineRateType_UberUnique, defineRateType_Unique } from './scr/AppUtils';
import { API } from './scr/API';
import { AxiosResponse } from 'axios';
import { cancelAllLocalNotifications, setNotification, setNotification_RemainSeconds } from './scr/common/Nofitication';

const adID_Interstitial = Platform.OS === 'android' ?
  'ca-app-pub-9208244284687724/6474432133' :
  'ca-app-pub-9208244284687724/4249911866'

const interstitial = InterstitialAd.createForAdRequest(adID_Interstitial, {
  requestNonPersonalizedAdsOnly: true,
  // keywords: ['fashion', 'clothing'],
});

const adID_Banner = Platform.OS === 'android' ?
  'ca-app-pub-9208244284687724/5493652375' :
  'ca-app-pub-9208244284687724/4776043942'

const today = new Date();
const todayString = 'd' + today.getDate() + '_m' + (today.getMonth() + 1) + '_' + today.getFullYear()

const upArrowIcon = require('./assets/images/up-arrow.png')
const starIcon = require('./assets/images/star-icon.png')
const leftIcon = require('./assets/images/left-icon.png')
const notiIcon = require('./assets/images/noti-icon.png')
const notiMuteIcon = require('./assets/images/mute-noti-icon.png')

const googleStoreOpenLink = "market://details?id=com.maxdiablo"
const appleStoreOpenLink = "https://apps.apple.com/us/app/d4-tool/id6469034531"

const appName = Platform.OS === 'android' ? "Diablo 4 Tool" : 'D4 Tool'

const version = require('./package.json')['version']

const buildsData: Tier[] = require('./assets/BuildsData.json') // for find suit builds
const classesData: SlotOfClasses[] = require('./assets/ClassesData.json') // for rating
const ignoredStats: IgnoredStatsOfSlot[] = require('./assets/IgnoredStats.json') // for ignoring stats
const uniqueBuilds: UniqueBuild[] = require('./assets/UniqueBuilds.json')

const allStatsData: string[] = require('./assets/AllStats.json') // for valid stat name
const allStatsData_IgnoredCase: string[] = allStatsData.map(name => name.toLowerCase())

const DefaultGoodStats = [
  'core skill damage',
  'critical strike damage',
  'all stats',
  'vulnerable damage',
]

const storage = new MMKVLoader().initialize();
// storage.clearStore()

const TouchableOpacityAnimated = Animated.createAnimatedComponent(TouchableOpacity)

const DefaultRateResult: RateResult = { score: -1, text: '...', color: 'black', statsForRating: [] }

const events: Event[] = [
  {
    name: 'World Boss',
    originTime: 1698327000000, // 20h30 26/oct/2023
    intervalInMinute: 210 // 3h30
  },
  {
    name: 'Helltide',
    originTime: 1698336000000, // 10/26/2023 11:00 PM
    intervalInMinute: 135 // 2h15
  },
  {
    name: 'Legion',
    originTime: 1698334200000, // 10/26/2023 10:30 PM
    intervalInMinute: 25 // 25p
  }
]

export var isDevDevice = false

function App(): JSX.Element {
  // current item

  const status = useRef('')
  const userImgUri = useRef('')
  const currentSlot = useRef<SlotCard | undefined>()
  const ocrResultTextOnly = useRef('')
  const suitBuilds = useRef<SuitBuildType[]>()
  const rateResult = useRef<RateResult>(DefaultRateResult)
  const isUberUnique = useRef(false)

  // notification

  const [notificationDataArr, setNotificationDataArr] = useMMKVStorage('notificationDataArr', storage, [] as NotificationData[])
  const currentNotiSettingEventData = useRef<NotificationData>()

  // other

  const [showCheat, setShowCheat] = useState(false)
  const [rateSuccessCount, setRateSuccessCount] = useMMKVStorage('rateSuccessCount', storage, 0)
  const [firstOpenApp, setFirstOpenApp] = useMMKVStorage('firstOpenApp', storage, true)
  const [isLangViet, setIsLangViet] = useMMKVStorage('isLangViet', storage, -1)
  const rateSuccessCountRef = useRef(0)
  const rateSuccessCountPerInterstitialConfig = useRef(2)
  const rateLimitText = useRef('') // api remain limit text
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollViewCurrentOffsetY = useRef(0)
  const scrollTopBtnAnimatedY = useRef(new Animated.Value(Platform.OS === 'android' ? 50 : 300)).current
  const loadedInterstitial = useRef(false)
  const reallyNeedToShowInterstitial = useRef(false)
  const showingInterstitial = useRef(false)
  const cachedAlert = useRef<[string, string] | undefined>(undefined)
  const currentFileID = useRef('')
  const cheatPasteOCRResultCount = useRef(0)
  const showCheatTapCount = useRef(0)
  const isOpeningCameraOrPhotoPicker = useRef(false)
  const lang = useRef(GetLang(isLangViet !== 1))
  const forceUpdate = useForceUpdate()

  // session

  const sessionSelectedImgCount = useRef(0)
  const sessionExtractedCount = useRef(0)
  const sessionStartTime = useRef(0)
  const sessionFileIDs = useRef('')
  const sessionRatedResult = useRef('')
  const sessionRequestAds = useRef(0)
  const sessionClosedAds = useRef(0)

  // multi

  const multiImageItems = useRef<ImgItemData[]>([])
  const isShowMulti = useRef(false)
  const multiSelectedItem = useRef<ImgItemData | undefined>(undefined)
  const lastUpdateStateOfItem = useRef<[ImgItemData | undefined, string]>([undefined, ''])
  const canPressNextItemInMulti = useRef(false)
  const canPressPreviousItemInMulti = useRef(false)

  // remote config

  const remoteConfig = useRef({
    android_version: '',
    auto_delete_file_if_extract_success: true,
    show_rate_app: false,
    save_ocr_result: false,
    ios_disable_suit_build: true,
    dev_devices: '',
    version_note_vn: '',
    version_note_en: '',
    notify_vn: '',
    notify_en: '',
    notify_max_ver: '',
    notify_style: 0,
    apple_review_version: '',
    api_index: 1,
  })

  // moving pic

  const [isTouchingImg, setIsTouchingImg] = useState(false)
  const imgScale = useRef(new Animated.Value(1)).current
  const imgMove = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const initialImg2TouchesDistance = useRef(-1)
  const initialImgTouch1Event = useRef<NativeTouchEvent | undefined>(undefined)
  const imgViewMeasure = useRef<CachedMeassure>(new CachedMeassure(false))
  const imgViewMeasureResult = useRef<CachedMeassureResult | undefined>(undefined)

  // funcs

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
    isOpeningCameraOrPhotoPicker.current = true

    const response = await launchImageLibrary({
      mediaType: 'photo',
      maxHeight: 1000,
      maxWidth: 1000,
      selectionLimit: limitMultiImage,
    })

    isOpeningCameraOrPhotoPicker.current = false

    if (response.didCancel)
      return
    else if (!response.assets || response.assets.length <= 0) {
      Alert.alert('Có lỗi khi chọn hình', 'Lỗi:\n\n' + ToCanPrint(response))
      return
    }
    else { // pick success
      // multi 

      if (response.assets.length > 1) {
        onSelectedMultiImgAsync(response.assets)
        Track('pick_multi_photo')
        return
      }

      // single img

      const path = response.assets[0].uri

      if (!path) {
        Alert.alert('Có lỗi khi chọn hình', 'Lỗi path empty.\n\n' + ToCanPrint(response))
        return
      }

      onSelectedImgAsync(path)
      Track('pick_photo')
    }
  }, [])

  const generateImgID = useCallback(() => {
    let now = Date.now().toString()
    let s = now.substring(now.length - 3) + '_' + Math.random().toString().substring(2, 5)
    // console.log(s, now);
    return s
  }, [])

  const onPressLang = useCallback((isViet: boolean) => {
    setIsLangViet(isViet ? 0 : 1)
    lang.current = GetLang(isViet)

    if (isViet)
      FirebaseIncrease('lang/viet')
    else
      FirebaseIncrease('lang/eng')
  }, [])

  const onPressTakeCamera = useCallback(async () => {
    const camRequestRes = await RequestCameraPermissionAsync()

    if (camRequestRes !== true) {
      Alert.alert(lang.current.cam_permission, lang.current.pls_permit)
      return
    }

    isOpeningCameraOrPhotoPicker.current = true

    const result = await launchCamera({
      saveToPhotos: false,
      cameraType: 'back',
      mediaType: 'photo',
      quality: Platform.OS === 'android' ? 0.5 : 0.1,
    } as CameraOptions)

    isOpeningCameraOrPhotoPicker.current = false

    if (!result || !result.assets)
      return

    const path = result.assets[0].uri

    if (!path)
      return

    // take success

    onSelectedImgAsync(path)
    Track('take_camera')
  }, [])

  const onPressTotalScore = useCallback(async () => {
    if (cheatPasteOCRResultCount.current < 5) {
      cheatPasteOCRResultCount.current++
      return
    }

    cheatPasteOCRResultCount.current = 0

    const txt = await Clipboard.getString()
    await onGotOcrResultTextAsync(txt, true, '')
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
    if (!ocrResultTextOnly.current)
      return

    Clipboard.setString(ocrResultTextOnly.current)
  }, [])

  const onPressNextItemInMulti = useCallback((isNext: boolean) => {
    if (!multiSelectedItem.current)
      return

    if (isNext && !canPressNextItemInMulti.current)
      return

    if (!isNext && !canPressPreviousItemInMulti.current)
      return

    const idx = multiImageItems.current.indexOf(multiSelectedItem.current)

    if (idx < 0)
      return

    multiSelectedItem.current = multiImageItems.current[idx + (isNext ? 1 : -1)]

    updateSelectedItemStateToMainScreen()
  }, [])

  const onPressItemInMulti = useCallback((item: ImgItemData) => {
    multiSelectedItem.current = item
    updateSelectedItemStateToMainScreen()
    toggleShowMulti(false)
  }, [])

  const onPressNotiBtn_OnlyNextEvent = useCallback(() => {
  }, [])

  const onPressNotiBtn_AllNextEvents = useCallback(() => {
  }, [])

  const onPressNotiBtn_TurnOff = useCallback(() => {
    if (!currentNotiSettingEventData.current)
      return

    currentNotiSettingEventData.current.state = NotificationState.Off
    currentNotiSettingEventData.current = undefined

    forceUpdate()
  }, [])

  const onPressNotiBtn_NotifyIn = useCallback((min: number) => {
  }, [])

  const resetNotification = useCallback(() => {

  }, [notificationDataArr])

  const onPressEventNotiIcon = useCallback((event: Event) => {
    let data = GetNotificationData(notificationDataArr, event)
    const isExist = data !== undefined

    if (!isExist || !data) {
      data = {
        nameEvent: event.name,
        state: NotificationState.Off,
        comingNotiTimeInMinutes: 0
      } as NotificationData
    }

    currentNotiSettingEventData.current = data

    let arr = notificationDataArr

    if (!arr)
      arr = [] as NotificationData[]

    if (!isExist) {
      arr.push(data)
      setNotificationDataArr([...arr])
    }
    else
      forceUpdate()
  }, [notificationDataArr])

  const updateSelectedItemStateToMainScreen = useCallback(() => {
    if (!multiSelectedItem.current)
      return

    const item = multiSelectedItem.current
    const state = GetItemState(item)

    if (item === lastUpdateStateOfItem.current[0] &&
      state === lastUpdateStateOfItem.current[1])
      return
    else {
      lastUpdateStateOfItem.current[0] = item
      lastUpdateStateOfItem.current[1] = state
    }

    userImgUri.current = item.uri
    currentSlot.current = item.slot
    ocrResultTextOnly.current = item.ocrResultTxt ? item.ocrResultTxt : ''
    suitBuilds.current = item.suitBuilds
    rateResult.current = item.rateResult ? item.rateResult : DefaultRateResult
    currentFileID.current = item.fileID
    isUberUnique.current = IsUberUnique(ocrResultTextOnly.current)

    if (state === 'success') {
      status.current = ''
    }

    else if (state === 'wait_api') {
      status.current = lang.current.wait_api
    }

    else { // fail
      status.current = ''

      if (item.errorAlert)
        cacheOrShowAlert(item.errorAlert[0], item.errorAlert[1])
    }

    // update state navigate btns

    const idx = multiImageItems.current.indexOf(multiSelectedItem.current)

    canPressPreviousItemInMulti.current = idx > 0
    canPressNextItemInMulti.current = idx < multiImageItems.current.length - 1

    // update

    forceUpdate()
  }, [])

  const checkAndShowAdsInterstitial = useCallback(() => {
    // console.log('cur rate success count', rateSuccessCountRef.current, '/ ' + rateSuccessCountPerInterstitialConfig.current);

    if (rateSuccessCountRef.current < rateSuccessCountPerInterstitialConfig.current)
      return

    showAdsInterstitial('single_pic')
  }, [])

  const showAdsInterstitial = useCallback((location: string) => {
    reallyNeedToShowInterstitial.current = true
    Track('fire_show_ads', loadedInterstitial.current)
    FirebaseIncrease('ads_v2/day/' + todayString + '/' + location + '/check_to_call_sum')
    FirebaseIncrease('ads_v2/check_to_call_total')

    if (loadedInterstitial.current) {
      loadedInterstitial.current = false
      sessionRequestAds.current++

      FirebaseIncrease('ads_v2/really_call_total')
      FirebaseIncrease('ads_v2/day/' + todayString + '/' + location + '/really_call')

      interstitial.show()
    }
    else {
      loadAdsInterstitial()
    }
  }, [])

  const loadAdsInterstitial = useCallback(() => {
    // console.log('loading interstitial')
    loadedInterstitial.current = false
    interstitial.load()
  }, [])

  const toggleShowMulti = useCallback((isUserPress: boolean) => {
    isShowMulti.current = !isShowMulti.current
    forceUpdate()

    if (isUserPress && isShowMulti.current)
      showAdsInterstitial('press_show_multi')
  }, [])

  const updateMultiStateAsync = useCallback(async () => {
    if (!isShowMulti.current) {
      updateSelectedItemStateToMainScreen()
      return
    }

    forceUpdate()
  }, [])

  const saveOcrResult = useCallback((isSuccess: boolean, resultText: string, fileId: string) => {
    if (!isDevDevice && remoteConfig.current.save_ocr_result) {
      const setpath = (isSuccess ? 'ocr_result_2/success/' : 'ocr_result_2/fail/') + todayString + '/' + fileId
      FirebaseDatabase_SetValueAsync(setpath, { result: resultText, version })
    }
  }, [])

  const startHandleMulti = useCallback(() => {
    async function StartFlowAsync(item: ImgItemData) {
      // compress

      item.uri = await CompressImageAsync(item.uri)

      // upload

      const id = generateImgID()
      item.fileID = id
      sessionFileIDs.current += ('[' + id + ']')

      const fbpath = (isDevDevice ? 'dev_file/' : 'user_file/') + todayString + '/' + id
      const uplodaErr = await FirebaseStorage_UploadAsync(fbpath, item.uri)

      if (uplodaErr) { // upload fail
        item.errorAlert = [
          lang.current.cant_upload,
          lang.current.no_internet + '\n\n' + ToCanPrint(uplodaErr)
        ]

        updateMultiStateAsync()
        return
      }

      Track('uploaded_done', {
        success: uplodaErr === null,
        fileID: id
      })

      const getURLRes = await FirebaseStorage_GetDownloadURLAsync(fbpath)

      if (getURLRes.error) {
        item.errorAlert = [
          'Lỗi lấy url ảnh',
          'Mã lỗi: ' + ToCanPrint(getURLRes.error)
        ]

        updateMultiStateAsync()
        return
      }

      // call api

      Track('call_api', { fileID: id })

      const [resultText, response] = await API(getURLRes.url, remoteConfig.current.api_index)

      sessionExtractedCount.current++

      updateTextLimitRate(response)

      if (!resultText) { // failed
        item.ocrResultTxt = ''

        item.errorAlert = [
          lang.current.cant_rate,
          lang.current.pls_pick_other + '\n\n' + ToCanPrint(response)
        ]

        updateMultiStateAsync()

        Track('call_api_failed')

        return
      }
      else { // success
        item.ocrResultTxt = resultText
      }

      // check unique

      const arrUniqueSuitBuilds = GetSuitBuildsForUnique(resultText, uniqueBuilds)
      const isUniqueAndHasSuitBuilds = arrUniqueSuitBuilds.length > 0

      // extract 

      let slot = isUniqueAndHasSuitBuilds ? 'unique' : ExtractSlotCard(resultText, false)
      const isSuccess = isUniqueAndHasSuitBuilds || typeof slot === 'object'

      saveOcrResult(isSuccess, resultText, id)

      if (isSuccess) {
        FirebaseIncrease('extracted_count/' + todayString + '/success')

        // delete file

        if (remoteConfig.current.auto_delete_file_if_extract_success === true)
          FirebaseStorage_DeleteAsync(fbpath)

        if (isUniqueAndHasSuitBuilds) {
          item.suitBuilds = arrUniqueSuitBuilds.map((buildName: string) => [
            undefined,
            {
              name: buildName,
            } as Build,
            undefined,
            undefined
          ] as SuitBuildType)

          sessionRatedResult.current += '[UNIQUE]'
        }
        else { // normal slot
          // @ts-ignore
          slot = HandleWeirdStatNames(slot)
          slot = FilterStats(slot)

          const suitBuilds = findSuitBuilds(slot)
          const rateRes = rate(slot, suitBuilds)

          item.slot = slot
          item.suitBuilds = suitBuilds
          item.rateResult = rateRes

          sessionRatedResult.current += ('[' + rateRes.text + '-' + RoundNumber(rateRes.score, 1) + ']')
        }

        updateMultiStateAsync()
        return
      }
      else { // extract fail
        FirebaseIncrease('extracted_count/' + todayString + '/fail')
        Track('extract_failed')

        // @ts-ignore
        item.errorAlert = getAlertContentWhenExtractFail(slot)

        updateMultiStateAsync()
        return
      }
    }

    // tracking

    multiSelectedItem.current = undefined
    sessionSelectedImgCount.current += multiImageItems.current.length
    FirebaseIncrease('multi_used_count/' + todayString)

    FirebaseIncrease(
      'multi_selected_img_count/' +
      todayString + '/' +
      (Date.now()), multiImageItems.current.length)

    // show ads

    storage.getInt('used_multi_count', (_: any, count: any) => {
      if (typeof count !== 'number')
        count = 0

      if (count >= 2)
        showAdsInterstitial('multi_pic')

      storage.setInt('used_multi_count', count + 1)
    })

    // handles

    for (let i = 0; i < multiImageItems.current.length; i++)
      StartFlowAsync(multiImageItems.current[i])
  }, [])

  const onSelectedMultiImgAsync = useCallback(async (response: Asset[]) => {
    if (response.length > limitMultiImage) {
      response = response.slice(0, limitMultiImage)
    }

    multiImageItems.current = response.map((img) => {
      return { uri: img.uri } as ImgItemData
    })

    FirebaseIncrease('selected_img_count/' + todayString, multiImageItems.current.length)

    toggleShowMulti(false)
    startHandleMulti()
  }, [])

  const onSelectedImgAsync = useCallback(async (path: string) => {
    currentSlot.current = undefined
    ocrResultTextOnly.current = ''
    suitBuilds.current = undefined
    rateResult.current = DefaultRateResult
    userImgUri.current = ''
    multiImageItems.current = []
    isUberUnique.current = false

    sessionSelectedImgCount.current++

    if (!await IsExistedAsync(path, false)) {
      status.current = ''
      forceUpdate()

      Alert.alert(
        'File không tồn tại để upload',
        'Path: ' + path)

      return
    }

    path = await CompressImageAsync(path)
    userImgUri.current = path

    FirebaseIncrease('selected_img_count/' + todayString)

    currentFileID.current = generateImgID()
    sessionFileIDs.current += ('[' + currentFileID.current + ']')

    status.current = lang.current.uploading
    forceUpdate()

    const fbpath = (isDevDevice ? 'dev_file/' : 'user_file/') + todayString + '/' + currentFileID.current
    const uplodaErr = await FirebaseStorage_UploadAsync(fbpath, path)

    Track('uploaded_done', {
      success: uplodaErr === null,
      fileID: currentFileID.current
    })

    if (uplodaErr) {
      status.current = ''
      forceUpdate()

      Alert.alert(
        lang.current.cant_upload,
        lang.current.no_internet + '\n\n' + ToCanPrint(uplodaErr))

      return
    }

    const getURLRes = await FirebaseStorage_GetDownloadURLAsync(fbpath)

    if (getURLRes.error) {
      status.current = ''
      forceUpdate()

      Alert.alert(
        'Lỗi lấy url ảnh',
        'Mã lỗi: ' + ToCanPrint(getURLRes.error))

      return
    }

    await detectFromImgUrlAsync_ImageToText(getURLRes.url, fbpath)
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
    const hideTopY = Platform.OS === 'android' ? 50 : 300
    const showTopY = multiImageItems.current.length === 0 ? 0 : -50

    const native = event.nativeEvent

    const nowY = native.contentOffset.y
    scrollViewCurrentOffsetY.current = nowY

    const value = nowY > thresholdScrollHide ? showTopY : hideTopY

    Animated.spring(
      scrollTopBtnAnimatedY,
      {
        toValue: value,
        useNativeDriver: false,
      }
    ).start()
  }, [])

  const findSuitBuilds = useCallback((userSlot: SlotCard) => {
    // find suits

    const arr: [Tier, Build, SlotCard, number][] = []

    const linesMatchIsGood = 3

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
            arr.push([tier, build, slot, statEquals.length])
            break
          }
        }
      }
    }

    // sort

    if (arr.length > 0) {
      arr.sort((a, b) => {
        if (a[3] < b[3]) {
          return 1;
        } else if (a[3] > b[3]) {
          return -1;
        }

        return 0;
      })
    }

    // return

    return arr
  }, [])

  const rate = useCallback((userSlot: SlotCard, suitBuilds: SuitBuildType[]) => {
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
      return DefaultRateResult
    }

    // start find

    const arrStatsForRating: StatForRatingType[] = []

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
          arrStatsForRating.push([stat, classs, findStats[0], -1])
          break
        }
      }
    }

    // append default good stats

    userGoodStats.forEach(stat => {
      if (arrStatsForRating.findIndex(tuple => tuple[0].name.toLowerCase() === stat.name.toLowerCase()) < 0) {
        arrStatsForRating.push([stat, undefined, undefined, -1])
      }
    })

    // rate

    let totalScore_Class = 0

    for (let i = 0; i < arrStatsForRating.length; i++) {
      const [userStat, classs, classStat, score] = arrStatsForRating[i]

      // this stat score

      let curScore = 0

      if (userStat.max === userStat.min)
        curScore = 0
      else
        curScore = (userStat.value - userStat.min) / (userStat.max - userStat.min)

      // sum score

      totalScore_Class += curScore
      arrStatsForRating[i][3] = curScore
    };

    // calc rateScore_Class

    const rateScore_Class = totalScore_Class / 4
    let rateScore_Class_Above3: number
    let valuableStatsScore = (totalScore_Class + (arrStatsForRating.length / 4)) / 5

    // calc rateScore_Class_BuildAbove3Stats

    if (suitBuilds.length > 0) {
      // count

      let totalScore_above3stats = 0

      let count_above3stats = 0

      for (let i = 0; i < suitBuilds.length; i++) {
        let matchStatCount = suitBuilds[i][3]

        if (matchStatCount === undefined)
          continue

        let score = Math.min(1, matchStatCount / 4)

        if (matchStatCount >= 3) { // from and above 3
          totalScore_above3stats += score
          count_above3stats++
        }
      }

      // calc rateScore_Class_BuildAbove3Stats

      rateScore_Class_Above3 = (totalScore_above3stats + totalScore_Class) / (count_above3stats + 4)
      valuableStatsScore = (totalScore_above3stats + totalScore_Class + (arrStatsForRating.length / 4)) / (count_above3stats + 4 + 1)
    }
    else {
      rateScore_Class_Above3 = rateScore_Class
    }

    // rate final

    const finalScore = Math.max(rateScore_Class, rateScore_Class_Above3, valuableStatsScore)
    const resultRate = GetRateTypeByScore(finalScore, lang.current)

    Track('rated', {
      finalScore,
      stats: arrStatsForRating.length,
      result: resultRate[1],
      fileID: currentFileID.current,
    })

    return {
      score: finalScore,
      text: resultRate[1],
      color: resultRate[0],
      statsForRating: arrStatsForRating,
    } as RateResult
  }, [])

  const getStatNameColorCompareWithBuild = useCallback((stat: string, slot: SlotCard) => {
    if (!slot)
      return 'white'

    const idx = slot.stats.findIndex(i => i.name.toLowerCase() === stat.toLowerCase())

    return idx >= 0 ? 'white' : 'gray'
  }, [])

  const getScoreOfStat = useCallback((statName: string, x10: boolean, statsForRating: StatForRatingType[]) => {
    if (!statsForRating || statsForRating.length === 0)
      return 0

    const stat = statsForRating.find(i => i[0].name.toLowerCase() === statName.toLowerCase())

    if (stat !== undefined) {
      if (x10)
        return RoundNumber(stat[3] * 10, 1)
      else
        return stat[3]
    }
    else
      return -1
  }, [])

  const getRateStatColor = useCallback((statName: string, statsForRating: StatForRatingType[]) => {
    if (!statsForRating)
      return 'green'

    if (statsForRating.length === 0)
      return 'gray'

    const stat = statsForRating.find(i => i[0].name.toLowerCase() === statName.toLowerCase())

    if (stat !== undefined) {
      return GetRateTypeByScore(stat[3], lang.current)[0]
    }
    else
      return 'gray'
  }, [])

  const onGotOcrResultTextAsync = useCallback(async (result: string, stringifyResult: boolean, fbPathToDeleteFile: string) => {
    sessionExtractedCount.current++
    ocrResultTextOnly.current = JSON.stringify(result)

    // check unique

    isUberUnique.current = IsUberUnique(result)
    const arrUniqueSuitBuilds = isUberUnique.current ? [] : GetSuitBuildsForUnique(result, uniqueBuilds)
    const isUniqueAndHasSuitBuilds = arrUniqueSuitBuilds.length > 0

    let extractRes = (isUniqueAndHasSuitBuilds || isUberUnique.current) ? 'unique' : ExtractSlotCard(result, stringifyResult)
    const isSuccess = isUberUnique.current || isUniqueAndHasSuitBuilds || typeof extractRes === 'object'

    // track

    if (isSuccess)
      FirebaseIncrease('extracted_count/' + todayString + '/success')
    else
      FirebaseIncrease('extracted_count/' + todayString + '/fail')

    saveOcrResult(isSuccess, ocrResultTextOnly.current, currentFileID.current)

    // rate

    if (isSuccess) { // success
      if (stringifyResult) {
        console.log(JSON.stringify(extractRes))
        console.log(JSON.stringify(extractRes, null, 1));
      }

      // delete file

      if (remoteConfig.current.auto_delete_file_if_extract_success === true)
        FirebaseStorage_DeleteAsync(fbPathToDeleteFile)

      // rate

      if (isUberUnique.current) { // uber unique
        sessionRatedResult.current += '[UBER UNIQUE]'
      }
      else if (isUniqueAndHasSuitBuilds) { // unique
        suitBuilds.current = arrUniqueSuitBuilds.map((buildName: string) => [
          undefined,
          {
            name: buildName,
          } as Build,
          undefined,
          undefined
        ] as SuitBuildType)

        sessionRatedResult.current += '[UNIQUE]'
      }
      else { // normal slot
        // @ts-ignore
        extractRes = HandleWeirdStatNames(extractRes)
        currentSlot.current = FilterStats(extractRes)

        suitBuilds.current = findSuitBuilds(currentSlot.current)
        rateResult.current = rate(currentSlot.current, suitBuilds.current)

        sessionRatedResult.current += ('[' + rateResult.current.text + '-' + RoundNumber(rateResult.current.score, 1) + ']')
      }

      rateSuccessCountRef.current++
      setRateSuccessCount(rateSuccessCountRef.current)

      // done

      forceUpdate()
    }
    else { // fail
      status.current = ''
      forceUpdate()

      // @ts-ignore
      const [title, content] = getAlertContentWhenExtractFail(extractRes)
      cacheOrShowAlert(title, content)

      Track('extract_failed')
    }
  }, [])

  const getAlertContentWhenExtractFail = useCallback((extractRes: string) => {
    if (extractRes === 'miss brackets') {
      return [
        lang.current.cant_rate,

        lang.current.miss_bracket +
        '[] Advanced Tooltip Compare\n' +
        '[] Advanced Tooltip Information']
    }
    else if (extractRes === 'unique') {
      return [
        'Ooops!',
        lang.current.err_unique]
    }
    else { // other errors
      return [
        lang.current.cant_rate,
        lang.current.pls_pick_other + '\n\n' + extractRes]
    }
  }, [])

  const cacheOrShowAlert = useCallback((title: string, content: string) => {
    if (showingInterstitial.current) { // showing ads
      cachedAlert.current = [title, content]
    }
    else // not showing ads
      AlertWithCopy(title, content)
  }, [])

  const detectFromImgUrlAsync_ImageToText = useCallback(async (imgUrl: string, fbPathToDelete: string) => {
    status.current = lang.current.wait_api
    forceUpdate()

    checkAndShowAdsInterstitial() // show ads

    try {
      Track('call_api', { fileID: currentFileID.current })

      // call api

      const [resultTxt, response] = await API(imgUrl, remoteConfig.current.api_index)

      // api limit text

      updateTextLimitRate(response)

      // handle 

      if (!resultTxt)
        throw ToCanPrint(response)

      onGotOcrResultTextAsync(resultTxt, false, fbPathToDelete)
    } catch (error) {
      cacheOrShowAlert(
        lang.current.cant_rate,
        lang.current.pls_pick_other + '\n\n' + ToCanPrint(error))

      userImgUri.current = ''
      status.current = ''
      forceUpdate()

      Track('call_api_failed')

      FirebaseIncrease('call_api_failed_count/' + todayString)
    }
  }, [])

  const updateTextLimitRate = useCallback((response: AxiosResponse | undefined) => {
    if (response && response.headers) {
      if (response.headers['x-ratelimit-requests-remaining'] > 0)
        rateLimitText.current = `${response.headers['x-ratelimit-requests-remaining']}/${response.headers['x-ratelimit-requests-limit']}`
      else
        rateLimitText.current = `(${Math.abs(response.headers['x-ratelimit-requests-remaining'])})`
    }
    else {
      rateLimitText.current = 'N/A'
    }
  }, [])

  const getReleaseNote = useCallback(() => {
    let releaseNote = isLangViet !== 1 ?
      remoteConfig.current.version_note_vn :
      remoteConfig.current.version_note_en

    if (!releaseNote)
      return undefined

    const arr = releaseNote.split('@')
    return arr.join('\n')
  }, [isLangViet])

  const getRemainTimeTextOfEvent = useCallback((event: Event) => {
    let target = CalcTargetTimeAndSaveEvent(event)

    const remainMS = target - Date.now()
    const [hour, min, sec] = GetHourMinSecFromMs(remainMS)

    let remainText = prependZero(hour) + 'h : ' + prependZero(min) + 'm : ' + prependZero(sec) + 's'

    const targetText = lang.current.startAt + new Date(target).toLocaleTimeString()

    const isPrepareFinish = hour === 0 && min === 0

    return [remainText, targetText, isPrepareFinish]
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

    if (VersionToNumber(version) < VersionToNumber(configVersion)) { // need to update
      const storeLink = Platform.OS === 'android' ? googleStoreOpenLink : appleStoreOpenLink

      let releaseNote = getReleaseNote()

      Alert.alert(
        lang.current.new_update,
        lang.current.let_update + (releaseNote ? ('\n\n' + releaseNote) : ''),
        [
          {
            text: lang.current.update,
            onPress: () => Linking.openURL(storeLink)
          }
        ])
    }
    else { // đag là version mới rồi
      const last_installed_version = await storage.getStringAsync('last_installed_version')
      const ver = (version as string).replaceAll('.', '_')

      if (last_installed_version !== version) { // new install or updated
        FirebaseIncrease('new_version_user_count/' + ver)

        await storage.setStringAsync('last_installed_version', version)

        // alert release note

        let releaseNote = getReleaseNote()

        if (!releaseNote)
          return

        Alert.alert(
          lang.current.thank_for_update,
          lang.current.update_detail + ':\n\n' + releaseNote)
      }
    }
  }, [])

  // init once 

  useEffect(() => {
    let appStateRemove: NativeEventSubscription

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

        appStateRemove = AppState.addEventListener('change', (e) => {
          // console.log(ToCanPrint(e));

          if (e === 'active') { // start session

            if (isOpeningCameraOrPhotoPicker.current) {
              isOpeningCameraOrPhotoPicker.current = false
              return
            }

            sessionExtractedCount.current = 0
            sessionSelectedImgCount.current = 0
            sessionClosedAds.current = 0
            sessionRequestAds.current = 0
            sessionFileIDs.current = ''
            sessionRatedResult.current = ''
            sessionStartTime.current = Date.now()
          }
          else if (e === 'background') { // end session
            if (isOpeningCameraOrPhotoPicker.current) {
              return
            }

            // const fbpath = 'sessions_v2/' + todayString + '/' + Date.now() + '/' + getUniqueId()
            const fbpath =
              'sessions_v3/' +
              (sessionSelectedImgCount.current <= 0 ? 'Zero/' : 'NoZero/') +
              todayString + '/' +
              (new Date()).getHours() + 'h/' +
              getUniqueId() + '/' +
              Date.now()

            FirebaseDatabase_SetValueAsync(fbpath, {
              extracted_count: sessionExtractedCount.current,
              selected_img: sessionSelectedImgCount.current,
              duration: (Date.now() - sessionStartTime.current) / 1000 + 's',
              version,
              files: sessionFileIDs.current,
              start_time: new Date(sessionStartTime.current).toString(),
              calledShowAds: sessionRequestAds.current,
              closedAds: sessionClosedAds.current,
              rated: sessionRatedResult.current,
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

      // notification

      cancelAllLocalNotifications()
    }

    initAsync()

    const unsubscribe_ads_interstitial_loaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      // console.log('loaded interstitial')
      loadedInterstitial.current = true

      if (reallyNeedToShowInterstitial.current)
        showAdsInterstitial('single')
    });

    const unsubscribe_ads_interstitial_opened = interstitial.addAdEventListener(AdEventType.OPENED, () => {
      // console.log('open interstitial')
      showingInterstitial.current = true
      Track('ads_opened')
    });

    const unsubscribe_ads_interstitial_closed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      // console.log('closed interstitial')
      reallyNeedToShowInterstitial.current = false
      showingInterstitial.current = false
      sessionClosedAds.current++
      loadAdsInterstitial()

      setRateSuccessCount(0)
      rateSuccessCountRef.current = 0

      // show cached alert

      if (cachedAlert.current !== undefined) {
        AlertWithCopy(cachedAlert.current[0], cachedAlert.current[1])
        cachedAlert.current = undefined
      }

      FirebaseIncrease('ads_v2/day/' + todayString + '/closed')
      FirebaseIncrease('ads_v2/closed_total')
      Track('ads_closed')
    });

    const unsubscribe_ads_interstitial_error = interstitial.addAdEventListener(AdEventType.ERROR, (e) => {
      console.log('error interstitial', e)

      if (reallyNeedToShowInterstitial.current)
        loadAdsInterstitial()

      Track('ads_error', ToCanPrint(e))
    })

    const updateEventInterval = setInterval(() => { forceUpdate() }, 1000)

    return () => {
      unsubscribe_ads_interstitial_loaded()
      unsubscribe_ads_interstitial_opened()
      unsubscribe_ads_interstitial_closed()
      unsubscribe_ads_interstitial_error()

      clearTimeout(updateEventInterval)

      if (appStateRemove && appStateRemove.remove)
        appStateRemove.remove()
    }
  }, [])

  // should show suid build list?

  const notShowSuitBuilds =
    !suitBuilds.current ||
    suitBuilds.current.length === 0


  const ios_diable_info =
    Platform.OS === 'ios' && !__DEV__ &&
    (remoteConfig.current.ios_disable_suit_build ||
      version === remoteConfig.current.apple_review_version)

  // rate result box text

  let rateResultBoxTxt = rateResult.current.text
  let rateResultBoxTxtColor = rateResult.current.text === '...' ? 'white' : 'black'
  let rateResultBoxColor = rateResult.current.color

  const isUnique =
    rateResult.current === DefaultRateResult &&
    suitBuilds.current &&
    suitBuilds.current.length > 0

  if (isUberUnique.current) { // uber unique
    const define = defineRateType_UberUnique(lang.current)

    rateResultBoxTxt = define[1]
    rateResultBoxColor = define[0]

    rateResultBoxTxtColor = 'black'
  }
  else if (isUnique) { // unique
    const define = defineRateType_Unique(lang.current)

    rateResultBoxTxt = define[1]
    rateResultBoxColor = define[0]

    rateResultBoxTxtColor = 'black'
  }

  const isShowScoreTxt = !isUnique && !isUberUnique.current

  const showNotifyText =
    remoteConfig.current.notify_vn &&
    remoteConfig.current.notify_en &&
    (!remoteConfig.current.notify_max_ver || VersionToNumber(version) <= VersionToNumber(remoteConfig.current.notify_max_ver))

  const notifyText = showNotifyText ?
    (isLangViet !== 1 ? remoteConfig.current.notify_vn : remoteConfig.current.notify_en) :
    undefined

  const notifyTextColor = remoteConfig.current.notify_style === 2 ? 'tomato' : 'white'
  const notifyTextSize = remoteConfig.current.notify_style === 0 ? FontSize.Normal : FontSize.Big
  const notifyTextWeight: TextStyle['fontWeight'] = remoteConfig.current.notify_style === 0 ? 'normal' : FontWeight.B500

  // render lange selection

  if (isLangViet === -1) {
    return (
      <SafeAreaView style={{ gap: Outline.Gap, flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => onPressLang(true)} style={{ minWidth: windowSize.width / 2, borderRadius: BorderRadius.Small, padding: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'black', fontSize: FontSize.Normal }}>{lang.current.vie}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onPressLang(false)} style={{ minWidth: windowSize.width / 2, borderRadius: BorderRadius.Small, padding: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'black', fontSize: FontSize.Normal }}>{lang.current.en}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    )
  }

  // main render

  return (
    <LangContext.Provider value={lang.current}>
      <SafeAreaView {...imageResponse.current} style={{ flex: 1, gap: Outline.Gap, backgroundColor: 'black' }}>
        <StatusBar barStyle={'light-content'} backgroundColor={'black'} />
        <BannerAd unitId={adID_Banner} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true, }} />
        {/* app name */}
        <View style={{ marginHorizontal: Outline.Margin, flexDirection: 'row', gap: Outline.Gap, alignItems: 'center', justifyContent: 'space-between' }}>
          <Text onPress={() => showAdsInterstitial('test')} style={{ fontSize: FontSize.Big, color: 'tomato', fontWeight: 'bold' }}>{appName}</Text>
          <Text onPress={remoteConfig.current.show_rate_app ? OnPressed_StoreRate : undefined} style={{ fontStyle: 'italic', fontSize: FontSize.Normal, color: remoteConfig.current.show_rate_app ? 'white' : 'black' }}>{lang.current.rate_app}</Text>
        </View>
        {/* red alert (notify) */}
        {
          !showNotifyText ? undefined :
            <View style={{ marginHorizontal: Outline.Margin, gap: Outline.Gap, alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: notifyTextSize, color: notifyTextColor, fontWeight: notifyTextWeight }}>{notifyText}</Text>
            </View>
        }
        {/* the rest */}
        <ScrollView
          scrollEnabled={!isTouchingImg}
          ref={scrollViewRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          style={{ marginHorizontal: Outline.Margin }}>
          {/* select photo btns */}
          <Text onPress={OnPressed_ShowCheat} style={{ fontSize: 15, color: 'white', marginBottom: Outline.Margin }}>{lang.current.pick_photo_guide}</Text>
          <View style={{ flexDirection: 'row', gap: Outline.Gap, justifyContent: 'center' }}>
            <TouchableOpacity onPress={onPressPickPhoto} style={{ flex: 1, borderRadius: BorderRadius.Small, padding: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'black', fontSize: FontSize.Normal }}>{lang.current.pick_photo}</Text>
              <Text style={{ color: 'black', fontSize: FontSize.Small }}>{lang.current.pick_photo_btn_guide}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onPressTakeCamera} style={{ flex: 1, borderRadius: BorderRadius.Small, padding: 5, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: 'black', fontSize: FontSize.Normal }}>{lang.current.take_cam}</Text>
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
                  <Text style={{ opacity: isTouchingImg ? 0 : 1, fontSize: 15, color: 'gray' }}>ID: {currentFileID.current} ({version})</Text>
              }
            </View>
            {/* loading & info */}
            {
              // loading or special item (unique,...) or blank
              !currentSlot.current ?
                <View style={{ opacity: isTouchingImg ? 0 : 1, marginLeft: Outline.Margin, flex: 1 }}>
                  {
                    userImgUri.current === '' || ocrResultTextOnly.current ?
                      // special item or blank
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Outline.Gap }}>
                        {
                          !isUnique && !isUberUnique.current ?
                            // blank
                            undefined :
                            // special item
                            <Text style={{ color: 'white', fontSize: FontSize.Big }}>{isUnique ? 'Unique' : 'Uber Unique'}</Text>
                        }
                      </View> :
                      // indicator (loading)
                      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: Outline.Gap }}>
                        <ActivityIndicator color={'tomato'} />
                        <Text style={{ color: 'white' }}>{status.current}</Text>
                      </View>
                  }
                </View> :
                // user stats info
                <View style={{ opacity: (ios_diable_info || isTouchingImg) ? 0 : 1, marginLeft: Outline.Margin, flex: 1 }}>
                  {/* slot name  */}
                  <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontWeight: FontWeight.B500, color: 'white', borderColor: 'white', borderRadius: BorderRadius.Small, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>
                      {currentSlot.current.slotName}
                    </Text>
                    <View style={{ flex: 1 }} />
                  </View>
                  {/* item power */}
                  <Text style={{ marginTop: Outline.Gap / 2, color: 'white' }}>
                    Item Power: {currentSlot.current.itemPower}
                  </Text>
                  {/* stats */}
                  <View style={{ gap: Outline.Gap, marginTop: Outline.Gap }}>
                    {
                      currentSlot.current.stats.map((stat, index) => {
                        const color = getRateStatColor(stat.name, rateResult.current.statsForRating)
                        const scoreX10 = getScoreOfStat(stat.name, true, rateResult.current.statsForRating)

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
              <View style={{ minWidth: windowSize.width * 0.4, alignItems: 'center', borderWidth: rateResult.current.text === '...' ? 1 : 0, borderColor: 'white', backgroundColor: rateResultBoxColor, padding: 10, borderRadius: BorderRadius.Normal }} >
                <Text style={{ color: rateResultBoxTxtColor, fontSize: 30, fontWeight: 'bold' }}>{rateResultBoxTxt}</Text>
              </View>
              {
                !isShowScoreTxt ? undefined :
                  <Text onPress={onPressTotalScore} style={{ color: 'white', fontSize: 30, fontWeight: 'bold' }}>{rateResult.current.score >= 0 ? RoundNumber(rateResult.current.score * 10, 1) : 0}/10</Text>
              }
            </View>
          }
          {/* ios updating note */}
          {
            !ios_diable_info ? undefined :
              <View style={{ opacity: isTouchingImg ? 0 : 1, marginTop: Outline.Gap, alignItems: 'center', gap: Outline.Gap }}>
                <Text style={{ color: 'white', fontSize: FontSize.Big, }}>{lang.current.ios_updating}</Text>
              </View>
          }
          {/* builds suit */}
          {
            notShowSuitBuilds || ios_diable_info ? undefined :
              <View style={{ opacity: isTouchingImg ? 0 : 1, marginTop: Outline.Gap * 2, alignItems: 'center', gap: Outline.Gap }}>
                <Text style={{ color: 'white', fontSize: FontSize.Normal }}>{lang.current.list_suit_builds} ({suitBuilds.current?.length} build):</Text>
                {
                  suitBuilds.current?.map(([tier, build, slot, statsMatchedCount], index) => {
                    return <View key={build.name + index} style={{ gap: Outline.Gap, width: '100%', padding: 10, borderRadius: BorderRadius.Small, borderWidth: 1, borderColor: 'white' }}>
                      {/* build name  */}
                      <Text style={{ color: 'tomato', fontSize: FontSize.Big }}>{(index + 1) + '. ' + build.name}</Text>
                      {/* tier & slot name */}
                      {
                        slot === undefined || tier === undefined || statsMatchedCount === undefined ? undefined :
                          <View style={{ flexDirection: 'row', gap: Outline.Gap }}>
                            <Text style={{ color: 'gray', borderColor: 'gray', borderRadius: BorderRadius.Small, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>{slot.slotName}</Text>
                            <Text style={{ color: 'gray', borderColor: 'gray', borderRadius: BorderRadius.Small, padding: 2, borderWidth: 1, fontSize: FontSize.Normal }}>{'Tier ' + tier.name}</Text>
                            {
                              statsMatchedCount < 3 ? undefined :
                                <View style={{ gap: 3, flexDirection: 'row', backgroundColor: 'gold', borderRadius: BorderRadius.Small, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Outline.Margin }} >
                                  <Image source={starIcon} style={{ width: 14, height: 14 }} />
                                  <Text style={{ color: 'black', fontWeight: FontWeight.B500 }}>{statsMatchedCount > 3 ? lang.current.qua_ngon : lang.current.ngon}</Text>
                                </View>
                            }
                            <View style={{ flex: 1 }} />
                          </View>
                      }
                      {
                        slot === undefined ? undefined :
                          <View style={{ gap: Outline.Gap }}>
                            {
                              slot.stats.map((stat, index) => {
                                return <Text
                                  key={stat.name + index}
                                  // @ts-ignore
                                  style={{ color: getStatNameColorCompareWithBuild(stat.name, currentSlot.current) }}>
                                  {stat.value}{stat.isPercent ? '%' : ''} {stat.name} [{stat.min}-{stat.max}]{stat.isPercent ? '%' : ''}
                                </Text>
                              })
                            }
                          </View>
                      }
                    </View>
                  })
                }
              </View>
          }
          {/* events */}
          {
            (ios_diable_info) ? undefined :
              <View style={{ opacity: isTouchingImg ? 0 : 1, marginTop: Outline.Gap * 2, alignItems: 'center', gap: Outline.Gap }}>
                <Text style={{ alignSelf: 'flex-start', color: 'white', fontSize: FontSize.Normal }}>{lang.current.events}:</Text>
                {
                  events.map((event: Event) => {
                    const [remainText, targetText, isPrepareFinish] = getRemainTimeTextOfEvent(event)
                    const bgColor = isPrepareFinish ? 'tomato' : 'whitesmoke'
                    const titleColor = isPrepareFinish ? 'black' : 'tomato'
                    const data = GetNotificationData(notificationDataArr, event)

                    return <View key={event.name} style={{ gap: Outline.Gap, width: '100%', padding: 10, borderRadius: BorderRadius.Small, borderWidth: 1, backgroundColor: bgColor }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={{ color: titleColor, fontSize: FontSize.Big, fontWeight: FontWeight.Bold, flex: 1 }}>{event.name}</Text>
                        <Text style={{ color: 'black', fontSize: FontSize.Big }}>{remainText}</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={{ color: 'black', fontSize: FontSize.Normal }}>{targetText}</Text>
                        <TouchableOpacity onPress={() => onPressEventNotiIcon(event)}>
                          <Image source={!data || data.state === NotificationState.Off ? notiMuteIcon : notiIcon} resizeMode='contain' style={{ width: 18, height: 18 }} />
                        </TouchableOpacity>
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
        {/* notification popup setting */}
        {
          !currentNotiSettingEventData.current ? undefined :
            <View style={{ position: 'absolute', backgroundColor: ColorNameToRgb('black', 0.5), width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
              <View style={{ borderRadius: BorderRadius.Normal, padding: Outline.Margin, gap: Outline.Gap, backgroundColor: 'white', minWidth: '70%', justifyContent: 'center', alignItems: 'flex-start' }}>
                <Text style={{ color: 'black' }}>{lang.current.noti_pp_title}</Text>
                <Text style={{ color: 'tomato', fontWeight: FontWeight.Bold, fontSize: FontSize.Big, marginBottom: Outline.Margin, }}>{currentNotiSettingEventData.current.nameEvent}</Text>
                <TouchableOpacity onPress={onPressNotiBtn_OnlyNextEvent} style={{ borderRadius: BorderRadius.Small, backgroundColor: 'black', padding: Outline.Margin / 2 }}>
                  <Text style={{ color: 'white' }}>{lang.current.only_next_event}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onPressNotiBtn_AllNextEvents} style={{ borderRadius: BorderRadius.Small, backgroundColor: 'black', padding: Outline.Margin / 2 }}>
                  <Text style={{ color: 'white' }}>{lang.current.all_events}</Text>
                </TouchableOpacity>

                <Text style={{ color: 'black' }}>{lang.current.noti_in}:</Text>
                <View style={{ flexDirection: 'row', gap: Outline.Gap / 2, }}>
                  {
                    NotifyInMinArr.map((minute: number) => {
                      return <TouchableOpacity
                        key={minute}
                        onPress={() => onPressNotiBtn_NotifyIn(0)}
                        style={{ borderWidth: 1.5, minWidth: 40, alignItems: 'center', justifyContent: 'center', borderColor: currentNotiSettingEventData.current && currentNotiSettingEventData.current.comingNotiTimeInMinutes === minute ? 'tomato' : 'black', borderRadius: BorderRadius.Small, padding: Outline.Margin / 2 }}>
                        <Text style={{ color: 'black' }}>{minute}{isLangViet !== 1 ? 'p' : 'm'}</Text>
                      </TouchableOpacity>
                    })
                  }
                </View>

                <TouchableOpacity onPress={onPressNotiBtn_TurnOff} style={{ marginTop: Outline.Margin * 2, borderRadius: BorderRadius.Small, backgroundColor: 'black', padding: Outline.Margin / 2 }}>
                  <Text style={{ color: 'white' }}>{lang.current.turn_off_noti}</Text>
                </TouchableOpacity>

              </View>
            </View>
        }
        {/* show list img button */}
        {
          multiImageItems.current.length === 0 ? undefined :
            <View style={{ gap: Outline.Gap, marginHorizontal: Outline.Margin, marginBottom: Outline.Margin, flexDirection: 'row' }}>
              <View onTouchEnd={() => onPressNextItemInMulti(false)} style={{ minWidth: windowSize.width / 7, borderRadius: BorderRadius.Small, padding: 10, backgroundColor: canPressPreviousItemInMulti.current ? 'white' : 'gray', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={leftIcon} style={{ width: 20, height: 20 }} />
              </View>
              <View onTouchEnd={() => toggleShowMulti(true)} style={{ borderRadius: BorderRadius.Small, padding: 10, flex: 1, backgroundColor: 'white', alignItems: 'center' }}>
                <Text style={{ color: 'black', fontSize: FontSize.Normal, }}>{lang.current.show_multi_btn}</Text>
              </View>
              <View onTouchEnd={() => onPressNextItemInMulti(true)} style={{ minWidth: windowSize.width / 7, borderRadius: BorderRadius.Small, padding: 10, backgroundColor: canPressNextItemInMulti.current ? 'white' : 'gray', alignItems: 'center', justifyContent: 'center' }}>
                <Image source={leftIcon} style={[{ width: 20, height: 20 }, { transform: [{ scale: -1 }] }]} />
              </View>
            </View>
        }
        {/* multi page */}
        {
          !isShowMulti.current ? undefined :
            <MultiImagePage
              toggleShow={() => toggleShowMulti(false)}
              onPressItem={onPressItemInMulti}
              items={multiImageItems.current} />
        }
        {/* cheat */}
        {
          !showCheat ? undefined :
            <View style={{ gap: Outline.Gap, backgroundColor: 'white', position: 'absolute', width: '100%', height: '100%', justifyContent: 'center', alignItems: 'flex-end' }}>
              <Text style={{ color: 'black' }}>{getUniqueId()}</Text>
              <Button title='copy storage log' onPress={OnPressed_CopyStorageLog} />
              <Button title='clear storage log' onPress={OnPressed_ClearStorageLog} />
              <Button title='copy device id' onPress={() => Clipboard.setString(getUniqueId())} />
              <Button title='close' onPress={OnPressed_CloseCheat} />
            </View>
        }
      </SafeAreaView>
    </LangContext.Provider >
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

  if (statNameLower.includes('resistance') ||
    statNameLower.includes('ranks of') ||
    statNameLower.includes('rank of')) {
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

    FirebaseIncrease('user_unique_open_count/' + todayString)
    FirebaseIncrease('device_info/platform/' + Platform.OS)
    FirebaseIncrease('device_info/brand/' + getBrand())
  }

  FirebaseIncrease('open_total_count/' + todayString)

  Track('app_open')
}

const FirebaseIncrease = (fbpath: string, incNum: number = 1) => {
  if (isDevDevice)
    return

  // console.log(fbpath);

  FirebaseDatabase_IncreaseNumberAsync(fbpath, 0, incNum)
}

const CalcTargetTimeAndSaveEvent = (event: Event) => {
  const intervalMS = event.intervalInMinute * 60 * 1000

  let now = Date.now()

  while (true) {
    if (event.originTime > now)
      return event.originTime

    event.originTime += intervalMS
  }
}

const GetNotificationData = (arr: NotificationData[], event: Event): NotificationData | undefined => {
  if (!arr || arr.length === 0)
    return undefined

  const idx = arr.findIndex(data => data.nameEvent === event.name)

  if (idx < 0)
    return undefined

  return arr[idx]
}

const CompressImageAsync = async (fileURI: string): Promise<string> => {
  return await ImageCompressor.compress(
    fileURI, {
    maxHeight: 1000,
    maxWidth: 1000,
    output: 'png'
  })
}