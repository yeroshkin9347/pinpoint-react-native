import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  PermissionsAndroid,
  Dimensions,
  Platform,
  View,
  TouchableOpacity,
  Pressable,
  Image
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import SwitchHeader from '../../../Components/SwitchHeader';
import CustomButton from '../../../Components/CustomButton';
import { FormControl, Input, Modal, Button, Box, ScrollView } from 'native-base';
import Feather from 'react-native-vector-icons/Feather';
import ConfimLocationModal from './ConfimLocationModal';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, updateMapLocation, updateProfile } from '../../../redux/reducers/authReducer';
import {
  checkLocationPermission,
  geoEncodedAddress,
} from '../../../services/httpServices';
import CustomInput from '../../../Components/CustomInput';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// Function to get permission for location

const GeoLocation = () => {
  const Nav = useNavigation();
  const dispatch = useDispatch();

  const [terrain, setTerrain] = useState<string>('standard');
  const {profile , mapLocation , emergencyLocation} = useSelector((state: any) => state.AuthReducer);
  const [open, setOpen] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const [savedPosition, setSavedPosition] = useState({
    latitude: 0,
    longitude: 0,
    address: '',
  });
  const mapInitialLocation = {
    latitude:
    profile.current_latitude  &&
      profile.current_latitude !==  "N/A"
      ? Number(profile.current_latitude)
      : 13.406,
  longitude:
    profile.current_longitude !== null &&
      profile.current_longitude !==  "N/A"
      ? Number(profile.current_longitude)
      : 123.3753,
  latitudeDelta: 0.005, // Adjust this value to control zoom
  longitudeDelta: 0.005,
  }
  const mapRefGeoLocation = useRef<MapView>(null);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (open) return
    const fetchData = async () => {
       if (mapLocation.latitude) {
        mapRefGeoLocation.current?.animateToRegion({
          latitude:
            mapLocation.latitude !== null && mapLocation.latitude !== ''
              ? Number(mapLocation.latitude)
              : 13.406,
          longitude:
            mapLocation.longitude !== null && mapLocation.latitude !== ''
              ? Number(mapLocation.longitude)
              : 123.3753,
              latitudeDelta: 0.005, // Adjust this value to control zoom
              longitudeDelta: 0.005,
        });
        setSavedPosition({
          latitude: mapLocation.latitude,
          longitude: mapLocation.longitude,
          address: mapLocation.address,
        });
        dispatch(updateMapLocation({ latitude : "", longitude : "", address : "" }));
      }
    }

    fetchData()
  }, [ mapLocation.latitude]);

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (profile.current_latitude && profile.current_latitude !== "N/A") {
        dispatch(setLoading(true));
        setTimeout(() => {
          mapRefGeoLocation.current?.animateToRegion({
            latitude:
              profile.current_latitude !== null && profile.current_latitude !== ''
                ? Number(profile.current_latitude)
                : 13.406,
            longitude:
              profile.current_longitude !== null && profile.current_longitude !== ''
                ? Number(profile.current_longitude)
                : 123.3753,
                latitudeDelta: 0.005, // Adjust this value to control zoom
                longitudeDelta: 0.005,
          });
          setSavedPosition({
            latitude: profile.current_latitude,
            longitude: profile.current_longitude,
            address: profile.address,
          });
          dispatch(setLoading(false));
          dispatch(updateMapLocation({ latitude : "", longitude : "", address : "" }));
        }, 10);
     }
   }

   fetchData()
    
  }, [profile.current_latitude])
  

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
      console.log(
        'Error occurred while requesting location permission:',
        error,
      );
      return false;
    }
  };

  // function to check permissions and get Location
  const getLocation = async () => {
    if (!profile.current_latitude || profile.current_latitude == "N/A") {
    const result = requestLocationPermission();
    result.then(res => {
      if (res) {
        Geolocation.getCurrentPosition(
          async (position) => {
            let latitude = position.coords.latitude.toString()
            let longitude = position.coords.longitude.toString()
            const completeAddress = await geoEncodedAddress({ latitude, longitude });
            setSavedPosition({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: completeAddress,
            });
            mapRefGeoLocation.current?.animateToRegion({
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
  const confirmLocationModalFunc = () => {
    // if (savedPosition.address !== profile.address) {
    //   dispatch(
    //     updateProfile({
    //       ['latitude']: savedPosition.latitude,
    //       ['longitude']: savedPosition.longitude,
    //       ['address']: savedPosition.address,
    //     }),
    //   );
    // }

    setOpen(true);
  };

  const handleMapRegionChangeComplete = (region: any) => {
    // Update the map center coordinate

    if(firstTime){
      setTimeout(()=>{
        setFirstTime(false)
      },500)
      return
    }
  
    clearTimeout(timerRef.current);
    const { latitude, longitude } = region;
    timerRef.current = setTimeout(async () => {
      const completeAddress = await geoEncodedAddress({ latitude, longitude });
      setSavedPosition({
        ['latitude']: latitude,
        ['longitude']: longitude,
        ['address']: completeAddress,
      });
    }, 200);
  };

  return (
    <>
      <Pressable style={{
        alignSelf: 'center',
        padding: 10,
        marginTop: 10,
        position: "absolute",
        zIndex: 999
      }}
        onPress={() => Nav.navigate('Search' as never)} >
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
          }}
        >
          <TouchableOpacity
            style={{
              display: 'flex',
              flexDirection: 'row',
            }}
            onPress={() => Nav.navigate('Search' as never)}
          >
            <Icon
              name="search-web"
              size={25}
              style={{ paddingRight: 4, width: Dimensions.get('window').width * 0.1 }}
            />
            <Text
              style={{
                fontSize: 18,
                width: Dimensions.get('window').width * 0.75,
                color: "black"
              }}>
              {savedPosition && savedPosition.address}
            </Text>
          </TouchableOpacity>
        </Box>
      </Pressable>

      <MapView
        ref={mapRefGeoLocation}
        provider={PROVIDER_GOOGLE}
        onRegionChangeComplete={handleMapRegionChangeComplete}
        style={styles.map}
        initialRegion={mapInitialLocation}
        mapType={terrain !== 'standard' ? 'standard' : 'satellite'}
        showsUserLocation={false}
        loadingEnabled={true}
        ></MapView>
      <View style={styles.iconContainer}>
      <Image
          source={require('../../../Assets/icons/savelocationpin.png')}
          style={{ width: 25, height: 35 }}
        />
      </View>

      <Button
        style={styles.btn}
        size="lg"
        position={'absolute'}
        mt="2"
        colorScheme="tertiary"
        onPress={() => confirmLocationModalFunc()}>
        Save Location
      </Button>
      {open && (
        <ConfimLocationModal
          isOpen={open}
          setOpen={setOpen}
          fromAddLocation={''}
          savedPosition={savedPosition}
          setSavedPosition={setSavedPosition}
        />
      )}
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
  btn: {
    width: Dimensions.get('window').width * 0.95,
    alignSelf: 'center',
    position: 'absolute',
    bottom: 50,
    borderRadius: 8,
  },
  iconContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30, // adjust this value based on the height of your icon
    marginLeft: -12, // adjust this value based on the width of your icon
  },
});
export default GeoLocation;
