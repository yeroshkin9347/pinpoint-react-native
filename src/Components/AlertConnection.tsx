import { StyleSheet, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Alert, Text, Collapse } from 'native-base';

interface AlertProps {
    show: boolean;
    checkInternet?: () => void;
    message: string;
}

const AlertConnection = ({ checkInternet, show, message }: AlertProps) => {
    return (
        <Collapse isOpen={show} >
            <Alert
                w="100%"
                status={'error'}
                backgroundColor={'#5A5A5A'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                zIndex={999}
            >
                <View style={{ flexDirection: 'row' }} >
                    <Text paddingLeft={2} fontSize="md" color="white">
                        {message}
                    </Text>
                </View>
                <TouchableOpacity onPress={checkInternet} >
                    <View>
                        <Text fontSize="md" color="white">Retry</Text>
                    </View>
                </TouchableOpacity>
            </Alert>
        </Collapse>
    )
}

export default AlertConnection

const styles = StyleSheet.create({})