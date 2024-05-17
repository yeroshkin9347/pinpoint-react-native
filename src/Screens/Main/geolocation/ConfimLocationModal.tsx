import { StyleSheet, Text, View, Dimensions, TouchableOpacity, Keyboard } from 'react-native';
import React, { useCallback, useState } from 'react';
import { Button, Modal, TextArea, useToast, Actionsheet, FlatList, Box } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { ApiRequestAsync, ErrorToast, getPlusCode } from '../../../services/httpServices';
import { resetApplink, resetSavedLocation, setLoading, setreRerenderLocation, updateProfile, updateSavedLocation } from '../../../redux/reducers/authReducer';
import Loader from '../../../Components/Loader';
import IconEntypo from 'react-native-vector-icons/Entypo';
import CustumTextArea from './CustumTextArea';
interface InputProps {
  isOpen: boolean;
  setOpen: any;
  fromSaved?: boolean;
  fromAddLocation: string;
  savedPosition?: any;
  setSavedPosition?: any
}

const ConfimLocationModal = ({ isOpen, setOpen, fromSaved, fromAddLocation, savedPosition, setSavedPosition }: InputProps) => {
  const [openActionSheet, setOpenActionSheet] = useState<any>(false);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { profile, fromSignUp, savedLocation, token, isLoading, fromLocationrenderer, appLink, categoryList } = useSelector(
    (state: any) => state.AuthReducer,
  );
  const toast = useToast();
  const id = 'test-toast';


  const saveLocation = async (confirmField='') => {
    dispatch(resetApplink())
    dispatch(setLoading(true));
    let data = new FormData();
    
    const pluscode = await getPlusCode(savedLocation.latitude, savedLocation.longitude);
    const  pluscodesplit = pluscode.split(' ')
    data.append('Location[longitude]', savedLocation.longitude);
    data.append('Location[latitude]', savedLocation.latitude);
    data.append('Location[address]', confirmField ? confirmField : savedLocation.address);
    data.append('Location[category_id]', savedLocation.categoryId);
    // New Plus Code Property Added
    data.append('Location[pluscode]', pluscodesplit[0]);

    ApiRequestAsync('POST', !fromLocationrenderer ? '/location/add' : `/location/update-location?id=${savedLocation.locationId}`, data, token)
      .then(async (data: any) => {
        dispatch(setLoading(false));
        if (data.data.detail) {
          if (!toast.isActive(id)) {
            ErrorToast({ toast, id, errorMessage: data.data.message });
          }
          dispatch(setreRerenderLocation(true));
          dispatch(resetSavedLocation());
          setOpen(false)
          navigation.navigate('Saved Places & New Locations' as never);
        }
      })
      .catch(error => {
        dispatch(setLoading(false));
        //   if (!toast.isActive(id)) {
        //     ErrorToast({ toast, id, errorMessage: errorMsg.message.contact_no[0] });
        //   }
      });
  };


  const handleLocation = (confirmField : string) => {
    if (appLink.longitude) {
      if (fromAddLocation === "SavedLocation") {
        setOpen(false);
        navigation.navigate("Location Contacts" as never);
      } else {
        setOpenActionSheet(true);
      }
    }
    else {
      if (fromSaved) {
        dispatch(
          updateSavedLocation({
            ['address']: confirmField,
          }),
        );
        if (fromAddLocation === "fromAddLocation") {
          saveLocation(confirmField);
        } else if (fromAddLocation === "SavedLocation") {
          setOpen(false);
          navigation.navigate("Location Contacts" as never);
        }
      } else {
        dispatch(
          updateProfile({
            ['current_latitude']: savedPosition.latitude,
            ['current_longitude']: savedPosition.longitude,
            ['address']: confirmField,
          }),
        );
        setOpen(false);
        let routeName = 'MainProfileSetup'
        if (fromSignUp) {
          routeName = "ProfileSetup"
        }
        navigation.navigate(routeName as never);
      }
    }
  }

  const selectCategory = (id: any) => {
    dispatch(updateSavedLocation({ categoryId: id }));
  };


  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setOpen(false)}>
        {isLoading && <Loader isLoading={isLoading} />}
        <View style={styles.modal}>
          <TouchableOpacity onPress={Keyboard.dismiss} activeOpacity={1} >
            <Modal.CloseButton color="white" />
            <Icon
              name="map-marker-outline"
              style={{ color: 'green', marginTop: 10, alignSelf: 'center' }}
              size={32}
            />
            <Text style={styles.text}>Confirm Address Line</Text>
            <CustumTextArea data={fromSaved ? savedLocation.address : savedPosition.address} handleLocation={handleLocation} />
            {/* <Button
              style={styles.confirmAmendBtn}
              size="lg"
              colorScheme="tertiary"
              onPress={handleLocation}>
              Confirm/Amend Location
            </Button> */}
          </TouchableOpacity>
        </View>
      </Modal>

      <Actionsheet isOpen={openActionSheet} onClose={() => setOpenActionSheet(false)}>
        <View style={styles.modalContent}>
          <View style={styles.header_Modal}>
            <Text style={styles.txt}>
              {'Move to'}
            </Text>
            <View style={{ marginTop: 10 }}>
              <IconEntypo
                name="cross"
                size={25}
                color="red"
                onPress={() => setOpenActionSheet(false)}
              />
            </View>
          </View>
          <FlatList
            data={categoryList}
            renderItem={({ item }: { item: any }) => {
              return (
                <Box
                  borderBottomWidth="1"
                  _dark={{
                    borderColor: 'muted.50',
                  }}
                  borderColor="muted.800"
                  py="2">
                  <TouchableOpacity
                    onPress={() => selectCategory(item.id)}>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingRight: 5,
                      }}>
                      <Text style={styles.text}>
                        {item.title}
                      </Text>
                      {savedLocation.categoryId == item.id ? (
                        <Icon
                          name="check"
                          style={{ fontSize: 25, color: 'green' }}
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                </Box>
              );
            }}
          />
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Button
              style={styles.btn}
              size="lg"
              position={'absolute'}
              mt="2"
              colorScheme="tertiary"
              onPress={() =>saveLocation('')}>
              Save
            </Button>
          </View>


        </View>
      </Actionsheet>
    </>

  );
};

export default ConfimLocationModal;

const styles = StyleSheet.create({
  modalContent: {
    width: Dimensions.get('window').width,
    height: 500,
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 20,
  },
  header_Modal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt: {
    color: 'black',
    paddingVertical: 10,
    fontSize: 19,
    fontWeight: 'bold',
  },
  modal: {
    width: '95%',
    height: '40%',
    backgroundColor: '#e8ffee',
    borderRadius: 12,
    paddingHorizontal: 10
  },
  textarea: {
    paddingBottom: 40,
    backgroundColor: '#fff',
    borderRadius: 6,
    fontSize: 20,
  },
  text: {
    fontSize: 16,
    color: 'green',
    textAlign: 'center',
    marginBottom: 10,
  },

  btn: {
    width: Dimensions.get('window').width * 0.85,
    position: 'absolute',
    alignSelf: 'center',
    bottom: 20,
    borderRadius: 8,
  },
  confirmAmendBtn: {
    width: Dimensions.get('window').width * 0.85,
    position: 'absolute',
    alignSelf: 'center',
    bottom: -60,
    borderRadius: 8,
  }
});
