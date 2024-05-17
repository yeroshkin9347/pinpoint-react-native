import Clipboard from '@react-native-community/clipboard';
import axios from 'axios';
import {
  Avatar,
  Box,
  Button,
  FlatList,
  FormControl,
  HStack,
  Modal,
  NativeBaseProvider,
  Text,
  VStack,
  useToast,
} from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import Contacts from 'react-native-contacts';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../../../Components/CustomInput';
import Loader from '../../../Components/Loader';
import { globalStyles } from '../../../Style/GlobalStyles/GlobalStyle';
import {
  setLoading,
} from '../../../redux/reducers/authReducer';
import {
  ErrorToast,
  checkContactsPermission,
  myApiKey,
  requestWriteContactsPermission,
  sortNamesAlphabetically,
  truncateString
} from '../../../services/httpServices';
import constantMessages from '../../../Constants';
import SignOutModal from '../Settings/SignOutModal';
import IstockPhoto from '../../../Assets/images/IstockPhoto.jpg';
import ContactList from '../savedPlaces/ContactList';

const UpdateContacts = () => {
  const [existingModal, setExistingModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [userContactsList, setContactsList] = useState<Array<any>>([]);
  const [userContactsListClone, setContactsListClone] = useState<Array<any>>([]);
  const { isLoading, phoneContacts } = useSelector((state: any) => state.AuthReducer,);
  const [contactDetail, setContactDetail] = useState<any>()
  const [copiedMessage, setCopiedMessage] = useState<any>({
    googleUrl: "",
    savedPlace: "",
    plusCode: ""
  })

  const dispatch = useDispatch();
  const toast = useToast();
  const id = 'test-toast';
  let userContextState = useRef({ ...phoneContacts })

  const [showModal, setShowModal] = useState(false);

  const FetchMessage = async () => {
    const copiedText = await Clipboard.getString();
    const googleMapUrlIndex = copiedText.indexOf('Google Map URL');
    const plusCodeIndex = copiedText.indexOf('Plus Code');
    let savedPlace: any = ""
    if (copiedText.includes('Home Location')) {
      const savedPlaceIndex = copiedText.indexOf('Home Location');
      savedPlace = copiedText.substring(savedPlaceIndex + 13, googleMapUrlIndex).trim().replace(/[\n\r:]/g, '');
    } else {
      const savedPlaceIndex = copiedText.indexOf('Saved Place');
      savedPlace = copiedText.substring(savedPlaceIndex + 11, googleMapUrlIndex).trim().replace(/[\n\r:]/g, '');
    }
    const googleUrl = copiedText.substring(googleMapUrlIndex + 14, plusCodeIndex).trim();
    const updateIndex = copiedText.indexOf('To update');
    const plusCode = copiedText.substring(plusCodeIndex + 10, updateIndex).trim();
    setCopiedMessage((pre: any) => ({ ...pre, googleUrl, savedPlace, plusCode }));
  }

  useEffect(() => {
    FetchMessage()
  }, [])

  const handleFetchContacts = async () => {
    const granted: boolean = await checkContactsPermission();
    Contacts.checkPermission().then(res => {
      if (res === 'authorized') {
        dispatch(setLoading(true));
        Contacts.getAll()
          .then(data => {
            setContactsList(sortNamesAlphabetically(data, 'updateContact') as Array<any>);
            setContactsListClone(data as Array<any>);
            dispatch(setLoading(false));
          })
          .catch(error => {
            console.log('Error occurred while accessing contacts:', error);
            dispatch(setLoading(false));
          });
      } else if (res === 'denied') {


      }
    });
  };

  useEffect(() => {
    if (phoneContacts.length === 0) {
      handleFetchContacts();
    } else {
      let completeRecord = Object.entries(userContextState.current).map(([key, value]) => ({ ...value as any, key }));
      let sortedContacts = sortNamesAlphabetically(completeRecord) as Array<any>;
      setContactsList(sortedContacts);
      setContactsListClone(sortedContacts);
    }
  }, []);

  const handleSearch = (text: any) => {
    setSearchText(text);
    try {
      if (text && text !== "") {
        let user_Contacts;
        const lowerText = text.toLowerCase();
        // setTimeout(() => {
        if (Platform.OS === 'android') {
          user_Contacts = userContactsListClone.filter((contact: any) =>
            contact?.displayName?.toLowerCase().includes(lowerText) ||
            contact?.phoneNumbers[0]?.number.toLowerCase().includes(lowerText),
          );
        } else {
          user_Contacts = userContactsListClone.filter(
            (contact: any) =>
              contact?.givenName?.toLowerCase().includes(lowerText) ||
              contact?.familyName?.toLowerCase().includes(lowerText) ||
              contact?.phoneNumbers[0]?.number.toLowerCase().includes(lowerText),
          );
        }

        setContactsList(user_Contacts);
        // }, 300)

      } else {
        setContactsList(userContactsListClone);
      }
    } catch (err: any) {
      // setErrorText(err);
    }

    // Perform search logic here
  };

  // async function handleInvite(contact: any): Promise<void> {
  //   setShowModal(true)
  //   setContactDetail(contact)
  // }

  // const handleInvite = (contact: any) => {
  //   setShowModal(true)
  //   setContactDetail(contact)
  // }

  const handleUpdateContact = useCallback((contact: any) => {
    setShowModal(true)
    setContactDetail(contact)
  },[])

  const HandleYesPlease = async () => {
    dispatch(setLoading(true));
    let existingContactforPhone: any = await Contacts.getContactById(
      contactDetail.recordID,
    );

    if (
      existingContactforPhone &&
      existingContactforPhone?.postalAddresses &&
      existingContactforPhone?.postalAddresses?.length > 0
    ) {
      setExistingModal(true);
      dispatch(setLoading(false));
    } else {
      updateContact(true);
    }

  }

  const updateContact = async (ifYes = false): Promise<void> => {
    try {
      dispatch(setLoading(true));
      const granted = await requestWriteContactsPermission();
      if (granted) {
        const response = await axios.get(
          'https://maps.googleapis.com/maps/api/geocode/json',
          {
            params: {
              address: copiedMessage.savedPlace,
              key: myApiKey, // Replace with your own API key
            },
          },
        );

        const address = response.data.results[0].formatted_address;
        const addressComponents = address.split(', ');
        const addressCityState = addressComponents[2].split(' ');
        let street = addressComponents[0];
        let city = addressComponents[1];
        let state = addressCityState[0];
        let postalCode = addressCityState[1];
        let country = addressComponents[3];
        let isoCountryCode = addressComponents[3];
        let formattedAddress = address;

        let existingContact: any = await Contacts.getContactById(
          contactDetail.recordID,
        );

        if (
          existingContact &&
          existingContact?.postalAddresses &&
          existingContact?.postalAddresses?.length > 0 &&
          !ifYes
        ) {
          // setExistingModal(true);
          // dispatch(setLoading(false));
        } else {
          // Update the desired properties of the existing contact
          // existingContact.note = copiedMessage.plusCode;

          let googleAddressurl = {
            label: 'home',
            url: copiedMessage?.googleUrl,
          };
          if (Platform.OS === 'android' && existingContact.urlAddresses.length) {
            let tinyURLlength = existingContact.urlAddresses?.filter((x: { url: any; }) => x.url === copiedMessage?.googleUrl)
            if (tinyURLlength.length === 0) {
              existingContact.urlAddresses = [
                {
                  id: existingContact.urlAddresses[0].id,
                  label: 'home',
                  url: copiedMessage?.googleUrl,
                }
              ]
            }
          } else {
            existingContact.urlAddresses = [googleAddressurl]
          }
            existingContact.postalAddresses = [
              {
                label: 'home',
                street: street,
                city: city,
                region: '',
                country: country,
                formattedAddress: formattedAddress,
                pobox: '',
                neighborhood: '',
                state: state,
                postCode: postalCode,
              },
            ];
          setShowModal(false);
          Contacts.updateContact(existingContact)
            .then(async (data: any) => {
              let updatedData = { ...data };
              dispatch(setLoading(false));

              setTimeout(async () => {
                await Contacts.viewExistingContact(updatedData);
                if (!toast.isActive(id)) {
                  setShowModal(false);
                  ErrorToast({
                    toast,
                    id,
                    errorMessage: `${contactDetail?.displayName ?? ''
                      } Updated Successfully`,
                  });
                }
              }, 300);
            })
            .catch(error => {
              console.log('Failed to update contact:', error);
              dispatch(setLoading(false));
            });
        }

      } else {
        // Permission denied
        console.log('Contact permission denied');
      }
    } catch (error) {
      console.log('Error requesting contact permission:', error);
    }
  };

  const handleYes = () => {
    setExistingModal(false);
    updateContact(true);
  };

  const handleNo = () => {
    setExistingModal(false);
  };

  return (
    <View style={styles.container}>
      <NativeBaseProvider>
        {isLoading && <Loader isLoading={isLoading} />}
        {/* <Text>{copiedMessage}</Text> */}
        <Box style={globalStyles.root} flex={0.4} p={4}>
          <Box mb={4}>
            <FormControl>
              <CustomInput
                variant="outline"
                fontSize="lg"
                placeholder="Search Contact"
                InputLeftElementIcon="account-outline"
                focusOutlineColor={'black'}
                focusbackgroundColor={'coolGray.100'}
                InputRightElementIcon=""
                passwordState={false}
                isDisabled={false}
                setpasswordState={() => { }}
                type={'text'}
                keyboardType={'default'}
                InputRightElementFunction={() => { }}
                value={searchText}
                onChangeText={(text: any) => handleSearch(text)}
                maxLength={100}
              />
            </FormControl>
          </Box>
          <VStack space={3} justifyContent="flex-start" alignItems="flex-start">
            <Text
              fontSize="sm"
              fontWeight="normal"
              color="grey"
              textAlign="left">
              Select contacts whom you want to share location
            </Text>
            <Box style={{ width: '100%', height: 615 }}>
              <ContactList userContactsList={userContactsList} handleUpdateContact={handleUpdateContact}  />
            </Box>
          </VStack>
        </Box>

        <Modal
          style={{ width: '120%', marginLeft: -40 }}
          isOpen={showModal}
          onClose={() => setShowModal(false)}>
          <Modal.Content>
            <View style={styles.Header}>
              <Text style={styles.Header1}>Update Contact</Text>
            </View>
            <Modal.Body>
              <VStack space={1}>
                <HStack alignItems="center" justifyContent="space-between">
                  <Text style={styles.txt}>
                    Do You really want to Update Following information for your
                    selected contacts?
                  </Text>
                </HStack>
                <HStack alignItems="center">
                  <Text fontWeight="medium">1.Name</Text>
                </HStack>
                <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="medium">
                  {Platform.OS === 'android' ? contactDetail?.displayName : contactDetail?.givenName + contactDetail?.familyName}
                  </Text>
                </HStack>
                <HStack alignItems="center">
                  <Text fontWeight="medium">2.Contact</Text>
                </HStack>
                <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="medium">
                    {contactDetail?.phoneNumbers[0].number}
                  </Text>
                </HStack>
                <HStack alignItems="center">
                  <Text fontWeight="medium">3.Address</Text>
                </HStack>
                {/* <Text fontWeight="medium">
                  Pint Point Eye -www.PinPointEye.com Here is my
                </Text> */}
                {/* <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="medium">Saved Places :</Text>
                </HStack> */}
                <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="medium">
                    {copiedMessage?.savedPlace}
                  </Text>
                </HStack>
                <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="medium">4. Google Map Link :</Text>
                </HStack>
                <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="medium">{copiedMessage?.googleUrl}</Text>
                </HStack>
                {/* <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="medium">5. Plus Code :</Text>
                </HStack>
                <HStack alignItems="center" justifyContent="space-between">
                  <Text fontWeight="medium">{copiedMessage?.plusCode}</Text>
                </HStack> */}
              </VStack>
            </Modal.Body>
            <View style={styles.button}>
              <Button
                style={styles.button1}
                onPress={() => {
                  setShowModal(false);
                }}>
                <Text style={styles.buttonTxt}>No,Thank You</Text>
              </Button>
              <Button
                colorScheme="tertiary"
                style={styles.button2}
                onPress={() => HandleYesPlease()}>
                <Text style={styles.buttonTxt}> Yes,Please</Text>

              </Button>
            </View>
          </Modal.Content>
        </Modal>
      </NativeBaseProvider>
      {existingModal && (
        <SignOutModal
          handleClickYes={handleYes}
          handleClickNo={handleNo}
          message={constantMessages.isExistingtxt}
          openModal={existingModal}
          setOpenModal={setExistingModal}
        />
      )}
    </View>
  );
};

export default UpdateContacts;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  Header: {
    width: '100%',
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#009e69',
  },
  Header1: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  button1: {
    width: "47%",
    backgroundColor: 'red',
    borderRadius: 8,
    fontSize: 18,
  },
  button2: {
    width: "47%",
    borderRadius: 8,
    fontSize: 18,
  },
  buttonTxt: {
    color: 'white',
    fontSize: 16,
  },
  txt: {
    color: '#009e69',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
