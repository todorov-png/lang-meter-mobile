import React from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { View, TextInput, StyleSheet } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { useTranslation } from 'react-i18next';

const SearchInput = ({ value, onChangeText }) => {
  const { t } = useTranslation();
  const themeColors = useThemeColors();

  return (
    <View style={styles.searchContainer(themeColors)}>
      <Icon name="search" size={24} color={themeColors.color5} />
      <TextInput
        style={styles.searchInput(themeColors)}
        placeholder={t('BASE.SEARCH')}
        placeholderTextColor={themeColors.color7}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: (themeColors) => ({
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: themeColors.color6,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
    backgroundColor: themeColors.color2,
  }),
  searchInput: (themeColors) => ({
    marginLeft: 8,
    paddingVertical: 8,
    flex: 1,
    color: themeColors.color5,
  }),
});

export default SearchInput;
