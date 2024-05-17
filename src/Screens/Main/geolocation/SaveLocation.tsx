import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Dimensions,
  View,
  TouchableOpacity,
  Image
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import SwitchHeader from '../../../Components/SwitchHeader';
import CustomButton from '../../../Components/CustomButton';
import { Button, Text } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import ConfimLocationModal from './ConfimLocationModal';
import { useDispatch, useSelector } from 'react-redux';
import { addCategoryList, resetApplink, setLoading, setLocationSave, setUserLocation, updateSavedLocation } from '../../../redux/reducers/authReducer';
import { ApiRequestAsync, checkLocationPermission, geoEncodedAddress, geoEncodedCompleteAddress } from '../../../services/httpServices';
import CustomInput from '../../../Components/CustomInput';
// Function to get permission for location
import { Box } from 'native-base';
import Search1 from 'react-native-vector-icons/AntDesign';


const SaveLocation = () => {
  const Nav = useNavigation();
  const dispatch = useDispatch();

  const { appLink, savedLocation, token, emergencyLocation, categoryList } = useSelector((state: any) => state.AuthReducer);
  const [open, setOpen] = useState(false);
  const [isSaveopen, setIsSaveopen] = useState(false);
  const mapRefSaveLocation = useRef<MapView>(null);
  const [mapLocation, setMapLocation] = useState<any>({
    latitude: savedLocation.latitude !== '' ? Number(savedLocation.latitude) : emergencyLocation.latitude
      ? Number(emergencyLocation.latitude)
      : 13.406,
    longitude: savedLocation.longitude !== '' ? Number(savedLocation.longitude) : emergencyLocation.longitude
      ? Number(emergencyLocation.longitude)
      : 123.3753,
    latitudeDelta: 0.005, // Adjust this value to control zoom
    longitudeDelta: 0.005,
  });
  const [savedPosition, setSavedPosition] = useState({
    latitude: 0, longitude: 0, address: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',

  });
  const [terrain, setTerrain] = useState<string>('standard');
  const timerRef = useRef<any>(null);

  const fromContactAddress = async () => {
    setTimeout(async () => {
      setMapLocation({
        latitude:
          appLink.latitude !== null && appLink.latitude !== ''
            ? Number(appLink.latitude)
            : 13.406,
        longitude:
          appLink.longitude !== null && appLink.latitude !== ''
            ? Number(appLink.longitude)
            : 123.3753,
        latitudeDelta: 0.005, // Adjust this value to control zoom
        longitudeDelta: 0.005,
      });
      mapRefSaveLocation.current?.animateToRegion({
        latitude:
          appLink.latitude !== null && appLink.latitude !== ''
            ? Number(appLink.latitude)
            : 13.406,
        longitude:
          appLink.longitude !== null && appLink.latitude !== ''
            ? Number(appLink.longitude)
            : 123.3753,
        latitudeDelta: 0.005, // Adjust this value to control zoom
        longitudeDelta: 0.005,
      });
      const completeAddress = await geoEncodedCompleteAddress({ latitude: appLink.latitude, longitude: appLink.longitude });
      setSavedPosition(pre => ({ ...pre, latitude: appLink.latitude, longitude: appLink.longitude, address: completeAddress.formattedAddress }))
   
    }, 100);
  }

  useEffect(() => {

    if (open) return
    if (appLink.longitude === '') {
      if (savedLocation && !open && !isSaveopen && savedLocation.latitude) {
        // Move the map to the updated location
      //   dispatch(setLoading(true));
        setTimeout(() => {
          setMapLocation({
            latitude:
              savedLocation.latitude
                ? Number(savedLocation.latitude)
                : 13.406,
            longitude:
              savedLocation.longitude
                ? Number(savedLocation.longitude)
                : 123.3753,
            latitudeDelta: 0.005, // Adjust this value to control zoom
            longitudeDelta: 0.005,
          });
          mapRefSaveLocation.current?.animateToRegion({
            latitude:
              savedLocation.latitude
                ? Number(savedLocation.latitude)
                : 13.406,
            longitude:
              savedLocation.longitude
                ? Number(savedLocation.longitude)
                : 123.3753,
            latitudeDelta: 0.005, // Adjust this value to control zoom
            longitudeDelta: 0.005,
          });
          setSavedPosition(pre => ({ ...pre, latitude: savedLocation.latitude, longitude: savedLocation.longitude, address: savedLocation.address }))
      //     dispatch(setLoading(false));
        }, 10);

      }
    } else {
      fromContactAddress()
    }
  }, [savedLocation.latitude]);


  useEffect(() => {

    if (appLink.longitude !== '' && categoryList.length === 0) {
      getCategoryData();
    }
    if (savedLocation.address || appLink.longitude) return
    getLocation();
  }, []);

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
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) { }
  };


  useFocusEffect(
    useCallback(() => {
      Nav.setOptions({
        headerRight: () => <SwitchHeader setTerrain={setTerrain} />,
      });
    }, []),
  );


  const requestLocationPermission = async () => {
    try {
      const granted = await checkLocationPermission();
      if (granted) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log('Error occurred while requesting location permission:', error);
      return false;
    }
  };

  // function to check permissions and get Location
  const getLocation = async () => {

    if (!savedLocation.address) {
      const result = requestLocationPermission();
      result.then(res => {
        if (res) {
          Geolocation.getCurrentPosition(
            async position => {
              let latitude = position.coords.latitude.toString();
              let longitude = position.coords.longitude.toString();
              // const address = await geoEncodedAddress({latitude, longitude});
              const completeAddress = await geoEncodedCompleteAddress({ latitude, longitude });
              setSavedPosition((pre) => ({
                ...pre,
                address: completeAddress.formattedAddress
              }))
              mapRefSaveLocation.current?.animateToRegion({
                latitude:
                  latitude !== null && latitude !== ''
                    ? Number(latitude)
                    : 13.406,
                longitude:
                  longitude !== null && latitude !== ''
                    ? Number(longitude)
                    : 123.3753,
                    latitudeDelta: 0.005, // Adjust this value to control zoom
                    longitudeDelta: 0.005,
              });
              dispatch(updateSavedLocation({ ['latitude']: latitude, ['longitude']: longitude, ['address']: completeAddress.formattedAddress }));
              dispatch(
                setUserLocation({
                  ['street']: completeAddress.street,
                  ['city']: completeAddress.city,
                  ['state']: completeAddress.state,
                  ['postalCode']: completeAddress.postalCode,
                  ['country']: completeAddress.country,
                  ['isoCountryCode']: completeAddress.isoCountryCode,
                  ['formattedAddress']: completeAddress.formattedAddress,
                }),
              );
            },
            error => {
              console.log(error.code, error.message);
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
          );
        }
      });
    }

  };

  const confirmLocationModalFunc = async () => {
    dispatch(
      updateSavedLocation({
        ['latitude']: savedPosition.latitude,
        ['longitude']: savedPosition.longitude,
        ['address']: savedPosition.address,
      }),
      );
      dispatch(
        setUserLocation({
          ['street']: savedPosition.street,
          ['city']: savedPosition.city,
          ['state']: savedPosition.state,
          ['postalCode']: savedPosition.postalCode,
          ['country']: savedPosition.country,
          ['formattedAddress']: savedPosition.address,
        }),
        );
        await setOpen(true);
  };

  const confirmLocationSavedModalFunc = () => {

      dispatch(
        updateSavedLocation({
          ['latitude']: savedPosition.latitude,
          ['longitude']: savedPosition.longitude,
          ['address']: savedPosition.address,
        }),
      );
      dispatch(
        setUserLocation({
          ['street']: savedPosition.street,
          ['city']: savedPosition.city,
          ['state']: savedPosition.state,
          ['postalCode']: savedPosition.postalCode,
          ['country']: savedPosition.country,
          ['formattedAddress']: savedPosition.address,
        }),
      );
  
    setIsSaveopen(true);
  };


  const handleNavigation = () => {
    dispatch(setLocationSave(true));
    Nav.navigate('Search' as never)
  } 
  const [firstTime, setFirstTime] = useState(true);

  const handleMapRegionChangeComplete = async (region: any) => {
    // Update the map center coordinate

    if(firstTime){
      setTimeout(()=>{
        setFirstTime(false)
      },500)
      return
    }

    clearTimeout(timerRef.current);
    const { latitude, longitude } = region
  
    const completeAddress = await geoEncodedCompleteAddress({ latitude, longitude });
    setSavedPosition({
      ['latitude']: latitude,
      ['longitude']: longitude,
      ['address']: completeAddress.formattedAddress,
      ['street']: completeAddress.street,
      ['city']: completeAddress.city,
      ['state']: completeAddress.state,
      ['postalCode']: completeAddress.postalCode,
      ['country']: completeAddress.country,
    })
 
  };

  return (
    <>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: Dimensions.get('window').width * 0.90,
          borderRadius: 5,
          alignSelf: 'center',
          borderWidth: 1,
          borderStyle: 'solid',
          borderColor: 'black',
          padding: 10,
          backgroundColor: 'white',
          marginTop: 20,
          position: "absolute",
          zIndex: 999
        }}>
        <TouchableOpacity
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center'
          }}
          onPress={handleNavigation}>
          <Icon
            name="search-web"
            size={25}
            style={{ paddingRight: 4 }}
          />
          <Text
            style={{ fontSize: 18, width: Dimensions.get('window').width * 0.75, color: "black" }}>
            {savedPosition && savedPosition.address.substring(0, 60)}
          </Text>
        </TouchableOpacity>
      </Box>
      <MapView
        ref={mapRefSaveLocation}
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={handleMapRegionChangeComplete}
        style={styles.map}
        initialRegion={mapLocation}
        mapType={terrain !== 'standard' ? 'standard' : 'satellite'}
        showsUserLocation={false}
        loadingEnabled={true}
      >

      </MapView>

      <View style={styles.iconContainer}>
        <Image
          source={require('../../../Assets/icons/savelocationpin.png')}
          style={{ width: 25, height: 35 }}
        />
      </View>

      <View style={styles.btnContainer}>
        <Button
          style={styles.btn}
          size="lg"
          mt="2"
          colorScheme="tertiary"
          onPressIn={confirmLocationModalFunc}>
          <Text style={styles.buttonText}>Save Location</Text>
        </Button>
        <Button
          style={styles.btn}
          size="lg"
          mt="2"
          colorScheme="tertiary"
          leftIcon={
            <Icon
              name="plus"
              size={25}
              color={'white'}
            />
          }
          onPress={confirmLocationSavedModalFunc}>
          <Text style={styles.buttonText}>Add to Contacts</Text>
        </Button>
      </View>

      {open && <ConfimLocationModal isOpen={open} setOpen={setOpen} fromSaved={true} fromAddLocation={"fromAddLocation"} />}
      {isSaveopen && <ConfimLocationModal isOpen={isSaveopen} setOpen={setIsSaveopen} fromSaved={true} fromAddLocation={"SavedLocation"} />}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    flex: 2,
    width: Dimensions.get('window').width,
  },
  btnContainer: {
    width: Dimensions.get('window').width,
    position: 'absolute',
    bottom: 50,
  },
  btn: {
    width: Dimensions.get('window').width * 0.95,
    alignSelf: 'center',
    borderRadius: 8,
  },
  iconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30, // adjust this value based on the height of your icon
    marginLeft: -12, // adjust this value based on the width of your icon
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16
  }

});
export default SaveLocation;
