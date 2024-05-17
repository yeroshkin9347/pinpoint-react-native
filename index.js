/**
 * @format
 */

import {AppRegistry, Text, TextInput , Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import PushNotification from "react-native-push-notification";


PushNotification.configure({

  onRegister: function (token) {
    console.log("TOKEN:", token);
  },


  onNotification: function (notification) {
    console.log("NOTIFICATION:", notification);

 
  },

  // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
  onAction: function (notification) {
    console.log("ACTION:", notification.action);
    console.log("NOTIFICATION:", notification);

    // process the action
  },

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError: function(err) {
    console.error(err.message, err);
  },

 
  popInitialNotification: true,


  requestPermissions: Platform.OS === 'ios',
});

AppRegistry.registerComponent(appName, () => App);

if (Text.defaultProps == null) {
    Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.allowFontScaling = false;
  }
