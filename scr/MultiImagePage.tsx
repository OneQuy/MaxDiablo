import { View, FlatList, Image, SafeAreaView } from 'react-native'
import React from 'react'
import { Outline, windowSize } from './AppConstant'
import GridItem, { numColumnGrid } from './GridItem'
import { ImgItemData } from './Types'

const closeIcon = require('../assets/images/x-icon.png')

type MultiImagePageProps = {
    items: ImgItemData[],
    toggleShow: () => void,
    onPressItem: (item: ImgItemData) => void,
}

const MultiImagePage = (props: MultiImagePageProps) => {
    return (
        <SafeAreaView style={{ position: 'absolute', width: '100%', height: windowSize.height, justifyContent: 'flex-start' }}>
            <View onTouchEnd={props.toggleShow} style={{ paddingTop: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: 'black' }} >
                <Image source={closeIcon} style={{ marginBottom: Outline.Margin, width: 40, height: 40}} />
            </View>
            <View style={{ flex: 1, backgroundColor: 'black' }} >
                <FlatList
                    data={props.items}
                    keyExtractor={(item, _) => item.uri}
                    numColumns={numColumnGrid}
                    contentContainerStyle={{ marginLeft: Outline.Gap / 2, marginTop: Outline.Margin, gap: Outline.Gap, }}
                    renderItem={({ item, index }) => <GridItem
                        index={index}
                        onPress={props.onPressItem}
                        itemData={item} />}
                />
            </View>
        </SafeAreaView>
    )
}

export default MultiImagePage