import { StyleSheet } from 'react-native';
import {
  VStack,
  useToast,
  Input,
  FormControl,
  Box,
  Center,
  Text,
  View,
  Icon,
  Button,
} from 'native-base';
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import CustomInput from '../../../Components/CustomInput';
import { setLoading } from '../../../redux/reducers/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../../../Components/Loader';
import { AuthRequestAsync, ErrorToast } from '../../../services/httpServices';

const ForgetPassword = () => {
  const [formData, setFormData] = useState({
    email: '',
  });
  const dispatch = useDispatch()
  const { isLoading } = useSelector((state: any) => state.AuthReducer);
  const navigation = useNavigation();
  const toast = useToast();
  const id = "test-toast";
  const validateEmail = (email: any) => {
    const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const ValidationCheck = () => {
    if (formData.email === '') {
      ErrorToast({ toast, id, errorMessage: 'Please enter email' });
      return;
    } else if (formData.email !== '') {
      const isValid = validateEmail(formData.email);
      if (!isValid) {
        ErrorToast({ toast, id, errorMessage: 'Please enter valid email' });
        return;
      }
    }

    StoreCode();
  };

  const handleChange = (data: any, name: string) => {
    try {
      setFormData(pre => ({
        ...pre,
        [name]: data,
      }));
    } catch (e) { }
  };

  const StoreCode = async () => {
    try {
      dispatch(setLoading(true));

      let Data = new FormData();
      Data.append('User[email]', formData.email);

      await AuthRequestAsync('/user/forget-password', Data)
        .then(response => {
      
          dispatch(setLoading(false))
          let errorMessage = response.data?.message
          if (!toast.isActive(id)) {
            ErrorToast({ toast, id, errorMessage });
          }
        })
        .catch(error => {
          dispatch(setLoading(false));
        });

    } catch (e) {
      console.log(e);
    }
  };

  return (
    <View style={styles.container}>
      {isLoading && <Loader isLoading={isLoading} />}
      <Center w="100%">
        <Box safeArea p="2" py="8" w="100%" maxW="290%">
          <VStack space={3} mt="5">
            <View p="2">
              <Text fontSize="xl">
                Please enter the email associated with your account
              </Text>
            </View>
            <FormControl>
              <CustomInput
                variant="outline"
                fontSize="lg"
                placeholder="Email"
                InputLeftElementIcon="email-outline"
                focusOutlineColor={'coolGray.300'}
                value={formData.email}
                onChangeText={(text: any) => handleChange(text, 'email')}
                focusbackgroundColor={'coolGray.100'}
                InputRightElementIcon=""
                passwordState={false}
                isDisabled={false}
                type={'text'}
                keyboardType={"default"}
                setpasswordState={() => { }}
                InputRightElementFunction={() => { }}
                maxLength={100}
              />
            </FormControl>
            <Button
              _text={styles.text}
              size="lg"
              mt="2"
              colorScheme="tertiary"
              onPress={ValidationCheck}>
              Continue
            </Button>
          </VStack>
        </Box>
      </Center>
    </View>
  );
};

export default ForgetPassword;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
  },
  text: {
    fontWeight: '600',
    fontSize: 18,
  },
});
