import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import {
  Box,
  Button,
  Center,
  FormControl,
  Pressable,
  Text,
  VStack,
  useToast,
} from 'native-base';
import React, { useCallback, useEffect, useState,  } from 'react';
import { ScrollView, StyleSheet ,Platform } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import CustomButton from '../../../Components/CustomButton';
import CustomInput from '../../../Components/CustomInput';
import { AuthRequestAsync, ErrorToast, checkLocationPermission, getUserCountryCode } from '../../../services/httpServices';
import CustomCheckBox from '../../../Components/CustomCheckBox';
import { useDispatch } from 'react-redux';
import {
  setCountryCode,
  setFromUser,
  setLoading,
  setProfile,
  userToken,
} from '../../../redux/reducers/authReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loader from '../../../Components/Loader';
import Geolocation from 'react-native-geolocation-service';
import messaging from '@react-native-firebase/messaging'
const Signup = () => {
  const navigation: NavigationProp<ReactNavigation.RootParamList> =
    useNavigation();
  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({ headerShown: false });
    }, []),
  );

  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    checked: false,
  });

  const toast = useToast();
  const id = 'test-toast';

  const handleChange = (data: any, name: string) => {
    try {
      setFormData(pre => ({
        ...pre,
        [name]: data,
      }));
    } catch (e) { }
  };

  const getLocation = () => {
    const result = checkLocationPermission();
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

  useEffect(() => {
    getLocation()
  }, [])

  const fetchDefaultCode = async (latitude: any, longitude: any) => {
    try {
      const code = await getUserCountryCode(latitude, longitude);
      if (code) {
        dispatch(setCountryCode(code));
      }
    } catch (error) {
      console.error("Error fetching default code:", error);
    }
  }

  const onChangeCheck = () => {
    setFormData(prevState => ({
      ...prevState,
      checked: !formData.checked,
    }));
  };

  // useEffect(() => {
  //   dispatch(setFromUser(true));
  // }, []);

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const ValidationCheck = () => {
    let validationMsg = '';
    if (formData.email === '') {
      validationMsg = 'Please enter email';
    } else if (formData.email !== '') {
      const isValid = validateEmail(formData.email);
      if (!isValid) {
        validationMsg = 'Please enter valid email';
      } else {
        if (formData.password === '') {
          validationMsg = 'Password';
        } else if (formData.password !== '') {
          if (formData.password.length < 8) {
            validationMsg = 'Password length must be minimum 8 characters';
          } else {
            if (formData.confirmPassword === '') {
              validationMsg = 'Please Enter Confirm Password';
            } else if (formData.password !== formData.confirmPassword) {
              validationMsg = 'Password and Confirm Password must be same';
            } else if (formData.checked === false) {
              validationMsg = 'Please accept Terms & Privacy';
            }
          }
        }
      }
    }
    return validationMsg;
  };

  const BeforeStoreCode = () => {
    const formValidation = ValidationCheck();
    const formValidationObj = Object.values(formValidation);
    if (!formValidationObj[2]) {
      StoreCode();
    } else {
      if (!toast.isActive(id)) {
        ErrorToast({ toast, id: id, errorMessage: formValidation })
      }
    }
  }

  const StoreCode = async () => {
    try { 
   let token = 'c-mAwCGYRC2X-tKvLMUTRa:APA91bFeENy8xeaA8Bu2C5cS6TmPS7dkqkpaVP7wDlsq13R5ZwC6u7bliGoCItpZIdrz-tCGHtiLlESw4mpX65IoQyN3Gm9QUkH8lXFWOAOPo1zHhcn22lo-qJh95AnmG8-F1qrcfEVA'
      if(Platform.OS === 'android'){
         await messaging().registerDeviceForRemoteMessages();
      token = await messaging().getToken();
      }
      const deviceName = await DeviceInfo.getDeviceName();
    
          dispatch(setLoading(true));
          const Data = new FormData();
          Data.append('User[email]', formData.email);
          Data.append('User[password]', formData.password);
          Data.append('AccessToken[device_name]', deviceName);
          Data.append('AccessToken[device_type]', '1');
          Data.append('User[confirm_password]', formData.confirmPassword);
          Data.append('AccessToken[device_token]', token);
          AuthRequestAsync('/user/signup', Data)
            .then(async (data: any) => {
              dispatch(setLoading(false));
              if (data.data.detail !== undefined) {
                dispatch(setProfile(data.data.detail));
                dispatch(userToken(data.data['access-token']));
                dispatch(setFromUser(true));
                navigation.navigate('ProfileSetup' as never);
              } else {
                if (data.data.message) {
                  dispatch(setLoading(false));
                  let errorMessage = data.data.message
                  if (!toast.isActive(id)) {
                    ErrorToast({ toast, id, errorMessage });
                  }
                }
              }
            })
            .catch(error => {
              console.log(error);
              dispatch(setLoading(false));
            });
    } catch (error: any) {
      console.log(error);
      toast.show({
        title: error.response.data.message,
      });
    }
  };

  return (
    <ScrollView>
      <Center w="100%">
        <Box safeArea pt="4" w="100%" maxW="290%">
          <VStack space={3}>
            <FormControl>
              <CustomInput
                variant="outline"
                fontSize="lg"
                placeholder="Email"
                InputLeftElementIcon="email-outline"
                focusOutlineColor={'coolGray.300'}
                value={formData.email}
                onChangeText={(text: any) => handleChange(text, 'email')}
                focusbackgroundColor={'coolGray.100'}
                InputRightElementIcon=""
                passwordState={false}
                isDisabled={false}
                type={'text'}
                setpasswordState={() => { }}
                keyboardType={'default'}
                InputRightElementFunction={() => { }}
                maxLength={100}
              />
            </FormControl>
            <FormControl>
              <CustomInput
                variant="outline"
                fontSize="lg"
                placeholder="Password"
                InputLeftElementIcon="lock-outline"
                focusOutlineColor={'coolGray.300'}
                value={formData.password}
                onChangeText={(text: any) => handleChange(text, 'password')}
                focusbackgroundColor={'coolGray.100'}
                InputRightElementIcon="eye"
                passwordState={show}
                setpasswordState={setShow}
                isDisabled={false}
                type={'text'}
                keyboardType={'default'}
                InputRightElementFunction={() => { }}
                maxLength={100}
              />
            </FormControl>
            <FormControl>
              <CustomInput
                variant="outline"
                fontSize="lg"
                placeholder="Confirm Password"
                InputLeftElementIcon="lock-outline"
                focusOutlineColor={'coolGray.300'}
                value={formData.confirmPassword}
                isDisabled={false}
                type={'text'}
                maxLength={100}
                onChangeText={(text: any) =>
                  handleChange(text, 'confirmPassword')
                }
                focusbackgroundColor={'coolGray.100'}
                InputRightElementIcon="eye"
                passwordState={confirmPass}
                setpasswordState={setConfirmPass}
                keyboardType={'default'}
                InputRightElementFunction={() => { }}
              />
            </FormControl>
            <Box mt="3" style={{ flexDirection: 'row' }}>
              <CustomCheckBox
                opacity={'0.5'}
                colorScheme={'gray'}
                value={'one'}
                size={'md'}
                isChecked={formData.checked}
                onChange={onChangeCheck}
                accessibilityLabel={''}
                customCheckBoxText={''}
              />
              <Text style={{ fontSize: 18, paddingHorizontal: 10 }}>
                I agree to{' '}
                <Text
                  onPress={() => navigation.navigate('Terms' as never)}
                  style={{ color: 'green', fontWeight: 'bold', fontSize: 18 }}>
                  Terms
                </Text>{' '}
                &{' '}
                <Text
                  onPress={() => navigation.navigate('Policy' as never)}
                  style={{ color: 'green', fontWeight: 'bold', fontSize: 18 }}>
                  Policy
                </Text>
              </Text>
            </Box>
            <Button
              _text={styles.text}
              size="lg"
              mt="2"
              colorScheme="tertiary"
              onPress={BeforeStoreCode}>
              Continue
            </Button>
          </VStack>
        </Box>
      </Center>
    </ScrollView>
  );
};

export default Signup;

const styles = StyleSheet.create({
  text: {
    fontWeight: '600',
    fontSize: 18,
  },
});
