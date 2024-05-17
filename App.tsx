import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import Routes from './src/Navigation/Route';
import { Provider } from 'react-redux';
import store from './src/redux/store';
import SplashScreen from 'react-native-splash-screen';
import { Alert, CloseIcon, HStack, IconButton, NativeBaseProvider, VStack, Text, Slide, Collapse } from 'native-base';
import { removeUser } from './src/services/httpServices';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import AlertConnection from './src/Components/AlertConnection';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import messaging from '@react-native-firebase/messaging'
import firebase from '@react-native-firebase/app'
import PushNotification,{ Importance } from 'react-native-push-notification'
function App(): JSX.Element {
  const [isConnected, setIsConnected] = useState<any>(false);
  const [show, setShow] = useState(false);

  const createChannel = (channelId) => {
    PushNotification.createChannel(
      {
        channelId: channelId, // (required)
        channelName: "My channel", // (required)
        channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
        playSound: false, // (optional) default: true
        soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
        importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
        vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
      },
      (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
    );
  }

  const showNotification = (channelId, options) =>{
    PushNotification.localNotification({
      /* Android Only Properties */
      channelId: channelId, // (required) channelId, if the channel doesn't exist, notification will not trigger.
      largeIconUrl: "https://www.example.tld/picture.jpg", // (optional) default: undefined
      smallIcon: "ic_notification", // (optional) default: "ic_notification" with fallback for "ic_launcher". Use "" for default small icon.
      subText: options.subText, // (optional) default: none
      bigLargeIcon: "ic_launcher", // (optional) default: undefined
      bigLargeIconUrl: "https://www.example.tld/bigicon.jpg", // (optional) default: undefined
      color: "red", // (optional) default: system default
      vibrate: true, // (optional) default: true
      vibration: 300, // vibration length in milliseconds, ignored if vibrate=false, default: 1000
      priority: "high", // (optional) set notification priority, default: high
      actions: ["Yes", "No"], // (Android only) See the doc for notification actions to know more
      title: options.title, // (optional)
      message: options.message, // (required)
    });
  }

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
     
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        setShow(false);
      } else {
        setShow(true);
      }
    });

    return () => {
      unsubscribe();
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      SplashScreen.hide();
    }, 1000);
  }, []);
  const getFCMToken = async () => {
    try {
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        const channelId = Math.random().toString(36).substring(7)
        createChannel(channelId)
        showNotification(channelId, { bigImage: remoteMessage.notification.android.imageUrl, title: remoteMessage.notification.title, message: remoteMessage.notification.body, subText: remoteMessage.data.subTitle })
        console.log('remoteMessage', remoteMessage)
        
      });
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
      });
      return unsubscribe;
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() =>{
    getFCMToken()
  },[])

  const checkInternet = () => {
    NetInfo.fetch().then(state => {
   
      setIsConnected(state.isConnected);
      if (state.isConnected) {
        setShow(false);
      } else {
        setShow(true);
      }
    });
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NavigationContainer>
          <NativeBaseProvider>
            <Routes />
            {!isConnected ? (
              <AlertConnection show={show} checkInternet={checkInternet} message={'No Internet Connection'} />
            ) : ('')}
          </NativeBaseProvider>
        </NavigationContainer>
      </Provider>
    </GestureHandlerRootView>

  );
}

export default App;
