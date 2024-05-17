import React, {useCallback, useEffect} from 'react';
import {
  NativeBaseProvider,
  Box,
  FlatList,
  HStack,
  Text,
  VStack,
  Avatar,
  Spacer,
  FormControl,
  useToast,
  View,
} from 'native-base';
//import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useState} from 'react';
import CustomInput from '../../../Components/CustomInput';
import Contacts from 'react-native-contacts';
import {
  ApiRequestAsync,
  ErrorToast,
  checkContactsPermission,
  sortNamesAlphabetically,
} from '../../../services/httpServices';
import {Platform, StyleSheet, TouchableOpacity} from 'react-native';
import {globalStyles} from '../../../Style/GlobalStyles/GlobalStyle';
import {useDispatch, useSelector} from 'react-redux';
import {
  setEmergencyUserContact,
  setLoading,
} from '../../../redux/reducers/authReducer';
import Loader from '../../../Components/Loader';
import SignOutModal from '../Settings/SignOutModal';
import constantMessages from '../../../Constants';

const BATCH_SIZE = 20;
let startIndex = 0;

const LocationRequest = () => {
  const [searchText, setSearchText] = useState('');
  const [userContactsList, setContactsList] = useState<Array<any>>([]);
  const [userContactsListClone, setContactsListClone] = useState<Array<any>>(
    [],
  );
  const {profile, isLoading,  token , dailingCode} = useSelector(
    (state: any) => state.AuthReducer,
  );
  const [errorText, setErrorText] = useState<any>(null);
  const dispatch = useDispatch();
  const toast = useToast();
  const id = 'test-toast';
  const [openModal, setOpenModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const [userContacts, setUserContacts] = useState<Array<any>>([]);

  const handleSearch = (text: any) => {
    setSearchText(text);
    try {
      if (text && text !== '') {
        let user_Contacts;
        const lowerText = text.toLowerCase();
        // setTimeout(() => {
        if (Platform.OS === 'android') {
      
          user_Contacts = userContactsListClone.filter(
            (contact: any) =>
              contact?.full_name?.toLowerCase().includes(lowerText) ||
              contact?.number?.toLowerCase().includes(lowerText),
          );
        } else {
          user_Contacts = userContactsListClone.filter(
            (contact: any) =>
              contact?.full_name?.toLowerCase().includes(lowerText) ||
              contact?.number?.toLowerCase().includes(lowerText),
          );
        }
        setContactsList(user_Contacts);
        // },300)
      } else {
        setContactsList(userContactsListClone);
      }
    } catch (err: any) {
      setErrorText(err);
    }
  };
  // Dummy contact list data

  // const handleFetchContacts = async () => {
  //   const granted: boolean = await checkContactsPermission();
  //   if (granted) {
  //       dispatch(setLoading(true));
  //       Contacts.getAll()
  //         .then(data => {
  //           let updatedContact = data.map(
  //             (contact: {phoneNumbers: {number: string}[]}) => ({
  //               ...contact,
  //               isEmergencyContact:
  //                 contact.phoneNumbers !== undefined &&
  //                 contact.phoneNumbers.length > 0 &&
  //                 contact.phoneNumbers[0].number !== undefined &&
  //                 emergencyUserContacts.length > 0
  //                   ? emergencyUserContacts.some(
  //                       (emergencyContact: {contact_no: string}) =>
  //                         contact.phoneNumbers[0].number.includes(
  //                           emergencyContact.contact_no,
  //                         ),
  //                       // emergencyContact.contact_no.includes(contact.phoneNumbers[0].number)
  //                       // contact.phoneNumbers[0].number,
  //                     )
  //                   : false,
  //             }),
  //           );
  //           setContactsListClone(updatedContact)
  //           setContactsList(updatedContact);
  //           dispatch(setLoading(false));
  //         })
  //         .catch(error => {
  //           console.log('Error occurred while accessing contacts:', error);
  //           dispatch(setLoading(false));
  //         });
  //   } else {
  //     console.log('Contacts permission denied.');
  //   }
  // };

  const getRegisteredUser = async (contactDataObj: any, done = false) => {
    try {
      let updatedContact = contactDataObj.filter((item: any) => item.number);
      const ContactData = JSON.stringify(updatedContact);
      const request = {
        id: ContactData,
          country_code : dailingCode
      };
      await ApiRequestAsync(
        'POST',
        '/contact/registered-user',
        request,
        token,
        'application/json',
      )
        .then(response => {
          dispatch(setLoading(false));
          if (response.data.detail) {
            setContactsListClone(response.data.detail as Array<any>);
            if (searchText) {
              const lowerText = searchText.toLowerCase();
              let user_Contacts = response?.data?.detail.filter((contact: any) =>
                contact?.full_name?.toLowerCase().includes(lowerText),
              );
              setContactsList(user_Contacts as Array<any>);
            } else {
              setContactsList(sortNamesAlphabetically(response.data.detail) as Array<any>);
            }
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

  const handleFetchContacts = async () => {
    const granted: boolean = await checkContactsPermission();

    Contacts.checkPermission().then(res => {
      if (res === 'authorized') {
        dispatch(setLoading(true));
        Contacts.getAll()
        .then(data => {
          // setContactsList(data as Array<any>);
          //const uniqueContacts = removeDuplicateContacts(data);
          const contactDataObj = data.map(item => {
            return {
              name:
                Platform.OS === 'android'
                  ? item.displayName
                  : `${item.givenName} ${item.familyName}`,
              number:
                item.phoneNumbers.length !== 0
                  ? item.phoneNumbers[0].number
                  : '',
              profile: '',
              contact_email: '',
            };
          });
          // dispatch(setUserContact(contactDataObj as any));
          setUserContacts(contactDataObj);
          getRegisteredUser(contactDataObj);
        })
        .catch(error => {
          console.log('Error occurred while accessing contacts:', error);
          dispatch(setLoading(false));
        });
      } else if (res === 'denied') {
        
        
      }
    });

  };

  const fetchEmergencyContacts = async () => {
    let data = new FormData();
    data.append('type', 0);
    dispatch(setLoading(true));
    ApiRequestAsync('GET', '/contact/emergency-contact-list', data, token)
      .then(async (data: any) => {
        if (data.data.list !== undefined) {  
          dispatch(setEmergencyUserContact(data.data.list));
          dispatch(setLoading(false));
        }
      })
      .catch(error => {
        setErrorText(error);
        console.log(error);
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    handleFetchContacts();
  }, []);

  // const handleScroll = ({nativeEvent}: any) => {
  //   const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
  //   const threshold = 100; // Adjust this value as needed

  //   if (
  //     layoutMeasurement.height + contentOffset.y >=
  //     contentSize.height - threshold
  //   ) {
  //     // Fetch the next batch of contacts
  //     // handleFetchContacts();
  //   }
  // };

  // const filteredContacts = contacts.filter(contact =>
  //   contact.fullName.toLowerCase().includes(searchText.toLowerCase()),
  // );

  const handleRemove = () => {
    dispatch(setLoading(true));
    let data = new FormData();
    data.append('Location[longitude]', profile.longitude);
    data.append('Location[latitude]', profile.latitude);
    data.append('Location[address]', profile.address);
    data.append('Location[category_id]', '');
    ApiRequestAsync(
      'POST',
      `/contact/remove-emergency-contact?contact=${selectedContact}`,
      data,
      token,
    )
      .then(async (data: any) => {
        if (selectedContact !== undefined)
          await getRegisteredUser(userContacts);
          fetchEmergencyContacts()
        if (!toast.isActive(id)) {
          ErrorToast({toast, id, errorMessage: data.data.message});
        }
      })
      .catch(error => {
        setErrorText(error);
        console.log(error);
        dispatch(setLoading(false));
      });
    // Logic to handle the invite action for the specific contact
  };

  const inviteUser = (name: any, number: any) => {
    dispatch(setLoading(true));
    let data = new FormData();
    data.append('Location[longitude]', profile.longitude);
    data.append('Location[latitude]', profile.latitude);
    data.append('Location[address]', profile.address);
    data.append('Location[category_id]', '');
    ApiRequestAsync(
      'POST',
      `/contact/add-emergency-contact?contact=${number}&name=${name}`,
      data,
      token,
    )
      .then(async (data: any) => {
        await getRegisteredUser(userContacts);
        fetchEmergencyContacts()
        if (!toast.isActive(id)) {
          ErrorToast({toast, id, errorMessage: data.data.message});
        }
      })
      .catch(error => {
        let {message} = JSON.parse(error['_response']);
        if (!toast.isActive(id)) {
          ErrorToast({toast, id, errorMessage: message ?? ''});
        }
        setErrorText(error);
        console.log(error);
        dispatch(setLoading(false));
      });
  };

  const openCOnfirmationModal = (contacts: string) => {
    setSelectedContact(contacts);
    setOpenModal(true);
  };

  const renderItem = useCallback(
    ({item: contact}: any) => (
      <Box
        borderBottomWidth="1"
        _dark={{
          borderColor: 'muted.50',
        }}
        borderColor="muted.800"
        pl={['0', '4']}
        pr={['0', '5']}
        py="3">
        <HStack space={[3, 3]} justifyContent="space-between">
          <Avatar
            size="38px"
            source={{
              uri:
                contact?.thumbnailPath !== undefined &&
                contact?.thumbnailPath !== ''
                  ? contact?.thumbnailPath
                  : 'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=',
            }}
          />
          <VStack>
            <Text
              _dark={{
                color: 'warmGray.50',
              }}
              color="coolGray.800"
              bold>
              {/* {contact?.displayName !== undefined && Platform.OS === "android"  ? contact?.displayName : contact?.givenName !== undefined && contact?.familyName !== undefined ? `${contact.givenName} ${contact.familyName}` : contact.name} */}
              {contact?.full_name !== undefined ? contact?.full_name : ''}
            </Text>
            <Text
              color="coolGray.600"
              _dark={{
                color: 'warmGray.200',
              }}>
              {/* {contact?.phoneNumbers && contact?.phoneNumbers.length > 0
                ? contact?.phoneNumbers[0]?.number
                : contact.number} */}
              {contact?.number ? contact?.number : ''}
            </Text>
          </VStack>
          <Spacer />
          {contact.is_emergency ? (
            <TouchableOpacity
              onPress={() => openCOnfirmationModal(contact?.number)}>
              <Text style={{color: 'red'}}>Remove</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                dispatch(setLoading(true));
                // inviteUser(
                //   Platform.OS === 'android'
                //     ? contact.displayName
                //     : `${contact.givenName} ${contact.familyName}`,
                //   Platform.OS === 'android'
                //     ? contact.phoneNumbers[0].number
                //     : contact.phoneNumbers[0]?.number,
                // );
                inviteUser(contact?.full_name, contact?.number);
              }}>
              <Icon
                name="plus"
                style={{
                  fontSize: 20,
                  color: 'black',
                  marginRight: 10,
                }}
              />
            </TouchableOpacity>
          )}
        </HStack>
      </Box>
    ),
    [userContactsList],
  );

  // const renderItem = ({ item }: any) => {
  //     return <Box p={4}>{item.name}</Box>;
  // };

  // const handleInvite = (contact) => {
  //     // Logic to handle the invite action for the specific contact
  // };

  return (
    <>
      {isLoading && <Loader isLoading={isLoading} />}

      <NativeBaseProvider>
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
                setpasswordState={() => {}}
                type={'text'}
                keyboardType={'default'}
                InputRightElementFunction={() => {}}
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
              You can select maximum 10 contacts whom you want to add in
              emergency contacts.
            </Text>
            <Box style={{width: '100%', height: 615}}>
              {userContactsList.length > 0 ? (
                <FlatList
                  data={userContactsList}
                  keyExtractor={(contact, index) =>
                    `${contact.number}_${index}`
                  }
                  renderItem={renderItem}
                  updateCellsBatchingPeriod={5} 
                  maxToRenderPerBatch={5}
                  initialNumToRender={50}
                  onEndReachedThreshold={16}
                />
              ) : (
                <View style={styles.viewStyle}>
                  <Text style={styles.textStyle}>no contact found</Text>
                </View>
              )}
            </Box>
          </VStack>
        </Box>
      </NativeBaseProvider>
      {openModal && (
        <SignOutModal
          handleClickYes={handleRemove}
          message={constantMessages.EmergencyModaltxt}
          openModal={openModal}
          setOpenModal={setOpenModal}
        />
      )}
    </>
  );
};
export default LocationRequest;

const styles = StyleSheet.create({
  viewStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    top: 50,
  },
  textStyle: {
    color: 'gray',
  },
});
