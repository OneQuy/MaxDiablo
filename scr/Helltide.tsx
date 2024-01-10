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
    return [
        {
            posX: 1119,
            posY: 306,
            width: chestSize,
            height: chestSize,
            element: <Chest num={0} />
        } as MapItem,
        {
            posX: 1128,
            posY: 780,
            width: chestSize,
            height: chestSize,
            element: <Chest num={1} />
        } as MapItem,
        {
            posX: 1180,
            posY: 431,
            width: chestSize,
            height: chestSize,
            element: <Chest num={2} />
        } as MapItem,
        {
            posX: 1113,
            posY: 619,
            width: chestSize,
            height: chestSize,
            element: <Chest num={3} />
        } as MapItem
    ]
}

// const randomItems = () => {
//     return new Array(RandomInt(30, 100)).fill({}).map((i, index) => {
//         return {
//             posX: Math.random() * 2000,
//             posY: Math.random() * 2000,
//             width: chestSize,
//             height: chestSize,
//             element: <Chest num={index} />
//         } as MapItem
//     })
// }

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
                    isDrawAllItems={true}
                    allItems={items}
                />
            </View>
            <Button onPress={() => setItems(randomItems())} title='Random items' />
        </SafeAreaView>
    )
}

export default Helltide