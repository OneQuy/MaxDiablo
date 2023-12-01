import { View, Text, SafeAreaView, Image, ImageBackground, NativeSyntheticEvent, ImageLoadEventData, LayoutChangeEvent, Animated, Dimensions } from 'react-native'
import React, { useRef, useState } from 'react'
import { windowSize } from './AppConstant'

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

const wholeMap = require('../assets/images/map/whole.jpg')

const Helltide = () => {
    const [mapRawSize, setMapRawSize] = useState<[number, number]>([10, 10])
    const [viewportSize, setViewportSize] = useState<[number, number]>([0, 0])
    const mapScale = useRef(new Animated.Value(1)).current

    const onLayoutViewport = (e: LayoutChangeEvent) => {
        const scale = Dimensions.get('screen').scale

        setViewportSize([e.nativeEvent.layout.width * scale, e.nativeEvent.layout.height * scale])
    }

    const onLoadedMap = (e: NativeSyntheticEvent<ImageLoadEventData>) => {
        Image.getSize(e.nativeEvent.source.uri, (w, h) => {
            if (w !== h)
                console.warn('map w & h are diff. They should same!')
                
            setMapRawSize([w, h])

            const viewportSizeMax = Math.max(viewportSize[0], viewportSize[1])

            mapScale.setValue(viewportSizeMax / w)
        })        
    }

    return (
        <SafeAreaView style={{ backgroundColor: 'gray', position: 'absolute', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
            <Text style={{ marginTop: 50, color: 'green' }}>Helltide</Text>
            <View style={{ width: '100%', height: windowSize.height * 0.7, backgroundColor: 'green' }}>
                <View onLayout={onLayoutViewport} style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
                    <AnimatedImageBackground
                        onLoad={onLoadedMap}
                        resizeMode='center'
                        source={wholeMap}
                        style={[
                            { width: mapRawSize[0], height: mapRawSize[1] },
                            { transform: [{ scale: mapScale }] }]} />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Helltide