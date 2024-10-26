import React, { useEffect, useState } from 'react';
import SearchInput from '../components/SearchInput.jsx';
import HistoryService from '../services/HistoryService.js';
import { Text, View, FlatList, ActivityIndicator } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';
import { StyleSheet } from 'react-native';

const HistoryScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ global: { value: '', matchMode: 'contains' } });
  const [history, setHistory] = useState([]);

  const getData = async () => {
    try {
      const response = await HistoryService.getAll();
      const data = {};
      response.data.forEach((item) => {
        const id = item.test._id;
        if (!data[id]) {
          data[id] = { name: item.test.name, attempts: 0, sum: 0, scoreMax: 0 };
        }
        data[id].attempts += 1;
        data[id].sum += item.correctAnswers;
        if (data[id].scoreMax < item.correctAnswers) {
          data[id].scoreMax = item.correctAnswers;
        }
      });
      const historyData = Object.values(data).map((item) => ({
        ...item,
        gpa: (item.sum / item.attempts).toFixed(2),
      }));
      setHistory(historyData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const filteredHistory = history.filter((item) =>
    item.name.toLowerCase().includes(filters.global.value.toLowerCase())
  );

  return (
    <View style={styles.container(themeColors)}>
      <View style={styles.header}>
        <Text style={styles.title(themeColors)}>{t('HISTORY.TABLE.TITLE')}</Text>
        <Button
          onPress={() => navigation.navigate('Home')}
          buttonStyle={styles.button(themeColors)}
          icon={{ name: 'home', type: 'material', size: 24, color: 'white' }}
        />
      </View>
      <SearchInput
        value={filters.global.value}
        onChangeText={(text) => setFilters({ global: { value: text, matchMode: 'contains' } })}
      />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <View>
          <View style={styles.tableHeader(themeColors)}>
            <Text style={styles.headerCell(themeColors)}>{t('HISTORY.COLUMN.NAME')}</Text>
            <Text style={styles.headerCell(themeColors)}>{t('HISTORY.COLUMN.ATTEMPTS')}</Text>
            <Text style={styles.headerCell(themeColors)}>{t('HISTORY.COLUMN.GPA')}</Text>
            <Text style={styles.headerCell(themeColors)}>{t('HISTORY.COLUMN.SCORE_MAX')}</Text>
          </View>
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.name}
            renderItem={({ item }) => (
              <View style={styles.row(themeColors)}>
                <Text style={styles.cell(themeColors)}>{item.name}</Text>
                <Text style={styles.cell(themeColors)}>{item.attempts}</Text>
                <Text style={styles.cell(themeColors)}>{item.gpa}</Text>
                <Text style={styles.cell(themeColors)}>{item.scoreMax}</Text>
              </View>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyMessage(themeColors)}>{t('HISTORY.TABLE.EMPTY')}</Text>
            }
          />
        </View>
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
  button: (themeColors) => ({
    backgroundColor: themeColors.color3,
    paddingHorizontal: 2,
    aspectRatio: 1,
  }),
  tableHeader: (themeColors) => ({
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: themeColors.color8,
    borderBottomWidth: 1,
    borderColor: themeColors.color6,
  }),
  headerCell: (themeColors) => ({
    flex: 1,
    fontSize: 13,
    textAlign: 'center',
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
  cell: (themeColors) => ({
    flex: 1,
    textAlign: 'center',
    color: themeColors.color5,
  }),
  emptyMessage: (themeColors) => ({
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
    color: themeColors.color9,
  }),
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HistoryScreen;
