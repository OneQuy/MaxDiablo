import { View, Animated, NativeTouchEvent, ViewProps, GestureResponderEvent, Dimensions, ImageBackground, LayoutChangeEvent, NativeSyntheticEvent, ImageLoadEventData, Image, ImageBackgroundProps } from 'react-native'
import React, { useMemo, useRef, useState } from 'react'
import { CachedMeassure, CachedMeassureResult } from './PreservedMessure'
import cluster from 'cluster'

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

const screenScale = Dimensions.get('screen').scale

type ImageAsMapProps = {
    img: ImageBackgroundProps['source'],
    maxScale: number,
}

const ImageAsMap = ({ img, maxScale }: ImageAsMapProps) => {
    const [mapRealOriginSize, setMapRealOriginSize] = useState<[number, number]>([10, 10])
    const [viewportRealSize, setViewportRealSize] = useState<[number, number]>([0, 0])

    // position

    const positionLeftTopCachedValue = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
    const positionLeftTopAnimated = useRef(new Animated.ValueXY(positionLeftTopCachedValue.current)).current

    const limitLeft = useRef(0)
    const limitTop = useRef(0)

    // scale

    const mapCurrentScaleCachedValue = useRef(1)
    const mapCurrentScaleAnimated = useRef(new Animated.Value(1)).current
    const mapMinScale = useRef(0)

    // gesture

    const viewportMeasure = useRef<CachedMeassure>(new CachedMeassure(false))
    const viewportMeasureResult = useRef<CachedMeassureResult | undefined>(undefined)
    const initial2TouchesDistance = useRef(-1)

    const initialTouch1 = useRef<NativeTouchEvent | undefined>(undefined)
    const initialMovePositionLeftTop = useRef(positionLeftTopCachedValue.current)

    // functions

    const onSetPositionLeftTop = (x: number, y: number, addToCurrent: boolean) => {
        if (addToCurrent) {
            x += positionLeftTopCachedValue.current.x
            y += positionLeftTopCachedValue.current.y
        }

        positionLeftTopCachedValue.current = { x, y }
        positionLeftTopAnimated.setValue(positionLeftTopCachedValue.current)
    }

    const onSetScale = (scale: number, multiByCurrent: boolean) => {
        // scale = 7

        if (multiByCurrent)
            scale = mapCurrentScaleCachedValue.current + scale

        scale = Math.max(mapMinScale.current, Math.min(maxScale, scale))

        // update scale

        mapCurrentScaleCachedValue.current = scale
        mapCurrentScaleAnimated.setValue(scale)

        // map size

        const mapCurrentRealSize = [mapRealOriginSize[0] * scale, mapRealOriginSize[1] * scale]

        // update limit left

        const leftLimit = (mapCurrentRealSize[0] - viewportRealSize[0]) / 2 / screenScale
        limitLeft.current = Math.abs(leftLimit)

        // update limit top

        const topLimit = (mapCurrentRealSize[1] - viewportRealSize[1]) / 2 / screenScale
        limitTop.current = Math.abs(topLimit)

        // update pos if exceed limits

        const curLeft = clamp(
            positionLeftTopCachedValue.current.x,
            -limitLeft.current,
            limitLeft.current)

        const curTop = clamp(
            positionLeftTopCachedValue.current.y,
            -limitTop.current,
            limitTop.current)

        onSetPositionLeftTop(curLeft, curTop, false)
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
            onSetScale(mapMinScale.current, false)
        })
    }

    const fatherViewResponser = useMemo<ViewProps>(() => {
        return {
            onMoveShouldSetResponder: (event: GestureResponderEvent) => { // start move
                const touches = event.nativeEvent.touches

                initialTouch1.current = touches[0]
                initialMovePositionLeftTop.current = positionLeftTopCachedValue.current

                // if (touches.length !== 2 ||
                //     !viewportMeasureResult.current)
                //     return false

                // const t1 = touches[0]
                // const t2 = touches[1]

                // if (!IsPointInRectMeasure(t1.pageX, t1.pageY, viewportMeasureResult.current) &&
                //     !IsPointInRectMeasure(t2.pageX, t2.pageY, viewportMeasureResult.current))
                //     return false

                // setIsTouchingImg(true)

                return true
            },

            onResponderMove: (event: GestureResponderEvent) => { // moving
                if (!initialTouch1.current)
                    return

                const touches = event.nativeEvent.touches

                // move

                const t1 = touches[0]

                const offsetX = t1.pageX - initialTouch1.current.pageX
                let x = initialMovePositionLeftTop.current.x + offsetX
                x = Math.min(limitLeft.current, Math.max(-limitLeft.current, x))

                const offsetY = t1.pageY - initialTouch1.current.pageY
                let y = initialMovePositionLeftTop.current.y + offsetY
                y = Math.min(limitTop.current, Math.max(-limitTop.current, y))

                onSetPositionLeftTop(x, y, false)

                // scale

                if (touches.length < 2)
                    return

                const t2 = touches[1]
                const currentDistance = Math.sqrt(Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2))

                if (initial2TouchesDistance.current <= 0) {
                    initial2TouchesDistance.current = currentDistance
                }

                const scale = (currentDistance - initial2TouchesDistance.current) / 500
                // console.log(scale );

                onSetScale(scale, true)
            },

            onResponderEnd: (_: GestureResponderEvent) => { // end move
                initial2TouchesDistance.current = -1 // reset scale

                // mapCurrentScale.setValue(mapMinScale.current)
                // mapLeftTop.setValue({ x: 0, y: 0 })
                // setIsTouchingImg(false)
            },
        }
    }, [onSetPositionLeftTop, onSetScale])

    // render

    return (
        <View
            {...fatherViewResponser}
            ref={viewportMeasure.current.theRef}
            onLayout={onLayoutViewport}
            style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* map */}
            <AnimatedImageBackground
                onLoad={onLoadedMap}
                resizeMode='center'
                source={img}
                style={[
                    { width: mapRealOriginSize[0], height: mapRealOriginSize[1] },
                    { ...positionLeftTopAnimated.getLayout() },
                    { transform: [{ scale: mapCurrentScaleAnimated }] }]} />
        </View>
    )
}

export default ImageAsMap

const clamp = (value: number, min: number, max: number) => {
    return Math.max(min, Math.min(max, value))
}