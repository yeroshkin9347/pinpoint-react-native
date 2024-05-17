import {
    Avatar,
    Box,
    Button,
    FlatList,
    HStack,
    Spacer,
    Text,
    VStack
} from 'native-base';
import React, { useCallback } from 'react';

import {
    Dimensions,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { CATEGORY_DATA } from '../../../redux/Interface/interface';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
    default as Entypo,
    default as IconEntypo,
  } from 'react-native-vector-icons/Entypo';

const MyListGrid = ({ 
    categoryList,
    showMoveModal,
    setShowMoveModal,
    selectCategory,
    savedLocation,
    moveLocation,
}: any) => {
    const screenHeight = Dimensions.get('window').height;
    return (
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
                  renderItem={({ item }: { item: CATEGORY_DATA }) => {
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
    )
}

export default React.memo(MyListGrid)

const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      justifyContent: 'flex-end',
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