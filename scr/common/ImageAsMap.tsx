import { View, Animated, NativeTouchEvent, ViewProps, GestureResponderEvent, Dimensions, LayoutChangeEvent, NativeSyntheticEvent, ImageLoadEventData, Image, ImageBackgroundProps, ImageProps, ActivityIndicator, ActivityIndicatorProps, StyleSheet } from 'react-native'
import React, { ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CachedMeassure, CachedMeassureResult } from './PreservedMessure'
import { Throttle } from './Throttler'

// const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground)

const screenScale = Dimensions.get('screen').scale
const dimensionsScreen = Dimensions.get('screen')

export type MapItem = {
    posX: number,
    posY: number,
    element: React.JSX.Element,

    /**
     * should be assigned if isDrawAllItems = false or undefined for check if this item is rendered
     */
    width?: number,

    /**
     * should be assigned if isDrawAllItems = false or undefined for check if this item is rendered
     */
    height?: number,
}

type ImageAsMapProps = {
    img?: ImageProps['source'],
    uri?: string,
    maxScale?: number,
    initialScale?: number,
    allItems?: MapItem[],
    minScaleIsContainIfImageRatioOver?: number,
    notMinScaleCoverModeWhenImageIsLandscape?: boolean,
    loadingIndicatorProps?: ActivityIndicatorProps,

    /**
     * default is [0.5, 0.5] (center of the map)
     */
    initialPointCenterByMapSizePercent?: [number, number],

    /**
     * it should be true if items less than 100 :)
     */
    isDrawAllItems?: boolean,

    /**
     * only use for isDrawAllItems = false or undefined.
     * idealy is 0 - 10
     */
    throttleInMsToUpdateItems?: number,
}

const ImageAsMap = ({
    img,
    uri,
    maxScale,
    initialScale,
    allItems,
    isDrawAllItems,
    throttleInMsToUpdateItems,
    initialPointCenterByMapSizePercent,
    minScaleIsContainIfImageRatioOver,
    notMinScaleCoverModeWhenImageIsLandscape,
    loadingIndicatorProps,
}: ImageAsMapProps) => {
    const [mapRealOriginSize, setMapRealOriginSize] = useState<[number, number]>([10, 10])
    const [viewportRealSize, setViewportRealSize] = useState<[number, number]>([0, 0])
    const [currentItems, setCurrentItems] = useState<MapItem[]>([])
    const setCurrentItemsThrottler = useRef(() => { })
    const [showIndicator, setShowIndicator] = useState(true)

    const itemLeftTopAnimatedValueArr = useRef(allItems && isDrawAllItems ? allItems.map(i => new Animated.ValueXY()) : [])

    // position

    const positionLeftTopCachedValue = useRef<{ x: number, y: number }>({ x: 0, y: 0 })
    const positionLeftTopAnimated = useRef(new Animated.ValueXY(positionLeftTopCachedValue.current)).current

    const limitLeft = useRef(0)
    const limitTop = useRef(0)

    // scale

    const mapCurrentScaleCachedValue = useRef(1)
    const mapCurrentScaleAnimated = useRef(new Animated.Value(1)).current
    const mapMinScale = useRef(0)
    const mapMaxScale = useRef(maxScale || 10) // is maxScale but validated

    // gesture

    const viewportMeasure = useRef<CachedMeassure>(new CachedMeassure(false))
    const viewportMeasureResult = useRef<CachedMeassureResult | undefined>(undefined)
    const initial2TouchesDistance = useRef(-1)
    const initialScaleWhenPinching = useRef(-1)
    const initialFocusPoint = useRef<[number, number, number, number]>([0, 0, 0, 0]) // map percent & vp percent
    const initialTouch1 = useRef<NativeTouchEvent | undefined>(undefined)
    const initialMovePositionLeftTop = useRef(positionLeftTopCachedValue.current)

    // functions

    const onSetPositionLeftTop = (x: number, y: number, addToCurrent: boolean) => {
        if (addToCurrent) {
            x += positionLeftTopCachedValue.current.x
            y += positionLeftTopCachedValue.current.y
        }

        // console.log('set left top ', x, y, limitLeft.current, limitTop.current);

        x = Math.min(limitLeft.current, Math.max(-limitLeft.current, x))
        y = Math.min(limitTop.current, Math.max(-limitTop.current, y))

        positionLeftTopCachedValue.current = { x, y }
        positionLeftTopAnimated.setValue(positionLeftTopCachedValue.current)

        // update items

        updatePositionItems()
    }

    const getLeftTopToCenterMapByMapPointPercent = (
        mapPercentX: number,
        mapPercentY: number,
        viewportPercentX: number,
        viewportPercentY: number) => {
        const mapCurSize = [mapRealOriginSize[0] * mapCurrentScaleCachedValue.current, mapRealOriginSize[1] * mapCurrentScaleCachedValue.current]

        // viewportPercentX = viewportPercentY = 0.5

        const left = limitLeft.current - (mapPercentX * mapCurSize[0] - (viewportPercentX * viewportRealSize[0])) / screenScale
        const top = limitTop.current - (mapPercentY * mapCurSize[1] - (viewportPercentY * viewportRealSize[1])) / screenScale

        return [left, top]
    }

    const getItemsInCurrentVP = (): MapItem[] | undefined => {
        if (!allItems)
            return undefined

        const arr = allItems.map(i => {
            const vp = getVpFromMapRealPos(i.posX, i.posY)

            return {
                ...i,
                posX: vp[0],
                posY: vp[1],
            } as MapItem
        })

        return arr.filter(i => {
            const w = i.width || 0
            const h = i.height || 0

            if (i.posX + w >= 0 && i.posX < dimensionsScreen.width &&
                i.posY + h >= 0 && i.posY < dimensionsScreen.height)
                return true
            else
                return false
        })
    }

    const getVpFromMapRealPos = (realMapPosX: number, realMapPosY: number): [number, number] => {
        if (!viewportMeasureResult.current)
            throw new Error('vp not messure yet')

        // find viewportPercentX

        const mapPercentX = realMapPosX / mapRealOriginSize[0]
        const mapCurSize = [mapRealOriginSize[0] * mapCurrentScaleCachedValue.current, mapRealOriginSize[1] * mapCurrentScaleCachedValue.current]
        const viewportPercentX = (mapPercentX * mapCurSize[0] - (limitLeft.current - positionLeftTopCachedValue.current.x) * screenScale) / viewportRealSize[0]

        // find vpX

        const vpX = viewportMeasureResult.current.width * viewportPercentX

        // find viewportPercentY

        const mapPercentY = realMapPosY / mapRealOriginSize[1]
        const viewportPercentY = (mapPercentY * mapCurSize[1] - (limitTop.current - positionLeftTopCachedValue.current.y) * screenScale) / viewportRealSize[1]

        // find vpY

        const vpY = viewportMeasureResult.current.height * viewportPercentY

        // return

        // console.log(vpX, vpY, viewportPercentX, viewportPercentY);

        return [vpX, vpY]
    }

    const getMapPercentFromVpPage = (viewportPageX: number, viewportPageY: number): [number, number, number, number] => {
        if (!viewportMeasureResult.current)
            throw new Error('vp not messure yet')

        const vpX = viewportPageX - viewportMeasureResult.current.px
        const vpY = viewportPageY - viewportMeasureResult.current.py

        const viewportPercentX = vpX / viewportMeasureResult.current.width
        const viewportPercentY = vpY / viewportMeasureResult.current.height
        const mapCurSize = [mapRealOriginSize[0] * mapCurrentScaleCachedValue.current, mapRealOriginSize[1] * mapCurrentScaleCachedValue.current]

        const mapPercentX = ((viewportPercentX * viewportRealSize[0]) + (limitLeft.current - positionLeftTopCachedValue.current.x) * screenScale) / mapCurSize[0]
        const mapPercentY = ((viewportPercentY * viewportRealSize[1]) + (limitTop.current - positionLeftTopCachedValue.current.y) * screenScale) / mapCurSize[1]

        return [mapPercentX, mapPercentY, viewportPercentX, viewportPercentY]
    }

    const setCenter = (mapPercentX: number, mapPercentY: number, viewportPercentX: number, viewportPercentY: number) => {
        const [left, top] = getLeftTopToCenterMapByMapPointPercent(mapPercentX, mapPercentY, viewportPercentX, viewportPercentY)

        onSetPositionLeftTop(left, top, false)
    }

    const onSetScale = (scale: number, addToCurrent: boolean) => {
        if (addToCurrent)
            scale = mapCurrentScaleCachedValue.current + scale

        scale = Math.max(mapMinScale.current, Math.min(mapMaxScale.current, scale))

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

        onSetPositionLeftTop(positionLeftTopCachedValue.current.x, positionLeftTopCachedValue.current.y, false)
    }

    const updatePositionItems = () => {
        if (!allItems || allItems.length <= 0) // no items to render
            return

        if (!viewportMeasureResult.current)
            return

        // for draw only items in vp mode

        if (isDrawAllItems !== true) {
            setCurrentItemsThrottler.current()
        }

        // for draw all mode

        else {
            if (itemLeftTopAnimatedValueArr.current.length !== allItems.length)
                itemLeftTopAnimatedValueArr.current = allItems.map(_ => new Animated.ValueXY())

            for (let i = 0; i < allItems.length; i++) {
                const xy = getVpFromMapRealPos(allItems[i].posX, allItems[i].posY)
                itemLeftTopAnimatedValueArr.current[i].setValue({ x: xy[0], y: xy[1] })
            }
        }
    }

    const onLayoutViewport = (e: LayoutChangeEvent) => {
        setViewportRealSize([e.nativeEvent.layout.width * screenScale, e.nativeEvent.layout.height * screenScale])

        viewportMeasure.current.GetOrMessure((res) => {
            viewportMeasureResult.current = res
        })
    }

    const onLoadedMap = (e: NativeSyntheticEvent<ImageLoadEventData>) => {
        Image.getSize(e.nativeEvent.source.uri, (w, h) => {
            setMapRealOriginSize([w, h])

            const ratio = Math.max(w, h) / Math.min(w, h)
            let minScaleIsContainOrCover = typeof minScaleIsContainIfImageRatioOver === 'number' && minScaleIsContainIfImageRatioOver > ratio

            if (notMinScaleCoverModeWhenImageIsLandscape === true && w > h) {
                minScaleIsContainOrCover = true
            }

            // console.log(ratio, minScaleIsContainOrCover);

            // find min scale

            if (viewportRealSize[0] * viewportRealSize[1] <= 0) {
                console.error('viewportRealSize is not inited. Maybe onLayoutViewport(e) was not called before this (onLoadedMap).')
                return
            }

            if (minScaleIsContainOrCover) {
                if (w > h) {
                    mapMinScale.current = viewportRealSize[0] / w

                    if (mapMinScale.current * h > viewportRealSize[1])
                        mapMinScale.current = viewportRealSize[1] / h
                }
                else {
                    mapMinScale.current = viewportRealSize[1] / h

                    if (mapMinScale.current * w > viewportRealSize[0])
                        mapMinScale.current = viewportRealSize[0] / w
                }
            }
            else if (w < h) {
                mapMinScale.current = viewportRealSize[0] / w

                if (mapMinScale.current * h < viewportRealSize[1])
                    mapMinScale.current = viewportRealSize[1] / h
            }
            else {
                mapMinScale.current = viewportRealSize[1] / h

                if (mapMinScale.current * w < viewportRealSize[0])
                    mapMinScale.current = viewportRealSize[0] / w
            }


            // find max scale

            mapMaxScale.current = Math.max(mapMinScale.current, maxScale || 10)

            // other setups

            createSetItemsThrottler()

            onSetScale(initialScale || mapMinScale.current, false)

            if (!minScaleIsContainOrCover && initialPointCenterByMapSizePercent && initialPointCenterByMapSizePercent.length === 2) {
                setCenter(
                    initialPointCenterByMapSizePercent[0],
                    initialPointCenterByMapSizePercent[1],
                    0.5,
                    0.5)
            }
        })
    }

    const createSetItemsThrottler = () => {
        if (!allItems || isDrawAllItems === true) {
            return
        }

        setCurrentItemsThrottler.current = Throttle(() => {
            const items = getItemsInCurrentVP()

            if (items)
                setCurrentItems(items)
        }, typeof throttleInMsToUpdateItems === 'number' ? throttleInMsToUpdateItems : 10)
    }

    const fatherViewResponser = useMemo<ViewProps>(() => {
        return {
            onMoveShouldSetResponder: (event: GestureResponderEvent) => { // start move
                return true
            },

            onResponderMove: (event: GestureResponderEvent) => { // moving
                const touches = event.nativeEvent.touches

                // move

                const t1 = touches[0]

                if (touches.length === 1) {
                    if (!initialTouch1.current) {
                        initialTouch1.current = touches[0]
                        initialMovePositionLeftTop.current = positionLeftTopCachedValue.current
                    }

                    const offsetX = t1.pageX - initialTouch1.current.pageX
                    const x = initialMovePositionLeftTop.current.x + offsetX

                    const offsetY = t1.pageY - initialTouch1.current.pageY
                    const y = initialMovePositionLeftTop.current.y + offsetY

                    onSetPositionLeftTop(x, y, false)
                }

                // scale

                if (touches.length < 2)
                    return

                initialTouch1.current = undefined
                const t2 = touches[1]
                const currentDistance = Math.sqrt(Math.pow(t1.pageX - t2.pageX, 2) + Math.pow(t1.pageY - t2.pageY, 2))

                if (initial2TouchesDistance.current <= 0) { // start regconize scale
                    initial2TouchesDistance.current = currentDistance
                    initialScaleWhenPinching.current = mapCurrentScaleCachedValue.current

                    const midPoint = getMidPoint(t1.pageX, t1.pageY, t2.pageX, t2.pageY)

                    initialFocusPoint.current = getMapPercentFromVpPage(midPoint[0], midPoint[1])
                }

                const scale = initialScaleWhenPinching.current * (currentDistance / initial2TouchesDistance.current)

                onSetScale(scale, false)

                setCenter(initialFocusPoint.current[0], initialFocusPoint.current[1], initialFocusPoint.current[2], initialFocusPoint.current[3])
            },

            onResponderEnd: (_: GestureResponderEvent) => { // end move
                initial2TouchesDistance.current = -1 // reset scale
                initialTouch1.current = undefined // reset move
            },
        }
    }, [onSetPositionLeftTop, onSetScale, setCenter])

    useEffect(() => {
        createSetItemsThrottler()
        updatePositionItems()
    }, [allItems])

    // const key = useMemo(() => {
    //     return Math.random()
    //     // @ts-ignore
    // }, [props.source.uri])

    const onStartLoad = useCallback(() => {
        setShowIndicator(true)
    }, [])

    const onEndLoad = useCallback(() => {
        setShowIndicator(false)
    }, [])

    const isDrawItems = allItems && allItems.length > 0 &&
        (isDrawAllItems !== true || allItems.length === itemLeftTopAnimatedValueArr.current.length)

    //     return

    // render

    return (
        <View
            {...fatherViewResponser}
            ref={viewportMeasure.current.theRef}
            onLayout={onLayoutViewport}
            style={{ justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', overflow: 'hidden' }}>
            {/* map */}
            <Animated.Image
                onLoadStart={onStartLoad}
                onLoad={onLoadedMap}
                onLoadEnd={onEndLoad}
                resizeMode='center'
                source={img ?? { uri }}
                style={[
                    { width: mapRealOriginSize[0], height: mapRealOriginSize[1] },
                    { ...positionLeftTopAnimated.getLayout() },
                    { transform: [{ scale: mapCurrentScaleAnimated }] }]} />
            {/* items */}
            {
                !isDrawItems ? undefined :
                    <View style={style.itemsView}>
                        {
                            isDrawAllItems !== true ?
                                // draw part
                                currentItems.map((item: MapItem, index: number) => {
                                    return <View key={index} style={[
                                        {
                                            left: item.posX,
                                            top: item.posY,
                                            position: 'absolute'
                                        }]}>
                                        {
                                            item.element
                                        }
                                    </View>
                                }) :

                                // draw all

                                allItems?.map((item: MapItem, index: number) => {
                                    return <Animated.View key={index} style={[
                                        {
                                            ...itemLeftTopAnimatedValueArr.current[index].getLayout(),
                                            position: 'absolute'
                                        }]}>
                                        {
                                            item.element
                                        }
                                    </Animated.View>
                                })
                        }
                    </View>
            }
            {/* loading indicator */}
            {
                !showIndicator ? undefined :
                    <View pointerEvents='none' style={style.loadingIndicatorView}>
                        {
                            <ActivityIndicator {...loadingIndicatorProps} />
                        }
                    </View>
            }
        </View>
    )
}

export default ImageAsMap

const style = StyleSheet.create({
    itemsView: { position: 'absolute', width: '100%', height: '100%', },
    loadingIndicatorView: { justifyContent: 'center', alignItems: 'center', position: 'absolute', width: '100%', height: '100%', },
})
const getMidPoint = (x1: number, y1: number, x2: number, y2: number): [number, number] => [(x1 + x2) / 2, (y1 + y2) / 2];
