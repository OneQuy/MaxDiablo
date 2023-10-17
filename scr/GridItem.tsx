import { View, Text } from 'react-native'
import React from 'react'
import { ImgItemData } from './Types'

type Props = {
  itemData: ImgItemData
  index: number,
}

const GridItem = (props : Props) => {
  return (
    <View>
      <Text>GridItem</Text>
    </View>
  )
}

export default GridItem