import React from 'react';
import {Checkbox, Text,} from 'native-base';
import { StyleSheet } from 'react-native';

interface CheckBoxInputProps {
  accessibilityLabel: string;
  customCheckBoxText: string;
  opacity: string;
  colorScheme: string;
  value: string;
  size: string;
  isChecked: boolean;
  onChange: any;
}

const CustomCheckBox = ({
  accessibilityLabel,
  customCheckBoxText,
  opacity,
  colorScheme,
  value,
  size,
  isChecked,
  onChange,
}: CheckBoxInputProps) => {
  
  return (
      <Checkbox
        opacity={opacity}
        colorScheme={colorScheme}
        value={value}
        size={size}
        isChecked={isChecked}
        onChange={onChange}
        accessibilityLabel={accessibilityLabel}
      >
        <Text style={styles.labelColor} >{customCheckBoxText}</Text>
      </Checkbox>
  );
};

export default CustomCheckBox;

const styles = StyleSheet.create({
  labelColor:{
    opacity: 0.4,
    fontSize: 18,
  }
})
