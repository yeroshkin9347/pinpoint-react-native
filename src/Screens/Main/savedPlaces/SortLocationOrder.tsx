import React from 'react'
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Dimensions,
    Text
} from 'react-native';
import DragabbleList from './DragabbleList';
import { useDispatch, useSelector } from 'react-redux';
import { addCategoryList, setLoading } from '../../../redux/reducers/authReducer';
import { ApiRequestAsync, ErrorToast } from '../../../services/httpServices';
import Icons from 'react-native-vector-icons/dist/AntDesign';
import { useNavigation } from '@react-navigation/native';

import { width } from '../../../Style/GlobalStyles/GlobalStyle';
import { useToast } from 'native-base';
const SortLocationOrder = () => {
    const dispatch = useDispatch();
    const { token, sortLocation } = useSelector(
        (state: any) => state.AuthReducer,
    );
    const toast = useToast();
    const toastid = 'test-toast';
    const navigation = useNavigation()
    const getCategoryData = () => {
        try {
            dispatch(setLoading(true));
            let data = new FormData();
            data.append('type', '0');
            ApiRequestAsync('GET', '/location/list?type=1', data, token)
                .then(async (data: any) => {
                    dispatch(setLoading(false));
                    if (data.data.list !== undefined) {
                        dispatch(addCategoryList(data.data.list));
                    }
                    dispatch(setLoading(false));
                    ErrorToast({ toast, id: toastid, errorMessage: 'Order Updated Successfully' });
                    navigation.goBack()
                })
                .catch(error => {
                    console.log(error);
                    dispatch(setLoading(false));
                });
        } catch (error) { }
    };
    return (
        <View style={styles.container}>
            <View style={styles.headerContent}>
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => navigation.goBack()}>

                    <Icons
                        name="arrowleft"
                        style={{
                            color: 'black',
                            fontSize: 20,
                            paddingVertical: 13,
                        }}
                    />

                </TouchableOpacity>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={styles.textHeading}>Sort Location Order</Text>
                </View>
            </View >
            <View style={{ height: Dimensions.get('window').height * 0.80, marginVertical: 10 }} >
                <DragabbleList data={sortLocation.data.locations} categoryId={sortLocation.data.id} getCategoryData={getCategoryData} />

            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
        backgroundColor: 'white',
    },
    headerContent: {
        marginVertical: 10,
        height: 50,
        display: 'flex',
        flexDirection: 'row',
        // width: width * 0.95,
    },
    button: {
        width: width * 0.95,
        alignSelf: 'center',
    },
    textHeading: {
        fontSize: 18,
        fontFamily: 'Poppins-SemiBold',
        paddingVertical: 13,
    },
});


export default SortLocationOrder