import { View, StyleSheet, Dimensions } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { colorSecondary } from '../../../Style/GlobalStyles/GlobalStyle';
import {
  addSentToMeList,
  getsharedLocations,
  setCategoryLocation,
  setLoading,
  setRequestLocation,
} from '../../../redux/reducers/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import { ApiRequestAsync, ApiRequestWithParamAsync, BaseURL, ErrorToast } from '../../../services/httpServices';
import {
  Avatar,
  Box,
  FlatList,
  HStack,
  Text,
  VStack,
  useToast,
  IconButton,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const RequestLocation = () => {
  const { token, requestLocation, fromLocationSave, categoryLocation } = useSelector(
    (state: any) => state.AuthReducer,
  );


  const toast = useToast();
  const toastid = 'test-toast';

  const dispatch = useDispatch();

  useEffect(() => {
    if (!fromLocationSave) {
      getLocationReqList();
    } else {
      getLocationCatList();
    }
  }, []);

  const getLocationList = async () => {
    try {
      await ApiRequestAsync('GET', '/location/list?type=2', {}, token)
        .then(response => {
          dispatch(addSentToMeList(response.data.list));
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  const getLocationCatList = async () => {
    try {
      dispatch(setLoading(true));
      await ApiRequestAsync('GET', '/location/request-list', {}, token)
        .then(response => {
       
          dispatch(setLoading(false));
          dispatch(setCategoryLocation(response.data?.list));
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

  const getLocationReqList = async () => {
    try {
      dispatch(setLoading(true));
      await ApiRequestAsync('GET', '/contact/location-request-list', {}, token)
        .then(response => {
          dispatch(setRequestLocation(response.data?.list));
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

  const getLatLong = () => {
    ApiRequestAsync('GET', '/contact/get-lat-long', {}, token)
      .then(response => {
        if (response.data.list) {
          dispatch(getsharedLocations(response.data.list))
        }
      })
      .catch(error => {
        // dispatch(setLoading(false));
        console.log(error);
      })
  }

  const getAcceptReject = async (state_id: number, id: number) => {
    try {
      dispatch(setLoading(true));
      if (!fromLocationSave) {
        await ApiRequestAsync(
          'GET',
          `/contact/accept-reject?id=${id}&state_id=${state_id}`,
          {},
          token,
        )
          .then(response => {
         
            dispatch(setLoading(false));
            let errorMessage = response?.data?.message;
            if (!toast.isActive(toastid)) {
              ErrorToast({ toast, id: toastid, errorMessage })
            }

            getLocationReqList();
            getLatLong()
          })
          .catch(error => {
            console.log(error);
            dispatch(setLoading(false));
          });
      } else {
        await ApiRequestWithParamAsync(
          'GET',
          `/location/accept-reject`,
          { request_id: id, state_id: state_id },
          token,
        )
          .then(response => {
       
            dispatch(setLoading(false));
            getLocationCatList()
            getLocationList()
            let errorMessage = response?.data?.message;
            if (!toast.isActive(toastid)) {
              ErrorToast({ toast, id: toastid, errorMessage })
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

  const renderItem = useCallback(
    (item: any) => (
      !fromLocationSave ? (
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
          <HStack
            space={[3, 3]}
            justifyContent="space-between"
            alignItems="center">
            <View style={{ flexDirection: "row" }} >
              <Avatar
                size="38px"
                source={{
                  uri:
                    item?.item.from_user_image !== undefined &&
                      item?.item.from_user_image !== ''
                      ? `${BaseURL}${item?.item.from_user_image}`
                      : 'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=',
                }}
              />
              <VStack>
                <Text
                  _dark={{
                    color: 'warmGray.50',
                  }}
                  color="coolGray.800"
                  textAlign="center"
                  style={{ marginLeft: 10, alignItems: "center", marginTop: 10 }}
                  bold>
                  {item?.item.from_user_name !== undefined
                    ? item?.item.from_user_name
                    : ''}
                </Text>
              </VStack>
            </View>
            <View style={{ flexDirection: "row" }} >
              <View style={styles.iconContainer}>
                <IconButton onPress={() => getAcceptReject(0, item?.item.id)} style={{ alignSelf: "center", paddingRight: 5 }} >
                  <Icon name="close" size={20} color="red" />
                </IconButton>
              </View>
              <View style={styles.iconContainerGreen}>
                <IconButton onPress={() => getAcceptReject(1, item?.item.id)} style={{ alignSelf: "center", paddingRight: 5 }}>
                  <Icon name="check" size={20} color="green" />
                </IconButton>
              </View>
            </View>
          </HStack>
        </Box>
      ) : (
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
          <HStack
            space={[3, 3]}
            justifyContent="space-between"
            alignItems="center">
            <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center' }} >
              <Avatar
                size="38px"
                source={{
                  uri:
                    'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=',
                }}
              />
              <View style={{ flex: 2, paddingHorizontal: 10 }} >
                <Text
                  _dark={{
                    color: 'warmGray.50',
                  }}
                  fontSize={15}
                  color="coolGray.800"
                  bold>
                  {item?.item.created_by_name} wants to share their {item?.item.category_name} list
                </Text>
              </View>
              <View style={{ flexDirection: "row" }} >
                <View style={styles.iconContainer}>
                  <IconButton onPress={() => getAcceptReject(0, item?.item.id)} style={{ alignSelf: "center", paddingRight: 5 }} >
                    <Icon name="close" size={20} color="red" />
                  </IconButton>
                </View>
                <View style={styles.iconContainerGreen}>
                  <IconButton onPress={() => getAcceptReject(1, item?.item.id)} style={{ alignSelf: "center", paddingRight: 5 }}>
                    <Icon name="check" size={20} color="green" />
                  </IconButton>
                </View>
              </View>
            </View>

          </HStack>
        </Box>
      )
    ),
    [requestLocation,categoryLocation],
  );

  return (
    requestLocation.length > 0 || categoryLocation.length > 0 ? (
      <FlatList
        data={!fromLocationSave ? requestLocation : categoryLocation}
        // keyExtractor={item => item.title as unknown as string}
        renderItem={renderItem}
        updateCellsBatchingPeriod={5}
        maxToRenderPerBatch={5}
        initialNumToRender={50}
        onEndReachedThreshold={16}
      />
    ) : (
      <View style={styles.container}>
        <Text style={styles.paraText}>No Request Found</Text>
      </View>
    ));
};

export default RequestLocation;

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paraText: {
    color: colorSecondary,
    fontSize: 13,
    // color: 'black',
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
  },
  viewStyles: {
    backgroundColor: 'white',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  closeStyle: {
    width: '100%',
    // marginLeft: 40,
  },
  iconContainer: {
    borderWidth: 1,
    borderColor: 'red', // or any other color for the close icon
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  iconContainerGreen: {
    borderWidth: 1,
    borderColor: 'green', // or any other color for the close icon
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
