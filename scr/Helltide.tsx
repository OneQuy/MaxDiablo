import { View, Text, SafeAreaView, Image, ImageBackground, NativeSyntheticEvent, ImageLoadEventData, LayoutChangeEvent, Animated, Dimensions, ViewProps, GestureResponderEvent, NativeTouchEvent } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { windowSize } from './AppConstant'
import { CachedMeassure, CachedMeassureResult, IsPointInRectMeasure } from './common/PreservedMessure'

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

const wholeMap = require('../assets/images/map/whole.jpg')
const screenScale = Dimensions.get('screen').scale

const Helltide = () => {
    const [mapRealOriginSize, setMapRealOriginSize] = useState<[number, number]>([10, 10])
    const [viewportRealSize, setViewportRealSize] = useState<[number, number]>([0, 0])

    // position

    const mapLeftTop = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
    const limitLeft = useRef(0)
    const limitTop = useRef(0)

    // scale

    const mapCurrentScale = useRef(new Animated.Value(1)).current
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

                mapLeftTop.setValue({ x, y })
            }

            // scale

            const t2 = touches[1]

            const currentDistance = Math.sqrt(Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2))

            const maxScale = 20

            const scale = currentDistance / initialImg2TouchesDistance.current;

            mapCurrentScale.setValue(Math.max(mapMinScale.current, Math.min(maxScale, scale)))
        },

        onResponderEnd: (_: GestureResponderEvent) => {
            // mapCurrentScale.setValue(mapMinScale.current)
            // mapLeftTop.setValue({ x: 0, y: 0 })
            // setIsTouchingImg(false)
        },
    })

    // functions

    const onSetScale = (scale: number) => {
        // update scale

        mapCurrentScale.setValue(scale)

        // map size

        const mapCurrentRealSize = [mapRealOriginSize[0] * scale, mapRealOriginSize[1] * scale]

        // update limit left

        const leftLimit = (mapCurrentRealSize[0] - viewportRealSize[0]) / 2 / screenScale
        limitLeft.current = Math.abs(leftLimit)

        // update limit top

        const topLimit = (mapCurrentRealSize[1] - viewportRealSize[1]) / 2 / screenScale
        limitTop.current = Math.abs(topLimit)

        // set left, top

        mapLeftTop.setValue({ x: 0, y: 0 })
    }


    const onLayoutViewport = (e: LayoutChangeEvent) => {
        setViewportRealSize([e.nativeEvent.layout.width * screenScale, e.nativeEvent.layout.height * screenScale])

        viewportMeasure.current.GetOrMessure((res) => {
            viewportMeasureResult.current = res
        })
    }

    const onLoadedMap = (e: NativeSyntheticEvent<ImageLoadEventData>) => {
        Image.getSize(e.nativeEvent.source.uri, (w, h) => {
            if (w !== h)
                console.warn('map w & h are diff. They should same!')

            setMapRealOriginSize([w, h])

            const viewportSizeMax = Math.max(viewportRealSize[0], viewportRealSize[1])
            mapMinScale.current = viewportSizeMax / w
            onSetScale(mapMinScale.current)
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
                            { width: mapRealOriginSize[0], height: mapRealOriginSize[1] },
                            { ...mapLeftTop.getLayout() },
                            { transform: [{ scale: mapCurrentScale }] }]} />
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Helltide