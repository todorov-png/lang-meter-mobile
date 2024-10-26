import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useThemeColors } from '../styles/themeColors.js';

const SelectDropdown = ({ data, placeholder, value, onChange }) => {
  const themeColors = useThemeColors();
  const [selected, setSelected] = useState(value || null);

  const handleSelect = (item) => {
    setSelected(item);
    onChange(item);
  };

  return (
    <View style={styles.container(themeColors)}>
      <Dropdown
        data={data}
        value={selected}
        labelField="label"
        valueField="value"
        maxHeight={200}
        onChange={handleSelect}
        placeholder={placeholder}
        activeColor={themeColors.color1}
        style={styles.dropdown(themeColors)}
        itemTextStyle={styles.itemTextStyle(themeColors)}
        containerStyle={styles.selectContainer(themeColors)}
        placeholderStyle={styles.placeholderStyle(themeColors)}
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
  itemContainerStyle: (themeColors) => ({
    backgroundColor: themeColors.color6,
    marginVertical: 0.5,
  }),
  itemTextStyle: (themeColors) => ({
    color: themeColors.color5,
    fontSize: 12,
  }),
  selectedTextStyle: (themeColors) => ({
    fontSize: 14,
    color: themeColors.color5,
  }),
  selectContainer: (themeColors) => ({
    borderWidth: 2,
    borderTopWidth: 1,
    borderColor: themeColors.color5,
    backgroundColor: themeColors.color5,
    overflow: 'hidden',
    borderRadius: 8,
    marginTop: 8,
  }),
});

export default SelectDropdown;
