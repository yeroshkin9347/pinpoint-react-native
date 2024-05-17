import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {
  Avatar,
  Box,
  Button,
  Center,
  FlatList,
  HStack,
  Pressable,
  Spacer,
  Text,
  VStack,
  Modal,
  useToast,
} from 'native-base';
import React, {useCallback, useEffect, useState} from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import Loader from '../../../Components/Loader';
import {
  setEmergencyUserContact,
  setLoading,
} from '../../../redux/reducers/authReducer';
import {ApiRequestAsync, BaseURL, ErrorToast, truncateString} from '../../../services/httpServices';
import constantMessages from '../../../Constants';
const EmergencyContacts = () => {
  const navigation = useNavigation();
  const {token, emergencyUserContacts, isLoading, profile} =
    useSelector((state: any) => state.AuthReducer);

    const [isOpen, setOpen] = useState(false);
    const [selectedNo, setSelectedNo] = useState('');

    const openModal = (number:any) => {
      setOpen(true);
      setSelectedNo(number)
    };

  const dispatch = useDispatch();
  const toast = useToast();
  const id = 'test-toast';

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={() =>
              navigation.navigate('Add Emergency Contacts' as never)
            }>
            <Icon
              name="plus"
              style={{fontSize: 25, color: 'black', marginRight: 10}}
            />
          </Pressable>
        ),
      });
    }, []),
  );

  const fetchEmergencyContacts = async () => {
    let data = new FormData();
    dispatch(setLoading(true));
    data.append('type', 0);
    ApiRequestAsync('GET', '/contact/emergency-contact-list', data, token)
      .then(async (data: any) => {
        dispatch(setLoading(false));
        if (data.data.list !== undefined) {
          dispatch(setEmergencyUserContact(data.data.list));
        }
      
      })
      .catch(error => {
        console.log(error);
        dispatch(setLoading(false));
      });
  };

  const handleScroll = ({nativeEvent}: any) => {
    const {layoutMeasurement, contentOffset, contentSize} = nativeEvent;
    const threshold = 100; // Adjust this value as needed

    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - threshold
    ) {
      // Fetch the next batch of contacts
      fetchEmergencyContacts();
    }
  };

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const handleRemove = (number : string) => {
    dispatch(setLoading(true));
    let data = new FormData();
    data.append('Location[longitude]', profile.longitude);
    data.append('Location[latitude]', profile.latitude);
    data.append('Location[address]', profile.address);
    data.append('Location[category_id]', '');
    ApiRequestAsync(
      'POST',
      `/contact/remove-emergency-contact?contact=${number}`,
      data,
      token,
    )
      .then(async (data: any) => {
        if (!toast.isActive(id)) {
          ErrorToast({toast, id, errorMessage: data.data.message});
        }
        await fetchEmergencyContacts();
        setOpen(false)
      })
      .catch(error => {
        console.log(error);
        dispatch(setLoading(false));
      });
    // Logic to handle the invite action for the specific contact
  };

  return (
    <>
      <View style={{backgroundColor: 'white', width: '100%', height: '100%'}}>
        {isLoading && <Loader isLoading={isLoading} />}
        {emergencyUserContacts.length ? (
          <Box style={{paddingHorizontal: 8}}>
            <FlatList
            data={emergencyUserContacts as Array<any>}
            keyExtractor={(contact, index) => `${contact.number}_${index}`}
            renderItem={({item}) => (
              <Box
                borderBottomWidth="1"
                _dark={{
                  borderColor: 'muted.50',
                }}
                borderColor="muted.800"
                pl={['0', '4']}
                pr={['0', '5']}
                py="3">
                <TouchableOpacity>
                  <HStack space={[3, 3]} justifyContent="space-between">
                    <Avatar
                      size="38px"
                      source={{
                        uri: item?.profile_file !== undefined && item?.profile_file !== ""
                          ? `${BaseURL}${item?.profile_file}`
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
                        {item?.full_name !== undefined ? truncateString(item?.full_name) : ""}
                      </Text>
                      <Text
                        color="coolGray.600"
                        _dark={{
                          color: 'warmGray.200',
                        }}>
                        {item?.contact_no}
                      </Text>
                    </VStack>
                    <Spacer />
                    <Button
                      size="md"
                      variant="tertiary"
                      onPress={()=> openModal(item?.contact_no)}
                      
                      >
                      <Text style={{color: 'red'}}>Remove</Text>
                    </Button>
                  </HStack>
                </TouchableOpacity>
               
              </Box>
            )}
            onScroll={handleScroll}
            onEndReachedThreshold={16}
          />
           <Modal isOpen={isOpen}  onClose={() => setOpen(false)}>
      <Modal.Content style={{ backgroundColor: 'white', width: '85%' }}>
        <Modal.Body>
          <VStack space={3}>
            <HStack alignItems="center" justifyContent="space-between">
              <Text style={{ fontSize: 18, paddingLeft: 5, color: 'black'}}>
              {constantMessages.EmergencyModaltxt}
              </Text>
            </HStack>
          </VStack>
        </Modal.Body>
        <Box style={styles.buttonBox}>
          <Button onPress={() => setOpen(false)}style={styles.button}>
            <Text style={styles.text}>{constantMessages.EmergencyNO}</Text>
          </Button>
          <Button onPress={() => handleRemove(selectedNo)} style={styles.button}>
            <Text style={styles.text}>{constantMessages.EmergencyYES}</Text>
          </Button>
        </Box>
      </Modal.Content>
    </Modal>
 
            {/* <ScrollView onScroll={handleScroll} scrollEventThrottle={16}>
              {emergencyUserContacts.map((contact: any) => (
                <Box
                  borderBottomWidth="1"
                  _dark={{
                    borderColor: 'muted.50',
                  }}
                  borderColor="muted.800"
                  pl={['0', '4']}
                  pr={['0', '5']}
                  key={
                    contact?.phoneNumbers && contact?.phoneNumbers.length > 0
                      ? contact?.phoneNumbers[0]?.number
                      : ''
                  }
                  py="3">
                  <TouchableOpacity>
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
                          {contact?.full_name !== undefined
                            ? contact?.full_name
                            : ''}
                        </Text>
                        <Text
                          color="coolGray.600"
                          _dark={{
                            color: 'warmGray.200',
                          }}>
                          {contact?.phoneNumbers &&
                          contact?.phoneNumbers.length > 0
                            ? contact?.phoneNumbers[0]?.number
                            : ''}
                        </Text>
                      </VStack>
                      <Spacer />
                      <Button
                        size="md"
                        variant="tertiary"
                        onPress={() =>
                          handleRemove({number: contact?.contact_no})
                        }>
                        <Text style={{color: 'red'}}>Remove</Text>
                      </Button>
                    </HStack>
                  </TouchableOpacity>
                </Box>
              ))}
            </ScrollView> */}
          </Box>
        ) : (
          <Center flex={1}>
            <Text fontSize="md" fontWeight="light">
              Start sharing your location with your friends {'\n'}
              and family in the case of Emergency. Click the + {'\n'}
              icon to Add Emergency Contacts
            </Text>
          </Center>
        )}
      </View>
    </>
  );
};

export default EmergencyContacts;

const styles = StyleSheet.create({
  buttonBox: {
    width: '60%',
    flexDirection: 'row',
    marginHorizontal: 200,
    paddingLeft: 20,
  },
  button: {
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
  },
  text: {
    fontWeight: 'bold',
    color: '#2F965F',
  },
});
