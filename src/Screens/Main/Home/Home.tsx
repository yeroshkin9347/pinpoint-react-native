import { Flex } from 'native-base'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import People from '../../../Components/People/People'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ApiRequestAsync } from '../../../services/httpServices'
import { useDispatch, useSelector } from 'react-redux'
import { getsharedLocations } from '../../../redux/reducers/authReducer'
import MapBox from '../../../Components/MapBox/MapBox';
const Home = () => {
  const { token, getLocations } = useSelector((state: any) => state.AuthReducer);

  const dispatch = useDispatch()

  useEffect(() => {
    const fetchData = async () => {
             ApiRequestAsync('GET', '/contact/get-lat-long',{},token)
          .then(response => {
            if(response.data.list){
              dispatch(getsharedLocations(response.data.list))
            }
          })
          .catch(error => {
            // dispatch(setLoading(false));
            console.log(error);
          })
    };

    // Initial API call
    fetchData();

    // Set interval to call the API every minute
    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    // Clear interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.map}>
        <MapBox data={getLocations} MapLocation="FromHome" />
      </View>
      <View style={styles.content}>
        <People data={getLocations} />
      </View>
    </View>
  )
}

Home.navigationOptions = () => ({
  headerLeft: () => (
    <Icon name="plus" size={24} />
  ),
});

export default Home


const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up all available space
    backgroundColor: 'white',
  },
  map: {
    flex: 4, // Take up 100% height of the parent container
  },
  content: {
    flex: 2
  }
})