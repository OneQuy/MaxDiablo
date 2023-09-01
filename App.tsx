import React from 'react';
import {
  Button,
  SafeAreaView
} from 'react-native';

// @ts-ignore
import { openPicker } from '@baronha/react-native-multiple-image-picker'

function App(): JSX.Element {
  const onPressUpload = async () => {
    const response = await openPicker();

    console.log(response);

    // if (!response || response.lenght == 0)
    //   setmediaURIs([]);
    // else {
    //   const paths: string[] = response.map((item: any) => {
    //     if (Platform.OS === 'android')
    //       return 'file://' + item.realPath;
    //     else
    //       return item.path;
    //   });

    //   const filter = paths.filter(uri => IsSupportURI(uri));
    //   setmediaURIs(filter);

    //   if (filter.length !== paths.length)
    //     Alert.alert('Unsupport some files', 'Full Response:\n\n' + JSON.stringify(response));
    // }

  };

  return (
    <SafeAreaView>
      <Button onPress={onPressUpload} title='Upload' />
    </SafeAreaView>
  )
}

export default App;
