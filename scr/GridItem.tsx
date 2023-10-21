import { View, Text, ImageBackground, ActivityIndicator } from 'react-native'
import React from 'react'
import { ImgItemData } from './Types'
import { Outline, windowSize } from './AppConstant'
import { RoundNumber } from './common/Utils'

type Props = {
  itemData: ImgItemData
  index: number,
}

export const numColumnGrid = 3
const itemWidth = (windowSize.width - Outline.Gap * (numColumnGrid - 1) - Outline.Gap * 2) / numColumnGrid
const itemHeight = windowSize.height * 0.25

const GridItem = (props: Props) => {
  const isWaitingAPI = props.itemData.ocrResultTxt === undefined

  const ratedSuccess = props.itemData.rateResult !== undefined

  let displayLine_1: string // indicator | result rate text

  if (ratedSuccess)
    // @ts-ignore
    displayLine_1 = props.itemData.rateResult?.text
  else
    displayLine_1 = '...'

  // line 2

  let displayLine_2: string // score | 'đang xử lý..'

  if (ratedSuccess)
    // @ts-ignore
    displayLine_2 = RoundNumber(props.itemData.rateResult?.score * 10, 1) + '/10'
  else if (props.itemData.ocrResultTxt === undefined)
    displayLine_2 = 'Đang xử lý...'
  else
    displayLine_2 = 'Lỗi'

  const bgColor = ratedSuccess ? props.itemData.rateResult?.color : 'white'

  return (
    <View style={{ width: itemWidth, height: itemHeight, backgroundColor: 'black', marginHorizontal: Outline.Gap / 2 }}>
      <ImageBackground style={{ flex: 1 }} source={{ uri: props.itemData.uri }} />
      <View style={{ width: '100%', height: '100%', position: 'absolute', alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={{ width: '100%', backgroundColor: bgColor, opacity: 0.7, alignItems: 'center' }}>
          {
            isWaitingAPI ?
              <ActivityIndicator color={'black'} /> :
              <Text>{displayLine_1}</Text>
          }
        </View>
        <View style={{ width: '100%', backgroundColor: bgColor, opacity: 0.7, alignItems: 'center' }}>
          <Text>{displayLine_2}</Text>
        </View>
      </View>
    </View>
  )
}

export default GridItem