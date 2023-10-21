import { View, Text, ImageBackground } from 'react-native'
import React from 'react'
import { ImgItemData } from './Types'
import { Outline, windowSize } from './AppConstant'

type Props = {
  itemData: ImgItemData
  index: number,
}

export const numColumnGrid = 3
const itemWidth = (windowSize.width - Outline.Gap * (numColumnGrid - 1) - Outline.Gap * 2) / numColumnGrid
const itemHeight = windowSize.height * 0.25

const GridItem = (props: Props) => {
  return (
    <View style={{ width: itemWidth, height: itemHeight, backgroundColor: 'black', marginHorizontal: Outline.Gap / 2 }}>
      <ImageBackground style={{ flex: 1 }} source={{ uri: props.itemData.uri }} />
      <View style={{ width: '100%', height: '100%', position: 'absolute', alignItems: 'center', justifyContent: 'flex-end' }}>
        <View style={{ width: '100%', backgroundColor: 'gold', opacity: 0.7, alignItems: 'center' }}>
          <Text>GOOD</Text>
        </View>
        <View style={{ width: '100%', backgroundColor: 'gold', opacity: 0.7, alignItems: 'center' }}>
          <Text>7/10</Text>
        </View>
      </View>
    </View>
  )
}

export default GridItem