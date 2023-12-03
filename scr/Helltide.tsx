import { View, Text, SafeAreaView, Image, ImageBackground, NativeSyntheticEvent, ImageLoadEventData, LayoutChangeEvent, Animated, Dimensions, ViewProps, GestureResponderEvent, NativeTouchEvent } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { windowSize } from './AppConstant'
import ImageAsMap from './common/ImageAsMap'

const wholeMap = require('../assets/images/map/whole.jpg')

const Helltide = () => {

    // render

    return (
        // father view
        <SafeAreaView style={{ backgroundColor: 'gray', position: 'absolute', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
            <Text style={{ marginTop: 50, color: 'green' }}>Helltide</Text>
            {/* map container */}
            <View style={{ width: '100%', height: windowSize.height * 0.6, backgroundColor: 'green' }}>
                {/* map */}
                <ImageAsMap img={wholeMap} />
            </View>
        </SafeAreaView>
    )
}

export default Helltide