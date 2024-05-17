// import {View, Text, Pressable, ScrollView} from 'native-base';
import React, { useCallback, useEffect } from 'react';
import { StyleSheet, AppState, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colorPrimary, colorSecondary } from '../../Style/GlobalStyles/GlobalStyle';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ApiRequestAsync, BaseURL } from '../../services/httpServices';
import { useDispatch, useSelector } from 'react-redux';
import { FlatList, View, TouchableOpacity } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  Pressable,
  Text,
} from 'native-base';
import PeopleList from './PeopleList';
import { setLoading, setLocationSave, setRequestLocation } from '../../redux/reducers/authReducer';
import { peopleHeading, peopleParagraph } from '../../Constants';

interface Props {
  data: Array<any>
}

const People = ({ data }: Props) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { token, requestLocation } = useSelector((state: any) => state.AuthReducer);

  useEffect(() => {
    const fetchData = async () => {

      ApiRequestAsync('GET', '/contact/location-request-list', {}, token)
        .then(response => {
          dispatch(setRequestLocation(response.data?.list))
        })
        .catch(error => {
          console.log(error);
        });
    }

    // Initial API call
    const handleAppStateChange = (nextAppState : any) => {
      if (Platform.OS === 'ios' && nextAppState === 'background') {
        // Implement background fetch logic here
        fetchData();
      }
    };
  
    // Add an AppState change listener
    const interval = setInterval(() => {
      fetchData();
    }, 30000);
    // Clear the listener on component unmount
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
      clearInterval(interval);
    };
  }, []);

  const navigateToContact = () => {
    dispatch(setLocationSave(false));
    navigation.navigate('Contacts' as never)
  }


  useFocusEffect(
    useCallback(() => {
      navigation.setOptions({
        headerRight: () => (
          <Pressable
            onPress={() => 
            {
              dispatch(setLocationSave(false));
              navigation.navigate('Location Requests' as never)
            }}>
            <View style={styles.iconcontainer}>
              <MaterialIcons
                name="add-location-alt"
                style={{ fontSize: 30, color: 'green', marginRight: 10 }}
              />
              {requestLocation.length > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{requestLocation.length }</Text>
                </View>
              )}
            </View>

          </Pressable>
        ),
      });
    }, [requestLocation]),
  );

  const renderItem = useCallback(
    (item: any) => (
      <PeopleList item={item} />
    ),
    [data],
  );


  return (

    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.textHeading}>{peopleHeading.Heading}</Text>
        <Pressable onPress={navigateToContact}>
          <Icon
            name="plus"
            style={{ paddingHorizontal: 10 }}
            size={25}
            color={'black'}
          />
        </Pressable>
      </View>
      {data.length > 0 ? (<View style={{ width: '100%', height: "100%" }}>
        <FlatList
          data={data}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
          scrollEnabled={true}
          contentContainerStyle={{ flexGrow: 1 }}
        />
      </View>) : (
        <View>
          <Text style={styles.paraText}>
            {peopleParagraph.paragraph1}
          </Text>
          <Text style={styles.paraText}>
            {peopleParagraph.paragraph2}
          </Text>
        </View>
      )

      }

    </View>

  );


};

export default People;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 90
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  textHeading: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  paraText: {
    color: colorSecondary,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  paraText1: {
    color: colorSecondary,
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  stopButton: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    color: 'red',
  },
  iconcontainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: 12,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
  },
});
