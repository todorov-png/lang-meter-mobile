import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { MultiSelect } from 'react-native-element-dropdown';
import { useThemeColors } from '../styles/themeColors.js';

const MultiSelectDropdown = ({ data, placeholder, value, onChange }) => {
  const themeColors = useThemeColors();
  const [selected, setSelected] = useState(value || []);

  const handleSelect = (items) => {
    setSelected(items);
    onChange(items);
  };

  return (
    <View style={styles.container(themeColors)}>
      <MultiSelect
        data={data}
        mode="modal"
        value={selected}
        labelField="label"
        valueField="value"
        onChange={handleSelect}
        placeholder={placeholder}
        activeColor={themeColors.color1}
        style={styles.dropdown(themeColors)}
        itemTextStyle={styles.itemTextStyle(themeColors)}
        selectedStyle={styles.selectedStyle(themeColors)}
        placeholderStyle={styles.placeholderStyle(themeColors)}
        containerStyle={styles.multiSelectContainer(themeColors)}
        selectedTextStyle={styles.selectedTextStyle(themeColors)}
        itemContainerStyle={styles.itemContainerStyle(themeColors)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: (themeColors) => ({
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    overflow: 'hidden',
    borderColor: themeColors.color6,
  }),
  dropdown: (themeColors) => ({
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: themeColors.color5,
  }),
  placeholderStyle: (themeColors) => ({
    fontSize: 14,
    color: themeColors.color7,
  }),
  selectedStyle: (themeColors) => ({
    backgroundColor: themeColors.color1,
    marginLeft: 8,
    marginBottom: 0,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  }),
  selectedTextStyle: (themeColors) => ({
    color: themeColors.color5,
  }),
  itemContainerStyle: (themeColors) => ({
    backgroundColor: themeColors.color6,
    marginVertical: 0.5,
  }),
  itemTextStyle: (themeColors) => ({
    color: themeColors.color5,
    fontSize: 12,
  }),
  multiSelectContainer: (themeColors) => ({
    borderWidth: 2,
    borderTopWidth: 1,
    borderColor: themeColors.color5,
    backgroundColor: themeColors.color5,
    overflow: 'hidden',
    borderRadius: 8,
  }),
});

export default MultiSelectDropdown;
