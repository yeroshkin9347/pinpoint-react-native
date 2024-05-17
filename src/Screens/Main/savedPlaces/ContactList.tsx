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
  Platform,
  TouchableOpacity
} from 'react-native';
import IstockPhoto from '../../../Assets/images/IstockPhoto.jpg';

const ContactList = ({ userContactsList, handleUpdateContact }: any) => {

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
        >
        <TouchableOpacity onPress={() => handleUpdateContact(contact)}>
          <HStack space={[3, 3]} justifyContent="space-between" py="3">
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
                {contact?.displayName !== undefined && Platform.OS === 'android'
                  ? contact?.displayName
                  : contact?.givenName !== undefined &&
                    contact?.familyName !== undefined
                    ? `${contact.givenName} ${contact.familyName}`
                    : ''}
              </Text>
              <Text
                color="coolGray.600"
                _dark={{
                  color: 'warmGray.200',
                }}>
                {contact?.phoneNumbers && contact?.phoneNumbers.length > 0
                  ? contact?.phoneNumbers[0]?.number
                  : ''}
              </Text>
            </VStack>
            <Spacer />
          </HStack>
        </TouchableOpacity>
      </Box>
    ),
    [userContactsList],
  );


  return (

    <FlatList
      data={userContactsList}
      keyExtractor={(item, index) => index.toString()}
      renderItem={renderItem}
      updateCellsBatchingPeriod={5}
      maxToRenderPerBatch={5}
      onEndReachedThreshold={16}
      initialNumToRender={10}
      windowSize={10}
    />
  )
}

export default React.memo(ContactList)