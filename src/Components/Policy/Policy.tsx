import { View, StyleSheet } from 'react-native'
import { Box, Text, ScrollView } from 'native-base';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { ApiRequestAsync } from '../../services/httpServices';
import { setLoading, setPolicy } from '../../redux/reducers/authReducer';
import { useNavigation } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const Policy = () => {
  const { privacyPolicy, token } = useSelector((state: any) => state.AuthReducer)
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const callPolicyApi = async () => {
    try {
      dispatch(setLoading(true))
      await ApiRequestAsync('GET', '/user/get-page?type=0', {}, token)
        .then((response) => {
          dispatch(setPolicy(response.data.detail.description))
          dispatch(setLoading(false))
          navigation.navigate('Policy' as never);
        }).catch(error => {
          console.log(error);
          dispatch(setLoading(false))
        })
    } catch (error) {
      console.log(error)
      dispatch(setLoading(false))
    }
  };

  const source = {
    html: privacyPolicy
  };

  const tagsStyles = {
    p: {
      color: 'black',
      fontSize: 15,
      marginBottom: 0,
      marginTop: 0,
      paddingLeft: 3,
    },
    strong: {
      color: 'black',
      fontSize: 16,
      marginBottom: 0,
    },
  }

  useEffect(() => {
    callPolicyApi();
  }, [])

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
  )
}

export default Policy

const styles = StyleSheet.create({

  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },

})