import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Box,
  Button,
  Center,
  FlatList,
  Flex,
  HStack,
  Pressable,
  Spacer,
  Text,
  VStack,
  useToast,
} from 'native-base';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ApiRequestAsync, ErrorToast, getUkTime } from '../../../services/httpServices';

import {
  setEmergencyUserContact,
  setLoading,
  setNotificationList,
} from '../../../redux/reducers/authReducer';
import Loader from '../../../Components/Loader';
const Notifications = () => {
  const navigation = useNavigation();
  const { token, notificationList, isLoading } = useSelector(
    (state: any) => state.AuthReducer,
  );
  const dispatch = useDispatch();
  const toast = useToast();
  const id = 'test-toast';

  const fetchNotification = async () => {
    let data = new FormData();
    // dispatch(setLoading(true));
    data.append('type', 0);
    ApiRequestAsync('POST', '/user/notification-list', data, token)
      .then(async (data: any) => {
       
        if (
          data?.data?.list !== undefined &&
          Object.keys(data.data.list).length !== 0
        ) {
          dispatch(setNotificationList(data.data.list));
        }
        // dispatch(setLoading(false));
      })
      .catch(error => {
        console.log(error);
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    fetchNotification();

    const interval = setInterval(() => {
      fetchNotification();
    }, 10000);

    return () => clearInterval(interval);

  }, []);

  function getTimeAgo(created_on: string) {
    var now: any = new Date();
    const ukTime: any = getUkTime();
    var dateTime: any = new Date(created_on);
    var diff = Math.floor((ukTime - dateTime) / 1000); // Difference in seconds

    if (diff < 60) {
      return diff + ' second ago';
    }

    var minutes = Math.floor(diff / 60);
    if (minutes < 60) {
      return minutes + ' minute ago';
    }

    var hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return hours + ' hour ago';
    }

    var days = Math.floor(hours / 24);
    if (days === 1) {
      return 'yesterday';
    }

    return days + ' days ago';
  }

  const getRelationalTime = (createdOn: any) => {
    const ukTime: any = getUkTime();
    const createdTime: any = new Date(createdOn);
    const timeDifference = ukTime - createdTime;
    const secondsDifference = Math.floor(timeDifference / 1000);
  
    if (secondsDifference < 60) {
      return `${secondsDifference} seconds ago`;
    } else if (secondsDifference < 3600) {
      const minutesDifference = Math.floor(secondsDifference / 60);
      return `${minutesDifference} minutes ago`;
    } else if (secondsDifference < 86400) {
      const hoursDifference = Math.floor(secondsDifference / 3600);
      return `${hoursDifference} hours ago`;
    } else {
      const daysDifference = Math.floor(secondsDifference / 86400);
      if (daysDifference === 1) {
        return 'yesterday';
      }
      return `${daysDifference} days ago`;
    }
  }

  const renderItem = useCallback(
    (item: any) => (
      <Box
        borderBottomWidth="1"
        _dark={{
          borderColor: 'muted.50',
        }}
        borderColor="muted.800"
        ml={['2', '2']}
        mr={['2', '2']}
        pl={['2', '2']}
        pr={['2', '2']}
        py="2">
        <HStack space={[1, 1]} justifyContent="space-between">
          <Image
            source={require('../../../Assets/icons/PinPointEye.png')}
            style={styles.image}
          />
          <VStack flexShrink={1} flexGrow={1}>
            <Text
              _dark={{
                color: 'warmGray.50',
              }}
              fontSize={15}
              color="coolGray.800"
              numberOfLines={2}
              ellipsizeMode="tail">
              {item.item.title !== undefined ? item.item.title : ''}
            </Text>
          </VStack>
          <Spacer />
        </HStack>
        <HStack justifyContent="flex-end">
          <VStack>
            <Text
              color="coolGray.600"
              _dark={{
                color: 'warmGray.200',
              }}>
              {item.item.created_on !== undefined
                ? getRelationalTime(item.item.created_on)
                : ''}
            </Text>
          </VStack>
        </HStack>
      </Box>
    ),
    [notificationList],
  );

  return (
    <>
      {isLoading && <Loader isLoading={isLoading} />}
      {notificationList.length > 0 ? (
        <View style={styles.Container}>
          <Box style={{ paddingBottom: 10, width: '100%', height: Dimensions.get('window').height - 100 }}>
            <FlatList
              data={notificationList}
              renderItem={renderItem}
              updateCellsBatchingPeriod={5}
              maxToRenderPerBatch={5}
              initialNumToRender={50}
              onEndReachedThreshold={16}
            />
          </Box>
        </View>
      ) : (
        <View style={styles.viewStyle} >
          <Text style={styles.text}>No data found!</Text>
        </View>
      )}
    </>
  );
};

export default Notifications;

const styles = StyleSheet.create({
  Container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  text: {
    color: 'grey',
  },
  image: {
    width: 20,
    height: 25,
    resizeMode: 'contain',
    padding: 2.5,
    marginRight: 10,
  },
  subText: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  viewStyle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white'
  }
});
