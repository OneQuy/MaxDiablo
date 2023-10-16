import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { windowSize } from './AppConstant'
import { ToCanPrint } from './common/UtilsTS'
import GridItem from './GridItem'

type MultiImagePageProps = {
    multiImageUriArr: string[],
    toggleShow: () => void,
}

const MultiImagePage = (props: MultiImagePageProps) => {
    // console.log(ToCanPrint(multiImageUriArr));
    
    return (
        <View style={{ backgroundColor: 'gray', position: 'absolute', width: '100%', height: windowSize.height, justifyContent: 'flex-start' }}>
            <View onTouchEnd={props.toggleShow} style={{ flex: 0.1, backgroundColor: 'red' }} />
            <View style={{ flex: 1, backgroundColor: 'blue' }} >
                <FlatList
                    data={props.multiImageUriArr}
                    keyExtractor={(_, index) => index.toString()}
                    numColumns={3}
                    contentContainerStyle={{ gap: 5, }}
                    renderItem={({ item, index }) => <GridItem />}
                />
            </View>
        </View>
    )
}

export default MultiImagePage