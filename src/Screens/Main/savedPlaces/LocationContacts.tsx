import {
  Box,
  Button,
  FormControl,
  HStack,
  Modal,
  NativeBaseProvider,
  Text,
  VStack,
  useToast
} from 'native-base';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  View
} from 'react-native';
import Contacts from 'react-native-contacts';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../../../Components/CustomInput';
import Loader from '../../../Components/Loader';
import constantMessages from '../../../Constants';
import { globalStyles } from '../../../Style/GlobalStyles/GlobalStyle';
import { setLoading } from '../../../redux/reducers/authReducer';
import {
  ErrorToast,
  checkContactsPermission,
  // getPlusCode,
  myApiKey,
  requestWriteContactsPermission,
  sortNamesAlphabetically
} from '../../../services/httpServices';
import SignOutModal from '../Settings/SignOutModal';
import ContactList from './ContactList';

const BATCH_SIZE = 20;
let startIndex = 0;

const LocationContacts = () => {

  const [searchText, setSearchText] = useState('');
  const [userContactsList, setContactsList] = useState<Array<any>>([]);
  const [copiedMessage, setCopiedMessage] = useState<any>({
    googleUrl: "",
    savedPlace: "",
    plusCode: "",
    address : ''
  })
  const {  isLoading, savedLocation,  phoneContacts } = useSelector(
    (state: any) => state.AuthReducer,
  );
  const dispatch = useDispatch();
  const toast = useToast();
  const id = 'test-toast';
  let userContextState = useRef({ ...phoneContacts })
  const [contactDetail, setContactDetail] = useState<any>();
  const [showModal, setShowModal] = useState({existingModal : false , isDetail : false});

  const filteredData = useMemo(()=>{
   try{
    if(!userContactsList.length) return []
    if(searchText !== ''){
      let updatedList = []
      if (Platform.OS === 'android') {
        updatedList = userContactsList.filter((contact: any) =>
          contact?.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
          contact?.phoneNumbers[0]?.number.toLowerCase().includes(searchText.toLowerCase())
        );
      } else {
        updatedList = userContactsList.filter(
          (contact: any) =>
            contact?.givenName?.toLowerCase().includes(searchText.toLowerCase()) ||
            contact?.familyName?.toLowerCase().includes(searchText.toLowerCase()) ||
            contact?.phoneNumbers[0]?.number.toLowerCase().includes(searchText.toLowerCase())
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
    if (granted) {
      dispatch(setLoading(true));
      Contacts.getAll()
        .then(data => {
          setContactsList(sortNamesAlphabetically(data, 'updateContact') as Array<any>);
          dispatch(setLoading(false));
        })
        .catch(error => {
          console.log('Error occurred while accessing contacts:', error);
          dispatch(setLoading(false));
        });
    } else {
      console.log('Contacts permission denied.');
    }
  },[]);

  const handleShareLocation = useCallback(async () => {
    try {
      const googleMapsLink = `https://www.google.com/maps/place/${savedLocation.latitude},${savedLocation.longitude}/@${savedLocation.latitude},${savedLocation.longitude}z`;
      const response = await axios.get(
        `https://tinyurl.com/api-create.php?url=${googleMapsLink}/`
      );
      const shortURL = response.data;
        
      // let plusCode = await getPlusCode(savedLocation.latitude, savedLocation.longitude)

      const responseAddress = await axios.get(
        'https://maps.googleapis.com/maps/api/geocode/json',
        {
          params: {
            address: savedLocation.address,
            key: myApiKey, // Replace with your own API key
          },
        },
      );
     
      setCopiedMessage({
        googleUrl: shortURL,
        savedPlace: savedLocation.address,
        // plusCode: plusCode,
        address : responseAddress.data.results[0].formatted_address
      })
    } catch (error) {
      console.log(error);
    }
  },[]);



  useEffect(() => {
    if (savedLocation.latitude) {
      handleShareLocation()
    }
  }, [savedLocation.latitude])


  useEffect(() => {
    if (phoneContacts.length === 0) {
      handleFetchContacts();
    } else {
      let completeRecord = Object.entries(userContextState.current).map(([key, value]) => ({ ...value as any, key }));
      setContactsList(sortNamesAlphabetically(completeRecord, 'updateContact') as Array<any>);
    }
  }, []);

  const updateContact = async (ifYes = false): Promise<void> => {
    try {
      dispatch(setLoading(true));
      const granted = await requestWriteContactsPermission();
      if (granted) {
        const addressComponents = copiedMessage.address.split(', ');
        const addressCityState = addressComponents[2].split(' ');
        let street = addressComponents[0];
        let city = addressComponents[1];
        let state = addressCityState[0];
        let postalCode = addressCityState[1];
        let country = addressComponents[3];
        let formattedAddress = copiedMessage.address;

        let existingContact: any = await Contacts.getContactById(
          contactDetail.recordID,
        );
        
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
          setShowModal({existingModal : false , isDetail : false});
          Contacts.updateContact(existingContact)
            .then(async (data: any) => {
              let updatedData = { ...data };
              dispatch(setLoading(false));
              if (!toast.isActive(id)) {
                ErrorToast({
                  toast,
                  id,
                  errorMessage: `${contactDetail?.displayName ?? ''
                    } Updated Successfully`,
                });
                setTimeout(async () => {
                  await Contacts.viewExistingContact(updatedData);
                  setShowModal({existingModal : false , isDetail : false});
                }, 300);
              }
            })
            .catch(error => {
              console.log('Failed to update contact:', error);
              dispatch(setLoading(false));
            });
    

      } else {
        console.log('Contact permission denied');
      }
    } catch (error) {
      console.log('Error requesting contact permission:', error);
    }
  };

  const handleYes = () => {
    setShowModal({existingModal : false , isDetail : false});
    updateContact(true);
  }

  const handleNo = () => {
    setShowModal({existingModal : false , isDetail : false});
  }

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
      setShowModal({existingModal : true , isDetail : true});
      dispatch(setLoading(false));
    } else {
      updateContact(true);
    }
  }

  const handleUpdateContact = useCallback((contact: any) => {
    setShowModal({existingModal : false , isDetail : true})
    setContactDetail(contact)
  },[])

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
            <ContactList userContactsList={filteredData} handleUpdateContact={handleUpdateContact}/>
          </Box>
        </VStack>
      </Box>

      <Modal
        style={{ width: '120%', marginLeft: -40 }}
        isOpen={showModal.isDetail}
        onClose={() => setShowModal({existingModal : false , isDetail : false})}>
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
                <Text fontWeight="medium" color= 'black' >
                  {Platform.OS === 'android' ? contactDetail?.displayName : contactDetail?.givenName + contactDetail?.familyName}
                </Text>
              </HStack>
              <HStack alignItems="center">
                <Text fontWeight="medium">2.Contact</Text>
              </HStack>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="medium" color= 'black' >
                  {contactDetail?.phoneNumbers[0].number}
                </Text>
              </HStack>
              <HStack alignItems="center">
                <Text fontWeight="medium">3.Address</Text>
              </HStack>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="medium" color= 'black' >
                  {copiedMessage?.savedPlace}
                </Text>
              </HStack>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="medium">4. Google Map Link :</Text>
              </HStack>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="medium" color= 'black' >{copiedMessage?.googleUrl}</Text>
              </HStack>
              {/* <HStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="medium">5. Plus Code :</Text>
              </HStack>
              <HStack alignItems="center" justifyContent="space-between">
                <Text fontWeight="medium" color= 'black' >{copiedMessage?.plusCode}</Text>
              </HStack> */}
            </VStack>
          </Modal.Body>
          <View style={styles.button}>
            <Button
              style={styles.button1}
              onPress={() => {
                setShowModal({existingModal : false , isDetail : false});
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

      {showModal.existingModal &&
        <SignOutModal
          handleClickYes={handleYes}
          handleClickNo={handleNo}
          message={constantMessages.isExistingtxt}
          openModal={showModal.existingModal}
          setOpenModal={setShowModal}
          fromLocationContacts={true}

        />}
    </NativeBaseProvider>
  );
};
export default LocationContacts;

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
