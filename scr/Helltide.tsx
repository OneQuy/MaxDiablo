import { View, Text, SafeAreaView, Image, ImageBackground, NativeSyntheticEvent, ImageLoadEventData, LayoutChangeEvent, Animated, Dimensions, ViewProps, GestureResponderEvent, NativeTouchEvent } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { windowSize } from './AppConstant'
import { CachedMeassure, CachedMeassureResult, IsPointInRectMeasure } from './common/PreservedMessure'

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

const wholeMap = require('../assets/images/map/whole.jpg')
const screenScale = Dimensions.get('screen').scale

const Helltide = () => {
    const [mapRawSize, setMapRawSize] = useState<[number, number]>([10, 10])
    const [viewportSize, setViewportSize] = useState<[number, number]>([0, 0])
    const mapPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current

    // scale

    const mapScale = useRef(new Animated.Value(1)).current
    const mapMinScale = useRef(0)

    // gesture

    const viewportMeasure = useRef<CachedMeassure>(new CachedMeassure(false))
    const viewportMeasureResult = useRef<CachedMeassureResult | undefined>(undefined)
    const initialImg2TouchesDistance = useRef(-1)
    const initialImgTouch1Event = useRef<NativeTouchEvent | undefined>(undefined)

    const fatherViewResponser = useRef<ViewProps>({
        onMoveShouldSetResponder: (event: GestureResponderEvent) => {
            const touches = event.nativeEvent.touches

            if (touches.length !== 2 ||
                !viewportMeasureResult.current)
                return false

            const t1 = touches[0]
            const t2 = touches[1]

            if (!IsPointInRectMeasure(t1.pageX, t1.pageY, viewportMeasureResult.current) &&
                !IsPointInRectMeasure(t2.pageX, t2.pageY, viewportMeasureResult.current))
                return false

            // can be moved!

            // setIsTouchingImg(true)

            // move img

            initialImgTouch1Event.current = t1

            // scale

            initialImg2TouchesDistance.current = Math.sqrt(
                Math.pow(t1.pageX - t2.pageX, 2) +
                Math.pow(t1.pageY - t2.pageY, 2))

            return true
        },

        onResponderMove: (event: GestureResponderEvent) => {
            const touches = event.nativeEvent.touches

            if (touches.length !== 2) {
                return
            }

            // move img

            const t1 = touches[0]

            if (initialImgTouch1Event.current) {
                const x = t1.pageX - initialImgTouch1Event.current.pageX
                const y = t1.pageY - initialImgTouch1Event.current.pageY

                mapPosition.setValue({ x, y })
            }

            // scale

            const t2 = touches[1]

            const currentDistance = Math.sqrt(Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2))

            const maxScale = 20

            const scale = currentDistance / initialImg2TouchesDistance.current;

            mapScale.setValue(Math.max(mapMinScale.current, Math.min(maxScale, scale)))
        },

        onResponderEnd: (_: GestureResponderEvent) => {
            onMoveImgEnd()
        },
    })

    const onMoveImgEnd = useCallback(() => {
        mapScale.setValue(mapMinScale.current)
        mapPosition.setValue({ x: 0, y: 0 })
        // setIsTouchingImg(false)
    }, [])

    // functions

    const onLayoutViewport = (e: LayoutChangeEvent) => {
        setViewportSize([e.nativeEvent.layout.width * screenScale, e.nativeEvent.layout.height * screenScale])

        viewportMeasure.current.GetOrMessure((res) => {
            viewportMeasureResult.current = res
        })
    }

    const onLoadedMap = (e: NativeSyntheticEvent<ImageLoadEventData>) => {
        Image.getSize(e.nativeEvent.source.uri, (w, h) => {
            if (w !== h)
                console.warn('map w & h are diff. They should same!')

            setMapRawSize([w, h])

            const viewportSizeMax = Math.max(viewportSize[0], viewportSize[1])
            mapMinScale.current = viewportSizeMax / w
            mapScale.setValue(mapMinScale.current)
        })
    }

    // render

    return (
        // father view
        <SafeAreaView {...fatherViewResponser.current} style={{ backgroundColor: 'gray', position: 'absolute', width: '100%', height: '100%', justifyContent: 'flex-start' }}>
            <Text style={{ marginTop: 50, color: 'green' }}>Helltide</Text>
            {/* viewport container */}
            <View style={{ width: '100%', height: windowSize.height * 0.7, backgroundColor: 'green' }}>
                {/* viewport */}
                <View ref={viewportMeasure.current.theRef} onLayout={onLayoutViewport} style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
                    {/* map */}
                    <AnimatedImageBackground
                        onLoad={onLoadedMap}
                        resizeMode='center'
                        source={wholeMap}
                        style={[
                            { width: mapRawSize[0], height: mapRawSize[1] },
                            { ...mapPosition.getLayout() },
                            { transform: [{ scale: mapScale }] }]} />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Helltide