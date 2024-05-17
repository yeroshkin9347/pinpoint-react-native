import { StyleSheet } from 'react-native';

const auth = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageBackground: {
    flex: 1,
    resizeMode: 'cover', // or 'stretch' to fill the entire background
  },
  logoContainer: {
    flex : 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex : 2,
    paddingHorizontal : 10,
  },
  
  image: {
    width: 65,
    height: 65,
    resizeMode: 'contain',
    marginTop: 50,
  },
  indicator: {
    backgroundColor: 'blue',
  },
  tabBar: {
    backgroundColor: 'white',
  },
  label: {
    color: 'black',
    fontWeight: 'bold',
  },
});

export default auth;