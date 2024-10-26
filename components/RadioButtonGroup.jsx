import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';

const RadioButtonGroup = ({ options, selectedValue, onValueChange }) => {
  const [currentValue, setCurrentValue] = useState(selectedValue);
  const themeColors = useThemeColors();

  useEffect(() => {
    if (selectedValue !== currentValue) {
      setCurrentValue(selectedValue);
    }
  }, [selectedValue]);

  const handlePress = (value) => {
    if (value !== currentValue) {
      setCurrentValue(value);
      onValueChange(value);
    }
  };

  return (
    <View style={styles.container}>
      {options.map((option, index) => {
        const isFirst = index === 0;
        const isLast = index === options.length - 1;

        return (
          <TouchableOpacity
            key={option.value}
            onPress={() => handlePress(option.value)}
            style={[
              styles.radioButton(themeColors),
              isFirst && styles.firstButton,
              isLast && styles.lastButton,
              currentValue === option.value && styles.selectedRadioButton(themeColors),
            ]}
          >
            <Text style={styles.label(themeColors, currentValue === option.value)}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioButton: (themeColors) => ({
    flex: 1,
    borderRadius: 0,
    borderWidth: 1,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: themeColors.color7,
    borderColor: themeColors.color6,
  }),
  firstButton: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  lastButton: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  selectedRadioButton: (themeColors) => ({
    backgroundColor: themeColors.color3,
  }),
  label: (themeColors) => ({
    color: themeColors.color4,
    fontSize: 16,
  }),
});

export default RadioButtonGroup;
