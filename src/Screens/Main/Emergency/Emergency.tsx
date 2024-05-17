import { useNavigation } from '@react-navigation/native';
import { Button, FormControl, Modal, Pressable, useToast } from 'native-base';
import React, { useEffect, useState } from 'react';
import { Dimensions, Linking, StyleSheet, Text, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../../../Components/CustomInput';
import { colorSecondary } from '../../../Style/GlobalStyles/GlobalStyle';
import { setLoading, setNotificationList, setProfile } from '../../../redux/reducers/authReducer';
import { ApiRequestAsync, ErrorToast } from '../../../services/httpServices';
import IconEntypo from 'react-native-vector-icons/Entypo';
import { textWithoutEncoding } from 'react-native-communications';
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MapBox from '../../../Components/MapBox/MapBox';

const Emergency = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { profile, emergencyLocation, token } = useSelector(
    (state: any) => state.AuthReducer,
  );
  const [emergencyContactsList, setEmergencyContacts] = useState([]);

  const toast = useToast();
  const toastid = 'test-toast';

  const fetchEmergencyContacts = async () => {
    let data = new FormData();
    dispatch(setLoading(true));
    data.append('type', 0);
    ApiRequestAsync('GET', '/contact/emergency-contact-list', data, token)
      .then(async (data: any) => {
        dispatch(setLoading(false));
        const list = data.data.list.map(
          (item: { contact_no: any }) => item.contact_no,
        );
        setEmergencyContacts(list);
      })
      .catch(error => {
        console.log(error);
        dispatch(setLoading(false));
      });
  };

  useEffect(() => {
    fetchEmergencyContacts();
  }, []);

  const handleShareLocation = () => {
    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('type', '0');
      const serviceUrl: `/${string}` = !profile.is_emergency
        ? '/contact/share-emergency-location'
        : '/contact/stop-emergency-location';
      ApiRequestAsync('POST', serviceUrl, data, token)
        .then(async (data: any) => {
          console.log(data);
          dispatch(setLoading(false));
          if (data.data.detail !== undefined) {
            dispatch(setProfile(data.data.detail));
          } else if (data.data.message === 'Location shared  Stopped') {
            dispatch(setProfile({ ...profile, ['is_emergency']: false }));
          } else if (data.data.message === 'Location shared successfully') {
            dispatch(setProfile({ ...profile, ['is_emergency']: true }));
          }
          else if (data.data.message.includes('No details  found')) {
            dispatch(setProfile({ ...profile, ['is_emergency']: false }));
          }
          fetchNotification();
        })
        .catch(error => {
          dispatch(setLoading(false));
          console.log(error);
          let { detail } = JSON.parse(error['_response']);
          if (!toast.isActive(toastid)) {
            ErrorToast({ toast, id: toastid, errorMessage: detail });
          }
        });
      if (!profile.is_emergency) {
        const googleMapsLink = `https://www.google.com/maps/place/${emergencyLocation.latitude},${emergencyLocation.longitude}/@${emergencyLocation.latitude},${emergencyLocation.longitude}z`;

        const message =
          `You are receiving this message because you are my Emergency Contact in Pinpointeye Location Sharing App.\n` +
          `+I am in an Emergency situation and need your help.\n` +
          `+Please contact me asap or send help to my location.\n` +
          `+${googleMapsLink}`;

        const url = `sms:${emergencyContactsList.join(
          ',',
        )}?body=${encodeURIComponent(message)}`;

        // Linking.openURL(url).catch(error => {
        //   console.error('Failed to open Messages app:', error);
        // });
        if (Platform.OS === 'android') {
          Linking.openURL(url).catch(error => {
            console.error('Failed to open Messages app:', error);
          });
        } else {
          textWithoutEncoding(emergencyContactsList.join(','), message);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchNotification = async () => {
    let data = new FormData();
    dispatch(setLoading(true));
    data.append('type', 0);
    ApiRequestAsync('POST', '/user/notification-list', data, token)
      .then(async (data: any) => {
       
        if (
          data?.data?.list !== undefined &&
          Object.keys(data.data.list).length !== 0
        ) {
          dispatch(setNotificationList(data.data.list));
        }
        dispatch(setLoading(false));
      })
      .catch(error => {
        console.log(error);
        dispatch(setLoading(false));
      });
  };

  return (
    <View style={styles.container}>
      {Platform.OS === 'ios' ? (
        <View style={styles.iosTop}>
          <Text style={styles.text}>Emergency </Text>
          <IconEntypo
            name="cross"
            style={{ paddingRight: 20 }}
            size={22}
            color="white"
            onPress={() => navigation.goBack()}
          />
        </View>
      ) : (
        <View style={styles.Top}>
          <Text style={styles.text}>Emergency</Text>
          <IconEntypo
            name="cross"
            size={22}
            style={{ paddingRight: 15 }}
            color="white"
            onPress={() => navigation.goBack()}
          />
        </View>
      )}

      <View style={styles.map}>
        <MapBox MapLocation={'FromEmergency'} />
        <View style={styles.container1}>
          <View style={styles.header1}>
            <Text style={styles.textHeading1}>Friends</Text>
          </View>
          <View>
            <FormControl>
              <Pressable
              // onPress={() => navigation.navigate('Set Location' as never)}

              >
                <View style={styles.marqueeView}>
                  <View style={{ padding: 4 }}>
                    <Icon name="map-marker-outline" size={25} />
                  </View>
                  <Text
                    style={styles.paraText}
                  >
                    {emergencyLocation && emergencyLocation.address}
                  </Text>
                </View>
              </Pressable>
            </FormControl>
            <Text style={styles.paraText1}>
              By clicking share button your selected contacts will be get
              notified of your location
            </Text>
            <Button style={styles.Button} onPress={handleShareLocation}>
              {profile.is_emergency ? 'Stop Sharing' : 'Share Location'}
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
};

export default Emergency;

const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up all available space
    backgroundColor: 'white',
  },
  map: {
    flex: 2, // Take up 100% height of the parent container
  },
  content: {
    flex: 1,
  },
  marqueeView: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 6,
    alignItems: 'center',
    borderColor: 'gray',
    borderRadius: 10,
  },
  iosTop: {
    paddingTop: 40,
    height: '10%',
    backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  Top: {
    backgroundColor: 'red',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    padding: 15,
    textAlign: 'center',
    fontSize: 17,
    marginLeft: 20,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
  },

  container1: {
    padding: 20,
  },
  header1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  textHeading1: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: 'black',
  },
  paraText1: {
    color: colorSecondary,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    paddingTop: 10,
    paddingBottom: 20,
  },
  paraText: {
    width: Dimensions.get('window').width * 0.75,
    color: 'black',
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
  },
  Button: {
    width: '98%',
    paddingTop: 15,
    paddingBottom: 15,
    fontSize: 20,
    backgroundColor: 'red',
  },
});
