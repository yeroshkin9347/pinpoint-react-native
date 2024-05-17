import React, { useEffect } from 'react';
import { Box, Text, ScrollView, View } from 'native-base';
import { ApiRequestAsync } from '../../../services/httpServices';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { setLoading, setUserGuide } from '../../../redux/reducers/authReducer';
import { Dimensions, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';


const UserGuide = () => {

  const { token, userGuide } = useSelector((state: any) => state.AuthReducer);
  const dispatch = useDispatch();

  const source = {
    html: userGuide
  };

  const getUserGuide = async () => {
    try {
      dispatch(setLoading(true))
      await ApiRequestAsync('GET', '/user/get-page?type=4', {}, token)
        .then((response) => {
          dispatch(setUserGuide(response.data.detail.description))
          dispatch(setLoading(false))
        }).catch(error => {
          console.log(error);
          dispatch(setLoading(false))
        })
    } catch (error) {
      console.log(error)
      dispatch(setLoading(false))
    }
  };

  const tagsStyles = {
    p: {
      color: 'black',
      fontSize: 15,
      marginBottom: 0,
      marginTop: 0,
      padding: 2.5,
    },
    strong: {
      color: 'black',
      fontSize: 16,
      marginBottom: 0,
    },
  }

  useEffect(() => {
    getUserGuide();
  }, []);

  return (
    <ScrollView>
      <View style={{ backgroundColor: 'white', padding: 2.5 }} >
        <RenderHtml
          tagsStyles={tagsStyles}
          contentWidth={Dimensions.get('window').width}
          source={source}
        />
      </View>
    </ScrollView>
  );
};

export default UserGuide;