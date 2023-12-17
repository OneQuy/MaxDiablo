import { View, Text, SafeAreaView, Image, ImageBackground, NativeSyntheticEvent, ImageLoadEventData, LayoutChangeEvent, Animated, Dimensions, ViewProps, GestureResponderEvent, NativeTouchEvent, Button } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { windowSize } from './AppConstant'
import ImageAsMap, { MapItem } from './common/ImageAsMap'
import { RandomInt } from './common/Utils'

// const wholeMap = require('../assets/images/map/map-vertical.jpeg')
// const wholeMap = require('../assets/images/map/map2.jpeg')
const wholeMap = require('../assets/images/map/whole.jpg')

const chestImg = require('../assets/images/map/chest.png')
const chestSize = 30

const Chest = ({ num }: { num: number }) => {
    return <ImageBackground
        source={chestImg}
        resizeMode='contain'
        style={{ width: chestSize, height: chestSize, alignItems: 'center', alignContent: 'center' }} >
        <Text style={{ color: 'white', verticalAlign: 'middle' }}>{num}</Text>
    </ImageBackground>
}

const randomItems = () => {
    return new Array(RandomInt(30, 100)).fill({}).map((i, index) => {
        return {
            posX: Math.random() * 2000,
            posY: Math.random() * 2000,
            width: chestSize,
            height: chestSize,
            element: <Chest num={index} />
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
            <View style={{ width: '100%', height: windowSize.height * 0.7 }}>
                {/* map */}
                <ImageAsMap
                    img={wholeMap}
                    maxScale={10}
                    // initialPointCenterByMapSizePercent={[0.7, 0.7]}
                    // initialScale={4}
                    // isDrawAllItems={true}
                    // allItems={items}
                    // throttleInMsToUpdateItems={10}
                />
            </View>
            <Button onPress={() => setItems(randomItems())} title='Random items' />
        </SafeAreaView>
    )
}

export default Helltide