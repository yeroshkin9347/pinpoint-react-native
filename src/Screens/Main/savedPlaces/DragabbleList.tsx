import React, { useState } from 'react';
import {
    TouchableOpacity,
    StyleSheet,
    View
} from 'react-native';
import DraggableFlatList, {
    RenderItemParams,
    ScaleDecorator,
} from "react-native-draggable-flatlist";
import { Button } from 'native-base';
import LocationItem from './LocationItem';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import { height, width } from '../../../Style/GlobalStyles/GlobalStyle';
import { setLoading } from '../../../redux/reducers/authReducer';
import { useDispatch, useSelector } from 'react-redux';
import { ApiRequestAsync } from '../../../services/httpServices';

const DragabbleList = ({
    data,
    setShowMoveModal,
    getCategoryData,
    categoryId
}: any) => {

    const [dataList, setDataList] = useState(data)
    const dispatch = useDispatch()
    const { token } = useSelector(
        (state: any) => state.AuthReducer,
    );

    const handleSave = () => {
        try {
            dispatch(setLoading(true));
            let locationIds = dataList.map((item: any) => item.id)
            let data = new FormData();
            data.append('category_id', categoryId);
            data.append('location_ids', locationIds);
            ApiRequestAsync(
                'POST',
                `/location/updatelist`,
                data,
                token,
            )
                .then(async (data_: any) => {
                    getCategoryData()
                })
                .catch(error => {
                    console.log(error,'error');
                    dispatch(setLoading(false));
                });
        } catch (e) { }
    };


    const renderItem = ({ item, drag, isActive }: RenderItemParams<any>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    activeOpacity={1}
                    onLongPress={drag}
                    disabled={isActive}
                    style={styles.rowItem}
                >
                    <View style={styles.rowItem}>
                        <Icons
                            name="sort"
                            style={{
                                color: 'black',
                                fontSize: 25,
                                marginTop: 10,
                                marginRight: 10
                            }}
                        />

                        <LocationItem
                            locationItem={item}
                            getCategoryData={getCategoryData}
                            setShowMoveModal={setShowMoveModal}
                            fromDraggable={true}
                        />

                    </View>

                </TouchableOpacity>
            </ScaleDecorator>
        );
    };

    return (
        <>
            <View style={{ height: height * 0.75, marginVertical: 10 }} >
                <DraggableFlatList
                    data={dataList}
                    onDragEnd={({ data }) => setDataList(data)}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                />
            </View>

            <Button
                bg="tertiary.600"
                style={styles.button}
                onPress={handleSave}
            >
                Save
            </Button>
        </>

    )
}

const styles = StyleSheet.create({
    rowItem: {
        display: 'flex',
        flexDirection: 'row'
    },
    button: {
        width: width * 0.95,
        alignSelf: 'center',
        marginBottom: 10
    },
});

export default React.memo(DragabbleList)