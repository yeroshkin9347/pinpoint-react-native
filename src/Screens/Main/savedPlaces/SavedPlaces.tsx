import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {Box, Button, FormControl, useToast} from 'native-base';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {SceneMap, TabView} from 'react-native-tab-view';
import IconEntypo from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useDispatch, useSelector} from 'react-redux';
import CustomInput from '../../../Components/CustomInput';
import Loader from '../../../Components/Loader';
import {
  colorPrimary,
  colorSecondary,
} from '../../../Style/GlobalStyles/GlobalStyle';
import {
  addCategoryList,
  initial_category_data,
  setCategoryLocation,
  setLoading,
  setLocationSave,
  setreRerenderLocation,
  updateCategory,
  updateProfile,
} from '../../../redux/reducers/authReducer';
import {ApiRequestAsync, ErrorToast} from '../../../services/httpServices';
import MyLists from '../savedPlaces/MyLists';
import Senttome from '../savedPlaces/Sendtome';
import constantMessages from '../../../Constants';
import Geolocation from 'react-native-geolocation-service';
const initialLayout = {width: Dimensions.get('window').width};

const SavedPlaces = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    {key: 'first', title: 'My Lists'},
    {key: 'second', title: 'Sent to me'},
  ]);
  const mapRef = useRef<MapView>(null);
  const dispatch = useDispatch();
  const {emergencyLocation, token, categoryData, isLoading, rerenderLocation ,categoryLocation, categoryList } =
    useSelector((state: any) => state.AuthReducer);
  const toast = useToast();
  const id = 'test-toast';

  const openModal = () => {
    dispatch(updateCategory({...initial_category_data}));
    setModalVisible(true);
  };

  const closeModal = () => {
    dispatch(updateCategory({id: 0, title: ''}));
    setModalVisible(false);
  };

  const handleMapPress = (event: any) => {
    const {latitude, longitude} = event.nativeEvent.coordinate;
    dispatch(updateProfile({['latitude']: latitude, ['longitude']: longitude}));
  };

  const getCategoryData = () => {
    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('type', '0');
      ApiRequestAsync('GET', '/location/list?type=1', data, token)
        .then(async (data: any) => {
          dispatch(setLoading(false));

          if (data.data.list !== undefined) {
            dispatch(addCategoryList(data.data.list));
            setModalVisible(false);
          }
          // console.log(data);
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
          setModalVisible(false);
        });
    } catch (error) {}
  };

  useEffect(() => {
   if(categoryList.length === 0) {
    getCategoryData();
   }
  }, []);

  useEffect(() => {
    if (rerenderLocation) {
      getCategoryData();
      dispatch(setreRerenderLocation(false));
    }
  }, [rerenderLocation]);

  useEffect(() => {
    const fetchData = async () => {
      ApiRequestAsync('GET', '/location/request-list', {}, token)
        .then(response => {
          dispatch(setCategoryLocation(response.data?.list));
          dispatch(setLoading(false));
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    };

    fetchData();

    // Set interval to call the API every minute
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);


  const handleAddCategory = () => {
    try {
      if (!categoryData.title) {
        if (!toast.isActive(id)) {
          ErrorToast({
            toast,
            id,
            errorMessage: 'Please enter category',
            placement: 'top',
          });
        }
        return;
      }
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('Category[title]', categoryData.title);
      ApiRequestAsync('POST', '/location/add-category', data, token)
        .then(async (data_: any) => {
          // setErrorText(data.data)
          if (data_.data.detail !== undefined) {
            dispatch(updateCategory({title: ''}));
            await setModalVisible(false);
            getCategoryData();
          }
          dispatch(setLoading(false));
          if (!toast.isActive(id)) {
            ErrorToast({toast, id, errorMessage: data_.data.message});
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (e) {}
  };

  const [pin, setPin] = useState({
    latitude: 13.406,
    longitude: 123.3753,
  });

  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={() => {
              dispatch(setLocationSave(true));
              navigation.navigate('Location Requests' as never);
            }}>
            {/* <Icon
              name="map-marker-plus"
              style={{fontSize: 25, color: 'green'}}
            /> */}
            <View style={styles.iconcontainer}>
            <Icon
              name="map-marker-plus"
                style={{ fontSize: 30, color: colorPrimary, marginRight: -10 }}
              />
              {categoryLocation.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {categoryLocation.length}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        ),
      });
    }, [categoryLocation]),
  );

  useEffect(() => {
    if (emergencyLocation) {
      // Move the map to the updated location
      // mapRef.current?.animateToRegion({
      //   latitude:
      //     emergencyLocation.latitude !== null &&
      //     emergencyLocation.latitude !== ''
      //       ? Number(emergencyLocation.latitude)
      //       : 13.406,
      //   longitude:
      //     emergencyLocation.longitude !== null &&
      //     emergencyLocation.latitude !== ''
      //       ? Number(emergencyLocation.longitude)
      //       : 123.3753,
      //   latitudeDelta: 0.0922,
      //   longitudeDelta: 0.0421,
      // });
    }
  }, [emergencyLocation.latitude]);

  const renderTabBar = (props: any): React.ReactNode => {
    const inputRange = props.navigationState.routes.map((x: any, i: any) => i);
    return (
      <Box flexDirection="row" paddingLeft={1} paddingRight={1}>
        {props.navigationState.routes.map((route: any, i: any) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex: any) =>
              inputIndex === i ? 1 : 0.5,
            ),
          });
          const borderColor = index === i ? colorPrimary : colorSecondary;
          return (
            <View style={{ height: 35 ,width: "50%"}}  key={i}>
            <TouchableOpacity   
             onPress={() => {
              console.log(i);
              setIndex(i);
            }}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
             >
              <Box
              style={{backgroundColor: borderColor, borderRadius: 5, width: "100%"}}
            
              borderColor={borderColor}
              flex={1}
              alignItems="center"
              p="1.5">
           
                <Animated.Text
                  style={{
                    color: 'white',
                    fontSize: 15,
                    fontFamily: 'poppins',
                  }}>
                  {route.title}
                </Animated.Text>
            </Box>
            </TouchableOpacity>
          </View>
          );
        })}
      </Box>
    );
  };

  const handleChange = (data: any, name: string) => {
    try {
      dispatch(updateCategory({[name]: data}));
    } catch (error) {
      console.log(error);
    }
  };

  const renderScene = SceneMap({
    first: MyLists,
    second: Senttome,
  });

  const goToUsersLocation = () => {
    Geolocation.getCurrentPosition(info => {
      let latitude = info.coords.latitude.toString();
      let longitude = info.coords.longitude.toString();
      mapRef.current?.animateToRegion({
        latitude:
          emergencyLocation.latitude !== null &&
            emergencyLocation.latitude !== ''
            ? Number(emergencyLocation.latitude)
            : 13.406,
        longitude:
          emergencyLocation.longitude !== null &&
            emergencyLocation.latitude !== ''
            ? Number(emergencyLocation.longitude)
            : 123.3753,
        latitudeDelta: 500 / (111.32 * 1000),
        longitudeDelta:
          500 /
          (Math.cos(
            emergencyLocation.latitude !== null &&
              emergencyLocation.latitude !== ''
              ? Number(emergencyLocation.latitude)
              : 13.406,
          ) *
            111.32 *
            1000)
      });
      // const { longitude, latitude } = info.coords;
    });
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loader isLoading={isLoading} />}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        onPress={handleMapPress}
        style={styles.map}
        initialRegion={{
          latitude:
            emergencyLocation?.latitude !== null &&
            emergencyLocation?.latitude !== ''
              ? Number(emergencyLocation?.latitude)
              : 13.406,
          longitude:
            emergencyLocation?.longitude !== null &&
            emergencyLocation?.longitude !== ''
              ? Number(emergencyLocation?.longitude)
              : 123.3753,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        mapType={'standard'}
        // showsUserLocation={true}
        >
       <Marker
          coordinate={{
            latitude: Number(emergencyLocation?.latitude),
            longitude: Number(emergencyLocation?.longitude),
          }}
          title="Selected Location">
          <View>
            <Image
              source={require('../../../Assets/icons/blue.png')}
              style={styles.image}
            />
          </View>
        </Marker>
      </MapView>
      <TouchableOpacity
        style={styles.myLocationButton}
        onPress={goToUsersLocation}>
        <Image
          source={require('../../../Assets/icons/currentLocation.png')}
          style={styles.image1}
        />
      </TouchableOpacity>

      <View style={styles.container_form}>
        <View style={styles.header}>
          <Text style={styles.textHeading}>{constantMessages.SavedPlaces}</Text>
          <Pressable onPress={openModal}>
            <Icon
              name="plus"
              style={{paddingHorizontal: 20}}
              size={25}
              color={'black'}
            />
          </Pressable>
        </View>
        <TabView
          style={styles.content}
          navigationState={{index, routes}}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          renderTabBar={renderTabBar}
          swipeEnabled={false}
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior="padding" style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header_Modal}>
              <Text style={styles.txt}>{constantMessages.SavedPlaceModaltxt}</Text>
              <View style={{marginTop: 20}}>
                <IconEntypo
                  name="cross"
                  size={25}
                  color="red"
                  onPress={closeModal}
                />
              </View>
            </View>
            {/* <Modal.CloseButton onClose={() => setOpen(false)} /> */}
            <FormControl style={{marginBottom: 30}}>
              <CustomInput
                variant="outline"
                fontSize="lg"
                placeholder=""
                InputLeftElementIcon=""
                focusOutlineColor={'coolGray.300'}
                value={categoryData && categoryData.title}
                // onChangeText={() => {}}
                onChangeText={(text: any) => handleChange(text, 'title')}
                focusbackgroundColor={'coolGray.100'}
                passwordState={false}
                isDisabled={false}
                setpasswordState={() => {}}
                type={'text'}
                keyboardType={'default'}
                InputRightElementFunction={() => {}}
                maxLength={100}
                InputRightElementIcon={''}
              />
            </FormControl>
            <Button
              colorScheme="tertiary"
              style={styles.button}
              onPress={handleAddCategory}>
              Save
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
  },
  map: {
    flex: 2,
    width: Dimensions.get('window').width,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  textHeading: {
    paddingLeft : 10,
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    width: Dimensions.get('window').width * 0.98,
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  paraText: {
    color: colorSecondary,
    fontSize: 13,
    alignSelf: 'center',
    top: 70,
    fontFamily: 'Poppins-Regular',
  },
  container_form: {
    height: Dimensions.get('window').height * 0.35,
    padding: 20,
    backgroundColor: 'white',
  },
  bottom: {
    marginBottom: 1,
    marginTop: 'auto',
    width: '100%',
  },
  button: {
    width: Dimensions.get('window').width * 0.95,
    alignSelf: 'center',
    bottom: 10,
  },
  txt: {
    color: 'black',
    paddingHorizontal: 10,
    paddingVertical: 20,
    fontSize: 19,
    fontWeight: 'bold',
  },
  header_Modal: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  iconcontainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: Dimensions.get('window').height * 0.35 + 10,
    right: 2,
    // top:100,
    borderRadius: 30,
    zIndex: 999,
  },
  image1: {
    width: 40,
    height: 40,
    padding: 2.5,
    marginRight: 10,
  },
  image: {
    width: 40,
    height: 40,
    padding: 2.5,
    marginRight: 10,
  },
});

export default SavedPlaces;
