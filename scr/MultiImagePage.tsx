import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { windowSize } from './AppConstant'
import { ToCanPrint } from './common/UtilsTS'
import GridItem from './GridItem'
import { ImgItemData } from './Types'

type MultiImagePageProps = {
    items: ImgItemData[],
    toggleShow: () => void,
}

const MultiImagePage = (props: MultiImagePageProps) => {
    // console.log(ToCanPrint(multiImageUriArr));

    return (
        <View style={{ backgroundColor: 'gray', position: 'absolute', width: '100%', height: windowSize.height, justifyContent: 'flex-start' }}>
            <View onTouchEnd={props.toggleShow} style={{ flex: 0.1, backgroundColor: 'red' }} />
            <View style={{ flex: 1, backgroundColor: 'blue' }} >
                <FlatList
                    data={props.items}
                    keyExtractor={(item, _) => item.uri}
                    numColumns={3}
                    contentContainerStyle={{ gap: 5, }}
                    renderItem={({ item, index }) => <GridItem
                        index={index}
                        itemData={item} />}
                />
            </View>
        </View>
    )
}

export default MultiImagePage