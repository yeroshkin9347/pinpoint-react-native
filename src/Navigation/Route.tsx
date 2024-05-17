import React, { useEffect, useState } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import AuthStack from './AuthStack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainStack from './MainStack';
import {
  removeUser,
  accessToken,
  ApiRequestAsync,
  checkContactsPermission,
  checkGalleryPermission,
  checkLocationPermission,
  requestWriteContactsPermission,
  checkAndRequestPermissions,
  geoReverseEncodedAddress,
  getUserCountryCode,
  ErrorToast,
  getAllPermissions,
} from '../services/httpServices';
import { useDispatch, useSelector } from 'react-redux';
import { addCategoryList, setAppLinkUrl, setCountryCode, setDialingCode, setLoading, setProfile, setUserContact, userToken } from '../redux/reducers/authReducer';
import { ImageBackground, Linking, Platform, StyleSheet } from 'react-native';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Contacts from 'react-native-contacts';
import Geolocation from 'react-native-geolocation-service';
import countries from 'country-data';
import { useToast } from 'native-base';
const Stack = createNativeStackNavigator();


export default function Routes() {
  const [show, setShow] = useState<string>('');
  const { token, rerenderToken, categoryList } = useSelector((state: any) => state.AuthReducer);

  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const toast = useToast();
  const id = 'test-toast';

  const getToken = async (firstTime?: string) => {
    let tokenData = await accessToken();
    const rememberMe = await AsyncStorage.getItem('@Remember_user');
    let user_Remember: any;
    if (rememberMe) {
      user_Remember = JSON.parse(rememberMe);
    }
    if (tokenData !== '') {
      dispatch(setLoading(true));
      ApiRequestAsync('GET', '/user/check', {}, token)
        .then(async (data: any) => {
          if (
            data.data.detail &&
            (data.data.detail.is_free_trial_valid ||
              data.data.detail.is_free_trial ||
              data.data.detail.is_purchase)
          ) {
            dispatch(setProfile(data.data.detail));
            await setShow(tokenData);
            dispatch(userToken(tokenData));
            setIsLoading(false);
            // setTimeout(() => {
            dispatch(setLoading(false));
            handleIncomingIntent(data.data.detail.first_name)

            // navigation.navigate('HomeScreen' as never);

            // }, 400);
          }
        })
        .catch(error => {
          console.log(error);
          const errorMsg = JSON.parse(error._response)
          if (!toast.isActive(id)) {
            ErrorToast({ toast, id, errorMessage: errorMsg.message });
          }
          setIsLoading(false);
          dispatch(setLoading(false));
        });
    } else {
      await setShow('');
      setIsLoading(false);
      if (!token && !isLoading) {
        navigation.navigate('Login' as never);
      }
    }
  };

  useEffect(() => {
    getToken();
  }, [token, rerenderToken]);

  const fetchDefaultCode = async (latitude: any, longitude: any) => {
    try {
      const code = await getUserCountryCode(latitude, longitude);
      if (code) {
        dispatch(setCountryCode(code))
        const countryCode = countries.countries[code].countryCallingCodes[0]
        dispatch(setDialingCode(countryCode))
      }
    } catch (error) {
      console.error("Error fetching default code:", error);
    }
  }

  const requestLocationPermission = async () => {
    try {
      const granted = await checkLocationPermission();
      if (granted) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(
        'Error occurred while requesting location permission:',
        error,
      );
      return false;
    }
  };

  const getLocation = () => {
    const result = requestLocationPermission();
    result.then(res => {
      if (res) {
        Geolocation.getCurrentPosition(
          position => {
            fetchDefaultCode(position.coords.latitude.toString(), position.coords.longitude.toString())
          },
          error => {
            // See error code charts below.
            console.log(error.code, error.message);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
        );
      }
    });
  };

  const getCategoryData = () => {
    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('type', '0');
      ApiRequestAsync('GET', '/location/list?type=1', data, token)
        .then(async (data: any) => {
          dispatch(setLoading(false));
          if (data.data.list !== undefined) {
            dispatch(addCategoryList(data.data.list));
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) { }
  };

  const handleUrl = async (url: string) => {
    let tokenData = await accessToken();
    if (url && tokenData) {
      const decodedUrl = decodeURIComponent(url);
      const decodeUrlSplit = decodedUrl.split('=')
      const modifiedUrl = decodeUrlSplit[1].split('\n').join('');
      const appLatLng = await geoReverseEncodedAddress({ address: modifiedUrl });
      dispatch(setAppLinkUrl(appLatLng));
      if (appLatLng.longitude !== '' && categoryList.length === 0) {
        getCategoryData();
      }
      navigation.navigate('Save Location' as never);
    } else {
      navigation.navigate('HomeScreen' as never);
    }
  }

  const handleIncomingIntent = async (user_name: string) => {
    const url = await Linking.getInitialURL();
    if (url) handleUrl(url);
  };

 useEffect(() => {
   if (Platform.OS === 'android') {
     StatusBar.setBackgroundColor('#16a34a');
     StatusBar.setBarStyle('light-content');
     getAllPermissions()
    }else{
      checkContactsPermission()
      requestWriteContactsPermission()
      checkGalleryPermission()
      checkAndRequestPermissions()
    }
    getLocation()
  }, []);

  useEffect(() => {
    Linking.addEventListener('url', (event) => {
      handleUrl(event.url);
    });
  }, [])

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={require('../Assets/images/launch_screen.png')}
          style={styles.image}>
          {/* Your component content */}
        </ImageBackground>
      </View>
    );
  }

  return (
    <>
      {/* <Stack.Navigator initialRouteName={show !== '' ? 'HomeScreen' : 'Login'}> */}

      {show !== '' ? (
        <Stack.Navigator>
          <Stack.Screen
            name="MainStack"
            component={MainStack}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator>
          <Stack.Screen
            name="MainStack"
            component={AuthStack}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      )}

      {/* {MainStack(Stack)} */}
      {/* </Stack.Navigator> */}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: -99,
  },
  image: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
    zIndex: -99,
  },
});

