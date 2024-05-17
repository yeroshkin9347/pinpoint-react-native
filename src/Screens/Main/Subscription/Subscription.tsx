import { Button, Heading, Modal, Box, Checkbox, ScrollView, Switch, useToast } from 'native-base';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Dimensions, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setChangePlan,
  setChangeSubscription,
  setFromUser,
  setLoading,
  setPlanList,
  setPlanListId,
  setProfile,
  setrerenderApp,
  updateProfile,
} from '../../../redux/reducers/authReducer';
import { ApiRequestAsync, ErrorToast, covertTimeToTwelveHourFormat } from '../../../services/httpServices';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { height, width } = Dimensions.get('window');

const Subscription = () => {
  const route = useRoute();
  const [planId, setPlanId] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);
  const [Show, setShow] = useState<boolean>(false);
  const [showbutton, setShowbutton] = useState(false);
  const [currenIndex, setCurrentIndex] = useState<any>(0);
  const [checked, setChecked] = useState(false);
  const [changePlanData, setChangePlanFilteredData] = useState([]);
  const { profile, token, planList, changeSubscription } = useSelector((state: any) => state.AuthReducer);
  const [check, setCheck] = useState(false);
  const [flag, setFlag] = useState('');
  const dispatch = useDispatch();
  const toast = useToast();
  const id = "test-toast";

  useEffect(() => {
 
    const subscriptionChangePlan = planList.every((item: any) =>
      item.subscription_state === 3 ? true : false);
    if (subscriptionChangePlan) {
      dispatch(setChangeSubscription([]));
    }
  }, [planList])

  React.useLayoutEffect(() => {
    navigation.setOptions({ title: "Subscription" });
  }, []);

  const navigation: NavigationProp<ReactNavigation.RootParamList> =
    useNavigation();

  useEffect(() => {
    if (profile !== undefined && profile.is_subscription_enable === 1) {
      setChecked(true);
    } else {
      setChecked(false);
    }
    planListApi();
  }, []);

  const onChangeCheck = () => {
    setCheck(!check);
    setShowbutton(!showbutton);
  };

  const handleNextPress = () => {

    if (flag === 'freeTrial') {
      if (profile.id !== 0) {
        dispatch(setLoading(true));
        dispatch(setrerenderApp());
        setShowModal(false);
        const Data = new FormData();
        Data.append('User[userId]', profile.id);
        ApiRequestAsync(
          'GET',
          '/user/enabled-free-trial',
          { id: profile.id, code: 0 },
          token,
        )
          .then(async (data: any) => {
            if (data.data.list !== undefined) {
              dispatch(setProfile(data.data.list));
            }
            if (!toast.isActive(id)) {
              let errorMessage = data.data.message
              if (!toast.isActive(id)) {
                ErrorToast({ toast, id, errorMessage });
              }
            }
            setTimeout(() => {
              dispatch(setFromUser(false));
              if(route?.name == 'SubscriptionSettings'){
                navigation.navigate('HomeScreen' as never);
              }
              dispatch(setrerenderApp());
              dispatch(setLoading(false));
            }, 500);
          })
          .catch(error => {
            console.log(error);
            dispatch(setLoading(false));
          });
      }
    }
    else {
      dispatch(setPlanListId(planId))
      navigation.navigate('Card Details' as never)
      setShowModal(false);
    }

  };
  const planListApi = () => {
    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('Location[longitude]', profile.longitude);
      data.append('Location[latitude]', profile.latitude);
      data.append('Location[address]', profile.address);
      data.append('Location[category_id]', '95');
      ApiRequestAsync('POST', '/user/plan-list', data, token)
        .then(async (data: any) => {
          console.log('plan-list', data);
          console.log('profile', profile);
          dispatch(setLoading(false));
          const filteredData = data.data.list.filter((item: any) => item.subscription_state !== 4)
          dispatch(setPlanList(filteredData));
          const changePlanFilteredData = data.data.list.filter((item: any) => item.subscription_state === 4)
          dispatch(setChangePlan(changePlanFilteredData));
          setChangePlanFilteredData(changePlanFilteredData);
        })
        .catch(error => {
          dispatch(setLoading(false));
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const changePlanApi = async () => {
    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append("Location[longitude]", profile.longitude);
      data.append("Location[latitude]", profile.latitude);
      data.append("Location[address]", profile.address);
      data.append("Location[category_id]", "95");
      await ApiRequestAsync('POST', '/user/change-plan-list', data, token)
        .then(response => {
          console.log('change-plan-list', response);
          dispatch(setLoading(false));
          dispatch(setChangePlan(response.data?.list))
          navigation.navigate('Change Plan' as never)
        })
        .catch(error => {
          dispatch(setLoading(false));
          console.log(error);
        })
    } catch (error) {
      console.log(error);
    }
  };

  const modalFunction = (flag: string, id: any) => {
    setShowModal(true)
    setPlanId(id);
    setFlag(flag);
  };

  const handleRenewSubscription = async () => {
    try {
      dispatch(setLoading(true));
      await ApiRequestAsync('GET', '/user/is-subscription-renew', {}, token)
        .then(response => {
          dispatch(setLoading(false));
          dispatch(updateProfile({ ['is_subscription_enable']: response.data?.is_subscription_enable }))
          if (response.data?.is_subscription_enable === 1) {
            let errorMessage = response.data?.message;
            if (!toast.isActive(id)) {
              ErrorToast({ toast, id, errorMessage });
            }
            setChecked(true);
          } else {
            setChecked(false);
            let errorMessage = response.data?.message;
            if (!toast.isActive(id)) {
              ErrorToast({ toast, id, errorMessage });
            }
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        })
    } catch (error) {
      console.log(error);
      dispatch(setLoading(false));
    }
  }

  const handleToggle = () => {
    handleRenewSubscription();
  }

  return (
    <ScrollView style={{ backgroundColor: '#e8ffee' }} >
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', }}>
        <View
          style={{
            borderRadius: 6,
            width: Dimensions.get('window').width * 0.95,
            height: Dimensions.get('window').height * 0.1,
            padding: 6,
            marginBottom: 20,
            marginTop: 20,
            backgroundColor: '#2F965F',
            shadowOffset: { width: 1, height: 1 },
            shadowColor: '#333',
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }}>
          <Heading
            style={{
              color: '#fff',
              marginTop: 7,
              marginHorizontal: 12,
              fontSize: 16,
            }}>
            Subscribe Now - Quaterly / Monthly / Yearly
          </Heading>
          <Text
            style={{
              color: '#fff',
              marginHorizontal: 12,
              fontSize: 11,
            }}>
            Use the benefit of the app
          </Text>
        </View>
        {profile && profile.is_purchase !== true ?
          profile.is_free_trial && <View style={styles.freeTrial} >
            <Text style={styles.freeTrialText}>Your free Trial ends in {profile.remaining_days} days</Text>
          </View>
          : (
            <View style={styles.switch}>
              <Text style={{ color: 'black', fontSize: 16 }}>Auto Renewal  </Text>
              <Switch
                isChecked={checked}
                onToggle={() => handleToggle()}
              />
            </View>
          )}

        <View style={{ height: height / 2 }}>
          {profile && profile.is_purchase === true ? (
            <FlatList
              data={planList}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              horizontal
              onScroll={e => {
                const x = e.nativeEvent.contentOffset.x;
                setCurrentIndex((x / width).toFixed(0));
              }}
              renderItem={({ item, index }) => {
                return (
                  item.is_purchased ? 
                  <View>
                    <View
                      style={{
                        width: width,
                        height: height / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          width: Dimensions.get('window').width * 0.85,
                          borderRadius: 20,
                          elevation: 3,
                          borderWidth: 1,
                          borderColor: 'green',
                          backgroundColor: 'white',
                          shadowOffset: { width: 1, height: 1 },
                          shadowColor: '#333',
                          shadowOpacity: 0.3,
                          shadowRadius: 2,
                        }}>
                        <View
                          style={{
                            width: Dimensions.get('window').width * 0.77,
                            height: Dimensions.get('window').height * 0.38,
                            borderRadius: 16,
                            elevation: 3,
                            borderColor: '#FFF',
                            backgroundColor: '#2F965F',
                            shadowOffset: { width: 1, height: 1 },
                            shadowColor: '#333',
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            marginHorizontal: 15,
                            marginVertical: 15,
                            justifyContent: 'space-between',
                            padding: 10,
                          }}>
                          <Heading
                            style={{
                              color: '#fff',
                              textAlign: 'center',
                              fontSize: 25,
                             
                            }}>
                            {item.title}
                          </Heading>
                          <Text
                            style={{
                              color: '#fff',
                              paddingLeft: Platform.OS === 'android' ? 50 : 0,
                              textAlign: 'center',
                              fontSize: 40,
                              fontWeight: 'bold',
                            }}>
                            £{item.price}
                            <Text
                              style={{
                                color: '#fff',
                                textAlign: 'center',
                                fontSize: 18,
                              }}>
                              {' '}{item.title === 'Gold' ? 'Yearly' : 'Monthly'}
                            </Text>{' '}
                          </Text>
                          {item.subscription_start !== "" ? (
                            <Text
                              style={{
                                color: '#fff',
                                textAlign: 'center',
                                fontSize: 15,
                              }}
  
                            >
                              Validity : {covertTimeToTwelveHourFormat(item.subscription_end)}
                            </Text>
                          ) : ('')}
                          <Text
                            style={{
                              width: '100%',
                              color: '#fff',
                              textAlign: 'center',
                              fontSize: 13,
                            }}>
                            {item.title === 'Gold' ? 'This plan is for Yearly' : item.description}
                          </Text>
                          {profile && profile.is_purchase === true ? (
                            <Button
                              style={{
                                width: Dimensions.get('window').width * 0.55,
                                alignSelf: 'center',
                                backgroundColor: 'white',
                              }}>
                              <Text
                                style={{
                                  color: 'green',
                                  fontSize: 18,
                                }}>
                                Subscribed
                              </Text>
                            </Button>
                          ) : (
                            <Button
                              style={{
                                width: Dimensions.get('window').width * 0.55,
                                marginBottom: 7,
                                alignSelf: 'center',
                                bottom: 10,
                                backgroundColor: 'white',
                              }}
                              onPress={() => modalFunction('subscribe', item.id)}>
                              <Text
                                style={{
                                  color: 'green',
                                  fontSize: 18,
                                }}>
                                Subscribe Now
                              </Text>
                            </Button>
                          )}
                          <Modal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}>
                            <Modal.Content style={{ width: 500, height: 160 }}>
                              <Modal.CloseButton />
                              <Modal.Header
                                style={{
                                  alignItems: 'center',
                                  backgroundColor: '#2F965F',
                                }}>
                                <Text style={{ color: 'white', fontSize: 17 }}>
                                  {' '}
                                  Subscribe
                                </Text>
                              </Modal.Header>
                              <Modal.Body>
                                <Box mt="3" style={{ flexDirection: 'row' }}>
                                  <Checkbox
                                    opacity="0.5"
                                    colorScheme="gray"
                                    value="one"
                                    size="md"
                                    isChecked={check}
                                    onChange={() => onChangeCheck()}
                                    accessibilityLabel={'-'}
                                  />
                                  <Text style={{ fontSize: 18, paddingHorizontal: 10 }}>
                                    I agree to{' '}
                                    <Text
                                      style={{
                                        color: 'green',
                                        fontWeight: 'bold',
                                        fontSize: 18,
                                      }}
                                      onPress={() => {
                                        navigation.navigate('Terms' as never);
                                        setShowModal(false);
                                      }
                                      }>
                                      Terms
                                    </Text>{' '}
                                    &{' '}
                                    <Text
                                      style={{
                                        color: 'green',
                                        fontWeight: 'bold',
                                        fontSize: 18,
                                      }}
                                      onPress={() => {
                                        navigation.navigate('Policy' as never);
                                        setShowModal(false)
                                      }
                                      }>
                                      Policy
                                    </Text>
                                  </Text>
                                  {showbutton === true ? (
                                    <Button
                                      style={{
                                        width: 80,
                                        height: 35,
                                        paddingTop: -1,
                                        paddingBottom: -10,
                                        backgroundColor: '#2F965F',
                                        marginTop: 30,
                                        marginLeft: 30,
                                      }}
                                      onPress={handleNextPress}>
                                      Next
                                    </Button>
                                  ) : (
                                    ''
                                  )}
                                </Box>
                              </Modal.Body>
                            </Modal.Content>
                          </Modal>
                        </View>
                      </View>
                    </View>
                  </View> : null
                );
              }}
            />
          ) : (
            <FlatList
              data={planList}
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              horizontal
              onScroll={e => {
                const x = e.nativeEvent.contentOffset.x;
                setCurrentIndex((x / width).toFixed(0));
              }}
              renderItem={({ item, index }) => {
                return (
                  <View>
                    <View
                      style={{
                        width: width,
                        height: height / 2,
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          width: Dimensions.get('window').width * 0.85,
                          borderRadius: 20,
                          elevation: 3,
                          borderWidth: 1,
                          borderColor: 'green',
                          backgroundColor: 'white',
                          shadowOffset: { width: 1, height: 1 },
                          shadowColor: '#333',
                          shadowOpacity: 0.3,
                          shadowRadius: 2,
                          marginHorizontal: 35,
                          marginVertical: 25,
                        }}>
                        <View
                          style={{
                            width: Dimensions.get('window').width * 0.77,
                            height: Dimensions.get('window').height * 0.38,
                            borderRadius: 16,
                            elevation: 3,
                            borderColor: '#FFF',
                            backgroundColor: '#2F965F',
                            shadowOffset: { width: 1, height: 1 },
                            shadowColor: '#333',
                            shadowOpacity: 0.3,
                            shadowRadius: 2,
                            marginHorizontal: 15,
                            marginVertical: 20,
                          }}>
                          <Heading
                            style={{
                              color: '#fff',
                              marginTop: 17,
                              marginHorizontal: 12,
                              textAlign: 'center',
                              fontSize: 25,
                              marginBottom: -8,
                            }}>
                            {item.title}
                          </Heading>
                          <Text
                            style={{
                              color: '#fff',
                              marginHorizontal: 12,
                              marginBottom: 10,
                              paddingLeft: Platform.OS === 'android' ? 50 : 0,
                              textAlign: 'center',
                              paddingTop: 35,
                              fontSize: 40,
                              fontWeight: 'bold',
                            }}>
                            £{item.price}
                            <Text
                              style={{
                                color: '#fff',
                                marginBottom: 20,
                                textAlign: 'center',
                                paddingLeft: 180,
                                fontSize: 18,
                              }}>
                              {' '}{item.title === 'Gold' ? 'Yearly' : 'Monthly'}
                            </Text>{' '}
                          </Text>
                          {item.subscription_start !== "" ? (
                            <Text
                              style={{
                                color: '#fff',
                                marginBottom: 10,
                                textAlign: 'center',
                                fontSize: 15,
                              }}
  
                            >
                              Validity : {covertTimeToTwelveHourFormat(item.subscription_end)}
                            </Text>
                          ) : ('')}
                          <Text
                            style={{
                              width: '100%',
                              color: '#fff',
                              textAlign: 'center',
                              padding: 30,
                              fontSize: 13,
                            }}>
                            {item.title === 'Gold' ? 'This plan is for Yearly' : item.description}
                          </Text>
                          {profile && profile.is_purchase === true ? (
                            <Button
                              style={{
                                width: Dimensions.get('window').width * 0.55,
                                alignSelf: 'center',
                                backgroundColor: 'white',
                              }}>
                              <Text
                                style={{
                                  color: 'green',
                                  fontSize: 18,
                                }}>
                                Subscribed
                              </Text>
                            </Button>
                          ) : (
                            <Button
                              style={{
                                width: Dimensions.get('window').width * 0.55,
                                marginBottom: 7,
                                alignSelf: 'center',
                                bottom: 10,
                                backgroundColor: 'white',
                              }}
                              onPress={() => modalFunction('subscribe', item.id)}>
                              <Text
                                style={{
                                  color: 'green',
                                  fontSize: 18,
                                }}>
                                Subscribe Now
                              </Text>
                            </Button>
                          )}
                          <Modal
                            isOpen={showModal}
                            onClose={() => setShowModal(false)}>
                            <Modal.Content style={{ width: 500, height: 160 }}>
                              <Modal.CloseButton />
                              <Modal.Header
                                style={{
                                  alignItems: 'center',
                                  backgroundColor: '#2F965F',
                                }}>
                                <Text style={{ color: 'white', fontSize: 17 }}>
                                  {' '}
                                  Subscribe
                                </Text>
                              </Modal.Header>
                              <Modal.Body>
                                <Box mt="3" style={{ flexDirection: 'row' }}>
                                  <Checkbox
                                    opacity="0.5"
                                    colorScheme="gray"
                                    value="one"
                                    size="md"
                                    isChecked={check}
                                    onChange={() => onChangeCheck()}
                                    accessibilityLabel={'-'}
                                  />
                                  <Text style={{ fontSize: 18, paddingHorizontal: 10 }}>
                                    I agree to{' '}
                                    <Text
                                      style={{
                                        color: 'green',
                                        fontWeight: 'bold',
                                        fontSize: 18,
                                      }}
                                      onPress={() => {
                                        navigation.navigate('Terms' as never);
                                        setShowModal(false);
                                      }
                                      }>
                                      Terms
                                    </Text>{' '}
                                    &{' '}
                                    <Text
                                      style={{
                                        color: 'green',
                                        fontWeight: 'bold',
                                        fontSize: 18,
                                      }}
                                      onPress={() => {
                                        navigation.navigate('Policy' as never);
                                        setShowModal(false)
                                      }
                                      }>
                                      Policy
                                    </Text>
                                  </Text>
                                  {showbutton === true ? (
                                    <Button
                                      style={{
                                        width: 80,
                                        height: 35,
                                        paddingTop: -1,
                                        paddingBottom: -10,
                                        backgroundColor: '#2F965F',
                                        marginTop: 30,
                                        marginLeft: 30,
                                      }}
                                      onPress={handleNextPress}>
                                      Next
                                    </Button>
                                  ) : (
                                    ''
                                  )}
                                </Box>
                              </Modal.Body>
                            </Modal.Content>
                          </Modal>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
        {profile && profile.is_purchase !== true ? (
          <View
          style={{
            flexDirection: 'row',
            width: width,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          {planList.map((item: any, index: any) => {
            return (
              <View
                key={item.id}
                style={{
                  width: currenIndex == index ? 10 : 8,
                  height: currenIndex == index ? 10 : 8,
                  borderRadius: currenIndex == index ? 5 : 4,
                  backgroundColor: currenIndex == index ? 'green' : 'grey',
                  marginLeft: 5,
                  marginTop: 25,
                }}></View>
            );
          })}
        </View>
        ) : ('')}
        
        {profile && profile.is_purchase !== true ? (
          profile.is_free_trial_valid === true && profile.is_free_trial === false ? (
            <Button
              style={{
                width: Dimensions.get('window').width * 0.95,
                backgroundColor: '#2F965F',
                marginTop: 55,
              }}
              onPress={() => modalFunction('freeTrial', undefined)}>
              Start 14 days free Trial
            </Button>
          ) : ('')
        ) : ('')}
        {/* <Button style={styles.btn1}>
        <Text style={styles.txt1}>Change Plan</Text>
      </Button> */}
        {profile && profile.is_purchase === true ? (
          <>
            <View style={styles.divider} /><Button style={styles.btn1} onPress={() => changePlanApi()}>
              <View style={styles.btn}>
                <Text style={styles.txt1}>Change Plan</Text>
                <Icon name="chevron-right" style={{ paddingHorizontal: 10, paddingBottom: -10 }} size={30} color={'white'} />
              </View>
            </Button>
          </>
        ) : ('')}
        {changeSubscription.length !== 0 ? (
          changeSubscription.map((item: any, index: any) => {
            return (
              <>
                <Text style={styles.txt2}>
                  This Below Plan will get activated automatically when current plan will expire.
                </Text>
                <View
                  key={index}
                  style={{
                    width: width,
                    height: height / 3,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 30
                  }}>
                  <View
                    style={{
                      width: Dimensions.get('window').width * 0.90,
                      borderRadius: 20,
                      elevation: 3,
                      borderWidth: 1,
                      borderColor: 'grey',
                      backgroundColor: 'white',
                      shadowOffset: { width: 1, height: 1 },
                      shadowColor: '#333',
                      shadowOpacity: 0.3,
                      shadowRadius: 2,
                      marginHorizontal: 35,
                      marginVertical: 25,
                    }}>
                    <View
                      style={{
                        width: '91%',
                        borderRadius: 16,
                        elevation: 3,
                        borderColor: '#FFF',
                        backgroundColor: 'grey',
                        shadowOffset: { width: 1, height: 1 },
                        shadowColor: '#333',
                        shadowOpacity: 0.3,
                        shadowRadius: 2,
                        marginHorizontal: 15,
                        marginVertical: 15,
                      }}>
                      <Heading
                        style={{
                          color: '#fff',
                          marginTop: 17,
                          textAlign: 'center',
                          fontSize: 25,
                          marginBottom: -3,
                        }}>
                        {item.title}
                      </Heading>
                      <Text
                        style={{
                          color: '#fff',
                          marginHorizontal: 12,
                          marginBottom: 10,
                          paddingLeft: 50,
                          textAlign: 'center',
                          paddingTop: 35,
                          fontSize: 40,
                          fontWeight: 'bold',
                        }}>
                        £{item.price}
                        <Text
                          style={{
                            color: '#fff',
                            marginBottom: 10,
                            textAlign: 'center',
                            fontSize: 18,
                          }}>
                          Yearly
                        </Text>{' '}
                      </Text>
                      <Text
                        style={{
                          color: 'white',
                          textAlign: 'center',
                        }}>
                        Validation From : {covertTimeToTwelveHourFormat(planList[0].subscription_end)}
                      </Text>
                      <Text
                        style={{
                          color: '#fff',
                          marginHorizontal: 12,
                          textAlign: 'center',
                          paddingTop: 20,
                          paddingBottom: 20,
                          fontSize: 12,
                        }}>
                        {item.title === 'Gold' ? 'This plan is for Yearly' : item.description}
                      </Text>
                    </View>
                  </View>
                </View></>
            )
          })
        ) : ('')}
      </View>
    </ScrollView>

  );
};
export default Subscription;
const styles = StyleSheet.create({
  divider: {
    width: '100%',
    marginTop: 20,
    backgroundColor: 'green',
    height: 2,
  },
  btn: {
    flexDirection: 'row',
  },
  btn1: {
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.06,
    marginTop: 20,
    backgroundColor: 'grey',
  },
  txt1: {
    fontSize: 18,
    color: 'white',
    marginRight: 230,
    marginLeft: 15
  },
  txt2: {
    width: Dimensions.get('window').width * 0.95,
    color: 'black',
    marginVertical: 17,
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
  },
  switch: {
    marginLeft: 230,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  freeTrial: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  freeTrialText: {
    color: 'red',
  }
});
