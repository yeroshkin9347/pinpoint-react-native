import { StyleSheet } from 'react-native'
import { Text, Pressable } from 'native-base'
import React from 'react'

interface ButtonInterface {
  onPress: any;
  text: string;
  type: string;
}

const CustomButton = ({ onPress, text, type = "PRIMARY" }: ButtonInterface ) => {
  return (
    <Pressable style={[Styles.container, Styles.container_PRIMARY]}>
      <Text onPress={onPress} style={[Styles.text, Styles.text_PRIMARY]}>{text}</Text>
    </Pressable>

  );
};

const Styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 55,
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  container_PRIMARY: {
    backgroundColor: '#339861',
    marginTop: 50,
    borderRadius: 4,
  },
  container_TERTIARY: {
    width: '90%',
    backgroundColor: '#339861',
    height: 50,
    bottom: 20,
    alignSelf: 'center',
    borderRadius: 5,
    position: 'absolute'
  },
  container_SHORT: {
    width: '85%',
    backgroundColor: '#339861',
    height: 50,
    bottom: 20,
    alignSelf: 'center',
    borderRadius: 7,
    marginRight: 1,
    marginTop: 40,
  },
  container_white: {
    width: '80%',
    backgroundColor: 'white',
    height: 50,
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 30,
    marginBottom: 15,
  },
  text: {
    fontWeight: 'bold',
    color: 'white',
  },
  text_PRIMARY: {
    fontSize: 18,
  },
  text_SHORT: {
    fontSize: 18,
  },
  text_TERTIARY: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 17,

  },
  text_white: {
    color: '#339861',
    fontSize: 14,
  },
});

export default CustomButton