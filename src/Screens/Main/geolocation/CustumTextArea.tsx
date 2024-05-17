import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Keyboard } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Button, Modal, TextArea, useToast, Actionsheet, FlatList, Box } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ApiRequestAsync, ErrorToast } from '../../../services/httpServices';
import { resetSavedLocation, setLoading, setreRerenderLocation, updateProfile, updateSavedLocation } from '../../../redux/reducers/authReducer';
import Loader from '../../../Components/Loader';
import IconEntypo from 'react-native-vector-icons/Entypo';


const CustumTextArea = ({data,handleLocation}) => {
  const [confirmField, setConfirmField] = useState(data);


  const confirmLocation =()=>{
    handleLocation(confirmField)
  }

  return (
    <>
      <TextArea
              h={140}
              onChangeText={text => setConfirmField(text)}
              value={confirmField}
              style={styles.textarea}
              placeholder="Enter Address"
              borderColor="#e3ffe9"
              focusOutlineColor={'transparent'}
            />
             <Button
              style={styles.confirmAmendBtn}
              size="lg"
              colorScheme="tertiary"
              onPress={confirmLocation}>
              Confirm/Amend Location
            </Button>
    </>

  );
};

export default React.memo(CustumTextArea);

const styles = StyleSheet.create({
  modalContent: {
    width: Dimensions.get('window').width,
    height: 500,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 20,
  },
  header_Modal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt: {
    color: 'black',
    paddingVertical: 10,
    fontSize: 19,
    fontWeight: 'bold',
  },
  modal: {
    width: '95%',
    height: '40%',
    backgroundColor: '#e8ffee',
    borderRadius: 12,
    paddingHorizontal: 10
  },
  textarea: {
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 6,
    fontSize: 20,
  },
  text: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
    marginBottom: 10,
  },

  btn: {
    width: Dimensions.get('window').width * 0.85,
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
    borderRadius: 8,
  },
  confirmAmendBtn: {
    width: Dimensions.get('window').width * 0.85,
    position: 'absolute',
    alignSelf: 'center',
    bottom: -60,
    borderRadius: 8,
  }
});
