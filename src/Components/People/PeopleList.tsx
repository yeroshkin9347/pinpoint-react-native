import React, { useState, useEffect } from 'react'
import {
    Avatar,
    Box,
    Text,
} from 'native-base';
import { StyleSheet } from 'react-native';
import { FlatList, View, TouchableOpacity } from 'react-native';
import { ApiRequestAsync, ApiRequestWithParamAsync, BaseURL, myApiKey } from '../../services/httpServices';
import { colorPrimary, colorSecondary } from '../../Style/GlobalStyles/GlobalStyle';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import SignOutModal from '../../Screens/Main/Settings/SignOutModal';
import constantMessages from '../../Constants';
import { getsharedLocations, setLoading } from '../../redux/reducers/authReducer';

const PeopleList = ({ item }: any) => {
    const { emergencyLocation, token, profile } = useSelector(
        (state: any) => state.AuthReducer,
    );
    let [miles, setMiles] = useState(0);
    const [userAddress, setUserAddress] = useState('')
    const [openModal, setOpenModal] = useState(false);
    const [contactNumber, setContactNumber] = useState({
        number: '',
        location_share_by_me: false
    });

    const dispatch = useDispatch();

    const fetchData = async () => {
        ApiRequestAsync('GET', '/contact/get-lat-long', {}, token)
            .then(response => {
                if (response.data.list) {
                    dispatch(getsharedLocations(response.data.list))
                }
            })
            .catch(error => {
                // dispatch(setLoading(false));
                console.log(error);
            })
    }
    const validTimeFun = () => {
        try {
            let validityPeriod = 15 * 60 * 1000;

            if (item.item.location_type == 2) {
                validityPeriod = 8 * 60 * 60 * 1000;
            } else if (item.item.location_type == 1) {
                validityPeriod = 1 * 60 * 60 * 1000;
            }

            const startTime = new Date(item?.item["location_share_time"]).getTime();
            const endTime = startTime + validityPeriod;
            let validTime = new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return validTime
        } catch (e) {
            console.log(e)
            return ""
        }
    }

    const deg2rad = (deg: any) => {
        return deg * (Math.PI / 180);
    }

    const rad2deg = (rad: any) => {
        return rad * (180 / Math.PI);
    }

    const getDistanceBetween = (lat1: any, lon1: any, lat2: any, lon2: any) => {
        const theta = lon1 - lon2;
        let dist =
            Math.sin(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) +
            Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.cos(deg2rad(theta));
        dist = Math.acos(dist);
        dist = rad2deg(dist);
        dist = dist * 60 * 1.60934; // Convert to kilometers
        return dist;
    }

    const calculateDistance = async () => {

        const distanceInMiles = getDistanceBetween(
            emergencyLocation?.latitude,
            emergencyLocation?.longitude,
            item.item.latitude,
            item.item.longitude
        )

        setMiles(distanceInMiles);
        try {
            if (emergencyLocation?.address) {
                const googleurl = `https://maps.googleapis.com/maps/api/geocode/json?address=${item.item.latitude},${item.item.longitude}&key=${myApiKey}`;
                const response1 = await axios.get(googleurl);
                const address = response1.data.results[0].formatted_address;
                setUserAddress(address)
            }
        } catch (error) {
            console.error(error);
        }
    };

useEffect(() => {
    calculateDistance()
}, [emergencyLocation?.address])

const handleStopShare = (arg: any) => {
    setOpenModal(true);
    setContactNumber({ number: arg.contact_no, location_share_by_me: arg.location_share_by_me });
}
const StopShareApi = async () => {
    dispatch(setLoading(true));
    await ApiRequestWithParamAsync(
        'POST',
        '/contact/stop-share-location',
        { contact: !contactNumber.location_share_by_me ? profile.contact_no : contactNumber.number },
        token,
        'application/json',
        {},
    )
        .then(response => {
            dispatch(setLoading(false));
            fetchData();
        })
        .catch(error => {
            console.log(error);
            dispatch(setLoading(false));
        })
}

return (
    <>
        <Box
            borderBottomWidth="1"
            _dark={{
                borderColor: 'muted.50',
            }}
            borderColor="muted.800"

            py="2">

            <View style={{ flexDirection: "row" }} >
                <Avatar
                    size="38px"
                    source={{
                        uri:
                            item?.item.profile_file !== undefined &&
                                item?.item.profile_file !== ''
                                ? `${BaseURL}${item?.item.profile_file}`
                                : 'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI=',
                    }}
                />

                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                        <View style={{ flex: 5, paddingHorizontal: 10 }}>
                            <Text
                                paddingBottom={1}
                                color={colorPrimary}
                                bold>
                                {item?.item.full_name !== undefined
                                    ? item?.item.full_name
                                    : ''}
                            </Text>

                            <Text
                                style={styles.paraText1}>
                                {item?.item.location_share_by_me ? 'Follows You' : "Followed By You"}
                            </Text>

                            <Text
                            style={styles.paraText}
                          >
                            {!item?.item.location_share_by_me ? userAddress : ""}
                          </Text>

                        </View>
                        <View style={{ flex: 1 }}>
                            <TouchableOpacity
                                onPress={() => { }}>
                                <Text onPress={() => handleStopShare(item.item)} style={styles.stopButton} >Stop</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ marginTop: 5, paddingHorizontal: 12, flexDirection: "row", justifyContent: 'space-between' }}>

                        <Text style={styles.validTillTxt}>
                            {(!item?.item.location_share_by_me) ? `${miles.toFixed(2)} miles` : ''}
                        </Text>
                        <Text style={styles.validTillTxt}>Valid Till : {validTimeFun()}</Text>

                    </View>
                </View>


            </View>


        </Box>
        {openModal && (
            <SignOutModal
                handleClickYes={StopShareApi}
                message={constantMessages.DeleteModaltxt}
                openModal={openModal}
                setOpenModal={setOpenModal}
            />
        )}
    </>
)
}

export default PeopleList



const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 90
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    textHeading: {
        fontSize: 16,
        fontFamily: 'Poppins-SemiBold',
    },
    paraText: {
        color: colorSecondary,
        fontSize: 14,
        fontFamily: 'Poppins-Regular',
    },
    paraText1: {
        color: colorSecondary,
        fontSize: 12,
        fontFamily: 'Poppins-Regular',
    },
    stopButton: {
        fontSize: 13,
        fontFamily: 'Poppins-SemiBold',
        color: 'red',
    },
    validTillTxt: {
        fontSize: 12,
        fontFamily: 'Poppins-SemiBold',
        color: 'green',
    }
});