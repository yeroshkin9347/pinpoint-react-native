import { Button, Flex } from 'native-base'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import MapBox from '../../../Components/MapBox/MapBox'
import People from '../../../Components/People/People'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState, useCallback, useEffect, useRef} from 'react';
import Emergency from '../../../Screens/Main/Emergency/Emergency';

const Map = () => {

    const Nav = useNavigation();
    const navigation = useNavigation();

    useFocusEffect(
        useCallback(() => {
          Nav.setOptions({
            headerRight: () => <Button style={styles.Button} onPress={() => navigation.navigate('Emergency' as never )}>Emergency</Button> ,
          });
        }, []),
      );

  return (
    <View style={styles.container}>
       <View style={styles.map}>
       <MapBox />
       </View>
       
    </View>
  )
}



export default Map


const styles = StyleSheet.create({
  container: {
    flex: 1, // Take up all available space
    backgroundColor: 'white',
  },
  map: {
    flex: 2, // Take up 100% height of the parent container
 },
 content : {
  flex: 1
 },
 Button: {
    width: Dimensions.get('window').width * 0.26,
    borderRadius: 0,
    height: '45%',
    paddingTop: 0,
    paddingBottom: 2,
    fontSize: 25,
    marginRight: 10,
    backgroundColor: 'red',
 }
})