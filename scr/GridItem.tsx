import { View, Text, ImageBackground, ActivityIndicator, TouchableOpacity } from 'react-native'
import React, { useCallback, useContext } from 'react'
import { ImgItemData } from './Types'
import { FontWeight, Outline, windowSize } from './AppConstant'
import { RoundNumber } from './common/Utils'
import { LangContext } from './Language'

type Props = {
  itemData: ImgItemData,
  index: number,
  onPress: (item: ImgItemData) => void,
}

export const numColumnGrid = 3

const itemWidth = (windowSize.width - Outline.Gap * (numColumnGrid - 1) - Outline.Gap * 2) / numColumnGrid
const itemHeight = windowSize.height * 0.25

const GridItem = (props: Props) => {
  const lang = useContext(LangContext)
  const isWaitingAPI = props.itemData.ocrResultTxt === undefined
  const ratedSuccess = props.itemData.rateResult !== undefined

  let displayLine_1: string // indicator | result rate text

  if (ratedSuccess)
    // @ts-ignore
    displayLine_1 = props.itemData.rateResult?.text
  else
    displayLine_1 = '...'

  // line 2

  let displayLine_2: string // score | 'rating..'

  if (ratedSuccess)
    // @ts-ignore
    displayLine_2 = RoundNumber(props.itemData.rateResult?.score * 10, 1) + '/10'
  else if (props.itemData.ocrResultTxt === undefined)
    displayLine_2 = lang.wait_api
  else
    displayLine_2 = lang.fail

  const bgColor = ratedSuccess ? props.itemData.rateResult?.color : 'gray'

  const onPress = useCallback(() => {
    props.onPress(props.itemData)
  }, [])

  return (
    <TouchableOpacity onPress={onPress} style={{ borderRadius: 10, width: itemWidth, height: itemHeight, backgroundColor: 'whitesmoke', marginHorizontal: Outline.Gap / 2 }}>
      <ImageBackground style={{ flex: 1, borderRadius: 10, overflow: 'hidden' }} resizeMode='stretch' source={{ uri: props.itemData.uri }} />
      <View style={{ width: '100%', height: '100%', position: 'absolute', alignItems: 'center', justifyContent: 'flex-end' }}>
        {/* line 1 */}
        <View style={{ paddingTop: Outline.Margin / 2, width: '100%', backgroundColor: bgColor, opacity: 0.7, alignItems: 'center' }}>
          {
            isWaitingAPI ?
              <ActivityIndicator color={'black'} /> :
              <Text style={{color: 'black', fontWeight: FontWeight.B500 }}>{displayLine_1}</Text>
          }
        </View>
        {/* line 2 */}
        <View style={{ borderBottomLeftRadius: 10, borderBottomRightRadius: 10, paddingBottom: Outline.Margin / 2, width: '100%', backgroundColor: bgColor, opacity: 0.7, alignItems: 'center' }}>
          <Text style={{color: 'black', fontWeight: FontWeight.B500 }}>{displayLine_2}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default GridItem

export const GetItemState = (item: ImgItemData) =>  {  
  if (item.errorAlert !== undefined)
    return 'fail'
  else if (item.ocrResultTxt === undefined)
    return 'wait_api'
  else if (item.rateResult !== undefined)
    return 'success'
  else
    return 'fail'
}