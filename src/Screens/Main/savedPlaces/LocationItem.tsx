import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, Linking, TouchableOpacity, Image, Platform } from 'react-native';
import { Accordion, Box, FlatList, HStack, Spacer, VStack } from 'native-base'; // Import your Box component library
import Icon from 'react-native-vector-icons/Feather';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { colorPrimary, colorSecondary, width } from '../../../Style/GlobalStyles/GlobalStyle';
import NativeMenu from '../../../Components/CustomPicker';
import { myApiKey } from '../../../services/httpServices';
import _ from 'lodash';

const LocationItem = ({ locationItem, getCategoryData, setShowMoveModal,fromMapView ,fromDraggable}: any) => {
  let [miles, setMiles] = useState(0);
  const [plusCode, setPlusCode] = useState('');
  const emergencyLocation = useSelector(
    (state: any) => state.AuthReducer.emergencyLocation,
  );

  const deg2rad = (deg: any) => {
    return deg * (Math.PI / 180);
  }

  const rad2deg = (rad: any) => {
    return rad * (180 / Math.PI);
  }

  const getDistanceBetween = (lat1: any, lon1: any, lat2: any, lon2: any) => {
    const theta = lon1 - lon2;
    let dist =
      Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(theta));
    dist = Math.acos(dist);
    dist = rad2deg(dist);
    dist = dist * 60 * 1.60934; // Convert to kilometers
    return dist;
  }

  const calculateDistance = async () => {
    try {
      const distanceInMiles = getDistanceBetween(
        emergencyLocation?.latitude,
        emergencyLocation?.longitude,
        locationItem?.latitude,
        locationItem?.longitude
      );
      setMiles(distanceInMiles);
      // const origin = encodeURIComponent(emergencyLocation?.address);
      // const destination = encodeURIComponent(locationItem.address);
      // const response = await axios.get(
      //   `https://maps.googleapis.com/maps/api/distancematrix/json?destinations=${destination}&origins=${origin}&units=imperial&key=${myApiKey}`
      // );
      // ;
      // console.log('responseData', response.data);
      // const { status, rows, elements } = response.data;
      // if (status === 'OK' && rows[0].elements[0].status === 'OK')) {
      //   const distanceInMeters = rows[0].elements[0].distance.value;
      //   const distanceInMiles = distanceInMeters * 0.000621371; // Convert meters to miles
      //   setMiles(distanceInMiles);
      // }
    } catch (error) {
      console.error(error);
    }
  };

  
  const cache = {}; // Create a cache object
  
  const getPlusCode = _.debounce(async () => {
    const currentTime = new Date().toISOString(); // Get the current time in ISO format
  
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${locationItem.latitude},${locationItem.longitude}&key=${myApiKey}`;
    console.log(`This is a call at time: ${currentTime}: ${url}`);
    
    if (cache[url]) {
      const results = cache[url];
      setPlusCode(`${results}`);
    } else {
      try {
        const response = await axios.get(url);
        const results = response.data?.plus_code?.compound_code;
        if (results) {
          cache[url] = results;
          setPlusCode(`${results}`);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, 1000); // Debounce time in milliseconds

  // const getPlusCode = async () => {

  //   try {
  //     const response = await axios.get(
  //       `https://maps.googleapis.com/maps/api/geocode/json?latlng=${locationItem.latitude},${locationItem.longitude}&key=${myApiKey}`,
  //     );
  //     const results = response.data?.plus_code?.compound_code;
  //     if (results) {
  //       setPlusCode(`${results}`);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    if (locationItem.address) {
      calculateDistance();
      getPlusCode()
    }
  }, [locationItem]);

  const openGoogleMaps = () => {
    let url = "";
    if (Platform.OS === 'android') {
      url = `https://www.google.com/maps/dir/?api=1&origin=${emergencyLocation?.latitude},${emergencyLocation?.longitude}&destination=${locationItem.latitude},${locationItem.longitude}`;
    } else {
      url = `comgooglemaps://?saddr=${emergencyLocation?.latitude},${emergencyLocation?.longitude}&daddr=${locationItem.latitude},${locationItem.longitude}&directionsmode=transit`;
    }
    Linking.openURL(url).catch(err =>
      console.error('Error opening Google Maps', err),
    );
  };

  return (
    <Box pl={['0', '4']} pr={['0', '5']} py="2">
      <View style={{ display: 'flex', flexDirection: 'row' }}>
        <Icon name="map-pin" color={'green'} size={25} />
        <View
          style={{
            paddingHorizontal: 10,

            width: fromDraggable ? width * 0.52 : width * 0.60,
          }}>
          <TouchableOpacity onPress={() => openGoogleMaps()}>
            <Text style={{ color: 'black', fontSize: 14, fontFamily: 'Poppins-SemiBold' }}>{locationItem.address}</Text>
            {plusCode ?

              <View style={{ display: 'flex', flexDirection: 'row', marginTop: 5 }}>
                <Image
                  style={{ width: 15, height: 15, resizeMode: 'contain', marginRight: 6, marginLeft: 2, marginTop: 3 }}
                  source={require('../../../Assets/icons/GooglePlusIcon.png')}
                />
                <Text style={{ color: 'black' }}>{plusCode ?? ''}</Text>
              </View> : null
            }

          </TouchableOpacity>
        </View>
        <View>
          <Text style={{ color: colorPrimary, fontWeight: 'bold' }}>
            {miles.toFixed(2)} Miles
          </Text>
          <View style={{ display: 'flex', flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', }}>
            {(!fromMapView && !fromDraggable) ? 
            <NativeMenu setShowMoveModal={setShowMoveModal} getCategoryData={getCategoryData} locationId={locationItem.id} id={locationItem.category_id} fromLocationItem={true} address={locationItem.address} latitude={locationItem.latitude} longitude={locationItem.longitude} plusCode={plusCode} />
            : null
          }
          </View>
        </View>
      </View>
    </Box>
  );
};

export default LocationItem;
