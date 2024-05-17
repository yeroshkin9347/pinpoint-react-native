import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Platform,
  Image,
} from 'react-native';
import React, { useEffect, useRef } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScrollView } from 'native-base';
import { useDispatch, useSelector } from 'react-redux';
import Icons from 'react-native-vector-icons/dist/AntDesign';
import {
  setLocationSave,
  updateMapLocation,
  updateMapLocationCondtion,
  updateProfile,
  updateSavedLocation,
} from './redux/reducers/authReducer';
import { useNavigation } from '@react-navigation/native';
const GoogleSearch = () => {
  const ref = useRef();

  useEffect(() => {
    ref.current?.focus();
  }, [])


  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { fromLocationSave } = useSelector(state => state.AuthReducer);

  const handlePress = (data, details = null) => {
    try {
      let latitude = details.geometry.location.lat;
      let longitude = details.geometry.location.lng;
      let address = details.formatted_address;
      if (fromLocationSave) {
        dispatch(updateSavedLocation({ latitude, longitude, address }));
        navigation.navigate('Save Location');
        dispatch(setLocationSave(false));
      } else {
        dispatch(updateMapLocation({ latitude, longitude, address }));
        dispatch(updateMapLocationCondtion(true));
        navigation.navigate('Set Location');
      }
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} >
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <ScrollView
          horizontal={true}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flex: 1 }}>
          <GooglePlacesAutocomplete
            ref={ref}
            renderLeftButton={() => (
              <TouchableOpacity
                activeOpacity={1}
                onPress={() => navigation.goBack()}>
                {Platform.OS === 'android' ? (
                  <Icons
                    name="arrowleft"
                    style={{
                      backgroundColor: 'black ',
                      color: 'white',
                      fontSize: 18,
                      paddingTop: 13,
                      paddingBottom: 13,
                    }}
                  />
                ) : (
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => navigation.goBack()}
                  >
                    <Image
                      source={require('./Assets/icons/BackArrowWhite.png')}
                      style={{
                        marginTop: 15,
                        paddingBottom: 13
                      }}
                    />
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
            styles={{
              textInputContainer: {
                backgroundColor: '#171717',
                padding: 5,
              },
              textInput: {
                color: 'white',
                fontSize: 16,
                backgroundColor: '#171717',
                paddingVertical: 10,
              },
            }}
            enablePoweredByContainer={true}
            placeholder="Search"
            textInputProps={{
              placeholderTextColor: 'gray',
              returnKeyType: "search",
              fontSize: 19
            }}
            debounce={400}
            predefinedPlacesAlwaysVisible={true}
            onPress={handlePress}
            fetchDetails={true}
            query={{
              key: 'AIzaSyByniSgpMtWl3-zWhpSB7_M5cQCafEE2Tk',
              language: 'en',
            }}
          />
          {/* </View> */}
          {/* </View> */}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default GoogleSearch;
