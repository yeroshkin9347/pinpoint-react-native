import { View, StyleSheet } from 'react-native'
import { Box, Text, ScrollView } from 'native-base';
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setLoading, setTerms } from '../../redux/reducers/authReducer';
import { ApiRequestAsync } from '../../services/httpServices';
import { Dimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

const Terms = () => {
  const { TermsAndCondition, token } = useSelector((state: any) => state.AuthReducer);
  const dispatch = useDispatch();
  
  const callTermsApi = async () => {
    try {
      dispatch(setLoading(true))
      await ApiRequestAsync('GET', '/user/get-page?type=1', {}, token)
        .then((response: any) => {
          dispatch(setTerms(response.data.detail.description))
          dispatch(setLoading(false))
        }).catch((error: any) => {
          console.log(error);
          dispatch(setLoading(false))
        })
    } catch (error) {
      console.log(error)
      dispatch(setLoading(false))
    }
  };

  const source = {
    html: TermsAndCondition
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
    callTermsApi();
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

export default Terms

const styles = StyleSheet.create({

    container: {
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
    },
})