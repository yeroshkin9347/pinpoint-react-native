import React, { useEffect, useState } from 'react';
import {
  BottomTabBar,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import Home from '../Screens/Main/Home/Home';
import Profile from '../Screens/Main/Profile/Profile';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Feather from 'react-native-vector-icons/Feather';
import { colorPrimary, colorSecondary } from '../Style/GlobalStyles/GlobalStyle';
import Settings from '../Screens/Main/Settings/Settings';
import Map from '../Screens/Main/Map/Map';
import Notifications from '../Screens/Main/Notifications/Notifications';

const Tab = createBottomTabNavigator();

const TabScreen = () => {
  const [mapPin, setMapPin] = useState(0)
  const [icon, setIcon] = useState(0)
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: any;

          if (route.name === 'People') {
            iconName = 'people-outline';
          } else if (route.name === 'Map') {
            iconName = 'map-pin';
          } else if (route.name === 'Notifications') {
            iconName = 'notifications-outline';
          } else if (route.name === 'Settings') {
            iconName = 'md-settings-sharp';
          }

          // You can return any component that you like here!
          return (
            iconName == "map-pin" ? 
            <Feather 
            name={iconName} 
            style={{ paddingHorizontal: 10, paddingTop: 3 }} 
            size={27} 
            color={color} /> : 
            <Icon 
            color={color} 
            name={iconName} 
            style={{ paddingHorizontal: 10, paddingTop: 3 }} 
            size={30} />
          );
        },
        tabBarStyle: { backgroundColor: 'white', paddingBottom: 13, height: 60, borderTopWidth: 0 },
        tabBarActiveTintColor: colorPrimary,
        tabBarInactiveTintColor: colorSecondary,
        headerTitleAlign: 'center',
      })}
    >
      <Tab.Screen name="People" component={Home} />
      <Tab.Screen name="Map" component={Map} />
      <Tab.Screen name="Notifications" component={Notifications} />
      <Tab.Screen name="Settings" component={Settings} options={{ headerTitleAlign: 'center' }} />
    </Tab.Navigator>
  );
};


export default TabScreen;
