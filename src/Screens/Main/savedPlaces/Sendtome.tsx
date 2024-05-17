import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, TouchableOpacity, Dimensions, } from 'react-native';
import React, { useEffect, useState } from 'react';
import { colorSecondary } from '../../../Style/GlobalStyles/GlobalStyle';
import { useDispatch, useSelector } from 'react-redux';
import {
  addCategoryList,
  addSentToMeList,
  setLoading,
  updateSavedLocation,
} from '../../../redux/reducers/authReducer';
import { ApiRequestAsync, ErrorToast } from '../../../services/httpServices';
import Collapsible from 'react-native-collapsible';
import { Box, Button, FlatList, useToast } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LocationItem from './LocationItem';
import {
  default as Entypo,
  default as IconEntypo,
} from 'react-native-vector-icons/Entypo';
import NativeMenu from '../../../Components/CustomPicker';
import SignOutModal from '../Settings/SignOutModal';
import SentToMeGrid from './SentToMeGrid';
const screenHeight = Dimensions.get('window').height;

const Senttome = () => {
  const { token, sentToMeList, categoryList, savedLocation } = useSelector((state: any) => state.AuthReducer);
  const dispatch = useDispatch();
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [openMove, setOpenMove] = useState(false);
  const [dataId, setId] = useState(0)
  const toast = useToast();

  const getLocationList = () => {
    try {
      dispatch(setLoading(true));
      ApiRequestAsync('GET', '/location/list?type=2', {}, token)
        .then(response => {
          dispatch(setLoading(false));
          dispatch(addSentToMeList(response.data.list));
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) {
      dispatch(setLoading(false));
      console.log(error);
    }
  };

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
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) { }
  };

  useEffect(() => {
    getLocationList();
  }, []);

  const toggleAccordion = (index: number, id: number) => {
    dispatch(setLoading(true));
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter(i => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
    }
    setTimeout(() => {
      dispatch(setLoading(false));
    }, 700);
  };

  const renderItem = ({ item: locationItem }: any) => {
    return (
      <LocationItem
        locationItem={locationItem}
        getCategoryData={getLocationList}
        setShowMoveModal={setShowMoveModal}
      />
    );
  };

  const selectCategory = (id: any) => {
    dispatch(updateSavedLocation({ categoryId: id }));
  };

  const moveHandler = (id: number) => {
    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('Location[longitude]', '');
      data.append('Location[latitude]', '');
      data.append('Location[address]', '');
      data.append('Location[category_id]', id);
      ApiRequestAsync('POST', `/location/move-to-mylist?id=${id}`, data, token)
        .then((response: any) => {
          ErrorToast({
            toast,
            id: 'toastid',
            errorMessage: response.data.message,
          });
          getLocationList();
          getCategoryData();
          // dispatch(setLoading(false));
        })
        .catch((error: any) => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (error) {
      dispatch(setLoading(false));
      console.log(error);
    }
  };

  const moveLocation = () => {
    try {
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('Location[longitude]', savedLocation.longitude);
      data.append('Location[latitude]', savedLocation.latitude);
      data.append('Location[address]', savedLocation.address);
      data.append('Location[category_id]', savedLocation.categoryId);
      ApiRequestAsync(
        'POST',
        `/location/move?location_id=${savedLocation.locationId}&cat_id=${savedLocation.categoryId}`,
        data,
        token,
      )
        .then(async (data: any) => {
          if (data.data.message) {
            if (!toast.isActive('toastid')) {
              ErrorToast({ toast, id: 'toastid', errorMessage: data.data.message });
            }
            getLocationList();
            getCategoryData();

          }
          setShowMoveModal(false);
          dispatch(setLoading(false));
        })
        .catch(error => {
          setShowMoveModal(false);
          console.log(error);
          dispatch(setLoading(false));
          let { message } = JSON.parse(error['_response'])
          if (!toast.isActive('toastid')) {
            ErrorToast({ toast, id: 'toastid', errorMessage: message });
          }
        });
    } catch (err) { }
  };

  const handleClickYes = () => {
    setOpenMove(false);
    moveHandler(dataId);
    // if (!toast.isActive(id)) {
    //   ErrorToast({ toast, id: id, errorMessage: 'Category Merged Successfully.' });
    // }
  }

  const handleClickNo = () => {
    setOpenMove(false);
  }

  const openMoveModalFunc = (id: number, title: string) => {
    let isAlreadyExist = categoryList.some((item: { title: string; }) => item.title == title)
    if (isAlreadyExist) {
      setOpenMove(true);
      setId(id);
    } else {
      moveHandler(id);
    }
  }



  return (
    <>
      {sentToMeList.length > 0 ? (
        <View style={{ paddingHorizontal: 10 }}>
          <Box>
            <SentToMeGrid
              sentToMeList={sentToMeList}
              expandedIndices={expandedIndices}
              toggleAccordion={toggleAccordion}
              getCategoryData={getCategoryData}
              getLocationList={getLocationList}
              openMoveModalFunc={openMoveModalFunc}
              renderItem={renderItem}
            />
          </Box>
        </View>
      ) : (
        <View>
          <Text style={styles.paraText}>No Location found</Text>
        </View>
      )}

      <Modal visible={showMoveModal} animationType="slide" transparent={true}>
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.modalContainer}>
          <View style={{ backgroundColor: '#fff', paddingHorizontal: 8 }}>
            <View style={styles.header_Modal}>
              <Text style={styles.txt}>Move to</Text>
              <View style={{ marginTop: 20 }}>
                <IconEntypo
                  name="cross"
                  size={25}
                  color="red"
                  onPress={() => setShowMoveModal(false)}
                />
              </View>
            </View>

            <View style={{ height: screenHeight * 0.6, marginBottom: 10 }}>
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
                          <Text style={{ color: 'black', fontWeight: 'bold' }}>
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
            </View>

            <Button
              colorScheme="tertiary"
              onPress={moveLocation}
              style={{ marginBottom: 10 }}>
              Save
            </Button>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {openMove && (
        <SignOutModal
          openModal={openMove}
          setOpenModal={setOpenMove}
          message={'Do you wish to merge the category ?'}
          handleClickYes={handleClickYes}
          handleClickNo={handleClickNo}
        />
      )}

    </>
  );
};

export default Senttome;

const styles = StyleSheet.create({
  paraText: {
    color: colorSecondary,
    marginVertical: 70,
    fontSize: 13,
    alignSelf: 'center',
    fontFamily: 'Poppins-Regular',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  header_Modal: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  txt: {
    color: 'black',
    paddingHorizontal: 10,
    paddingVertical: 20,
    fontSize: 19,
    fontWeight: 'bold',
  },
});
