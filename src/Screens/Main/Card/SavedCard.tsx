import React from 'react';
import {
  Button,

  FormControl,
  useToast,
  Center,
  Checkbox,
  NativeBaseProvider,
  VStack,
  Stack,
  Text,
  Box,
  Pressable,
  HStack,
  Flex,
  View,
  IconButton,
  ScrollView,
  Fab,
} from 'native-base';
import { useState, useEffect } from 'react';
import { StyleSheet, Dimensions, Platform, Modal, TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomInput from '../../../Components/CustomInput';
import CustomCheckBox from '../../../Components/CustomCheckBox';
import IconEntypo from 'react-native-vector-icons/Entypo';
import CreditDebitCard from '../Credit-DebitCard/Credit-DebitCard';
import { useDispatch, useSelector } from 'react-redux';
import {
  initial_card_data,
  setCardData,
  setCardLists,
  setLoading,
} from '../../../redux/reducers/authReducer';
import { ApiRequestAsync, ErrorToast } from '../../../services/httpServices';

const SavedCard = () => {
  const { cardData, token, profile, cardLists } = useSelector(
    (state: any) => state.AuthReducer,
  );
  const toast = useToast();
  const id = 'test-toast';

  const [open, setOpen] = useState(false);
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);

  const dispatch = useDispatch();

  const formatExpiryDate = (text: any) => {
    let maskedText = text;
    if (text.length > 2) {
      const month = text.slice(0, 2);
      const year = text.slice(2, 4);
      maskedText = `${month}/${year}`;
    }

    return maskedText;
  };

  const handleChange = (data: any, name: string) => {
    try {
      if (name === 'card_number') {
        // const cleanedText = data.replace(/\D/g, '');

        // // Add spaces to format the card number (e.g., "XXXX XXXX XXXX XXXX")
        // let formattedText = '';
        // for (let i = 0; i < cleanedText.length; i += 4) {
        //   formattedText += cleanedText.slice(i, i + 4) + ' ';
        // }

        // // Remove the trailing space if it exists
        // if (data.length % 5 === 0) {
        //   formattedText = formattedText.slice(0, -1);
        // }
        dispatch(setCardData({ [name]: data.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim() }));
      } else {
        dispatch(setCardData({ [name]: data }));
      }
      if (name === 'expiry_date') {
        const cleanedText = data.replace(/[^\d]/g, '');
        const maskedText = formatExpiryDate(cleanedText);
        dispatch(setCardData({ [name]: maskedText }));

      }
    } catch (error) {
      console.log(error);
    }
  };

  const getCardsData = () => {
    dispatch(setLoading(true));
    let data = new FormData();
    data.append('Location[longitude]', profile.longitude);
    data.append('Location[latitude]', profile.latitude);
    data.append('Location[address]', profile.location);
    data.append('Location[category_id]', '');
    ApiRequestAsync('GET', '/user/card-list', data, token)
      .then(async (data: any) => {
        dispatch(setLoading(false));
        if (data.data.card_details !== undefined) {
          dispatch(setCardLists(data.data.card_details));
        } else {
          dispatch(setCardLists([] as never));
        }
      
      })
      .catch(error => {
        console.log(error);
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    getCardsData();
  }, []);

  const ValidationCheck = () => {
    let validationMsg = '';
    if (cardData.customer_name === '') {
      validationMsg = 'Please enter card details'
    }
    else if (cardData.card_number === '' || cardData.expiry_date === '') {
      validationMsg = 'Invalid Card Details'
    }
    return validationMsg;
  }

  const BeforeStoreCode = () => {
    const formValidation = ValidationCheck();
    if (!formValidation) {
      
      addCardApi();
    } else {
      if (!toast.isActive(id)) {
        ErrorToast({ toast, id, errorMessage: formValidation, placement: 'top' });
      }
    }
  };

  const addCardApi = () => {
    try {
      setOpen(false);
      dispatch(setLoading(true));
      let errorMessage = '';
      let data = new FormData();
      data.append('cvc', cardData.cvc);
      data.append('card_number', cardData.card_number);
      data.append('expiry_date', cardData.expiry_date);
      data.append('customer_name', cardData.customer_name);
      
      ApiRequestAsync('POST', '/user/add-card', data, token)
        .then(response => {
          getCardsData();
          if (response.data?.message !== undefined) {
            dispatch(setLoading(false));
          }
          if (!toast.isActive(id) && response.data?.message !== undefined) {
            ErrorToast({ toast, id, errorMessage: response.data?.message });
          }
        })
        .catch(error => {

          if (error.response) {
            if (error.response.data !== undefined) {
              errorMessage = error.response.data.message;
              dispatch(setLoading(false));
            } else {
              const RespMsg = JSON.parse(error.response)
              errorMessage = RespMsg.message;
              dispatch(setLoading(false));
            }
            if (!toast.isActive(id)) {
              ErrorToast({ toast, id, errorMessage, placement: 'top' });
            }
          }
        });
    } catch (error) {
      console.log(error);
    }
  };

  const handleOpenCard = () => {
    dispatch(setCardData({ ...initial_card_data }));
    setOpen(true);
  };

  return (
    <>
      <View style={styles.root}>
        {cardLists.length !== 0 ? (
          <CreditDebitCard getCardsData={getCardsData} />
        ) : (
          <>
            <View style={styles.noCardStyle} >
              <Text style={styles.textColorStyle} >No card added yet!</Text>
              <Text style={styles.textColorStyle} >click on + icon add cards.</Text>
            </View>
          </>
        )}
        <Fab
          renderInPortal={false}
          shadow={2}
          size="sm"
          colorScheme="emerald"
          variant="solid"
          onPress={() => handleOpenCard()}
          icon={<Icon name="plus" style={styles.iconStyle} color="white" />}
        />
      </View>

      <Modal visible={open} animationType="fade" transparent={true}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableOpacity onPress={() => setOpen(false)} activeOpacity={1} style={styles.modalContainer} >
            <View style={styles.modalContent}>
              <View style={styles.header_Modal}>
                <Text style={styles.txt}>Card Details</Text>
                <View style={{ marginTop: 20 }}></View>
              </View>
              {/* <Modal.CloseButton onClose={() => setOpen(false)} /> */}
              <FormControl style={{ marginBottom: 10 }}>
                <CustomInput
                  variant="outline"
                  fontSize="lg"
                  placeholder="Name on card"
                  InputLeftElementIcon="credit-card-outline"
                  focusOutlineColor={'coolGray.300'}
                  // value={categoryData && categoryData.title}
                  // onChangeText={() => {}}
                  value={cardData && cardData.customer_name}
                  onChangeText={(text: any) =>
                    handleChange(text, 'customer_name')
                  }
                  focusbackgroundColor={'coolGray.100'}
                  InputRightElementIcon=""
                  passwordState={false}
                  isDisabled={false}
                  setpasswordState={() => { }}
                  type={'text'}
                  keyboardType={'default'}
                  InputRightElementFunction={() => { }}
                  maxLength={32}
                />
              </FormControl>
              <FormControl style={{ marginBottom: 10 }}>
                <CustomInput
                  variant="outline"
                  fontSize="lg"
                  placeholder="Card number"
                  InputLeftElementIcon="credit-card-outline"
                  focusOutlineColor={'coolGray.300'}
                  value={cardData && cardData.card_number}
                  // value={categoryData && categoryData.title}
                  // onChangeText={() => {}}
                  onChangeText={(text: any) => handleChange(text, 'card_number')}
                  focusbackgroundColor={'coolGray.100'}
                  InputRightElementIcon=""
                  passwordState={false}
                  isDisabled={false}
                  setpasswordState={() => { }}
                  type={'number'}
                  keyboardType={'default'}
                  InputRightElementFunction={() => { }}
                  maxLength={Platform.OS === 'android' ? 19 : 19}
                />
              </FormControl>
              <View style={styles.expiryCVC}>
                <View style={styles.expiry}>
                  <FormControl>
                    <CustomInput
                      variant="outline"
                      fontSize="lg"
                      placeholder="Expiry"
                      InputLeftElementIcon="calendar-month"
                      focusOutlineColor={'coolGray.300'}
                      value={cardData && cardData.expiry_date}
                      // onChangeText={() => {}}
                      onChangeText={(text: any) =>
                        handleChange(text, 'expiry_date')
                      }
                      focusbackgroundColor={'coolGray.100'}
                      InputRightElementIcon=""
                      passwordState={false}
                      isDisabled={false}
                      setpasswordState={() => { }}
                      type={'number'}
                      keyboardType={'numeric'}
                      InputRightElementFunction={() => { }}
                      maxLength={5}
                    />
                  </FormControl>
                </View>
                <View style={styles.CVC}>
                  <FormControl>
                    <CustomInput
                      variant="outline"
                      fontSize="lg"
                      placeholder="CVC"
                      InputLeftElementIcon="credit-card-outline"
                      focusOutlineColor={'coolGray.300'}
                      value={cardData && cardData.cvc}
                      // onChangeText={() => {}}
                      onChangeText={(text: any) => handleChange(text, 'cvc')}
                      focusbackgroundColor={'coolGray.100'}
                      InputRightElementIcon=""
                      passwordState={false}
                      isDisabled={false}
                      setpasswordState={() => { }}
                      type={'number'}
                      keyboardType={'numeric'}
                      InputRightElementFunction={() => { }}
                      maxLength={4}
                    />
                  </FormControl>
                </View>
              </View>
              <Button
                style={styles.modalFooter}
                bg="tertiary.600"
                colorScheme={'tertiary'}
                onPress={() => {
                  BeforeStoreCode();

                }}>
                <Text style={styles.textButton}>Add</Text>
              </Button>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
};

export default SavedCard;

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  bottom: {
    marginBottom: 0,
  },
  Header: {
    alignItems: 'center',
    color: 'white',
  },
  txt: {
    color: 'green',
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalContent: {
    width: Dimensions.get('window').width,
    backgroundColor: '#fff',
    padding: 16,
    // justifyContent: 'center',
  },
  header_Modal: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  expiryCVC: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  expiry: {
    width: Dimensions.get('window').width * 0.48,
  },
  CVC: {
    width: Dimensions.get('window').width * 0.32,
    marginLeft: 45,
  },
  modalFooter: {
    width: Dimensions.get('window').width,
    alignSelf: 'center',
    marginBottom: -15,
  },
  textButton: {
    color: 'white',
    fontSize: 18,
  },
  card: {
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.23,
    borderRadius: 10,
  },
  textrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textrow1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  text: {
    width: '100%',
    fontSize: 21,

    color: 'white',
    alignContent: 'center',
    paddingLeft: 30,
  },
  text1: {
    color: 'white',
    fontSize: 13,
    paddingTop: 20,
    paddingLeft: 30,
  },
  text2: {
    color: 'white',
    fontSize: 13,
    paddingTop: 20,
    paddingRight: 40,
  },
  text3: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 5,
    paddingLeft: 30,
  },
  text4: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 5,
    paddingLeft: 20,
    paddingRight: 38,
  },
  number: {
    paddingTop: 15,
  },
  noCardStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  textColorStyle: {
    color: 'gray',
    fontSize: 14
  },
  iconStyle: {
    fontSize: 24
  }
});
