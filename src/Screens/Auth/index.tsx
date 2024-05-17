import { Box, useColorModeValue } from 'native-base';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Pressable,
  Text,
  View
} from 'react-native';
import { SceneMap, TabView } from 'react-native-tab-view';
import authStyle from '../../Style/Auth/Auth';
import { colorPrimary, colorSecondary } from '../../Style/GlobalStyles/GlobalStyle';
import Login from './Login/Login';
import Signup from './SignUp/SignUp';
import Loader from '../../Components/Loader';
import { useSelector } from 'react-redux';

const initialLayout = {width: Dimensions.get('window').width};

const Auth = () => {
  const {isLoading} = useSelector((state: any) => state.AuthReducer);
  const [index, setIndex] = useState(1);
  const [routes] = useState([
    {key: 'first', title: 'Sign Up',},
    {key: 'second', title: 'Sign In',},
  ]);

  const renderTabBar = (props: any): React.ReactNode => {
    const inputRange = props.navigationState.routes.map((x: any, i: any) => i);
    return (
      <Box flexDirection="row">
        {props.navigationState.routes.map((route: any, i: any) => {
          const opacity = props.position.interpolate({
            inputRange,
            outputRange: inputRange.map((inputIndex: any) =>
              inputIndex === i ? 1 : 0.5,
            ),
          });
          const color = index === i ? colorPrimary : colorSecondary;
          const borderColor = index === i? colorPrimary : colorSecondary;
          return (
            <Box
            key={i}
              borderBottomWidth="3"
              borderColor={borderColor}
              flex={1}
              alignItems="center"
              p="3">
              <Pressable
                onPress={() => {
                  setIndex(i);
                }}>
                <Animated.Text
                  style={{
                    color,
                    fontSize: 20,
                    fontWeight: 'bold',
                    fontFamily : 'poppins'
                  }}>
                  {route.title}
                </Animated.Text>
              </Pressable>
            </Box>
          );
        })}
      </Box>
    );
  };

  const renderScene = SceneMap({
    first: Signup ,
    second: Login,
  });
  return (
    <>
   
    <View style={authStyle.container}>
       
      <ImageBackground
        source={require('../../Assets/images/Background.png')}
        style={authStyle.imageBackground}>
        <View style={authStyle.logoContainer}>
          <Image
            source={require('../../Assets/icons/PinPointEye.png')}
            style={authStyle.image}
          />
        </View>
        <View style={authStyle.content}>
        {isLoading && <Loader isLoading={isLoading} />}
          <TabView
            navigationState={{index, routes}}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={initialLayout}
            renderTabBar={renderTabBar}
            swipeEnabled={false}
          />
        </View>
      </ImageBackground>
    </View>
    </>
  );
};

export default Auth;
