/* eslint-disable prettier/prettier */
import { useNavigation } from '@react-navigation/native';
import {
  Box,
  Button,
  Center,
  Checkbox,
  FormControl,
  Input,
  Link,
  Pressable,
  Text,
  VStack,
  useToast,
} from 'native-base';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Image, View, TouchableOpacity,Platform } from 'react-native';
import { PostService } from '../../../API/api';
import { colorPrimary, globalStyles } from '../../../Style/GlobalStyles/GlobalStyle';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../../../Components/CustomButton';
import axios from 'axios';
import CustomInput from '../../../Components/CustomInput';
import CustomCheckBox from '../../../Components/CustomCheckBox';
import { AuthRequestAsync, ErrorToast } from '../../../services/httpServices';
import {
  setLoading,
  setProfile,
  userToken,
  setrerenderApp,
  setSocialLogin,
} from '../../../redux/reducers/authReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Icons from 'react-native-vector-icons/FontAwesome';
import { AccessToken, GraphRequest, GraphRequestManager, LoginManager } from 'react-native-fbsdk-next';
import messaging from '@react-native-firebase/messaging'
import DeviceInfo from 'react-native-device-info';
// import LinkedInModal from '@gcou/react-native-linkedin'

const Login = () => {
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    checked: false,
  });
  const {unauthorized} = useSelector((state: any) => state.AuthReducer);
  const navigation = useNavigation();
  const toast = useToast();
  const id = 'test-toast';

  const onChangeCheck = () => {
    setChecked(!checked);
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleChange = (data: any, name: string) => {
    try {
      setFormData(pre => ({
        ...pre,
        [name]: data,
      }));
    } catch (e) { }
  };

  const ValidationCheck = async () => {
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
        } else if (formData.password.length < 8) {
          validationMsg = 'Password length must be minimum 8 characters';
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
        toast.show({
          id,
          render: () => {
            return (
              <Box
                style={styles.boxContainer}
                _text={{ color: 'black', fontSize: 15 }}
                bg="white"
                px="3"
                py="3"
                mb={5}
              >
                <Image
                  source={require('../../../Assets/icons/PinPointEye.png')}
                  style={styles.image} />
                {formValidationObj[2]}
              </Box>
            );
          },
        });
      }
    }
  };

  const getRememberUser = async () => {
    const rememberUserDetail = await AsyncStorage.getItem('@Remember_user_Details');
    if (rememberUserDetail) {
      let user_Result: any = JSON.parse(rememberUserDetail);
      if (user_Result.email !== "" && user_Result.password !== "") {
        setFormData({
          ...formData,
          ["email"]: user_Result.email,
          ["password"]: user_Result.password,
          ["checked"]: user_Result.isRemeber
        });
        setChecked(user_Result.isRemeber)
      }
    }
  }

  useEffect(() => {
    getRememberUser();
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
      webClientId: '887828653364-gv8mt5l53hfsgej3q5ibhu51ov4qn1ar.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      hostedDomain: '', // specifies a hosted domain restriction
      forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
      accountName: '', // [Android] specifies an account name on the device that should be used
      iosClientId: '887828653364-gjd065rsoboppu9m1mh3g2er18kospu3.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
      // googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
      // openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
      // profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
    });
    
  }, [])

  const StoreCode = async (arg= {email:'' ,first_name:'' ,full_name:'' ,last_name:"" ,photo:'' ,is_social_id:'' ,is_social:0 }) => {
    try {

      let { email ,first_name ,full_name ,last_name ,photo ,is_social_id ,is_social }:any = arg
      let token = 'c-mAwCGYRC2X-tKvLMUTRa:APA91bFeENy8xeaA8Bu2C5cS6TmPS7dkqkpaVP7wDlsq13R5ZwC6u7bliGoCItpZIdrz-tCGHtiLlESw4mpX65IoQyN3Gm9QUkH8lXFWOAOPo1zHhcn22lo-qJh95AnmG8-F1qrcfEVA'
      if(Platform.OS === 'android'){
         await messaging().registerDeviceForRemoteMessages();
      token = await messaging().getToken();
      }
      const deviceName = await DeviceInfo.getDeviceName();
      
      dispatch(setLoading(true));
      const Data = new FormData();
      Data.append('LoginForm[username]', formData.email);
      Data.append('LoginForm[password]', formData.password);
      Data.append('LoginForm[device_name]', deviceName);
      Data.append('LoginForm[device_type]', '1');
      Data.append('LoginForm[device_token]', token);
      Data.append('is_social_id', is_social_id);
      Data.append('is_social', is_social);
      Data.append('LoginForm[first_name]', first_name);
      Data.append('LoginForm[last_name]', last_name);
      Data.append('LoginForm[photo]', photo);
      Data.append('LoginForm[email]', email);
      Data.append('LoginForm[full_name]', full_name);
      AuthRequestAsync('/user/login', Data)
        .then(async (data: any) => {
         
          if (data.data.detail !== undefined) {
            dispatch(setProfile(data.data.detail));
            dispatch(userToken(data.data['access-token']));
            const UserDetail = {
              email: data.data.detail.email,
              password: formData.password,
              accessToke: data.data['access-token'],
            };

            const UserDetail_remeber = {
              email: data.data.detail.email,
              password: formData.password,
              accessToke: data.data['access-token'],
              isRemeber: checked
            };


            await AsyncStorage.setItem(
              '@MyApp_user',
              JSON.stringify(UserDetail),
            );
            await AsyncStorage.setItem(
              '@Remember_user',
              JSON.stringify(checked),
            );

            if (checked) {
              await AsyncStorage.setItem(
                '@Remember_user_Details',
                JSON.stringify(UserDetail_remeber),
              );
            } else {
              await AsyncStorage.removeItem('@Remember_user_Details');
            }
            dispatch(setrerenderApp());
            // dispatch(setLoading(false));
            if (!toast.isActive(id)) {
              ErrorToast({ toast, id, errorMessage: "Sign in successfully!" });
            }
          } else {
            if (data.data.message) {
              dispatch(setLoading(false));
              let errorMessage = ""
              if (data.data.message === 'Incorrect Email Address') {
                errorMessage = data.data.message
              } else {
                errorMessage = data.data.message?.password[0]
              }

              if (!toast.isActive(id)) {
                ErrorToast({ toast, id, errorMessage: errorMessage ?? '' });
              }
            }
          }
          dispatch(setLoading(false));
        })
        .catch(error => {
          if (error.response) {
            dispatch(setLoading(false));
            let errorMessage = error.response.data.message;
            if (!toast.isActive(id)) {
              ErrorToast({ toast, id, errorMessage });
            }
          }
        });
    } catch (error: any) {
      console.log(error);
    }
  };

  const signInGoogle = async () => {
  
    try {
      await GoogleSignin.signOut();
      dispatch(setLoading(true));
      await GoogleSignin.hasPlayServices();
      const {user} = await GoogleSignin.signIn();
      let userObj = {
        email : user.email,
        first_name : user.givenName,
        full_name : user.name,
        last_name : user.familyName,
        photo : user.photo,
        is_social_id : user.id,
        is_social : 1,
      }
      StoreCode(userObj)
      dispatch(setSocialLogin('google'));
    } catch (error : any) {
      dispatch(setLoading(false));
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
      }
    }
  };
  const signInFacebook = async () => {
    // LoginManager.logOut()
    dispatch(setLoading(true));
    LoginManager.logInWithPermissions(["public_profile","email"]).then(
        function(result) {
          if (result.isCancelled) {
            console.log("Login cancelled");
          } else {
            console.log(
              "Login success with permissions: " +
                result.grantedPermissions.toString()
            );
            AccessToken.getCurrentAccessToken().then(
              (data) => {
                let accessToken = data.accessToken
                const responseInfoCallback = (error, result) => {
                  if (error) {
                    console.log(error)
                  } else {
                    console.log(result)
                    let userObj = {
                      email : result.email,
                      first_name : result.first_name,
                      full_name : result.name,
                      last_name : result.last_name,
                      photo : '',
                      is_social_id : result.id,
                      is_social : 2,
                    }
                    StoreCode(userObj)
                  }
                }
    
                const infoRequest = new GraphRequest(
                  '/me',
                  {
                    accessToken: accessToken,
                    parameters: {
                      fields: {
                        string: 'email,name,first_name,middle_name,last_name'
                      }
                    }
                  },
                  responseInfoCallback
                );
    
                // Start the graph request.
                new GraphRequestManager().addRequest(infoRequest).start()
    
              }
            )
          }
        },
        function(error) {
          console.log("Login fail with error: " + error);
        }
      );
   
  };

  useEffect(() => {
    if (unauthorized) {
      if (!toast.isActive(id)) {
        ErrorToast({
          toast,
          id: id,
          errorMessage: 'Session timeout, Redirecting to login',
        });
      }
    }
  }, [unauthorized])
  


  return (
    <ScrollView>
      <Center w="100%">
        <Box safeArea pt="4" w="100%" maxW="290%">
        {/* <LinkedInModal 
          clientID= "78d1wphxskdx3s"
          clientSecret= "CPr0mepxgEefC9g5"
          redirectUri= "http://localhost:8081/auth/linkedin/callback"
          onSuccess= {
            (token: { access_token: string; }) =>{
              let name_surname = "https://api.linkedin.com/v2/me";
              let user_mail = "https://api.linkedin.com/v2/clientAwareMemberHandles?q=members&projection=(elements*(primary,type,handle~))";
              let namereq = new XMLHttpRequest();
                namereq.open("GET", user_mail);
                namereq.setRequestHeader("Authorization", "Bearer " + token.access_token);
                namereq.onreadystatechange = function(){
                  if(namereq.readyState === 4){
                    console.log("Text:" , namereq.responseText);;
                  }
                }
                namereq.send();
            }
          }
      /> */}
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
                keyboardType={'default'}
                setpasswordState={() => { }}
                InputRightElementFunction={() => { }}
                maxLength={100} />
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
                type={'text'}
                keyboardType={'default'}
                isDisabled={false}
                InputRightElementFunction={() => { }}
                maxLength={100}
              />
            </FormControl>
            <Box
              mt="6"
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <CustomCheckBox
                accessibilityLabel='Remember Me'
                opacity={'0.4'}
                colorScheme={'gray'}
                value={'one'}
                size={'md'}
                isChecked={checked}
                onChange={onChangeCheck}
                customCheckBoxText={'Remember Me'}
              />
              {/* <Text opacity="0.4" style={globalStyles.label}>
                Remember Me
              </Text> */}
              <Link
                _text={{
                  fontSize: '18',
                  fontWeight: '500',
                  color: 'tertiary.700',
                  textDecoration: 'none',
                }}
                alignSelf="flex-end"
                onPress={() => navigation.navigate('ForgetPassword' as never)}>
                Forget Password?
              </Link>
            </Box>

            <Button
              // _text={styles.text}
              size="lg"
              mt="2"
              colorScheme="tertiary"
              onPress={BeforeStoreCode}>
              Continue
            </Button>

            <View style={{ marginVertical: 20, alignItems: 'center' }}>
              <Text style={{ fontSize: 15, fontFamily: 'Poppins-Regular' }}>
                Or Login with
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
                paddingHorizontal: 60,
              }}>
              <TouchableOpacity
                style={{
                  width: 45,
                  height: 45,
                  backgroundColor: '#059669',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 18,
                }}
                onPress={signInFacebook}
                >
                <Icons
                  size={25}
                  name="facebook"
                  style={{
                    color: 'white',
                  }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  width: 45,
                  height: 45,
                  backgroundColor: '#059669',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 18,
                }}
                onPress={signInGoogle}
                activeOpacity={1}
                >
                <Icons
                  size={25}
                  name="google"
                  style={{
                    color: 'white',
                  }}
                />
              </TouchableOpacity>
            </View>
            {/* <CustomButton text="Continue" onPress={BeforeStoreCode} /> */}
          </VStack>
          <View style={{ marginTop: 20 }} >
            <Text style={styles.versionFontStyle}>Version: 00.01.02.0024</Text>
          </View>
        </Box>
      </Center>
    </ScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({
  boxContainer: {
    zIndex: 999,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    borderColor: '#000',
    borderWidth: 0.01,
    borderRadius: 50,
    flexDirection: 'row'
  },
  image: {
    width: 20,
    height: 25,
    resizeMode: 'contain',
    padding: 2.5,
    marginRight: 10
  },
  versionFontStyle: {
    fontSize: 10,
    textAlign: 'center',
    color: 'gray',
    opacity: 0.5,
  },
});
