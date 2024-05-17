import {
    Box,
    FlatList,
    Text,
} from 'native-base';
import React, { useCallback } from 'react';

import {
    View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NativeMenu from '../../../Components/CustomPicker';
import Collapsible from 'react-native-collapsible';

const MyListGrid = ({
    sentToMeList,
    expandedIndices,
    toggleAccordion,
    getCategoryData,
    getLocationList,
    openMoveModalFunc,
    renderItem,
}: any) => {

    const handleCategoryPress = (item: any, index: any) => {
        if (item?.locations?.length) {
            return toggleAccordion(index, item.id)
        }
        else {
            return ({})
        }
    }

    const renderCategory = useCallback(
        ({ item, index }: { item: any; index: number }) => {
            const isExpanded = expandedIndices.includes(index);

            return (
                <Box
                    borderBottomWidth="1"
                    _dark={{
                        borderColor: 'muted.50',
                    }}
                    borderColor="muted.800"
                    pl={['0', '4']}
                    pr={['0', '5']}
                    py="2">
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}>
                        <View
                            style={{
                                display: 'flex',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                                flex: 1
                            }}>
                            {item?.locations?.length ? (
                                <Icon
                                    name={
                                        !isExpanded ? 'chevron-down' : 'chevron-up'
                                    }
                                    style={{ fontSize: 25, color: 'green' }}
                                    onPress={() => toggleAccordion(index, item?.id)}
                                />
                            ) : null}
                            <Text style={{ color: 'black', fontWeight: 'bold', flex: 1 }} 
                            onPress={() => handleCategoryPress(item, index)} >
                                {item.title}
                            </Text>
                        </View>

                        <View style={{ flexDirection: 'row', paddingRight: 10 }}>
                            <NativeMenu
                                getCategoryData={getCategoryData}
                                getLocationList={getLocationList}
                                id={item.id}
                                fromSentTome={true}
                                moveHandler={openMoveModalFunc}
                                title={item.title}
                            />
                        </View>
                    </View>
                    <Collapsible collapsed={!isExpanded}>
                        {isExpanded ? (
                            <FlatList
                                data={item.locations}
                                renderItem={renderItem}
                            />
                        ) : null}
                    </Collapsible>
                </Box>
            );
        },
        [expandedIndices, toggleAccordion]
    );


    return (
        <FlatList
            data={sentToMeList}
            renderItem={renderCategory}
        />
    )
}

export default React.memo(MyListGrid)