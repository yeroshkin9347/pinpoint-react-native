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
    TouchableOpacity,
    View
} from 'react-native';
import { CATEGORY_DATA } from '../../../redux/Interface/interface';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import NativeMenu from '../../../Components/CustomPicker';
import Collapsible from 'react-native-collapsible';
import DragabbleList from './DragabbleList';

const MyListGrid = ({ 
    categoryList, 
    expandedIndices, 
    toggleAccordion,
    handleCategoryPress, 
    getCategoryData,
    setModalVisible,
    renderItem,
    
}: any) => {
    const renderCategory = useCallback(
        ({ item, index }: { item: CATEGORY_DATA; index: number }) => {
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
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }} >
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
                            <Text style={{ color: 'black', fontWeight: 'bold', flex: 1 }} onPress={() => handleCategoryPress(item, index)} >
                                {item.title}
                            </Text>
                        </View>
                        <View>
                            <NativeMenu
                                getCategoryData={getCategoryData}
                                id={item.id}
                                pdfLink={item.pdf_link}
                                csv_link={item.csv_link}
                                title={item.title}
                                setModalVisible={setModalVisible}
                                locations={item?.locations}
                                item={item}
                            />
                        </View>
                    </View>
                    <Collapsible collapsed={!isExpanded}>
                        {isExpanded ? (
                            <FlatList data={item.locations} renderItem={renderItem} />
                        ) : null}
                    </Collapsible>
                </Box>
            );
        },
        [expandedIndices, toggleAccordion]
    );

    return (

        <FlatList
            data={categoryList}
            renderItem={renderCategory}
        />
    )
}

export default React.memo(MyListGrid)