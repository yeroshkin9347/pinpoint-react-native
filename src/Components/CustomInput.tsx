import React, {useState} from 'react';
import {FormControl, Input} from 'native-base';
import {StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colorSecondary } from '../Style/GlobalStyles/GlobalStyle';

interface InputProps {
  variant: string;
  fontSize: string;
  placeholder: string;
  InputLeftElementIcon: string;
  focusOutlineColor: string;
  value: any;
  onChangeText: any;
  focusbackgroundColor: string;
  InputRightElementIcon: string;
  passwordState: boolean;
  setpasswordState: any;
  isDisabled: boolean;
  type: any;
  keyboardType: any;
  InputRightElementFunction: any;
  maxLength: number;
  onPressInFunction?: () => void;
}

const CustomInput = ({
  variant,
  fontSize,
  placeholder,
  InputLeftElementIcon,
  focusOutlineColor,
  value,
  onChangeText,
  focusbackgroundColor,
  InputRightElementIcon,
  passwordState,
  setpasswordState,
  isDisabled,
  type,
  keyboardType,
  InputRightElementFunction,
  maxLength,
  onPressInFunction,
}: InputProps) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <FormControl>
      {InputLeftElementIcon ? (
        <Input
          variant={variant}
          fontSize={fontSize}
          placeholder={placeholder}
          type={
            InputRightElementIcon !== 'eye'
              ? type
              : passwordState
              ? 'text'
              : 'password'
          }
          isReadOnly={isDisabled}
          isDisabled={isDisabled}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onPressIn={
            onPressInFunction
              ? onPressInFunction
              : InputRightElementIcon === 'map-marker-outline'
              ? InputRightElementFunction
              : () => {}
          }
          InputLeftElement={
            <Icon
              name={InputLeftElementIcon}
              style={{paddingHorizontal: 10}}
              size={20}
              color={colorSecondary}
            />
          }
          InputRightElement={
            InputRightElementIcon !== '' ? (
              <Pressable
                onPress={
                  InputRightElementIcon === 'map-marker-outline'
                    ? InputRightElementFunction
                    : () => setpasswordState(!passwordState)
                }>
                <Icon
                  name={
                    InputRightElementIcon !== 'eye'
                      ? InputRightElementIcon
                      : passwordState
                      ? 'eye'
                      : 'eye-off-outline'
                  }
                  size={20}
                  style={{paddingHorizontal: 10}}
                  color={'green'}
                />
              </Pressable>
            ) : (
              <></>
            )
          }
          _light={{
            _focus: {
              bg: focusbackgroundColor,
            },
          }}
          focusOutlineColor={focusOutlineColor}
          value={value}
          onChangeText={onChangeText}
        />
      ) : (
        <Input
          variant={variant}
          fontSize={fontSize}
          placeholder={placeholder}
          type={'text'}
          isReadOnly={isDisabled}
          keyboardType={keyboardType}
          maxLength={maxLength}
          _light={{
            _focus: {
              bg: focusbackgroundColor,
            },
          }}
          focusOutlineColor={focusOutlineColor}
          value={value}
          onChangeText={onChangeText}
        />
      )}
    </FormControl>
  );
};

export default CustomInput;
