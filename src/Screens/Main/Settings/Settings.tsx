import { StyleSheet, View, Linking, Image,Share } from 'react-native';
import React, { useEffect, useState } from 'react';
import {
  Box,
  FlatList,
  Heading,
  Avatar,
  HStack,
  VStack,
  Text,
  Spacer,
  Center,
  NativeBaseProvider,
  Switch,
  Pressable,
  Modal,
  Button,
  useToast,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { notInitialized } from 'react-redux/es/utils/useSyncExternalStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setPlanListId, setUserGuide, setrerenderApp, updateProfile, userToken } from '../../../redux/reducers/authReducer';
import SignOutModal from './SignOutModal';
import { ApiRequestAsync, ErrorToast, getPlusCode } from '../../../services/httpServices';
import { Dimensions } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import axios from 'axios';

const Settings = () => {
  const { token, profile } = useSelector((state: any) => state.AuthReducer)
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [openModal, setOpenModal] = useState(false);
  const [isLocation, setIsLocation] = useState<boolean>(false)
  const [isAlert, setIsAlert] = useState<boolean>(false)
  const [isNotify, setIsNotify] = useState<boolean>(false)
  const toast = useToast();
  const id = "test-toast";


  const handleShareLocation = async() => {
    try {
      const googleMapsLink = `https://www.google.com/maps/place/${profile.current_latitude},${profile.current_longitude}/@${profile.current_latitude},${profile.current_longitude}z`;

      const response = await axios.get(
        `https://tinyurl.com/api-create.php?url=${googleMapsLink}/`
      );
      const shortURL = response.data;
     
      let plusCode = await getPlusCode(profile.current_latitude,profile.current_longitude)
      const message = `Pinpointeye � www.pinpointeye.com\n\n`
        + `Here is My Home Location:\n\n`
        + `${profile.address}\n\n`
        + `Google Map URL\n`
        + `${shortURL}\n\n`
        + `Plus Code:\n`
        + `${plusCode}\n\n`
        + `To update a selected Contact with this location, copy this message to the clipboard and select Update Contact from the PPE menu.\n\n`
        + `Get the benefits of a feature-rich & versatile Location & Sharing experience � www.pinpointeye.com Free to use for 14 days.`;

      // const url = `sms:${''}?body=${encodeURIComponent(message)}`;
      await Share.share({
        message: message,
      });

    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (checked: boolean, name: string) => {
    if (name === 'Location Sharing') {
      setIsLocation(!isLocation)
      alertLocationApi();
    }
    else if (name === 'Emergency Alerts') {
      setIsAlert(!isAlert);
      alertEmergencyApi();
    }
    else if (name === 'Notifications') {
      setIsNotify(!isNotify)
      notificationApi();
    }
  };

  const alertLocationApi = async () => {
    try {
      dispatch(setLoading(true));
      await ApiRequestAsync('GET', '/user/get-location-alert', {}, token)
        .then(response => {
          dispatch(setLoading(false));
        
          if (response.data.is_location === 1) {
            if (!toast.isActive(id)) {
              toast.show({
                id,
                duration: 2500,
                render: () => {
                  return <Box
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
                    Location sharing enabled
                  </Box>;
                }
              })
            }
            dispatch(updateProfile({["is_location_alert"]: 1 }));
          } else {
            if (!toast.isActive(id)) {
              toast.show({
                id,
                duration: 2500,
                render: () => {
                  return <Box
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
                    Location sharing disabled
                  </Box>;
                }
              })
            }
            dispatch(updateProfile({["is_location_alert"]: 0 }));
          }
        })
        .catch(error => {
          dispatch(setLoading(false));
          console.log(error)
        })
    } catch (error) {
      dispatch(setLoading(false));
      console.log(error);
    }
  }
  const alertEmergencyApi = async () => {
    try {
      dispatch(setLoading(true));
      await ApiRequestAsync('GET', '/user/get-alert', {}, token)
        .then(response => {
          dispatch(setLoading(false));
   
          if (response.data.is_alert === 1) {
            if (!toast.isActive(id)) {
              toast.show({
                id,
                duration: 2500,
                render: () => {
                  return <Box
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
                    Emergency alert enabled
                  </Box>;
                }
              })
            }
          } else {
            if (!toast.isActive(id)) {
              toast.show({
                id,
                duration: 2500,
                render: () => {
                  return <Box
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
                    Emergency alert disabled
                  </Box>;
                }
              })
            }
          }
        })
        .catch(error => {
          dispatch(setLoading(false));
          console.log(error)
        })
    } catch (error) {
      dispatch(setLoading(false));
      console.log(error);
    }
  }
  const notificationApi = async () => {
    try {
      dispatch(setLoading(true));
      await ApiRequestAsync('GET', '/user/is-notified', {}, token)
        .then(response => {
          dispatch(setLoading(false));
        
          if (response.data.is_notification === 1) {
            if (!toast.isActive(id)) {
              toast.show({
                id,
                duration: 2500,
                render: () => {
                  return <Box
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
                    Notification enabled
                  </Box>;
                }
              })
            }
          } else {
            if (!toast.isActive(id)) {
              toast.show({
                id,
                duration: 2500,
                render: () => {
                  return <Box
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
                    Notification disabled
                  </Box>;
                }
              })
            }
          }
        })
        .catch(error => {
          dispatch(setLoading(false));
          console.log(error)
        })
    } catch (error) {
      dispatch(setLoading(false));
      console.log(error);
    }
  }
  useEffect(() => {
    if (profile.is_location_alert === 1) {
      setIsLocation(true);
    } else {
      setIsLocation(false);
    }
    if (profile.is_emergency_alert === 1) {
      setIsAlert(true);
    } else {
      setIsAlert(false);
    }
    if (profile.is_notification === 1) {
      setIsNotify(true);
    } else {
      setIsNotify(false);
    }


  }, [])

  const openSavedCards = () => {
    dispatch(setPlanListId(0));
    navigation.navigate('Card Details' as never)
  }

  const handleSignout = () => {
    setOpenModal(true)
  }

  const handleUpdateContact = async() => {
   try{
    // navigation.navigate('UpdateContacts' as never)
    const copiedText = await Clipboard.getString();
    if(copiedText && copiedText.includes('Update Contact from the PPE menu')) {
      navigation.navigate('UpdateContacts' as never)
    }else{
      if (!toast.isActive(id)) {
        ErrorToast({toast, id, errorMessage: "PPE message format is not correct!! \nPlease Copy Correct Message and try again!"});
      }
    }

   }catch (e){
    
   }
  }

  const data = [
    {
      items: 'Edit Profile',
      InputRightElement: (
        <Icon name="chevron-right" size={28} style={{ paddingHorizontal: -10 }} />
      ),
      onPress: () => navigation.navigate('MainProfileSetup' as never)
    },
    {
      items: 'Saved Places & New Location',
      InputRightElement: (
        <Icon name="chevron-right" size={28} style={{ paddingHorizontal: -10 }} />
      ),
      onPress: () => navigation.navigate('Saved Places & New Locations' as never)
    },
    {
      items: 'Emergency Contacts',
      InputRightElement: (
        <Icon name="chevron-right" size={28} style={{ paddingHorizontal: -10 }} />
      ),
      onPress: () => navigation.navigate('Emergency Contacts' as never)
    },
    {
      items: 'Send Your Home Location As A Message',
      InputRightElement: (
        <Icon name="chevron-right" size={28} style={{ paddingHorizontal: -10 }} />
      ),
      onPress: handleShareLocation
    },
    {
      items: 'Update Contacts',
      InputRightElement: (
        <Icon name="chevron-right" size={28} style={{ paddingHorizontal: -10 }} />
      ),
      onPress: handleUpdateContact
    },
    {
      items: 'Subscriptions',
      InputRightElement: (
        <Icon name="chevron-right" size={28} style={{ paddingHorizontal: -10 }} />
      ),
      onPress: () => navigation.navigate('SubscriptionSettings' as never)
    },
    {
      items: 'Saved Cards',
      InputRightElement: (
        <Icon name="chevron-right" size={28} style={{ paddingHorizontal: -10 }} />
      ),
      onPress: () => openSavedCards()
    },
    {
      items: 'User Guide',
      InputRightElement: (
        <Icon name="chevron-right" size={28} style={{ paddingHorizontal: -10 }} />
      ),
      onPress: () => navigation.navigate('User Guide' as never)
    },
    {
      items: 'Location Sharing',
      InputRightElement: (undefined),
    },
    {
      items: 'Emergency Alerts',
      InputRightElement: (undefined),
    },
    {
      items: 'Notifications',
      InputRightElement: (undefined),
    },
    {
      items:
        <Text
          style={{ fontSize: 17, color: '#2F965F', fontWeight: 'bold' }}
        >
          Sign Out
        </Text>,
      InputRightElement: (null),
      onPress: () => handleSignout()
    }
  ];

  return (
    <>
      <View style={styles.container}>
        <Box style={{ backgroundColor: 'white' }}>
          <FlatList
            data={data}
            renderItem={({ item, index }) => (
              <Pressable onPress={item.onPress} >
                <Box
                  borderBottomWidth="1"
                  borderTopWidth={index == 0 ? "1" : "0"}
                  _dark={{
                    borderColor: 'grey',
                  }}
                  borderColor="grey"
                  pl={['3', '1']}
                  pr={['0', '5']}
                  py="4">
                  <HStack space={[0, 0]}>
                    <VStack>
                      <Text style={styles.text1}>{item.items}</Text>
                    </VStack>
                    <Spacer />
                    <Text style={styles.text2}>{item.InputRightElement === undefined ? (
                      <Switch
                        isChecked={
                          item.items === 'Location Sharing' ? isLocation :
                            item.items === 'Emergency Alerts' ? isAlert :
                              item.items === 'Notifications' ? isNotify : undefined
                        }
                        onToggle={(toggle) => handleChange(toggle, item.items)}
                        trackColor={{ false: '#767577', true: 'green' }}
                        ios_backgroundColor="green"
                      />) : item.InputRightElement}</Text>
                  </HStack>
                </Box>
              </Pressable>
            )}
          />
        </Box>
        {openModal && <SignOutModal openModal={openModal} setOpenModal={setOpenModal} />}
      </View>
    </>
  );
};

export default Settings;

const styles = StyleSheet.create({

  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  buttonBox: {
    width: '20%',
    flexDirection: 'row',
    marginLeft: 200,
  },
  button1: {
    backgroundColor: "#fff",
    color: "green.100",
    justifyContent: 'flex-end'
  },
  text: {
    color: "green",
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold'
  },
  text1: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
  },
  text2: {
    fontSize: 16,
    marginRight: 10,
  },
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
})
