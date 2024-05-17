import React, { useState } from 'react';
import {
  Menu,
  HamburgerIcon,
  Box,
  Pressable,
  Center,
  NativeBaseProvider,
  Modal,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetSavedLocation,
  setFromLocationrenderer,
  setLoading,
  setLocationSave,
  setSortLocation,
  updateCategory,
  updateSavedLocation,
} from '../redux/reducers/authReducer';
import { Dimensions, StyleSheet, Linking, Share , TouchableOpacity } from 'react-native';
import { ApiRequestAsync, ErrorToast } from '../services/httpServices';
import axios from 'axios';

interface InputProps {
  id?: number;
  setModalVisible?: any;
  pdfLink?: string;
  csv_link?: string;
  latitude?: string;
  longitude?: string;
  plusCode?: string;
  address?: string;
  title?: string | null;
  locationId?: number;
  fromLocationItem?: boolean | null;
  locations?: Array<any> | null;
  getCategoryData?: () => void;
  getLocationList?: () => void;
  setShowMoveModal?: any;
  fromSentTome?: boolean;
  moveHandler?: any
  item?: any
}

function NativeMenu({
  id,
  setModalVisible,
  pdfLink,
  csv_link,
  latitude,
  longitude,
  title,
  fromLocationItem,
  locations,
  address,
  plusCode,
  locationId,
  getCategoryData,
  getLocationList,
  setShowMoveModal,
  fromSentTome,
  moveHandler,
  item,
}: InputProps) {
  const [openModal, setOpenModal] = useState(false);
  const { categoryList, categoryData, token } = useSelector(
    (state: any) => state.AuthReducer,
  );
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const toast = useToast();
  const toastid = 'test-toast';

  const handleAddNewLocation = (fromLocation: string, arg: any) => {
    dispatch(updateSavedLocation({ longitude: 0, latitude: 0, address: '' }));
    if (id !== undefined) {
      dispatch(updateSavedLocation({ ['categoryId']: id }));
    }
    if (fromLocation === 'fromEdit') {
      const { locationId, longitude, latitude, address } = arg
      dispatch(setFromLocationrenderer(true));
      dispatch(updateSavedLocation({ locationId, longitude, latitude, address }));
    } else {
      dispatch(setFromLocationrenderer(false));
      if (locations?.length > 0) {
        dispatch(updateSavedLocation({ longitude: locations[locations.length - 1].longitude, latitude: locations[locations.length - 1].latitude, address: locations[locations.length - 1].address }));
      }
      // dispatch(updateSavedLocation({locationId,longitude,latitude,address}));
    }
    navigation.navigate('Save Location' as never);
  };

  const handleShareLocation = async () => {
    if (fromLocationItem) {
      const googleMapsLink = `https://www.google.com/maps/place/${latitude},${longitude}/@${latitude},${longitude}z`;

      const response = await axios.get(
        `https://tinyurl.com/api-create.php?url=${googleMapsLink}/`
      );

      const shortURL = response.data;

      const message =
        `Here is my Saved Place:\n\n`
        + `${address}\n\n`
        + `Google Map URL\n`
        + `${shortURL}\n\n`
        + `Plus Code:\n`
        + `${plusCode}\n\n`
        + `To update a selected Contact with this location, copy this message to the clipboard and select Update Contact from the PPE menu.\n\n`
        + `Get the benefits of a feature-rich & versatile Location & Sharing experience � www.pinpointeye.com Free to use for 14 days.`;

      // const url = `sms:?body=${encodeURIComponent(message)}`;
      await Share.share({
        message: message,
      });
      dispatch(setLoading(false));

      // Linking.openURL(url).catch(error => {
      //   console.error('Failed to open Messages app:', error);
      //   dispatch(setLoading(false));
      // });

    } else {
      if (locations?.length) {
        dispatch(updateSavedLocation({ pdfLink, title, ['categoryId']: id , csv_link }));
        dispatch(setLocationSave(true));
        navigation.navigate('Contacts' as never);
      } else {
        if (!toast.isActive(toastid)) {
          ErrorToast({
            toast,
            id: toastid,
            errorMessage: 'You are not allowed to share a blank list',
          });
        }
      }
    }
  };

  const handleEditCategory = () => {
    try {
      dispatch(updateCategory({ id, title }));
      setModalVisible(true);
    } catch (err) { }
  };

  const deleteCategory = () => {
    try {
      let data = new FormData();
      data.append('Category[title]', title);
      ApiRequestAsync(
        'delete',
        `/location/delete-category?cat_id=${id}`,
        data,
        token,
      )
        .then(async (data: any) => {
          if (data.data.message) {
            if (!toast.isActive(toastid)) {
              ErrorToast({ toast, id: toastid, errorMessage: data.data.message });
            }
            if (getCategoryData) {
              getCategoryData();
              getLocationList();
            }
          }
          setOpenModal(false);
          dispatch(setLoading(false));
        })
        .catch(error => {
          setOpenModal(false);
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (err) {

    }
  }

  const deleteLocation = () => {
    try {
      let data = new FormData();
      data.append('Location[longitude]', longitude);
      data.append('Location[latitude]', latitude);
      data.append('Location[address]', address);
      data.append('Location[category_id]', id);
      ApiRequestAsync(
        'delete',
        `/location/delete-location?id=${locationId}`,
        data,
        token,
      )
        .then(async (data: any) => {
          if (data.data.message) {
            if (!toast.isActive(toastid)) {
              ErrorToast({ toast, id: toastid, errorMessage: data.data.message });
            }
            if (getCategoryData) {
              getCategoryData();
            }
          }
          setOpenModal(false);
          dispatch(setLoading(false));
        })
        .catch(error => {
          setOpenModal(false);
          console.log(error);
          if (error._response !== undefined && error._response !== "") {
            const responceData = JSON.parse(error._response);
            if (responceData && responceData.message !== undefined && responceData.message !== "") {
              if (!toast.isActive(toastid)) {
                ErrorToast({ toast, id: toastid, errorMessage: responceData.message });
              }
            }
          }
          dispatch(setLoading(false));
        });
    } catch (err) {

    }
  }

  const handleDeletCategory = () => {
    try {
      dispatch(setLoading(true));
      if (fromLocationItem) {
        deleteLocation()
      } else {
        deleteCategory()
      }

    } catch (e) { }
  };

  const handleMove = () => {
    setShowMoveModal(true)
    dispatch(updateSavedLocation({ locationId, longitude, latitude, address }));
  }

  const handleMapView = () => {
    if (locations?.length) {
      navigation.navigate('Map View', {
        selectedcategoryData: { locations, title },
      })
    } else {
      if (!toast.isActive(toastid)) {
        ErrorToast({
          toast,
          id: toastid,
          errorMessage: 'No Location Found',
        });
      }
    }
  }

  const handleSort = () =>{
    navigation.navigate('SortLocationOrder')
    dispatch(setSortLocation({data : item}))
  }
  return (
    <>
      <Box>
        {fromLocationItem ? (
          <Menu
            w="200"
            shouldOverlapWithTrigger={false} // @ts-ignore
            placement={'left bottom'}
            padding={0}
            trigger={triggerProps => {
              return (
                <Pressable
                  accessibilityLabel="More options menu"
                  {...triggerProps}>
                  <Icon
                    name="dots-horizontal"
                    style={{
                      fontSize: 25,
                      color: 'black',
                      paddingTop: 6,
                      paddingBottom: 6,
                      paddingLeft: 25,
                      paddingRight: 25,
                    }}
                  />
                </Pressable>
              );
            }}>
            <Menu.Item style={{ backgroundColor: '#e8ffee' }} onPress={handleMove}>
              <MaterialIcons
                name="add-location-alt"
                style={{ fontSize: 20, color: 'black' }}
              />
              <Text style={{ color: 'grey' }}>Move</Text>
            </Menu.Item>
            <Menu.Item
              style={{ backgroundColor: '#e8ffee' }}
              onPress={() => handleAddNewLocation('fromEdit', { locationId, longitude, latitude, address })}>
              <MaterialIcons
                name="edit"
                style={{ fontSize: 20, color: 'black' }}
              />
              <Text style={{ color: 'grey' }}>Edit</Text>
            </Menu.Item>
            <Menu.Item
              style={{ backgroundColor: '#e8ffee' }}
              onPress={handleShareLocation}>
              <MaterialIcons
                name="share"
                style={{ fontSize: 20, color: 'black' }}
              />
              <Text style={{ color: 'grey' }}>Share</Text>
            </Menu.Item>
            <Menu.Item
              style={{ backgroundColor: '#e8ffee' }}
              onPress={() => setOpenModal(true)}>
              <Ionicons
                name="ios-trash-bin-sharp"
                style={{ fontSize: 20, color: 'black' }}
              />
              <Text style={{ color: 'grey' }}>Delete</Text>
            </Menu.Item>
          </Menu>
        ) : (

          <Menu
            w="215"
            shouldOverlapWithTrigger={false} // @ts-ignore
            placement={'left bottom'}
            padding={0}
            trigger={triggerProps => {
              return (
                <Pressable
                  accessibilityLabel="More options menu"
                  {...triggerProps}>
                  <Icon
                    name="dots-vertical"
                    style={{
                      fontSize: 25,
                      color: 'black',
                      paddingTop: 6,
                      paddingBottom: 6,
                      paddingLeft: 25,
                      paddingRight: 25,
                    }}
                  />
                </Pressable>
              );
            }}>
            {fromSentTome ?
              <Menu.Item
                style={{ backgroundColor: '#e8ffee' }}
                onPress={() => moveHandler(id, title)}>
                <Icon
                  name="chevron-left"
                  style={{ fontSize: 20, color: 'black' }}
                />
                <Text style={{ color: 'grey' }}>Transfer To My Lists</Text>
              </Menu.Item>
              : (
                <>
                  <Menu.Item
                    style={{ backgroundColor: '#e8ffee' }}
                    onPress={handleMapView}>
                    <Ionicons
                      name="map"
                      style={{ fontSize: 20, color: 'black' }}
                    />
                    <Text style={{ color: 'grey' }}>Map View</Text>
                  </Menu.Item>
                  <Menu.Item
                    style={{ backgroundColor: '#e8ffee' }}
                    onPress={() => handleAddNewLocation('fromAdd',{})}>
                    <MaterialIcons
                      name="add-location-alt"
                      style={{ fontSize: 20, color: 'black' }}
                    />
                    <Text style={{ color: 'grey' }}>Add New Location</Text>
                  </Menu.Item>
                  {/* <Menu.Item
                    style={{ backgroundColor: '#e8ffee' }}
                    onPress={handleSort}
                    >
                    <MaterialIcons
                      name="add-location-alt"
                      style={{ fontSize: 20, color: 'black' }}
                    />
                    <Text style={{ color: 'grey' }}>Change Locations Order</Text>
                  </Menu.Item> */}
                  <Menu.Item
                    style={{ backgroundColor: '#e8ffee' }}
                    onPress={handleEditCategory}>
                    <MaterialIcons
                      name="edit"
                      style={{ fontSize: 20, color: 'black' }}
                    />
                    <Text style={{ color: 'grey' }}>Edit</Text>
                  </Menu.Item>
                  <Menu.Item
                    style={{ backgroundColor: '#e8ffee' }}
                    onPress={handleShareLocation}>
                    <MaterialIcons
                      name="share"
                      style={{ fontSize: 20, color: 'black' }}
                    />
                    <Text style={{ color: 'grey' }}>Share</Text>
                  </Menu.Item>
                </>

              )

            }

            <Menu.Item
              style={{ backgroundColor: '#e8ffee' }}
              onPress={() => setOpenModal(true)}>
              <Ionicons
                name="ios-trash-bin-sharp"
                style={{ fontSize: 20, color: 'black' }}
              />
              <Text style={{ color: 'grey' }}>Delete</Text>
            </Menu.Item>
          </Menu>
        )}
      </Box >

      <Modal isOpen={openModal}>
        <Modal.Content maxWidth="350" style={{ backgroundColor: 'white' }}>
          <Modal.Body>
            <VStack space={3}>
              <HStack alignItems="center" justifyContent="space-between">
                <Text style={styles.paragraphText}>
                  Are you sure that you want to delete this saved place?
                </Text>
              </HStack>
            </VStack>
            <Box style={styles.buttonBox}>
              <TouchableOpacity onPress={() => setOpenModal(false)} >
                <Text style={styles.text}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeletCategory} >
                <Text style={styles.text}>OK</Text>
              </TouchableOpacity>
            </Box>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </>
  );
}

export default NativeMenu;

const styles = StyleSheet.create({
  buttonBox: {
    flexDirection: 'row',
    justifyContent : 'flex-end'
  },
  button: {
    backgroundColor: '#fff',
    color: 'green.100',
  },
  text: {
    color: 'green',
    marginLeft : 10
  },
  paragraphText: {
    fontSize: 16,
  },
});
