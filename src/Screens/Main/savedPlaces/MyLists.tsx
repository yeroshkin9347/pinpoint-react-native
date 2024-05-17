import { Box, Button, FlatList, FormControl, useToast } from 'native-base';
import React, { useState, useCallback } from 'react';
import {
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Collapsible from 'react-native-collapsible';
import {
  default as Entypo,
  default as IconEntypo,
} from 'react-native-vector-icons/Entypo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDispatch, useSelector } from 'react-redux';
import CustomInput from '../../../Components/CustomInput';
import NativeMenu from '../../../Components/CustomPicker';
import { colorSecondary } from '../../../Style/GlobalStyles/GlobalStyle';
import { CATEGORY_DATA } from '../../../redux/Interface/interface';
import {
  addCategoryList,
  resetSavedLocation,
  setLoading,
  updateCategory,
  updateSavedLocation,
} from '../../../redux/reducers/authReducer';
import LocationItem from './LocationItem';
import { ApiRequestAsync, ErrorToast } from '../../../services/httpServices';
import MyListGrid from './MyListGrid';
import MoveToModal from './MoveToModal';

const MyLists = () => {
  const { categoryList, categoryData, token, savedLocation } = useSelector(
    (state: any) => state.AuthReducer,
  );
  const dispatch = useDispatch();
  const [expandedIndices, setExpandedIndices] = useState<number[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const toast = useToast();
  const id = 'test-toast';
  const screenHeight = Dimensions.get('window').height;
  const toggleModal = () => {
    setIsModalVisible(!isModalVisible);
  };
  const toggleAccordion = (index: number, id: number) => {
    dispatch(updateSavedLocation({ ['categoryId']: id }));
    dispatch(setLoading(true));
    if (expandedIndices.includes(index)) {
      setExpandedIndices(expandedIndices.filter(i => i !== index));
    } else {
      setExpandedIndices([...expandedIndices, index]);
    }
    setTimeout(() => {
      dispatch(setLoading(false));
    }, 500);
  };

  const closeModal = () => {
    dispatch(updateCategory({ id: 0, title: '' }));
    setModalVisible(false);
  };

  const handleChange = (data: any) => {
    try {
      dispatch(updateCategory({ title: data }));
    } catch (error) {
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
            setModalVisible(false);
          }
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
          setModalVisible(false);
        });
    } catch (error) { }
  };

  const handleUpdateCategory = () => {
    try {
      if (!categoryData.title) {
        if (!toast.isActive(id)) {
          ErrorToast({ toast, id, errorMessage: 'Please enter category' });
        }
        return;
      }
      dispatch(setLoading(true));
      let data = new FormData();
      data.append('Category[title]', categoryData.title);

      ApiRequestAsync(
        'POST',
        `/location/update-category?cat_id=${categoryData.id}`,
        data,
        token,
      )
        .then(async (data_: any) => {
          // setErrorText(data.data)
          if (data_.data.detail !== undefined) {
            dispatch(updateCategory({ id: 0, title: '' }));
            if (!toast.isActive(id)) {
              ErrorToast({ toast, id, errorMessage: data_.data.message });
            }
            getCategoryData();
          }
          dispatch(setLoading(false));
          closeModal();
        })
        .catch(error => {
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (e) { }
  };

  const renderItem = ({ item: locationItem }: any) => {
    return (
      <LocationItem
        locationItem={locationItem}
        getCategoryData={getCategoryData}
        setShowMoveModal={setShowMoveModal}
      />
    );
  };

  const selectCategory = (id: any) => {
    dispatch(updateSavedLocation({ categoryId: id }));
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
            if (!toast.isActive(id)) {
              ErrorToast({ toast, id: id, errorMessage: data.data.message });
            }
            if (getCategoryData) {
              getCategoryData();
            }
          }
          dispatch(resetSavedLocation());
          setShowMoveModal(false);
          dispatch(setLoading(false));
        })
        .catch(error => {
          setShowMoveModal(false);
          console.log(error);
          dispatch(setLoading(false));
        });
    } catch (err) { }
  };

  const handleCategoryPress = (item: any, index: any) => {
    if (item?.locations?.length) {
      return toggleAccordion(index, item.id)
    } else {
      return ({})
    }
  }

  return (
    <>
      <View style={{ paddingHorizontal: 10 }}>
        <Box>
          <MyListGrid
            categoryList={categoryList}
            expandedIndices={expandedIndices}
            toggleAccordion={toggleAccordion}
            handleCategoryPress={handleCategoryPress}
            getCategoryData={getCategoryData}
            setModalVisible={setModalVisible}
            renderItem={renderItem}
          />
        </Box>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <KeyboardAvoidingView
            behavior="padding"
            style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.header_Modal}>
                <Text style={styles.txt}>Edit Category</Text>
                <View style={{ marginTop: 20 }}>
                  <IconEntypo
                    name="cross"
                    size={20}
                    color="red"
                    onPress={closeModal}
                  />
                </View>
              </View>

              <FormControl style={{ marginBottom: 30 }}>
                <CustomInput
                  variant="outline"
                  fontSize="lg"
                  placeholder=""
                  InputLeftElementIcon=""
                  focusOutlineColor={'coolGray.300'}
                  value={categoryData && categoryData.title}
                  onChangeText={(text: any) => handleChange(text)}
                  focusbackgroundColor={'coolGray.100'}
                  InputRightElementIcon=""
                  passwordState={false}
                  isDisabled={false}
                  setpasswordState={() => { }}
                  type={'text'}
                  keyboardType={'default'}
                  InputRightElementFunction={() => { }}
                  maxLength={100}
                />
              </FormControl>
              <Button
                bg="tertiary.600"
                style={styles.button}
                onPress={handleUpdateCategory}>
                Save
              </Button>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <MoveToModal
          categoryList={categoryList}
          showMoveModal={showMoveModal}
          setShowMoveModal={setShowMoveModal}
          selectCategory={selectCategory}
          savedLocation={savedLocation}
          moveLocation={moveLocation}
        />
      </View>
    </>
  );
};

export default MyLists;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 16,
  },
  map: {
    flex: 2,
    width: Dimensions.get('window').width,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  textHeading: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Poppins-SemiBold',
  },
  content: {
    width: Dimensions.get('window').width * 0.98,
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  paraText: {
    color: colorSecondary,
    fontSize: 13,
    alignSelf: 'center',
    top: 70,
    fontFamily: 'Poppins-Regular',
  },
  container_form: {
    height: Dimensions.get('window').height * 0.35,
    padding: 20,
    backgroundColor: 'white',
  },
  bottom: {
    marginBottom: 1,
    marginTop: 'auto',
    width: '100%',
  },
  button: {
    width: Dimensions.get('window').width * 0.95,
    alignSelf: 'center',
    bottom: 10,
  },
  txt: {
    color: 'black',
    paddingHorizontal: 10,
    paddingVertical: 20,
    fontSize: 19,
    fontWeight: 'bold',
  },
  header_Modal: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
