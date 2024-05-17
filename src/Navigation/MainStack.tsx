import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Policy from '../Components/Policy/Policy';
import Terms from '../Components/Term/Terms';
import GoogleSearch from '../GoogleSearch';
import SavedCard from '../Screens/Main/Card/SavedCard';
import Contacts from '../Screens/Main/Contacts/Contacts';
import Emergency from '../Screens/Main/Emergency/Emergency';
import Profile from '../Screens/Main/Profile/Profile';
import RequestLocation from '../Screens/Main/RequestLocation/RequestLocation';
import Settings from '../Screens/Main/Settings/Settings';
import Changeplan from '../Screens/Main/Subscription/Changeplan';
import Subscription from '../Screens/Main/Subscription/Subscription';
import UpdateContacts from '../Screens/Main/UpdateContacts/UpdateContacts';
import UserGuide from '../Screens/Main/UserGuide/UserGuide';
import EmergencyContacts from '../Screens/Main/emergencyContacts/EmergencyContacts';
import GeoLocation from '../Screens/Main/geolocation/GeoLocation';
import SaveLocation from '../Screens/Main/geolocation/SaveLocation';
import LocationRequests from '../Screens/Main/locationRequest/LocationRequest';
import LocationContacts from '../Screens/Main/savedPlaces/LocationContacts';
import MapViewLocations from '../Screens/Main/savedPlaces/MapViewLocations';
import SavedPlaces from '../Screens/Main/savedPlaces/SavedPlaces';
import { setFromUser } from '../redux/reducers/authReducer';
import TabScreen from './TabRoutes';
import { useNavigation } from '@react-navigation/native';
import SortLocationOrder from '../Screens/Main/savedPlaces/SortLocationOrder';

const MainStacks = createNativeStackNavigator();

const MainStack = () => {

  const [initialRoute, setInitialRoute] = useState(''); 
  const navigation = useNavigation()
  const { profile } = useSelector((state: any) => state.AuthReducer);
const dispatch = useDispatch()
  useEffect(() => {
    
    const fetchInitialRoute = async () => {
      try {
        if(!profile.is_profile_update){
          setInitialRoute('MainProfileSetup')
          dispatch(setFromUser(false));
          return
        }
        if (
          (profile.is_free_trial ||
            profile.is_purchase)
        ){
          setInitialRoute('HomeScreen')
          setTimeout(()=>{
            navigation.navigate('HomeScreen' as never);
          },3000)
        } else {
          setInitialRoute('SubscriptionSettings')
        }
      } catch (error) {
        console.error('Error fetching data from AsyncStorage:', error);
      }
    };
    fetchInitialRoute();
  }, []);

  return (
    <>
    {initialRoute && 
    <MainStacks.Navigator screenOptions={{}} initialRouteName={initialRoute}>
      {/* <MainStacks.Screen
                name="Home"
                component={TabRoutes}
            /> */}
      <MainStacks.Screen
        name="HomeScreen"
        component={TabScreen}
        options={{headerShown: false}}
      />
      <MainStacks.Screen
        name="MainProfileSetup"
        component={Profile}
        options={{headerTitleAlign: 'center'}}
      />
      <MainStacks.Screen
        name="Set Location"
        component={GeoLocation}
        options={{headerTitleAlign: 'center' , headerBackTitle : ''}}
        
      />
      <MainStacks.Screen
        name="Search"
        component={GoogleSearch}
        options={{headerTitleAlign: 'center',headerShown:false , headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="SubscriptionSettings"
        component={Subscription}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Contacts"
        component={Contacts}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Add Emergency Contacts"
        component={LocationRequests}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Location Requests"
        component={RequestLocation}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Card Details"
        component={SavedCard}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Emergency"
        component={Emergency}
        options={{headerShown: false , headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="SortLocationOrder"
        component={SortLocationOrder}
        options={{headerShown: false , headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Saved Places & New Locations"
        component={SavedPlaces}
        options={{
          headerTitleAlign: 'center', 
          headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="User Guide"
        component={UserGuide}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Emergency Contacts"
        component={EmergencyContacts}
        options={{headerTitleAlign: 'center' , headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="UpdateContacts"
        component={UpdateContacts}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Save Location"
        component={SaveLocation}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      {/* <MainStacks.Screen
        name="Login"
        component={Auth}
        options={{headerShown: false}}
      /> */}
      <MainStacks.Screen
        name="Terms"
        component={Terms}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Policy"
        component={Policy}
        options={{headerTitleAlign: 'center' , headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Settings"
        component={Settings}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Change Plan"
        component={Changeplan}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Location Contacts"
        component={LocationContacts}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
      <MainStacks.Screen
        name="Map View"
        component={MapViewLocations}
        options={{headerTitleAlign: 'center', headerBackTitle : ''}}
      />
    </MainStacks.Navigator>
  }
    </>
  
    );
};

export default MainStack;
