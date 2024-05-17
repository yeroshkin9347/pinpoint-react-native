import { Dimensions, StyleSheet } from 'react-native';
import React from 'react';
import { Box, Button, HStack, Modal, Text, VStack, View, useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetAppState,
  resetProfile,
  setFromUser,
  setLoading,
  setrerenderApp,
  userToken,
} from '../../../redux/reducers/authReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestAsync, ErrorToast } from '../../../services/httpServices';
import constantMessages, { noTag, yesTag } from '../../../Constants';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
interface modalInputProps {
  openModal: boolean;
  setOpenModal: any;
  message?: string,
  handleClickYes?: () => void,
  handleClickNo?: () => void,
  fromLocationContacts ? : any
}

const SignOutModal = ({ openModal, setOpenModal, message, handleClickYes, handleClickNo,fromLocationContacts }: modalInputProps) => {
  const dispatch = useDispatch();
  const { token } = useSelector((state: any) => state.AuthReducer);
  const toast = useToast();
  const id = 'test-toast';

  const handleLogout = async () => {
    if(fromLocationContacts){
      setOpenModal({existingModal : false , isDetail : true});
    }else{
      setOpenModal(false);
    }
    if (handleClickYes) {
      handleClickYes()
    } else {
      dispatch(setLoading(true));
      // await GoogleSignin.signOut();
      await ApiRequestAsync('GET', '/user/logout', {}, token)
        .then(async (response: any) => {
          await AsyncStorage.removeItem('@MyApp_user');
          await AsyncStorage.removeItem('@Remember_user');
          dispatch(resetAppState());
          dispatch(userToken(''));
          dispatch(setFromUser(false));
          dispatch(setLoading(false));
          dispatch(setrerenderApp());
          dispatch(resetProfile());
          let errorMessage = 'Sign Out Successfully';
          if (!toast.isActive(id)) {
            ErrorToast({ toast, id, errorMessage });
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    }
  };

  const handleLogoutOnNo = async () => {
    if (handleClickNo) {
      handleClickNo()
    } else {
      dispatch(setLoading(true));
      setOpenModal(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <Modal isOpen={openModal}>
      <View style={styles.viewStyle}>
        <Text style={styles.textStyle} fontWeight="medium">
          {message ?? 'Are you sure you want to sign out?'}
        </Text>
        <View style={styles.buttonBox}>
          <Button onPress={handleLogoutOnNo} style={styles.button}>
            <Text style={styles.text}>{message == constantMessages.isLocationtxt ? "Cancel" : `${noTag.no}`}</Text>
          </Button>
          <Button onPress={handleLogout} style={styles.button}>
            <Text style={styles.text}> {message == constantMessages.isLocationtxt ? "Settings" : `${yesTag.yes}`}</Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default SignOutModal;

const styles = StyleSheet.create({
  buttonBox: {
    width: Dimensions.get('window').width * 0.80,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    padding: 25,
    backgroundColor: '#fff',
    color: 'green.100',
  },
  text: {
    color: 'green',
    textAlign: 'center',
    fontSize: 17
  },
  viewStyle: {
    width: Dimensions.get('window').width * 0.85,
    backgroundColor: 'white',
    borderRadius: 0,
  },
  textStyle: {
    fontWeight: 'normal',
    paddingTop: 15,
    paddingLeft: 15,
    fontSize: constantMessages.isLocationtxt ? 15 : 17,
    textAlign: 'left'
  }
});
