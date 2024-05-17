import React, { useState, useRef, useEffect, useCallback , useMemo } from 'react';
import { Dimensions, StyleSheet, Image, TouchableOpacity } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Geolocation from 'react-native-geolocation-service';
import { Platform, PermissionsAndroid } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  setLagLong,
  setLoading,
  updateEmergencyLocation,
} from '../../redux/reducers/authReducer';
import {
  ApiRequestAsync,
  BaseURL,
  checkLocationPermission,
  geoEncodedAddress,
} from '../../services/httpServices';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import SwitchHeader from '../SwitchHeader';
import Loader from '../Loader';
import { Avatar, Text, View } from 'native-base';

const MapBox = ({ data, MapLocation }: any) => {

  const [renderMap, setRenderMap] = useState(true);
  const { emergencyLocation, token, profile } = useSelector(
    (state: any) => state.AuthReducer,
  );
  const [mapLocation, setMapLocation] = useState<any>({
    latitude: 13.406,
    longitude: 123.3753,
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
  const mapRef = useRef<MapView>(null);

  const Nav = useNavigation();
  const [terrain, setTerrain] = useState<string>('standard');
  const { isLoading } = useSelector((state: any) => state.AuthReducer);
  const dispatch = useDispatch();

  const updateUserLocation = (latitude: any, longitude: any) => {
    try {
      let data = new FormData();
      data.append('User[latitude]', latitude);
      data.append('User[longitude]', longitude);

      ApiRequestAsync('POST', '/user/update-lat-long', data, token)
        .then(response => {
     
        })
        .catch(error => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  // useEffect(() => {
  //   let watchId: any;
  //   const startLocationTracking = async () => {
  //     try {
  //       const permissionGranted = await requestLocationPermission();

  //       if (!permissionGranted) {
  //         console.error('Location permission not granted');
  //         dispatch(setLoading(false));
  //         return;
  //       }

  //       const successCallback = async (position: { coords: { latitude: any; longitude: any; }; }) => {
  //         const { latitude, longitude } = position.coords;
  //         console.log(position.coords,'position.coords')
  //         const completeAddress = await geoEncodedAddress({ latitude, longitude });
          
  //         dispatch(updateEmergencyLocation({
  //           latitude,
  //           longitude,
  //           address: completeAddress,
  //         }));

  //         updateUserLocation(latitude, longitude);
  //         dispatch(setLoading(false));
  //       };

  //       const errorCallback = (error: any) => {
  //         console.error('Location tracking error:', error);
  //         dispatch(setLoading(false));
  //       };

  //       const options = {
  //         enableHighAccuracy: true,
  //         distanceFilter: 0,
  //         interval: 1000,
  //         fastestInterval: 1000,
  //       };

  //       watchId = Geolocation.watchPosition(successCallback, errorCallback, options);
  //     } catch (error) {
  //       console.error('An error occurred while starting location tracking:', error);
  //       dispatch(setLoading(false));
  //     }
  //   };

  //   startLocationTracking();

  //   return () => {
  //     // Clean up by stopping location updates when the component unmounts
  //     if (watchId) {
  //       Geolocation.clearWatch(watchId);
  //     }
  //   };
  // }, []);
  
  useEffect(() => {
    // Function to get the user's current location
    const getCurrentLocation = () => {
      Geolocation.getCurrentPosition(
        async(position) => {
          const { latitude, longitude } = position.coords;
          const completeAddress = await geoEncodedAddress({ latitude, longitude });
      
          dispatch(updateEmergencyLocation({
            latitude,
            longitude,
            address: completeAddress,
          }));

          updateUserLocation(latitude, longitude);
        },
        (error) => {
          console.log('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
      );
    };

    // Initial call to get the user's location
    getCurrentLocation();

    // Set up interval to fetch location every 30 seconds
    const locationInterval = setInterval(getCurrentLocation, 30000);

    // Clear interval on component unmount
    return () => clearInterval(locationInterval);
  }, []);

  useEffect(() => {
    if (renderMap && emergencyLocation.latitude) {
      const latitude = Number(emergencyLocation.latitude) || 13.406;
      const longitude = Number(emergencyLocation.longitude) || 123.3753;
      const latitudeDelta = 500 / (111.32 * 1000);
      const longitudeDelta = 500 / (Math.cos(latitude) * 111.32 * 1000);

      setTimeout(() => {
        setMapLocation({
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        });

        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta,
          longitudeDelta,
        });
        setRenderMap(false)
      }, 0);
    }
  }, [emergencyLocation.latitude]);

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
            1000),
            
      });
      // const { longitude, latitude } = info.coords;
    });
  };

  const mapComponent = useMemo(() => (
     <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        showsUserLocation={false}
        initialRegion={mapLocation}
        mapType={'standard'}
        loadingEnabled={true}
        zoomEnabled={true}

      >
        <Marker
          coordinate={{
            latitude: Number(emergencyLocation?.latitude),
            longitude: Number(emergencyLocation?.longitude),
          }}
          title="Selected Location">
          <View>
            <Image
              source={
                profile.is_emergency || MapLocation === 'FromEmergency'
                  ? require('../../Assets/icons/red.png')
                  : require('../../Assets/icons/blue.png')
              }
              style={styles.image}
            />
          </View>
        </Marker>
        {data?.length > 0 &&
          !data?.location_share_by_me &&
          data.map((item: any, index: number) => (
            <View key={index.toString()}>
              <Marker
                coordinate={{
                  latitude: Number(item?.latitude),
                  longitude: Number(item?.longitude),
                }}>
                <View
                  style={{
                    width: 150,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {item?.is_emergency ? (
                    <Avatar
                      size="38px"
                      style={{ borderWidth: 2, borderColor: 'red' }}
                      source={{
                        uri:
                          item?.profile_file !== undefined &&
                            item?.profile_file !== ''
                            ? `${BaseURL}${item?.profile_file}`
                            : 'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=',
                      }}
                    />
                  ) : (
                    <Avatar
                      size="38px"
                      style={{ borderWidth: 2, borderColor: 'green' }}
                      source={{
                        uri:
                          item?.profile_file !== undefined &&
                            item?.profile_file !== ''
                            ? `${BaseURL}${item?.profile_file}`
                            : 'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=',
                      }}
                    />
                  )}

                  <View
                    style={{
                      backgroundColor: !item?.is_emergency ? 'green' : 'red',
                      borderRadius: 5,
                      paddingHorizontal: 4,
                    }}>
                    <Text style={styles.paraText1}>{item.full_name}</Text>
                  </View>
                </View>
              </Marker>
            </View>
          ))}
      </MapView> 
  ), [mapLocation , data,profile]);

  return (
    <>
      {isLoading && <Loader isLoading={isLoading} />}
    
          {mapComponent}
      {MapLocation === 'FromEmergency' ? (
        ''
      ) : (
        <TouchableOpacity
          style={styles.myLocationButton}
          onPress={goToUsersLocation}>
          <Image
            source={require('../../Assets/icons/currentLocation.png')}
            style={styles.image}
          />
        </TouchableOpacity>
      )}
  </>
  );
};

export default MapBox;

const styles = StyleSheet.create({
  map: {

    flex: 1,
  },
  paraText1: {
    color: 'white',
    fontSize: 7,
    fontFamily: 'Poppins-Regular',
  },
  image: {
    width: 40,
    height: 40,
    padding: 2.5,
    marginRight: 10,
  },
  myLocationButton: {
    position: 'absolute',
    bottom: 12,
    right: 2,
    borderRadius: 30,
  },
});
