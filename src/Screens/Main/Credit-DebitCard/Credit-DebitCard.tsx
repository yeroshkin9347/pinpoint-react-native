import {Text, StyleSheet, Dimensions} from 'react-native';
import {
  Button,
  Modal,
  FormControl,
  Input,
  Center,
  Checkbox,
  View,
  NativeBaseProvider,
  VStack,
  Stack,
  Box,
  Pressable,
  HStack,
  Flex,
  IconButton,
  ScrollView,
  Menu,
  useToast,
} from 'native-base';
import React, {useState} from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import {
  setLoading,
  setPurchasePlan,
  setrerenderApp,
} from '../../../redux/reducers/authReducer';
import {ApiRequestAsync, ErrorToast} from '../../../services/httpServices';
import {useNavigation} from '@react-navigation/native';
import Loader from '../../../Components/Loader';
import {
  cardHolderText,
  deleteText,
  noTag,
  payText,
  setDefault,
  sterik,
  validThruText,
  yesTag,
} from '../../../Constants';

interface cardDataProps {
  getCardsData?: any;
}

const CreditDebitCard = ({getCardsData}: cardDataProps) => {
  const [checked, setChecked] = useState(false);
  const [cardModal, setCardModal] = useState(false);
  const {cardLists, token, planId, isLoading,fromSignUp} = useSelector(
    (state: any) => state.AuthReducer,
  );

  const toast = useToast();
  const id = 'test-toast';
  const navigation = useNavigation();

  const dispatch = useDispatch();

  const onChangeCheck = () => {
    setChecked(!checked);
  };

  const handleDefault = async (cardId: any) => {

    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('card_id', cardId);
      await ApiRequestAsync(
        'POST',
        `/user/set-default-card?card_id=${cardId}`,
        data,
        token,
      )
        .then(response => {
          dispatch(setLoading(false));
          getCardsData();
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) {
      console.log();
      dispatch(setLoading(false));
    }
  };

  const handleDelete = async (cardId: any) => {
    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('card_id', cardId);
      await ApiRequestAsync(
        'POST',
        `/user/card-delete?card_id=${cardId}`,
        data,
        token,
      )
        .then(response => {
          dispatch(setLoading(false));
          getCardsData();
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) {
      console.log();
      dispatch(setLoading(false));
    }
  };

  const handleCardModal = () => {
    if (planId !== 0) {
      setCardModal(true);
    }
  };

  const purchasePlanAPI = async (cardId: any) => {
    try {
      setCardModal(false);
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('card_id', cardId);
      data.append('plan_id', planId);

      await ApiRequestAsync(
        'GET',
        '/user/purchase-plan',
        {card_id: cardId, plan_id: planId, code: 0},
        token,
      )
        .then(response => {
      
          dispatch(setPurchasePlan(response.data?.detail));
          dispatch(setLoading(false));
          if (!toast.isActive(id) && response.data?.message !== undefined) {
            ErrorToast({toast, id, errorMessage: response.data?.message});
          }
          dispatch(setrerenderApp());
        if(!fromSignUp){
          navigation.navigate('HomeScreen' as never);
        }
      
        })
        .catch(error => {
          dispatch(setLoading(false));
          console.log(error);
        });
    } catch (error) {
      console.log(error);
      dispatch(setLoading(false));
    }
  };

  const insertSpaceBetweenDigits = (number: any) => {
    const SpacedNumber = number.toString().split('').join(' ');
    return SpacedNumber;
  };

  return (
    <ScrollView>
      {isLoading && <Loader isLoading={isLoading} />}
      {cardLists.map((cardData: any, index: any) => (
        <>
          <Pressable onPress={() => handleCardModal()}>
            <VStack key={index} space={4} alignItems="center" marginTop="5">
              <View style={styles.card} bg="tertiary.600" shadow={3}>
                <View style={styles.textrow}>
                  {cardData.is_default === 1 ? (
                    <Checkbox
                      style={{marginTop: 15}}
                      opacity={'1'}
                      colorScheme={'gray'}
                      value={'one'}
                      size={'md'}
                      isChecked={true}
                      onChange={onChangeCheck}
                      accessibilityLabel={'-'}
                    />
                  ) : (
                    <View></View>
                  )}
                  <Menu
                    key={index}
                    w="200"
                    shouldOverlapWithTrigger={false}
                    placement="bottom right"
                    padding={0}
                    trigger={triggerProps => {
                      return (
                        <Pressable
                          accessibilityLabel="More options menu"
                          {...triggerProps}>
                          <Icon
                            name="dots-horizontal"
                            style={{
                              paddingRight: 20,
                              paddingTop: 10,
                              fontSize: 40,
                              color: 'white',
                            }}
                          />
                        </Pressable>
                      );
                    }}>
                    {cardLists.length > 1 ? (
                      <Menu.Item
                        style={{backgroundColor: '#cef5d6'}}
                        onPress={() => handleDefault(cardData.id)}>
                        <Text style={{color: 'grey'}}>
                          {setDefault.setAsDefault}
                        </Text>
                      </Menu.Item>
                    ) : (
                      ''
                    )}
                    <Menu.Item
                      style={{backgroundColor: '#cef5d6'}}
                      onPress={() => handleDelete(cardData.id)}>
                      <Text style={{color: 'grey'}}>{deleteText.delete}</Text>
                    </Menu.Item>
                  </Menu>
                </View>
                <View style={styles.number}>
                  <Text style={styles.text}>
                    {' '}
                    {sterik.sterikk} {' '} {sterik.sterikk}{' '} {sterik.sterikk}{' '}{' '}
                    {insertSpaceBetweenDigits(cardData.last4)}
                  </Text>
                </View>
                <View style={styles.textrow}>
                  <Text style={styles.text1}>
                    {cardHolderText.cardHolderName}
                  </Text>
                  <Text style={styles.text2}>{validThruText.validThru}</Text>
                </View>
                <View style={styles.textrow1}>
                  <Box style={{width: '60%', paddingBottom: 10}}>
                    <Text style={styles.text3}>{cardData.name}</Text>
                  </Box>
                  <Text style={styles.text4}>
                    {cardData.exp_month}/{cardData.exp_year}
                  </Text>
                </View>
              </View>
            </VStack>
          </Pressable>
          <Modal isOpen={cardModal}>
            <Modal.Content maxWidth="350" style={{backgroundColor: 'white'}}>
              <Modal.Body>
                <VStack space={3}>
                  <HStack alignItems="center" justifyContent="space-between">
                    <Text style={styles.paragraphText}>
                      {payText.payVia} {cardData.last4}
                    </Text>
                  </HStack>
                </VStack>
                <Box style={styles.buttonBox}>
                  <Button
                    onPress={() => setCardModal(false)}
                    style={styles.button}>
                    <Text style={styles.textt}>{noTag.no}</Text>
                  </Button>
                  <Button
                    onPress={() => purchasePlanAPI(cardData.id)}
                    style={styles.button}>
                    <Text style={styles.textt}>{yesTag.yes}</Text>
                  </Button>
                </Box>
              </Modal.Body>
            </Modal.Content>
          </Modal>
        </>
      ))}
    </ScrollView>
  );
};

export default CreditDebitCard;
const styles = StyleSheet.create({
  card: {
    width: Dimensions.get('window').width * 0.95,
    minHeight: Dimensions.get('window').height * 0.1,
    borderRadius: 10,
    overflow: 'hidden',
    paddingLeft: 25,
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
    fontSize: 26,
    color: 'white',
    alignContent: 'center',
    // paddingLeft: 25,
    letterSpacing: -1,
    // backgroundColor:"red",
    paddingLeft: -10,
    marginLeft: -5,
    // margin:0
  },
  text1: {
    color: 'white',
    fontSize: 13,
    paddingTop: 20,
    // paddingLeft: 30,
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
    // paddingLeft: 30,
  },
  text4: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    paddingTop: 5,
    // paddingLeft: 20,
    paddingRight: 38,
  },
  number: {
    paddingTop: 15,
  },
  paragraphText: {
    color: 'black',
    fontSize: 16,
  },
  buttonBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    backgroundColor: '#fff',
    color: 'green.100',
    justifyContent: 'flex-end',
  },
  textt: {
    color: 'green',
  },
});
