import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { Outline, windowSize } from './AppConstant'
import { ToCanPrint } from './common/UtilsTS'
import GridItem, { numColumnGrid } from './GridItem'
import { ImgItemData } from './Types'

type MultiImagePageProps = {
    items: ImgItemData[],
    toggleShow: () => void,
    onPressItem: (item: ImgItemData) => void,
}

const MultiImagePage = (props: MultiImagePageProps) => {
    return (
        <View style={{ backgroundColor: 'gray', position: 'absolute', width: '100%', height: windowSize.height, justifyContent: 'flex-start' }}>
            <View onTouchEnd={props.toggleShow} style={{ flex: 0.1, backgroundColor: 'red' }} />
            <View style={{ flex: 1, backgroundColor: 'blue' }} >
                <FlatList
                    data={props.items}
                    keyExtractor={(item, _) => item.uri}
                    numColumns={numColumnGrid}
                    contentContainerStyle={{ gap: Outline.Gap, }}
                    renderItem={({ item, index }) => <GridItem
                        index={index}
                        onPress={props.onPressItem}
                        itemData={item} />}
                />
            </View>
        </View>
    )
}

export default MultiImagePage