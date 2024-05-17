import {
  Avatar,
  Box,
  FlatList,
  HStack,
  Spacer,
  Text,
  VStack
} from 'native-base';
import React, { useCallback } from 'react';

import {
  Dimensions,
  Platform,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import IstockPhoto from '../../../Assets/images/IstockPhoto.jpg';
import { truncateString } from '../../../services/httpServices';

const PeopleContactList = ({ userContactsList, handleUpdateContact, fromLocationSave }: any) => {

  const renderItem = useCallback(
    ({ item: contact }: any) => (
      <Box
        borderBottomWidth="1"
        _dark={{
          borderColor: 'muted.50',
        }}
        borderColor="muted.800"
        pl={['0', '4']}
        pr={['0', '5']}
        py="3">
        <HStack space={[3, 3]} justifyContent="space-between">
          <Avatar
            size="38px"
            source={contact?.thumbnailPath ?? IstockPhoto}
          />
          <VStack>
            <Text
              _dark={{
                color: 'warmGray.50',
              }}
              color="coolGray.800"
              bold>
              {truncateString(contact?.full_name) ?? ""}
            </Text>
            <Text
              color="coolGray.600"
              _dark={{
                color: 'warmGray.200',
              }}>
              {contact?.number ?? ""}
            </Text>
          </VStack>
          <Spacer />
          <TouchableOpacity
            onPress={() => {
              handleUpdateContact(contact)
            }}>
            <Text style={[styles.inviteText, { color: (contact?.is_registered && contact.is_location_shared != 2 && !fromLocationSave) ? 'red' : 'green' }]}>{contact?.is_registered ? (contact.is_location_shared == 2 || fromLocationSave) ? "Share" : contact.is_location_shared == 0
              ? 'Requested'
              : 'Stop Sharing' : "Invite"}</Text>
          </TouchableOpacity>
        </HStack>
      </Box>
    ),
    [userContactsList,fromLocationSave],
  );


  return (

    <FlatList
      data={userContactsList}
      keyExtractor={(contact: any, index) => `${contact.number}_${index}`}
      renderItem={renderItem}
      updateCellsBatchingPeriod={5}
      maxToRenderPerBatch={5}
      initialNumToRender={50}
      onEndReachedThreshold={16}
    />
  )
}

export default React.memo(PeopleContactList)

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#e8ffee',
    borderRadius: 12,
    padding: 20,
  },
  text: {
    padding: 10,
    fontSize: 18,
    color: '#00996b',
  },

  btn: {
    width: Dimensions.get('window').width * 0.85,
    height: Dimensions.get('window').height * 0.06,
    marginTop: 10,
  },
  btnn: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  btnn1: {
    width: Dimensions.get('window').width * 0.26,
    height: Dimensions.get('window').height * 0.06,
    borderRadius: 8,
  },
  txt1: {
    fontSize: 20,
    color: 'white',
  },
  txt2: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  inviteText: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    // color: 'green',
  },
  RequestStyle: {
    fontSize: 13,
    fontFamily: 'Poppins-SemiBold',
    // color: 'red',
  },
});