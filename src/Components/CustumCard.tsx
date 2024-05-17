import React, { useState } from 'react'
import { View, Text, Heading, VStack, Box, Center, NativeBaseProvider, Modal, Button, Checkbox } from "native-base";
import { ScrollView, StyleSheet, Dimensions, } from 'react-native';
import CustomButton from './CustomButton';
import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';


const CustumCard = ({ text, text1, text2, text3 }) => {

  const [showModal, setShowModal] = useState(false);
  const [Show, setShow] = useState<boolean>(false);
  const [showbutton, setShowbutton] = useState(false);
  const [check, setCheck] = useState(false);


  const navigation: NavigationProp<ReactNavigation.RootParamList> =
  useNavigation();

  const onChangeCheck = () => {
    setCheck(!check);
    setShowbutton(!showbutton);
  };

  return (
    <Center w="100%">
      <Box safeArea pt="4" w="95%" maxW="290%">
        <VStack space={3}>
          <View>
            <View style={styles.card1}>
              <View style={styles.card2}>
                <Heading style={styles.heading1}>
                  {text}
                </Heading>
                <Text style={styles.text1}>{text1} <Text style={styles.text2}>{text2}</Text> </Text>
                <Text style={styles.text3}>{text3}</Text>
                <Button style={styles.button1} onPress={() => setShowModal(true)} type={''}>
                <Text style={styles.txt}>
                Subscribe Now
                </Text>
          </Button>
                <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
                  <Modal.Content style={styles.Content}>
                    <Modal.CloseButton color='white' />
                    <Modal.Header style={styles.Header}><Text style={{ color: 'white', fontSize: 17 }}> Subscribe</Text></Modal.Header>
                    <Modal.Body>
                      <Box
                        mt="3"
                        style={{ flexDirection: 'row' }}>
                        <Checkbox
                          opacity="0.5"
                          colorScheme="gray"
                          value="one"
                          size="md"
                          isChecked={check}
                          onChange={() => onChangeCheck()} />
                        <Text style={{ fontSize: 18, paddingHorizontal: 10 }}>
                          I agree to <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 18 }} onPress={()=> navigation.navigate('Terms' as never)}>Terms</Text> & <Text style={{ color: 'green', fontWeight: 'bold', fontSize: 18 }} onPress={()=> navigation.navigate('Policy')}>Policy</Text>
                        </Text>
                        {showbutton === true ? (
                          <Button style={styles.button}
                            onPress={() => navigation.navigate('Card Details' as never )}
                          >
                            Next
                          </Button>
                        ) : ('')}

                      </Box>
                    </Modal.Body>

                  </Modal.Content>
                </Modal>
              </View>
            </View>
          </View>
        </VStack>
      </Box>
    </Center>
  )
}

export default CustumCard

const styles = StyleSheet.create({
  Header: {
    alignItems: 'center',
    backgroundColor: '#2F965F',
  },
  Content: {
    width: 500,
  },
  button: {
    width: 80,
    height: 35,
    paddingTop: -1,
    paddingBottom: -10,
    backgroundColor: '#2F965F',
    marginTop: 30,
    marginLeft: 30,
  },
  button1: {
    width: Dimensions.get('window').width * 0.55,
    marginBottom: 7,
    alignSelf: 'center',
    bottom: 10,
    backgroundColor: "white",
  },
  txt: {
    color: "green",
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    borderRadius: 6,
    elevation: 3,
    backgroundColor: '#2F965F',
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginHorizontal: 0,
    marginVertical: 5,
  },
  heading: {
    color: '#fff',
    marginTop: 7,
    marginHorizontal: 12,
    fontSize: 16,
    marginBottom: -3,
  },
  text: {
    color: '#fff',
    marginHorizontal: 12,
    marginBottom: 10,
    fontSize: 11,
  },


  card1: {
    borderRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'green',
    backgroundColor: 'white',
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginHorizontal: 35,
    marginVertical: 25,
  },
  card2: {
    borderRadius: 16,
    elevation: 3,
    borderColor: '#FFF',
    backgroundColor: '#2F965F',
    shadowOffset: { width: 1, height: 1 },
    shadowColor: '#333',
    shadowOpacity: 0.3,
    shadowRadius: 2,
    marginHorizontal: 15,
    marginVertical: 15,

  },
  heading1: {
    color: '#fff',
    marginTop: 17,
    marginHorizontal: 12,
    textAlign: 'center',
    fontSize: 25,
    marginBottom: -3,
  },
  text1: {
    color: '#fff',
    marginHorizontal: 12,
    marginBottom: 10,
    paddingLeft: 50,
    textAlign: 'center',
    paddingTop: 35,
    fontSize: 40,
    fontWeight: 'bold',
  },
  text2: {
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    paddingLeft: 180,
    fontSize: 18,
  },
  text3: {
    color: '#fff',
    marginHorizontal: 12,
    textAlign: 'center',
    paddingTop: 50,
    paddingBottom: 120,
    fontSize: 12,
  },
});