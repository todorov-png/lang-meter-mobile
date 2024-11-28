import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { Button } from 'react-native-elements';

const PasswordInput = ({ placeholder, value, onChangeText }) => {
  const [isSecure, setIsSecure] = useState(true);
  const themeColors = useThemeColors();

  const toggleSecureEntry = () => {
    setIsSecure((prev) => !prev);
  };

  return (
    <View style={styles.inputContainer(themeColors)}>
      <TextInput
        style={styles.input(themeColors)}
        placeholder={placeholder}
        placeholderTextColor={themeColors.color7}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={isSecure}
      />
      <Button
        type="clear"
        icon={{
          name: isSecure ? 'eye-off' : 'eye',
          type: 'ionicon',
          size: 24,
          color: themeColors.color7,
        }}
        onPress={toggleSecureEntry}
        buttonStyle={styles.iconButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: (themeColors) => ({
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.color6,
    borderRadius: 8,
  }),
  input: (themeColors) => ({
    flex: 1,
    padding: 8,
    height: 42,
    paddingRight: 0,
    color: themeColors.color5,
  }),
  iconButton: {
    padding: 8,
  },
});

export default PasswordInput;
