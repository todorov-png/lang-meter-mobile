import SearchInput from './SearchInput.jsx';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';
import { getTests } from '../store/index.js';

const TestList = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const themeColors = useThemeColors();

  const tests = useSelector((state) => state.tests) || [];
  const [filters, setFilters] = useState({ global: { value: '', matchMode: 'contains' } });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await dispatch(getTests()).unwrap();
      if (!response?.success) {
        Alert.alert(t('TOAST.SUMMARY.ERROR'), response?.messageError);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row(themeColors)}>
      <Text style={styles.langLabel(themeColors)}>{item.lang}</Text>
      <Text style={styles.name(themeColors)}>{item.name}</Text>
      <Button
        buttonStyle={styles.button(themeColors)}
        onPress={() => navigation.navigate('Test', { id: item._id })}
        icon={{ name: 'visibility', type: 'material', size: 20, color: 'white' }}
      />
    </View>
  );

  const filteredTests = tests.filter((test) =>
    test.name.toLowerCase().includes(filters.global.value.toLowerCase())
  );

  return (
    <View style={styles.container(themeColors)}>
      <View style={styles.header}>
        <Text style={styles.title(themeColors)}>{t('TESTS.TABLE.TITLE')}</Text>
        <Button
          onPress={() => navigation.navigate('History')}
          buttonStyle={styles.button(themeColors)}
          icon={{ name: 'history', type: 'material', size: 24, color: 'white' }}
        />
      </View>
      <SearchInput
        value={filters.global.value}
        onChangeText={(text) => setFilters({ global: { value: text, matchMode: 'contains' } })}
      />
      {loading ? (
        <ActivityIndicator size="large" color={themeColors.color1} />
      ) : filteredTests.length > 0 ? (
        <FlatList data={filteredTests} renderItem={renderItem} keyExtractor={(item) => item._id} />
      ) : (
        <Text style={styles.emptyText(themeColors)}>{t('TESTS.TABLE.EMPTY')}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: (themeColors) => ({
    flex: 1,
    padding: 16,
    backgroundColor: themeColors.color1,
  }),
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: (themeColors) => ({
    fontSize: 24,
    fontWeight: 'bold',
    color: themeColors.color5,
  }),
  row: (themeColors) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: themeColors.color6,
  }),
  name: (themeColors) => ({
    fontSize: 18,
    color: themeColors.color5,
    marginHorizontal: 8,
  }),
  langLabel: (themeColors) => ({
    fontSize: 14,
    color: themeColors.color5,
    backgroundColor: themeColors.color6,
    borderRadius: 4,
    padding: 6,
  }),
  button: (themeColors) => ({
    backgroundColor: themeColors.color3,
    paddingHorizontal: 2,
    aspectRatio: 1,
  }),
  emptyText: (themeColors) => ({
    textAlign: 'center',
    marginTop: 32,
    fontSize: 18,
    color: themeColors.color7,
  }),
});

export default TestList;
