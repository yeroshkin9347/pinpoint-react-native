import axios, { Method, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ERROR_TOAST } from '../redux/Interface/interface';
import { Box, useToast } from 'native-base';
import { Image, PermissionsAndroid, Platform, StyleSheet } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import React from 'react';
import store from '../redux/store';
import { resetAppState } from '../redux/reducers/authReducer';

export const BaseURL = 'https://admin.pinpointeye.com';
// export const BaseURL = 'https://dev.ozvid.in/pin-point-eye-yii2-1667/api';
export const myApiKey = 'AIzaSyByniSgpMtWl3-zWhpSB7_M5cQCafEE2Tk';

type UrlType = `/${string}`;


export const ApiRequestAsync = async (
  method: Method,
  url: UrlType,
  data: Array<any> | Object | FormData,
  token: string,
  contentType?: string,
) => {
  let userToken = await accessToken();
  let config: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BaseURL}/api${url}`,
    headers: {
      'Content-Type': contentType ? 'application/json' : 'multipart/form-data',
      Authorization: `Bearer ${userToken !== '' ? userToken : token}`,
      Cookie:
        '_csrf_pin_point_eye_yii2_1667=802fd9cfecd53b32801b67ae9a6ff730b8d213e31c7f8ce9a7cfbc0d21511599a%3A2%3A%7Bi%3A0%3Bs%3A29%3A%22_csrf_pin_point_eye_yii2_1667%22%3Bi%3A1%3Bs%3A32%3A%22H-_qQ0_EsDNbGBbXQ71aFe6zoDGL5Axg%22%3B%7D; _session_pin_point_eye_yii2_1667=jraieqtlr50hqsvj2jrruuejuh',
    },
  };
  try {
    switch (method) {
      case 'POST':
        config.data = data;
        break;
      case 'GET':
        config.params = data;
        break;
      case 'PUT':
        config.data = data;
        break;
      default:
        config.params = data;
        break;
    }
    return await axios(config);
  } catch (e: any) {
    if (e.request.status === 401) {
      removeUser();
      store.dispatch(resetAppState())
      const toast = useToast();
      const toastid = 'test-toast';
      if (!toast.isActive(toastid)) {
        ErrorToast({
          toast,
          id: toastid,
          errorMessage: 'Session timeout, Redirecting to login',
        });
      }
    }

    throw e.request;
    // return e.response;
  }
};

export const AuthRequestAsync = async (url: string, data: any) => {
  try {
    let response = await axios
      .post(`${BaseURL}/api${url}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then(res => {
        return res;
      })
      .catch(e => {
        if (e.request.status === 401) {
          removeUser();
          store.dispatch(resetAppState())
        }
        return e.response;
      });
    return response;
  } catch (error) {
    // throw error
  }
};

export const accessToken = async () => {
  const tokenresult = await AsyncStorage.getItem('@MyApp_user');
  if (tokenresult !== undefined && tokenresult !== '' && tokenresult !== null) {
    let user_token: any = JSON.parse(tokenresult);
    return user_token.accessToke as string;
  } else {
    return '';
  }
};

export const removeUser = () => {
  AsyncStorage.removeItem('@MyApp_user');
};

export const ErrorToast = ({
  toast,
  id,
  errorMessage,
  placement,
}: ERROR_TOAST) => {
  toast.show({
    placement: placement ? placement : 'bottom',
    duration: 2000,
    id,
    render: () => {
      return (
        <Box
          style={styles.boxContainer}
          _text={{ color: 'black', fontSize: 15 }}
          bg="white"
          px="3"
          py="3"
          mb={5}>
          <Image
            source={require('../Assets/icons/PinPointEye.png')}
            style={styles.image}
          />
          {errorMessage}
        </Box>
      );
    },
  });
};

export const requestPermission = async () => {
  try {
    const permission = PERMISSIONS.ANDROID.READ_CONTACTS;
    const granted = await PermissionsAndroid.request(permission);
    return granted;
  } catch (error) {
    console.log('Error requesting permission:', error);
    return 'denied';
  }
};

export const geoEncodedAddress = async (arg: {
  latitude: any;
  longitude: any;
}) => {
  const googleurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${arg.latitude},${arg.longitude}&key=${myApiKey}`;
  const response = await axios.get(googleurl);
  const address = response.data.results[0].formatted_address;
  return address;
};

export const geoReverseEncodedAddress = async (arg: {
  address: string;
}) => {

  const googleurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${arg.address}&key=${myApiKey}`;
  const response = await axios.get(googleurl);
  const dataObj = {
    address: arg.address,
    latitude: response.data.results[0].geometry.location.lat,
    longitude: response.data.results[0].geometry.location.lng,
  };

  return dataObj;
};

export const geoEncodedCompleteAddress = async (arg: {
  latitude: string;
  longitude: string;
}) => {
  const googleurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${arg.latitude},${arg.longitude}&key=${myApiKey}`;
  const response = await axios.get(googleurl);
  const address = response.data.results[0].formatted_address;
  const addressComponents = address.split(', ');
  const addressCityState = addressComponents[2].split(' ');
  return {
    street: addressComponents[0],
    city: addressComponents[1],
    state: addressCityState[0],
    postalCode: addressCityState[1],
    country: addressComponents[3],
    isoCountryCode: addressComponents[3],
    formattedAddress: address,
  };
};

export const getPlusCode = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${myApiKey}`,
    );
    const results = response.data?.plus_code?.compound_code;
    if (results) {
      return `${results}`;
    } else {
      return ' ';
    }
  } catch (error) {
    console.error(error);
    return '';
  }
};

export const ApiRequestWithParamAsync = async (
  method: Method,
  url: UrlType,
  param: Array<any> | Object | FormData,
  token: string,
  contentType?: string,
  data?: Array<any> | Object | FormData,
) => {
  let userToken = await accessToken();
  let config: AxiosRequestConfig = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BaseURL}/api${url}`,
    headers: {
      'Content-Type': contentType ? 'application/json' : 'multipart/form-data',
      Authorization: `Bearer ${userToken !== '' ? userToken : token}`,
      Cookie:
        '_csrf_pin_point_eye_yii2_1667=802fd9cfecd53b32801b67ae9a6ff730b8d213e31c7f8ce9a7cfbc0d21511599a%3A2%3A%7Bi%3A0%3Bs%3A29%3A%22_csrf_pin_point_eye_yii2_1667%22%3Bi%3A1%3Bs%3A32%3A%22H-_qQ0_EsDNbGBbXQ71aFe6zoDGL5Axg%22%3B%7D; _session_pin_point_eye_yii2_1667=jraieqtlr50hqsvj2jrruuejuh',
    },
  };
  try {
    switch (method) {
      case 'POST':
        config.data = data;
        config.params = param;
        break;
      case 'GET':
        config.data = data;
        config.params = param;
        break;
      case 'PUT':
        config.data = data;
        config.params = param;
        break;
      default:
        config.data = data;
        config.params = param;
        break;
    }
    return await axios(config);
  } catch (e: any) {
    if (e.request.status === 401 && url !== '/v2/auth') {
      removeUser();
      store.dispatch(resetAppState())
    }

    throw e.request;
    // return e.response;
  }
};

const styles = StyleSheet.create({
  boxContainer: {
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderColor: '#000',
    borderWidth: 0.01,
    borderRadius: 50,
    flexDirection: 'row',
    zIndex: 999999999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 20,
    height: 25,
    resizeMode: 'contain',
    padding: 2.5,
    marginRight: 10,
  },
});

export const checkContactsPermission = async (): Promise<boolean> => {
  let permissionStatus = false;

  if (Platform.OS === 'android') {
    const granted: any = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Contacts',
        message: 'This app would like to view your contacts.',
        buttonPositive: 'Please accept bare mortal',
      },
    );

    permissionStatus = granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'ios') {
    const permission = await check(PERMISSIONS.IOS.CONTACTS);

    if (permission === RESULTS.DENIED) {
      const requestPermission = await request(PERMISSIONS.IOS.CONTACTS);
      permissionStatus = requestPermission === RESULTS.GRANTED;
    } else {
      permissionStatus = permission === RESULTS.GRANTED;
    }
  }

  return permissionStatus;
};

export const checkGalleryPermission = async () => {
  let permissionStatus = false;

  if (Platform.OS === 'android') {
    // Android permission request
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: 'Gallery Permission',
        message: 'App needs access to your gallery',
        buttonPositive: 'OK',
      },
    );

    permissionStatus = granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'ios') {
    // iOS permission request
    const permission = await check(PERMISSIONS.IOS.PHOTO_LIBRARY);

    if (permission === RESULTS.DENIED) {
      const requestPermission = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);
      permissionStatus = requestPermission === RESULTS.GRANTED;
    } else {
      permissionStatus = permission === RESULTS.GRANTED;
    }
  }

  return permissionStatus;
};

export const getUkTime = () => {
  const date = new Date();
  const options = { timeZone: 'UTC' };

  const ukTimeString = date.toLocaleTimeString('en-GB', options);
  const [hour, minute, second] = ukTimeString.split(':');

  const ukDateTime = new Date();
  ukDateTime.setHours(Number(hour), Number(minute), Number(second));

  return ukDateTime;
};

export const galleryPermissionCheck = async () => {
  const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

  const hasPermission = await PermissionsAndroid.check(permission);

  if (hasPermission) {
    return true;
  }

  const status = await PermissionsAndroid.request(permission);
  return status === 'granted';
}

export const checkCameraPermission = async () => {
  let permissionStatus = false;

  if (Platform.OS === 'android') {
    // Android permission request
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message: 'App needs access to your camera',
        buttonPositive: 'OK',
        buttonNegative: 'Cancel',
      },
    );

    permissionStatus = granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'ios') {
    // iOS permission request
    const permission = await check(PERMISSIONS.IOS.CAMERA);

    if (permission === RESULTS.DENIED) {
      const requestPermission = await request(PERMISSIONS.IOS.CAMERA);
      permissionStatus = requestPermission === RESULTS.GRANTED;
    } else {
      permissionStatus = permission === RESULTS.GRANTED;
    }
  }

  return permissionStatus;
};

export const checkLocationPermission = async () => {
  let permissionStatus = false;

  if (Platform.OS === 'android') {
    // Android permission request
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Geolocation Permission',
        message: 'Can we access your location?',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    permissionStatus = granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'ios') {
    // iOS permission request
    const permission = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

    if (permission === RESULTS.DENIED) {
      const requestPermission = await request(
        PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      );
      permissionStatus = requestPermission === RESULTS.GRANTED;
    } else {
      permissionStatus = permission === RESULTS.GRANTED;
    }
  }

  return permissionStatus;
};

export const requestWriteContactsPermission = async () => {
  let permissionStatus = false;

  if (Platform.OS === 'android') {
    // Android permission request
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
      {
        title: 'Contact Permission',
        message: 'This app needs access to update contacts.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );

    permissionStatus = granted === PermissionsAndroid.RESULTS.GRANTED;
  } else if (Platform.OS === 'ios') {
    // iOS permission request
    const permission = await check(PERMISSIONS.IOS.CONTACTS);

    if (permission === RESULTS.DENIED) {
      const requestPermission = await request(PERMISSIONS.IOS.CONTACTS);
      permissionStatus = requestPermission === RESULTS.GRANTED;
    } else {
      permissionStatus = permission === RESULTS.GRANTED;
    }
  }

  return permissionStatus;
};

export const covertTimeToTwelveHourFormat = (time: any) => {
  if (time !== undefined && time !== null && time !== '') {
    let dateTime = time.split(' ');

    // Split the time into hours, minutes, and seconds
    const [hours, minutes, seconds] = dateTime[1].split(':');

    // Create a new Date object and set the hours, minutes, and seconds
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);

    // Convert the time to 12-hour format with AM/PM
    dateTime[1] = date.toLocaleString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    });
    dateTime = dateTime.join(' | ');
    return dateTime;
  }
  return '';
};

export const checkAndRequestPermissions = async () => {
  const permissionsToCheck = [
    {
      permission: Platform.select({
        android: PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        ios: PERMISSIONS.IOS.CONTACTS,
      }),
      rationale: 'This app would like to view your contacts.',
    },
    {
      permission: Platform.select({
        android: PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      }),
      rationale: 'App needs access to your gallery.',
    },
    {
      permission: Platform.select({
        android: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      }),
      rationale: 'Can we access your location?',
    },
    {
      permission: Platform.select({
        android: PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
        ios: PERMISSIONS.IOS.CONTACTS,
      }),
      rationale: 'This app needs access to update contacts.',
    },
    {
      permission: Platform.select({
        android: PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      }),
      rationale: 'This app needs to send notifications',
    },
  ];

  try {
    for (const permissionInfo of permissionsToCheck) {
      const { permission, rationale } = permissionInfo;
      let status = await check(permission as any);

      if (status === RESULTS.DENIED) {
        const requestResult = await request(
          permission as any,
          { rationale } as any,
        );
        status = requestResult;
      }
    }
  } catch (error) {
    console.error(error);
  }
};

export const sortNamesAlphabetically = (fullName: any, flag = '') => {
  let sortedNameArray = [];
  if (flag === 'updateContact') {
    if (Platform.OS === 'android') {
      sortedNameArray = fullName.sort((a: any, b: any) => a.displayName?.localeCompare(b.displayName));
    } else {
      sortedNameArray = fullName.sort((a: any, b: any) => a.givenName?.localeCompare(b.giveName) && a.familyName.localeCompare(b.familyName));
    }
  }
  else if (flag === 'emergencyContact') {
    sortedNameArray = fullName.sort((a: any, b: any) => a.full_name?.localeCompare(b.full_name));
  }
  else {
    // Use the Array.prototype.sort() method with a comparison function
    sortedNameArray = fullName.sort((a: any, b: any) => a.name?.localeCompare(b.name));
  }
  return sortedNameArray;
}

export function truncateString(inputString: string) {

  if (inputString.length <= 30) {
    return inputString;
  } else {
    return inputString.substring(0, 30) + "...";
  }
}

export const getUserCountryCode = async (latitude: any, longitude: any) => {
  try {

    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${myApiKey}`,
    );
    const results = response.data?.results;
    if (results && results.length > 0) {
      for (const result of results) {
        // Look for the country code in the address components
        for (const component of result.address_components) {
          if (component.types.includes('country')) {
            return component.short_name;
          }
        }
      }
    }
    // If no country code was found, return an empty string or handle as needed
    return '';
  } catch (error) {
    console.error(error);
    return '';
  }
};


export const getAllPermissions = async () => {
  PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
    PermissionsAndroid.PERMISSIONS.CAMERA,
    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS
  ]).then(result => {
    if (
      result['android.permission.ACCESS_FINE_LOCATION'] &&
      result['android.permission.CAMERA'] &&
      result['android.permission.READ_CONTACTS'] &&
      result['android.permission.POST_NOTIFICATIONS'] &&
      result['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted'
    ) {
      console.log(
        'All permissions granted!',
      );
    } else {
      console.log('Permissions denied!', 'You need to give permissions');
    }
  });
};