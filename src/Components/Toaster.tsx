import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { Box, useToast } from 'native-base';

interface InputProps {
    message: any;
    showToaster: boolean;
}

const Toaster: React.FC<InputProps> = ({ message, showToaster }) => {
    const toast = useToast();
    const id = "test-toast";

    if (!toast.isActive(id)) {
        toast.show({
            id,
            render: () => {
                return <Box
                    style={styles.boxContainer}
                    _text={{ color: 'black', fontSize: 15 }}
                    bg="white"
                    px="3"
                    py="3"
                    mb={5}
                >
                    <Image
                        source={require('../Assets/icons/PinPointEye.png')}
                        style={styles.image} />
                    {message[2]}
                </Box>;
            }
        })
    }
    return (
        <View>
            <Text>Toaster</Text>
        </View>
    )
}

export default Toaster

const styles = StyleSheet.create({
    boxContainer: {
        width: '100%',
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
        borderColor: '#000',
        borderWidth: 0.01,
        borderRadius: 50,
        flexDirection: 'row'
    },
    image: {
        width: 20,
        height: 25,
        resizeMode: 'contain',
        padding: 2.5,
        marginRight: 10
    },
})