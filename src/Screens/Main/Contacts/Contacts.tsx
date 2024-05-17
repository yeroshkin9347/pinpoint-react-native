import {
  Box,
  Button,
  FormControl,
  Modal,
  NativeBaseProvider,
  Text,
  VStack,
  useToast
} from 'native-base';
import React, { useCallback, useEffect, useRef , useMemo} from 'react';
import { Dimensions, Platform, StyleSheet, View } from 'react-native';
import { openComposer } from 'react-native-email-link';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useState } from 'react';
import { Linking } from 'react-native';
import { textWithoutEncoding } from 'react-native-communications';
import Contacts from 'react-native-contacts';
import SendSMS, { AndroidSuccessTypes } from 'react-native-sms';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../../../Components/CustomInput';
import Loader from '../../../Components/Loader';
import constantMessages from '../../../Constants';
import { globalStyles } from '../../../Style/GlobalStyles/GlobalStyle';
import {
  setLoading,
  setLocationSave,
} from '../../../redux/reducers/authReducer';
import {
  ApiRequestAsync,
  ApiRequestWithParamAsync,
  ErrorToast,
  checkContactsPermission,
  getPlusCode,
  myApiKey,
  sortNamesAlphabetically
} from '../../../services/httpServices';
import SignOutModal from '../Settings/SignOutModal';
import PeopleContactList from './PeopleContactList';

const BATCH_SIZE = 20;
let startIndex = 0;

let contactDataObj : any = []
const ContactList = () => {
  const [searchText, setSearchText] = useState('');
  const [userContactsList, setContactsList] = useState<Array<any>>([]);
  const [condition, setcondition] = useState('');
  const [contextText, setContextText] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const {
    profile,
    isLoading,
    savedLocation,
    fromLocationSave,
    token,
    dailingCode,
    userContacts
  } = useSelector((state: any) => state.AuthReducer);
  let userContextState = useRef({ ...userContacts })
  const dispatch = useDispatch();
  const [isOpen, setOpen] = useState(false);

  const openShareModal = () => {
    setOpen(true);
  };
  const toast = useToast();
  const id = 'test-toast';

  const navigation: NavigationProp<ReactNavigation.RootParamList> =
    useNavigation();

  const filteredData = useMemo(()=>{
    try{
     if(!userContactsList.length) return []
     if(searchText !== ''){
       let updatedList = []
       if (Platform.OS === 'android') {
         updatedList = userContactsList.filter((contact: any) =>
         contact?.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
         contact?.number?.toLowerCase().includes(searchText.toLowerCase()),
       );
       } else {
         updatedList = userContactsList.filter(
          (contact: any) =>
            contact?.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
            contact?.number?.toLowerCase().includes(searchText.toLowerCase()),
        );
       }
       return updatedList
     }
     return userContactsList
    }catch (e){
     console.log(e)
    }
   },[userContactsList,searchText])


  const handleFetchContacts = useCallback(async () => {
    const granted: boolean = await checkContactsPermission();
    Contacts.checkPermission().then(res => {
      if (res === 'authorized') {
        dispatch(setLoading(true));
        Contacts.getAll()
          .then(data => {
            contactDataObj = data.map(item => {
              return {
                name:
                  Platform.OS === 'android'
                    ? item.displayName
                    : `${item.givenName} ${item.familyName}`,
                number:
                  item.phoneNumbers.length !== 0
                    ? item.phoneNumbers[0].number.replace(/[ \-]/g, '')
                    : '',
                profile: '',
                contact_email: item.emailAddresses.length !== 0
                ? item.emailAddresses[0].email
                : '',
                postalAddresses: item.postalAddresses
              };
            });
            getRegisteredUser(contactDataObj);
          })
          .catch(error => {
            console.log('Error occurred while accessing contacts:', error);
            dispatch(setLoading(false));
          });
      } else if (res === 'denied') {
         console.log('access denied')
      }
    });
  },[]);

  const getRegisteredUser = async (contactDataObj: any, done = false) => {
    try {
      let updatedContact = contactDataObj.filter((item: any) => item?.number);
      const ContactData = JSON.stringify(updatedContact);
      const request = {
        id: ContactData,
        country_code: dailingCode
      };
      await ApiRequestAsync(
        'POST',
        '/contact/registered-user',
        request,
        token,
        'application/json',
      )
        .then(response => {
          setContactsList(sortNamesAlphabetically(response.data.detail) as Array<any>);
          dispatch(setLoading(false));
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) {
      console.log(error);
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    if (userContacts.length === 0) {
      handleFetchContacts();
    } else {
      let completeRecord = Object.entries(userContextState.current).map(([key, value]) => ({ ...value as any, key }));
      let sortedContacts = sortNamesAlphabetically(completeRecord) as Array<any>;
      setContactsList(sortedContacts);
    }
    setcondition('15min');
  }, []);

  const shareMyPdfLink = (email: string) => {
    try {
      dispatch(setLocationSave(false));
      const message =
        `Hello\n\n` +
        `I am sharing my favorite list category of ${savedLocation.title} locations with you. Please click on the link below to download the list of favorite locations:\n\n` +
        `${savedLocation.pdfLink}\n\n` +
        `Or Please click on the link below to download the CSV File of favorite locations:\n\n` +
        `${savedLocation.csv_link}\n\n` +
        `You can also create your own favorites lists easily and quickly with the app – www.pinpointeye.com\n\n` +
        `It's free to use for 14 days!\n\n` +
        `Best Regards\n\n` +
        `${profile.full_name}`;
    
      const encodedMessage = encodeURIComponent(message);
      const url = `mailto:${email}?subject=Favorite Locations List&body=${encodedMessage}`;

      dispatch(setLoading(false));
      if (Platform.OS === 'android') {
        Linking.openURL(url).catch(error => {
          console.error('Failed to open email client:', error);
          dispatch(setLoading(false));
        });
      } else {
        openComposer({
          to: '',
          subject: 'Favorite Locations List',
          body: message,
        });
      }
    } catch (e) { }
  };

  const handleShareContact = async () => {
    let type = 0;

    if (condition === '8hour') {
      type = 2;
    } else if (condition === '1hour') {
      type = 1;
    }

    let bodyData = new FormData();
    bodyData.append('type', type);
    dispatch(setLoading(true));
    await ApiRequestWithParamAsync(
      'POST',
      '/contact/share-location',
      { contact: contextText, type },
      token,
      'application/json',
      bodyData,
    )
      .then(response => {
        setOpen(false);
        let errorMessage = response?.data?.message;
        if (!toast.isActive(id)) {
          ErrorToast({ toast, id, errorMessage });
        }  
        if (response.data.detail) {
          getRegisteredUser(contactDataObj, true);
        }
      })
      .catch(error => {
        setOpen(false);
        let { message } = JSON.parse(error['_response']);
        if (!toast.isActive(id)) {
          ErrorToast({ toast, id, errorMessage: message });
        }
        console.log(error);
        dispatch(setLoading(false));
      });
  };

  const handleInvite = useCallback(async(phoneNumber: string,email: string) =>{
    const isAndroid8 = Platform.OS === 'android' && Platform.Version === 26;

    dispatch(setLoading(true));

    if (fromLocationSave) {
      shareMyPdfLink(email);
    } else {
      const googleMapsLink = `https://www.google.com/maps/place/${profile.current_latitude},${profile.current_longitude}/@${profile.current_latitude}!!,${profile.current_longitude},17z`;
      const plusCode = await getPlusCode(profile.current_latitude, profile.current_longitude);
      let message =
        `Pinpointeye   www.pinpointeye.com\n\n` +
        `Here is My Home Location:\n` +
        `${profile.address}\n\n` +
        `${googleMapsLink}\n\n` +
        `Plus Code:\n` +
        `${plusCode}\n\n` +
        `To update a selected Contact with this location, copy this message to the clipboard and select Update Contact from the PPE menu\n\n` +
        `Get the benefits of a feature-rich & versatile Location & Sharing experience   www.pinpointeye.com Free to use for 14 days.`;

      if (isAndroid8) {
        message = message.replace(/&/g, '%26');
      }

      const url = `sms:${encodeURIComponent(
        phoneNumber,
      )}?body=${encodeURIComponent(message)}`;
      dispatch(setLoading(false));
      if (Platform.OS === 'android') {
        SendSMS.send(
          {
            body: message,
            recipients: [phoneNumber],
            successTypes: ['sent', 'queued'] as AndroidSuccessTypes[],
            allowAndroidSendWithoutReadPermission: true,
          },
          (completed, cancelled, error) => {
            console.log(
              'SMS Callback: completed: ' +
              completed +
              ' cancelled: ' +
              cancelled +
              'error: ' +
              error,
            );
          },
        );
      } else {
        textWithoutEncoding(phoneNumber, message);
      }
    }
  },[])



  const handleShare = (number: any) => {
    if (fromLocationSave) {
      return getLocationShare(number);
    }

    if (profile.is_location_alert == 1) {
      openShareModal();
      setContextText(number);
      return;
    }

    setOpenModal(true);
  };

  const getLocationShare = async (num: any) => {
    try {
      dispatch(setLoading(true));
      await ApiRequestWithParamAsync(
        'POST',
        '/location/share',
        { contact: num, category_id: savedLocation.categoryId },
        token,
      )
        .then(response => {

          dispatch(setLoading(false));
          if (response.data?.message !== undefined) {
            let errorMessage = response.data?.message;
            if (!toast.isActive(id)) {
              ErrorToast({ toast, id, errorMessage });
            }
            navigation.goBack();
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) {
      console.log(error);
      dispatch(setLoading(false));
    }
  };

  const handleContactButton = useCallback((contact: any) => {
    if (contact?.is_registered) {
      if (contact.is_location_shared == 2 || fromLocationSave) {
        handleShare(contact?.number)
      } else {
        handleStopSharing(
          contact.is_location_shared == 0
            ? 'Requested'
            : 'Stop Sharing',
          contact?.number,
        )
      }
    } else {
      handleInvite(contact?.number,contact?.contact_email)
    }
  },[])

  const handleButton = (condition: string) => {
    if (condition === '15min') {
      setcondition('15min');
    } else if (condition === '1hour') {
      setcondition('1hour');
    } else if (condition === '8hour') {
      setcondition('8hour');
    }
  };

  const handleStopSharing = async (text: any, number: any) => {
    try {
      if (text === 'Stop Sharing') {
        dispatch(setLoading(true));
        await ApiRequestWithParamAsync(
          'POST',
          '/contact/stop-share-location',
          { contact: number },
          token,
          'application/json',
          {},
        )
          .then(response => {

            dispatch(setLoading(false));
            if (response.data.detail) {
              getRegisteredUser(contactDataObj);
            }
          })
          .catch(error => {
            console.log(error);
            dispatch(setLoading(false));
          });
      }
    } catch (error) {
      console.log(error);
      dispatch(setLoading(false));
    }
  };

  const navigationSetting = () => {
    navigation.navigate('Settings' as never);
  };

  return (
    <NativeBaseProvider>
      {isLoading && <Loader isLoading={isLoading} />}

      <Box style={globalStyles.root} flex={0.4} p={4}>
        <Box mb={4}>
          <FormControl>
            <CustomInput
              variant="outline"
              fontSize="lg"
              placeholder="Search Contact"
              focusOutlineColor={'black'}
              focusbackgroundColor={'coolGray.100'}
              InputRightElementIcon=""
              InputLeftElementIcon=""
              passwordState={false}
              isDisabled={false}
              setpasswordState={() => { }}
              type={'text'}
              keyboardType={'default'}
              InputRightElementFunction={() => { }}
              value={searchText}
              onChangeText={(text: any) => setSearchText(text)}
              maxLength={100}
            />
          </FormControl>
        </Box>
        <VStack space={3} justifyContent="flex-start" alignItems="flex-start">
          <Text fontSize="sm" fontWeight="normal" color="grey" textAlign="left">
            Select contacts whom you want to share location
          </Text>
          <Box style={{ width: '100%', height: 615 }}>
            <PeopleContactList
              userContactsList={filteredData}
              handleUpdateContact={handleContactButton}
              fromLocationSave={fromLocationSave} />
          </Box>
        </VStack>
      </Box>

      <Modal isOpen={isOpen} onClose={() => setOpen(false)}>
        {isLoading && <Loader isLoading={isLoading} />}
        <View style={styles.modal}>
          <Text style={styles.text}>{constantMessages.shareLocation}</Text>
          <View style={styles.btnn}>
            <Button
              style={styles.btnn1}
              size="lg"
              mt="2"
              colorScheme={condition === '15min' ? 'tertiary' : 'muted'}
              onPress={() => handleButton('15min')}>
              <Text style={styles.txt1}>{constantMessages.min}</Text>
            </Button>
            <Button
              style={styles.btnn1}
              size="lg"
              mt="2"
              colorScheme={condition === '1hour' ? 'tertiary' : 'muted'}
              onPress={() => handleButton('1hour')}>
              <Text style={styles.txt1}>{constantMessages.hour}</Text>
            </Button>
            <Button
              style={styles.btnn1}
              size="lg"
              mt="2"
              colorScheme={condition === '8hour' ? 'tertiary' : 'muted'}
              onPress={() => handleButton('8hour')}>
              <Text style={styles.txt1}>{constantMessages.hours}</Text>
            </Button>
          </View>
          <Button
            style={styles.btn}
            size="lg"
            mt="2"
            colorScheme="tertiary"
            onPress={handleShareContact}>
            <Text style={styles.txt2}>{constantMessages.DONE}</Text>
          </Button>
        </View>
      </Modal>

      {openModal && (
        <SignOutModal
          handleClickYes={navigationSetting}
          message={constantMessages.isLocationtxt}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      )}
    </NativeBaseProvider>
  );
};
export default ContactList;

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#e8ffee',
    borderRadius: 12,
    padding: 20,
  },
  text: {
    padding: 10,
    fontSize: 18,
    color: '#00996b',
  },

  btn: {
    width: Dimensions.get('window').width * 0.85,
    height: Dimensions.get('window').height * 0.06,
    marginTop: 10,
  },
  btnn: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnn1: {
    width: Dimensions.get('window').width * 0.26,
    height: Dimensions.get('window').height * 0.06,
    borderRadius: 8,
  },
  txt1: {
    fontSize: 20,
    color: 'white',
  },
  txt2: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  inviteText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    // color: 'green',
  },
  RequestStyle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    // color: 'red',
  },
});
