import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text } from 'react-native';
import { colorPrimary } from '../Style/GlobalStyles/GlobalStyle';

type LoaderProps = {
    isLoading: boolean;
  };
  
  const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
    return (
      <Modal transparent visible={isLoading} style={styles.container}>
        <View style={styles.blurContainer}>
          <ActivityIndicator size="large" color={'gray'} />
          <Text style={styles.textStyle} >Please Wait</Text>
        </View>
      </Modal>
    );
  };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    textStyle: {
      fontSize: 20,
      color: 'white'
    }
});

export default Loader;
