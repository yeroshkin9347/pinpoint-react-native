import { parsePhoneNumber } from 'libphonenumber-js';
import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import { useSelector } from 'react-redux';
interface InputProps {
  value: any;
  onChangeText: any;
}

const CustomPhoneInput = ({ value, onChangeText }: InputProps) => {
  const { profile, countryCode, } = useSelector((state: any) => state.AuthReducer);
  const [values, setvalue] = useState<string>('');
  const [defaultCode, setDefaultCode] = useState<any>('');


  useEffect(() => {
    try {
      
      const parsedPhoneNumber = parsePhoneNumber(profile.contact_no);
      if (parsedPhoneNumber) {
        setvalue(parsedPhoneNumber?.nationalNumber)
        setDefaultCode(parsedPhoneNumber?.country ? parsedPhoneNumber?.country : 'GB')
      }
    } catch (error) {
      if (profile.contact_no && profile.contact_no.startsWith('0')) {
        setvalue(profile.contact_no.slice(1))
      } else {
        setvalue(profile.contact_no)
      }
      setDefaultCode(countryCode ? countryCode : 'GB')
    }
  }, []);


  const handleChange = (text: any) => {
    onChangeText(text)
    setvalue(text)
  }

  return (
    <>
      {!!defaultCode &&
        <PhoneInput
          value={values ? values : profile.contact_no}
          defaultValue={values ? values : profile.contact_no}
          defaultCode={defaultCode ? defaultCode : countryCode}
          layout="first"
          onChangeFormattedText={(text: any) => handleChange(text)}
          containerStyle={styles.phoneContainer}
           textContainerStyle={styles.textContainerStyle}
          textInputStyle={styles.phoneInputText}
          textInputProps={{maxLength: 12}}
          codeTextStyle={styles.phoneCodeText}
        />
      }
    </>
  );
};

export default CustomPhoneInput;

const styles = StyleSheet.create({
  phoneContainer: {
    // height: '100%', // Take up the full height of the parent
    borderColor: '#757575',
    borderWidth: 0.5,
    flexDirection: 'row', // Arrange children in a row
    alignItems: 'center', // Vertically center the content
    paddingLeft: 10, // Add some padding to the left side
    width: "100%"
  },
  phoneInputText: {
    borderRadius: 50,
    height: 55,
    fontSize: 15,
    fontWeight: 'normal'
  },
  phoneCodeText: {
    borderRadius: 50,
    height: 25,
    paddingTop: 2,
    fontSize: 15,
    fontWeight: 'normal'
  },
  textContainerStyle: {
    height: 45,
    borderRadius: 50,
    backgroundColor: 'white',

  }
});
