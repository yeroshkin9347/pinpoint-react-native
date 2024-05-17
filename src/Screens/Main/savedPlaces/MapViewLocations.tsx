import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { FlatList } from 'native-base';
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet, Dimensions, Linking, TouchableOpacity, Image ,Platform} from 'react-native'
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useSelector } from 'react-redux';
import LocationItem from './LocationItem';
import Geolocation from 'react-native-geolocation-service';
import SwitchHeader from '../../../Components/SwitchHeader';

const MapViewLocations = () => {
    const route = useRoute();
    const { selectedcategoryData }: any = route.params;
    const Nav = useNavigation();
    const mapRef = useRef<MapView>(null);
    console.log('selectedcategoryData', selectedcategoryData);
    const [terrain, setTerrain] = useState<string>('standard');
    const { emergencyLocation } = useSelector((state: any) => state.AuthReducer);
    const getShortAddress = (arg: string) => {
        return arg.substring(0, 20)
    }

    const openGoogleMaps = (item: any) => {
       
        let url = "";
        if (Platform.OS === 'android') {
        url = `https://www.google.com/maps/dir/?api=1&origin=${emergencyLocation?.latitude},${emergencyLocation?.longitude}&destination=${item.latitude},${item.longitude}`;
        } else {
          url = `comgooglemaps://?saddr=${emergencyLocation?.latitude},${emergencyLocation?.longitude}&daddr=${item.latitude},${item.longitude}&directionsmode=transit`;
        }
        Linking.openURL(url).catch(err =>
          console.error('Error opening Google Maps', err),
        );
    };

    useFocusEffect(
        useCallback(() => {
          Nav.setOptions({
            headerRight: () => <SwitchHeader setTerrain={setTerrain} />,
          });
        }, []),
      );

    useEffect(() => {
        const fetchData = async () => {
            if (selectedcategoryData.locations[0]?.latitude) {
                setTimeout(() => {
                    mapRef.current?.animateToRegion({
                        latitude:
                            selectedcategoryData.locations?.length > 0 &&
                                selectedcategoryData.locations[0]?.latitude !== null &&
                                selectedcategoryData.locations[0]?.latitude !== ''
                                ? Number(selectedcategoryData.locations[0]?.latitude)
                                : 13.406,
                        longitude:
                            selectedcategoryData.locations?.length > 0 &&
                                selectedcategoryData.locations[0]?.longitude !== null &&
                                selectedcategoryData.locations[0]?.longitude !== ''
                                ? Number(selectedcategoryData.locations[0]?.longitude)
                                : 123.3753,
                        latitudeDelta: 0.15,
                        longitudeDelta: 0.15,
                    });
                }, 300);
                
            }
        }

        fetchData()
    }, [selectedcategoryData.locations[0]?.latitude]);

    const renderItem = ({ item: locationItem }: any) => {
        return (
            <LocationItem
                locationItem={locationItem}
                fromMapView={true}
            // getCategoryData={getCategoryData}
            // setShowMoveModal={setShowMoveModal}
            />
        );
    };

    const goToUsersLocation = () => {
        Geolocation.getCurrentPosition(info => {
            let latitude = info.coords.latitude.toString();
            let longitude = info.coords.longitude.toString();
            mapRef.current?.animateToRegion({
                latitude:
                    emergencyLocation.latitude !== null &&
                        emergencyLocation.latitude !== ''
                        ? Number(emergencyLocation.latitude)
                        : 13.406,
                longitude:
                    emergencyLocation.longitude !== null &&
                        emergencyLocation.latitude !== ''
                        ? Number(emergencyLocation.longitude)
                        : 123.3753,
                latitudeDelta: 500 / (111.32 * 1000),
                longitudeDelta:
                    500 /
                    (Math.cos(
                        emergencyLocation.latitude !== null &&
                            emergencyLocation.latitude !== ''
                            ? Number(emergencyLocation.latitude)
                            : 13.406,
                    ) *
                        111.32 *
                        1000)
            });
            // const { longitude, latitude } = info.coords;
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                provider={PROVIDER_GOOGLE}
                ref={mapRef}
                style={styles.map}
                mapType={terrain !== 'standard' ? 'standard' : 'satellite'}
                showsUserLocation={false}>
                {selectedcategoryData.locations?.length > 0 && selectedcategoryData.locations.map((marker: any) => (
                    <Marker
                        key={marker.id}
                        coordinate={{
                            latitude: marker?.latitude ? Number(marker?.latitude) : 13.406,
                            longitude: marker?.longitude ? Number(marker?.longitude) : 123.3753,
                        }}
                        title={marker.title}
                        pinColor={'green'} // Set marker color
                    >
                        <Callout onPress={() => openGoogleMaps(marker)}>
                            <TouchableOpacity style={styles.textContainer} onPress={() => openGoogleMaps(marker)}>
                                <Text>{getShortAddress(marker.address)}</Text>
                                {/* <Text>{marker.description}</Text> */}
                            </TouchableOpacity>
                        </Callout>
                    </Marker>
                ))}
                {/* {pin && <Marker coordinate={pin} title="Selected Location" />} */}
            </MapView>
            <TouchableOpacity
                style={styles.myLocationButton}
                onPress={goToUsersLocation}>
                <Image
                    source={require('../../../Assets/icons/currentLocation.png')}
                    style={styles.image1}
                />
            </TouchableOpacity>
            <View style={styles.container_form}>
                <View style={styles.header}>
                    <Text style={styles.textHeading}>{selectedcategoryData.title}</Text>

                </View>
                <FlatList data={selectedcategoryData.locations} renderItem={renderItem} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        flex: 2,
        width: Dimensions.get('window').width,
    },
    textContainer: {
        width: 130
    },
    container_form: {
        height: Dimensions.get('window').height * 0.28,
        width: Dimensions.get('window').width,
        padding: 20,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 15,
    },
    textHeading: {
        fontSize: 20,
        color: 'black',
        fontFamily: 'Poppins-SemiBold',
    },
    image1: {
        width: 40,
        height: 40,
        padding: 2.5,
        marginRight: 10,
    },
    myLocationButton: {
        position: 'absolute',
        bottom: Dimensions.get('window').height * 0.28 + 10,
        right: 2,
        // top:100,
        borderRadius: 30,
        zIndex: 999,
    },
});

export default MapViewLocations