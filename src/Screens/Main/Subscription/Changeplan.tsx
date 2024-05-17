import { View, Text, StyleSheet, Dimensions, FlatList, } from 'react-native'
import { Button, Heading, Modal, Box, Checkbox, ScrollView, useToast } from 'native-base';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setChangeSub, setChangeSubscription, setLoading } from '../../../redux/reducers/authReducer';
import { ApiRequestAsync, ErrorToast } from '../../../services/httpServices';
import { NavigationProp, useNavigation } from '@react-navigation/native';

const Changeplan = () => {
  const { height, width } = Dimensions.get('window');
  const { token, changePlanList } = useSelector((state: any) => state.AuthReducer);
  const [currenIndex, setCurrentIndex] = useState<any>(0);
  const dispatch = useDispatch();
  const toast = useToast();
  const toastId = "test-toast";
  const navigation: NavigationProp<ReactNavigation.RootParamList> = useNavigation();
  
  const modalFunction = async (id: number) => {
    try {
      dispatch(setLoading(true));
    
      await ApiRequestAsync('GET', `/user/change-subscription?plan_id=${id}`, {}, token)
        .then(response => {
         
          console.log('changesubscriptionPlan', response);

          dispatch(setLoading(false));
          if(changePlanList.length > 1) {
            const filteredPlanList = changePlanList.filter((item: any) => item.id === id)
            dispatch(setChangeSubscription(filteredPlanList));
          } else {
            dispatch(setChangeSubscription(changePlanList));
          }
          dispatch(setChangeSub(true));
          if (response.data?.message !== undefined) {
            let errorMessage = response.data?.message;
            if (!toast.isActive(toastId)) {
              ErrorToast({ toast, id: toastId, errorMessage });
            }
            navigation.goBack();
          }
        })
        .catch(error => {
          console.log(error)
          dispatch(setLoading(false));
        })
    } catch (error) {
      console.log(error);
      dispatch(setLoading(false));
    }
  }

  return (
    <>
      <View>
        <FlatList
          data={changePlanList}
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
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View
                    style={{
                      width: Dimensions.get('window').width * 0.75,
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
                        width: '91%',
                        height: 350,
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
                        alignItems: 'center',
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
                      <Text
                        style={{
                          color: '#fff',
                          textAlign: 'center',
                          fontSize: 12,
                        }}>
                        {item.title === 'Gold' ? 'This plan is for Yearly' : item.description}
                      </Text>
                      <Button
                        style={{
                          width: Dimensions.get('window').width * 0.55,
                          alignSelf: 'center',
                          backgroundColor: 'white',
                        }}
                        onPress={() => modalFunction(item.id)}>
                        <Text
                          style={{
                            color: 'green',
                            fontSize: 18,
                          }}>
                          Add
                        </Text>
                      </Button>
                    </View>
                  </View>
                </View>
              </View>
            );
          }} />
      </View><View
        style={{
          flexDirection: 'row',
          width: width,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        {changePlanList.map((item: any, index: any) => {
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
    </>
  )
}

export default Changeplan
const styles = StyleSheet.create({
  container: {
   
    backgroundColor: 'white'
  }
});