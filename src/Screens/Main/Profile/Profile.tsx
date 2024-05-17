import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import {
  Actionsheet,
  Avatar,
  Box,
  Button,
  Center,
  FormControl,
  Image,
  Pressable,
  Text,
  VStack,
  useToast
} from 'native-base';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  PermissionsAndroid,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import ImagePicker from 'react-native-image-crop-picker';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../../../Components/CustomInput';
import Loader from '../../../Components/Loader';
import {
  setFromUser,
  setLoading,
  setProfile,
  updateProfile
} from '../../../redux/reducers/authReducer';
import {
  ApiRequestAsync,
  BaseURL,
  ErrorToast,
  checkCameraPermission,
  checkGalleryPermission,
  galleryPermissionCheck,
} from '../../../services/httpServices';
import { colorSecondary } from '../../../Style/GlobalStyles/GlobalStyle';
import { TouchableWithoutFeedback } from 'react-native';
import CustumPhoneInput from '../../../Components/CustumPhoneInput';
// import { CameraRoll } from "@react-native-camera-roll/camera-roll";

const data = [
  { label: 'Male', value: '0' },
  { label: 'Female', value: '1' },
  { label: 'Other', value: '2' },
  { label: 'Prefer not to say', value: '3' },
];

interface UserProfile {
  profile_file: string;
  address: string;
  gender: string;
  contact_no: string;
  email: string;
  last_name: string;
  first_name: string;
  image_file: any
}

const Profile = ({ route }: any) => {

  const toast = useToast();
  const { profile, token, isLoading, fromSignUp } = useSelector((state: any) => state.AuthReducer);
  const [imageSource, setImageSource] = useState<any>(null);
  const [errorText, setErrorText] = useState<any>(null);
  const [images, setImages] = useState<any>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    profile_file: '',
    address: '',
    gender: '',
    contact_no: '',
    email: '',
    last_name: '',
    first_name: '',
    image_file: '',
  });
  const [isFocus, setIsFocus] = useState(false);
  const id = 'test-toast';
  const navigation = useNavigation();
  const dispatch = useDispatch();

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: "Profile" });
  }, []);

  useEffect(() => {
    setUserProfile((pre) => ({
      ...pre,
      profile_file: profile.profile_file,
      address: profile.address,
      gender: profile.gender,
      contact_no: profile.contact_no,
      email: profile.email,
      last_name: profile.last_name,
      first_name: profile.first_name,
    }));

  }, [])


  useEffect(() => {

    setUserProfile((pre) => ({
      ...pre,
      address: profile.address,
    }))
  }, [profile.address])




  const ValidationCheck = () => {
    let validationMsg = '';
    if (!userProfile.first_name) {
      validationMsg = 'Please Enter First Name';
    } else if (!userProfile.last_name) {
      validationMsg = 'Please Enter Last Name';
    } else if (!userProfile.contact_no) {
      validationMsg = 'Please Enter Contact Number';
    } else if (userProfile.contact_no && userProfile.contact_no.length < 5) {
      validationMsg = 'Phone number length must be greater or equal to 5';
    } else if (!userProfile.address) {
      validationMsg = 'Please Select Your Address';
    }
    return validationMsg;
  };

  const BeforeStoreCode = () => {
    const formValidation = ValidationCheck();
    const formValidationObj = Object.values(formValidation);
    if (!formValidationObj[2]) {
      if (!userProfile.gender) {
        setUserProfile(prevState => ({
          ...prevState,
          gender: '2' // Default to 'unknown'
        }));
      }
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
                  style={styles.image}
                  alt='ppe'
                />
                {formValidation}
              </Box>
            );
          },
        });
      }
    }
  };

  const StoreCode = async () => {
    dispatch(setLoading(true));
    let data = new FormData();
    let profilepic = userProfile.image_file?.path ? {
      uri: userProfile.image_file?.path,
      type: userProfile.image_file?.mime,
      name: userProfile.image_file?.path.split('/').pop(),
    } : ''
    data.append('User[first_name]', userProfile.first_name);
    data.append('User[last_name]', userProfile.last_name);
    data.append('User[contact_no]', userProfile.contact_no);
    data.append('User[address]', userProfile.address);
    data.append('User[gender]', Number(userProfile.gender));
    data.append('User[latitude]', profile.latitude);
    data.append('User[longitude]', profile.longitude);
    data.append('User[curr_lat]', profile.current_latitude);
    data.append('User[curr_lon]', profile.current_longitude);
    data.append('User[profile_file]', profilepic);
    ApiRequestAsync('POST', '/user/update-profile', data, token)
      .then(async (data: any) => {
        dispatch(setProfile(data.data.detail));
        const UserDetail = {
          email: userProfile.email,
          accessToke: token,
        };
        // setImageSource('')
        if((!fromSignUp && !data.data.detail.is_free_trial &&
          !data.data.detail.is_purchase)){
            await AsyncStorage.setItem('@MyApp_user', JSON.stringify(UserDetail));
            navigation.navigate("SubscriptionSettings" as never);
            return
          }
        if (fromSignUp) {

          await AsyncStorage.setItem('@MyApp_user', JSON.stringify(UserDetail));
          navigation.navigate('Subscription' as never);
          // dispatch(setFromUser(false));
        } else {
          navigation.navigate('HomeScreen' as never, {
            screen: 'Settings' as never,
          } as never);
          // navigation.goBack();
        }
        // setErrorText(data.data)
        dispatch(setLoading(false));
      })
      .catch(error => {

        setErrorText(error);
        dispatch(setLoading(false));
        const errorMsg = JSON.parse(error._response)
        if (!toast.isActive(id)) {
          ErrorToast({ toast, id, errorMessage: errorMsg.message });
        }
      });
  };

  // const handleChange = (data: any, name: string) => {
  //   try {
  //     setUserProfile(pre => ({ ...pre, [name]: data }));
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const handleChange = (data: any, name: string) => {
    try {
      if (name === 'first_name' || name === 'last_name') {
        const filteredText = data.replace(/[0-9]/g, '');
        setUserProfile(pre => ({ ...pre, [name]: filteredText }));
        // if (allowedCharactersRegex.test(data)) {
        // }
      } else {
        setUserProfile(pre => ({ ...pre, [name]: data }));
      }
      if (data === '') {
        setUserProfile(pre => ({ ...pre, [name]: data }));
      }
    } catch (error) {
      console.log(error);
    }
  };
  const requestGalleryPermission = async () => {
    try {

      const granted = await checkGalleryPermission();
      if (granted) {
        // Permission granted, you can now access the gallery
        openImagePicker();
        // fetchImages();
      } else {
        // Permission denied
        console.log('Gallery permission denied');
      }
    } catch (error) {
      console.log('Error requesting gallery permission:', error);
    }
  };

  const openImagePicker = async () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      cropping: true
    }).then(image => {
    
      setImageSource(image.path);
      setUserProfile(pre => ({ ...pre, image_file: image, profile_file: image.path }))
   
    });
    // launchImageLibrary({ mediaType: 'photo' }, image => {

    //   if (image.didCancel) {
    //     console.log('User cancelled image picker');
    //   } else if (image.errorCode) {
    //     console.log('ImagePicker Error: ', image.errorCode);
    //   } else {
    //     if (image.assets !== undefined) {
    //       ImagePicker.openCropper({
    //        mediaType: 'photo',
    //        path: image?.assets !== undefined ? image?.assets[0].uri : ''

    //       }).then(image => {
    //         console.log('croppedImage', image)
    //         setImageSource(image?.path);
    //         setUserProfile(pre => ({
    //           ...pre,
    //           image_file: image,
    //           profile_file: image?.path
    //         }))
    //       });

    //     }
    //   }
    // })
  };

  // const fetchImages = () => {

  //   CameraRoll.getPhotos({
  //     first: 50, // Number of images to fetch (adjust as needed)
  //     assetType: 'Photos', // Fetch only photos (you can also use 'All' to include videos)
  //   })
  //     .then((res) => {

  //       console.log('cameraRoll', res)
  //       const imageObj = res.edges.map((item: any) => item.node.image.uri)
  //       console.log('imageObj', imageObj);
  //       setImages(imageObj);
  //       setIsOpen(true);
  //     })
  //     .catch((error) => {
  //       console.log('Error fetching images:', error);
  //     });
  // };

  const selectLocation = () => {
    //  let {first_name,last_name,email,contact_no,gender,address} = userProfile
    //   dispatch(updateProfile({first_name,last_name,email,contact_no,gender,address}))
    navigation.navigate('Set Location' as never)
  }

  const onClose = () => {
    setIsOpen(false);
  }

  return (
    <>
      {isLoading && <Loader isLoading={isLoading} />}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView style={{ flex: 1 }}>

          <TouchableWithoutFeedback onPress={Platform.OS === 'ios' ? Keyboard.dismiss  : ()=>{}} >
            <Center w="100%" style={styles.root}>
              <Box safeArea pt="4" w="95%" maxW="290%">
                <VStack space={3}>

                  {
                    userProfile?.profile_file ? (
                      <TouchableOpacity style={{ width: 130, alignSelf: 'center' }} onPress={requestGalleryPermission}>
                        <Avatar style={styles.avatar} bg="lightgrey" source={{ uri: imageSource ? imageSource : (userProfile?.profile_file ? `${BaseURL}${userProfile?.profile_file}` : '') }} />
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={{ width: 130, alignSelf: 'center' }} onPress={requestGalleryPermission}>
                        <Avatar style={styles.avatar} bg="lightgrey">
                          <Icon name="camera-outline" size={30} onPress={requestGalleryPermission} />
                        </Avatar>
                      </TouchableOpacity>
                    )
                  }

                  <Actionsheet isOpen={isOpen} onClose={onClose}>
                    <Actionsheet.Content>
                      <Box w="100%" h={60} px={4} justifyContent="center">
                        <Text fontSize="16" color="gray.500" _dark={{
                          color: "gray.300"
                        }}>
                          Select Image
                        </Text>
                      </Box>
                      {images.map((item: any, index: any) => (
                        <Avatar key={index} style={styles.avatar} bg="lightgrey" source={{ uri: item }} />
                      ))};
                    </Actionsheet.Content>
                  </Actionsheet>
                  <FormControl>
                    <CustomInput
                      variant="outline"
                      fontSize="lg"
                      placeholder="Enter first name"
                      InputLeftElementIcon="account-outline"
                      focusOutlineColor={'coolGray.300'}
                      value={userProfile && userProfile.first_name}
                      onChangeText={(text: any) => handleChange(text, 'first_name')}
                      focusbackgroundColor={'coolGray.100'}
                      InputRightElementIcon=""
                      passwordState={false}
                      isDisabled={false}
                      setpasswordState={() => { }}
                      type={'text'}
                      keyboardType={'default'}
                      InputRightElementFunction={() => { }}
                      maxLength={100} />
                  </FormControl>
                  <FormControl>
                    <CustomInput
                      variant="outline"
                      fontSize="lg"
                      placeholder="Enter last name"
                      InputLeftElementIcon="account-outline"
                      focusOutlineColor={'coolGray.300'}
                      value={userProfile && userProfile.last_name}
                      onChangeText={(text: any) => handleChange(text, 'last_name')}
                      focusbackgroundColor={'coolGray.100'}
                      InputRightElementIcon=""
                      passwordState={false}
                      isDisabled={false}
                      setpasswordState={() => { }}
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
                      placeholder="Enter Email"
                      InputLeftElementIcon="email-outline"
                      focusOutlineColor={'coolGray.300'}
                      value={userProfile && userProfile.email}
                      // value={route.params.loginData.detail.email}
                      onChangeText={(text: any) => handleChange(text, 'email')}
                      focusbackgroundColor={'coolGray.100'}
                      InputRightElementIcon=""
                      passwordState={false}
                      isDisabled={true}
                      setpasswordState={() => { }}
                      type={'text'}
                      keyboardType={'default'}
                      InputRightElementFunction={() => { }}
                      maxLength={100}
                    />
                  </FormControl>
                  <View >
                    <CustumPhoneInput
                      value={userProfile.contact_no}
                      onChangeText={(text: any) =>
                        handleChange(text, 'contact_no')} />
                  </View>
                  <FormControl>
                    <Dropdown
                      style={[styles.dropdown, isFocus && { borderColor: 'blue' }]}
                      placeholder='Select Gender'
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      renderLeftIcon={() => (
                        <FontAwesome5 name="venus-mars" color={colorSecondary} size={20} />
                      )}
                      iconColor="green"
                      itemTextStyle={styles.itemTextStyle}
                      data={data}
                      labelField="label"
                      valueField="value"
                      value={userProfile.gender !== null && userProfile.gender !== "" ? userProfile.gender.toString() : ""}
                      onBlur={() => setIsFocus(false)}
                      onChange={item => {
                        handleChange(item.value, 'gender')
                        // setValue(item.value);
                        setIsFocus(false);
                      }} />
                  </FormControl>
                  {userProfile && userProfile.address ? (
                    <FormControl>
                      <Pressable onPress={() => selectLocation()} >
                        <View style={styles.marqueeView} >
                          <View style={{ padding: 4, width: Dimensions.get('window').width * 0.1 }} >
                            <Icon name="home-outline" size={20} />
                          </View>
                          <Text
                            style={styles.paraText}
                          >
                            {userProfile && userProfile.address}
                          </Text>
                          <View>
                            <Icon color={'green'} name="map-marker-outline" size={20} />
                          </View>
                        </View>
                      </Pressable>
                    </FormControl>
                  ) : (
                    <FormControl>
                      <CustomInput
                        variant="outline"
                        fontSize="lg"
                        placeholder="Enter Location"
                        InputLeftElementIcon="home-outline"
                        focusOutlineColor={'coolGray.300'}
                        value={undefined}
                        onChangeText={(text: any) => handleChange(text, 'address')}
                        focusbackgroundColor={'coolGray.100'}
                        InputRightElementIcon="map-marker-outline"
                        passwordState={false}
                        setpasswordState={() => { }}
                        type={'text'}
                        keyboardType={'default'}
                        isDisabled={false}
                        maxLength={200}
                        InputRightElementFunction={selectLocation}
                      />
                    </FormControl>
                  )}
                  <Button
                    _text={styles.text}
                    size="lg"
                    mt="2"
                    colorScheme="tertiary"
                    onPress={BeforeStoreCode}>
                    Save
                  </Button>

                </VStack>
              </Box>
            </Center>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </>

  );
};

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'white',
  },

  avatar: {
    borderRadius: 225,
    height: 125,
    width: 125,
    marginTop: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'green',
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
  },
  dropdown: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
  },

  placeholderStyle: {
    fontSize: 16,
    color: 'gray',
    paddingLeft: 20,
  },
  selectedTextStyle: {
    fontSize: 18,
    paddingLeft: 20,
    color: 'black',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    width: '40%',
    backgroundColor: 'white'
  },
  itemTextStyle: {
    color: 'black'
  },
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
    flexDirection: 'row'
  },
  image: {
    width: 20,
    height: 25,
    resizeMode: 'contain',
    padding: 2.5,
    marginRight: 10
  },
  paraText1: {
    color: colorSecondary,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  marqueeView: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    borderColor: 'grey',
    borderRadius: 4
  },
  paraText: {
    width: Dimensions.get('window').width * 0.75,
    color: 'black',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
});
export default Profile;
function alert(error: any) {
  throw new Error('Function not implemented.');
}

