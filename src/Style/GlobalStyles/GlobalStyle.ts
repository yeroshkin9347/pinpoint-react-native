import { Dimensions } from "react-native"
import { StyleSheet } from "react-native"


export const globalStyles = StyleSheet.create({
    label: {
        fontSize: 18
    },
    text: {
        fontWeight: '600',
        fontSize: 18
    },
    root: {
        backgroundColor: 'white',
        flex : 1
      },
})

export const width = Dimensions.get('window').width
export const height = Dimensions.get('window').height

export const colorPrimary = '#2F965F'
export const colorSecondary = '#C8C8C8'