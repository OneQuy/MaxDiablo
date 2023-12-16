import { View, Text, SafeAreaView, Image, ImageBackground, NativeSyntheticEvent, ImageLoadEventData, LayoutChangeEvent, Animated, Dimensions, ViewProps, GestureResponderEvent, NativeTouchEvent, Button } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { windowSize } from './AppConstant'
import ImageAsMap, { MapItem } from './common/ImageAsMap'

const wholeMap = require('../assets/images/map/whole.jpg')
const chestImg = require('../assets/images/map/chest.png')

const Chest = () => {
    return <ImageBackground
        source={chestImg}
        resizeMode='contain'
        style={{ width: 20, height: 20 }} />
}

const randomItems = () => {
    return new Array(50).fill({}).map(i => {
        return {
            posX: Math.random() * 2000,
            posY: Math.random() * 2000,
            element: <Chest />
        } as MapItem
    })
}

const Helltide = () => {
    const [items, setItems] = useState(randomItems())

    // render

    return (
        // father view
        <SafeAreaView style={{ backgroundColor: 'white', position: 'absolute', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
            <Text style={{ marginTop: 50, color: 'green' }}>Helltide</Text>
            {/* set viewport of map on this screen here */}
            <View style={{ width: '100%', height: windowSize.height * 0.6 }}>
                {/* map */}
                <ImageAsMap
                    img={wholeMap}
                    maxScale={10}
                    isDrawAllItems={true}
                    throttleInMsToUpdateItems={10}
                    allItems={items}
                />
            </View>
            <Button onPress={() => setItems(randomItems())} title='Random items' />
        </SafeAreaView>
    )
}

export default Helltide