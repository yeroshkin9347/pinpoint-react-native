import React from 'react';
import Signup from '../Screens/Auth/SignUp/SignUp';
import Auth from '../Screens/Auth';
import ForgetPassword from '../Screens/Auth/ForgetPassword/ForgetPassword';
import Terms from '../Components/Term/Terms';
import Policy from '../Components/Policy/Policy';

import Profile from '../Screens/Main/Profile/Profile';
import GeoLocation from '../Screens/Main/geolocation/GeoLocation';
import Subscription from '../Screens/Main/Subscription/Subscription';
import GoogleSearch from '../GoogleSearch';
import SaveLocation from '../Screens/Main/geolocation/SaveLocation';
import SavedCard from '../Screens/Main/Card/SavedCard';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// import Settings from '../Screens/Main/Home/Setings/Settings';

const AuthStacks = createNativeStackNavigator();

const AuthStack = () => {
  return (
    <AuthStacks.Navigator initialRouteName={"Login"}>
      <AuthStacks.Screen
        name="Login"
        component={Auth}
        options={{headerShown: false}}
      />
      <AuthStacks.Screen
        name="ForgetPassword"
        component={ForgetPassword}
        options={{headerTitleAlign: 'center'}}
      />
      <AuthStacks.Screen
        name="Terms"
        component={Terms}
        options={{headerTitleAlign: 'center'}}
      />
      <AuthStacks.Screen
        name="Policy"
        component={Policy}
        options={{headerTitleAlign: 'center'}}
      />
      <AuthStacks.Screen
        name="ProfileSetup"
        component={Profile}
        options={{headerTitleAlign: 'center'}}
      />
      <AuthStacks.Screen
        name="Set Location"
        component={GeoLocation}
        options={{headerTitleAlign: 'center'}}
      />

      <AuthStacks.Screen
        name="Subscription"
        component={Subscription}
        options={{headerTitleAlign: 'center'}}
      />
      <AuthStacks.Screen
        name="Search"
        component={GoogleSearch}
        options={{headerTitleAlign: 'center',headerShown:false}}
      />
      <AuthStacks.Screen
        name="Card Details"
        component={SavedCard}
        options={{headerTitleAlign: 'center'}}
      />
    </AuthStacks.Navigator>
  );
};

export default AuthStack;
