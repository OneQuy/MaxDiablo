import { View, Text, SafeAreaView, Image, ImageBackground, NativeSyntheticEvent, ImageLoadEventData, LayoutChangeEvent, Animated, Dimensions, ViewProps, GestureResponderEvent, NativeTouchEvent } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { windowSize } from './AppConstant'
import ImageAsMap, { MapItem } from './common/ImageAsMap'

const wholeMap = require('../assets/images/map/whole.jpg')

const Helltide = () => {

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
                    allItems={[
                        {
                            posX: 500,
                            posY: 500
                        } as MapItem,
                        {
                            posX: 1000,
                            posY: 1000
                        } as MapItem,
                        {
                            posX: 1200,
                            posY: 1200
                        } as MapItem,
                        {
                            posX: 1700,
                            posY: 1700
                        } as MapItem
                    ]}
                />
            </View>
        </SafeAreaView>
    )
}

export default Helltide