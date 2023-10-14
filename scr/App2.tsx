import { View, Text, Button, SafeAreaView, Alert, Platform } from 'react-native'
import React, { useState } from 'react'
import { RequestCameraPermissionAsync, ToCanPrint } from './common/UtilsTS'
import { CameraOptions, launchCamera } from 'react-native-image-picker'
import { FirebaseStorage_UploadAsync } from './common/Firebase/FirebaseStorage'
import { openPicker } from '@baronha/react-native-multiple-image-picker'
import { FirebaseInit } from './common/Firebase/Firebase'

FirebaseInit()

const App2 = () => {
    const [state, setState] = useState('')
    const [filepath, setfilepath] = useState('')


    const onPressPickPhoto = async () => {
        try {
            const response = await openPicker(
                {
                });

            if (!response || response.length <= 0) {
                Alert.alert('Hãy chọn lại', 'Vui lòng chọn một hình!')
                return
            }
            else {
                const img = response[0]

                if ((Platform.OS === 'android' && !img) || (Platform.OS !== 'android' && !img.path)) {
                    Alert.alert('Hãy chọn lại', 'Vui lòng chọn một hình!')
                    return
                }

                const path = Platform.OS === 'android' ? 'file://' + img.realPath : img.path;
                await onSelectedImg(path)
            }
        }
        catch (e: any) {
            if (e && e.toString().includes('User has canceled'))
                return

            Alert.alert('aaaaa', ToCanPrint(e))
        }
    }

    const onPressPickPhotoPath = async () => {
        try {
            const response = await openPicker(
                {
                });

            if (!response || response.length <= 0) {
                Alert.alert('Hãy chọn lại', 'Vui lòng chọn một hình!')
                return
            }
            else {
                const img = response[0]

                if ((Platform.OS === 'android' && !img) || (Platform.OS !== 'android' && !img.path)) {
                    Alert.alert('Hãy chọn lại', 'Vui lòng chọn một hình!')
                    return
                }

                const path = Platform.OS === 'android' ? 'file://' + img.realPath : img.path;
                setfilepath(path)
            }
        }
        catch (e: any) {
            if (e && e.toString().includes('User has canceled'))
                return

            Alert.alert('aaaaa', ToCanPrint(e))
        }
    }

    const onPressTakeCamera = async () => {
        setState('pick cam')

        const camRequestRes = await RequestCameraPermissionAsync()

        if (camRequestRes !== true) {
            Alert.alert('Thiếu quyền truy cập Camera!', 'Vui lòng cấp quyền truy cập')
            return
        }

        const result = await launchCamera({
            // saveToPhotos: false
        } as CameraOptions)

        if (!result || !result.assets) {
            setState('Opppps')
            return
        }

        const path = result.assets[0].uri

        if (!path) {
            setState('Opppps 2')
            return
        }

        await onSelectedImg(path)
    }

    const onSelectedImg = async (path: string) => {
        const id = Date.now().toString().substring(Date.now().toString().length - 4)

        // setState('Đang upload...' + id)

        const uplodaErr = await FirebaseStorage_UploadAsync('test/' + id, path)

        if (uplodaErr) {
            setState('udpload failed: ' + id)

            Alert.alert(
                'Lỗi không thể upload hình để xử lý',
                'Vui lòng kiểm tra internet của bạn.\nMã lỗi: ' + ToCanPrint(uplodaErr))

            return
        }

        setState('doneee!! ' + id)
    }

    return (
        <SafeAreaView>
            <Text>fb10.5</Text>
            <Text>{state}</Text>
            <Button title='photo' onPress={onPressPickPhoto} />
            <Button title='cam' onPress={onPressTakeCamera} />
            <Text>{filepath}</Text>
            <Button title='get filepath' onPress={onPressPickPhotoPath} />
            <Button title='upload from filepath' onPress={() => onSelectedImg(filepath)} />
        </SafeAreaView>
    )
}

export default App2