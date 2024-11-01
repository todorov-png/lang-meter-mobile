import chroma from 'chroma-js';
import React, { useEffect, useState } from 'react';
import SearchInput from '../components/SearchInput.jsx';
import HistoryService from '../services/HistoryService.js';
import { Text, View, ActivityIndicator, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { useNavigation } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';

const HistoryScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ global: { value: '', matchMode: 'contains' } });
  const [history, setHistory] = useState([]);
  const colors = [];

  const generateUniqueColor = () => {
    let newColor;
    let isUnique = false;
    while (!isUnique) {
      newColor = chroma.random().hex();
      isUnique = colors.every((existingColor) => chroma.distance(newColor, existingColor) > 20);
    }
    colors.push(newColor);
    return newColor;
  };

  const getData = async () => {
    try {
      const response = await HistoryService.getAll();
      const data = {};
      response.data.forEach((item) => {
        const id = item.test._id;
        if (!data[id]) {
          data[id] = {
            name: `${item.test.name}(${item.test.lang})`,
            attempts: 0,
            sum: 0,
            scoreMax: 0,
            correctAnswers: [],
            color:
              colors.length > Object.keys(data).length
                ? colors[Object.keys(data).length]
                : generateUniqueColor(),
          };
        }
        data[id].attempts += 1;
        data[id].sum += item.correctAnswers;
        data[id].correctAnswers.push(item.correctAnswers);
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

  const maxCorrectAnswersLength = Math.max(
    ...filteredHistory.map((item) => item.correctAnswers.length)
  );

  const chartData =
    filteredHistory.length > 0
      ? {
          labels: Array(Math.max(...filteredHistory.map((item) => item.attempts))).fill(''),
          datasets: filteredHistory.map((item) => {
            const correctAnswers = [...item.correctAnswers];
            while (correctAnswers.length < maxCorrectAnswersLength) {
              correctAnswers.push(correctAnswers[correctAnswers.length - 1]);
            }
            return {
              data: correctAnswers,
              color: () => item.color,
              strokeWidth: 2,
            };
          }),
        }
      : {
          labels: ['No Data'],
          datasets: [{ data: [0], strokeWidth: 2 }],
        };

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
        <ScrollView>
          <View style={{ flex: 1 }}>
            <LineChart
              bezier
              data={chartData}
              width={Dimensions.get('window').width - 32}
              height={220}
              withDots={false}
              withShadow={false}
              style={styles.chart}
              chartConfig={{
                backgroundGradientFrom: themeColors.color2,
                backgroundGradientTo: themeColors.color2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => themeColors.color5,
                propsForDots: { r: '4', strokeWidth: '2', stroke: themeColors.color5 },
              }}
            />
            <View style={styles.annotationContainer}>
              {filteredHistory.map((item, index) => (
                <View key={index} style={styles.annotationItem}>
                  <View style={[styles.annotationCircle, { backgroundColor: item.color }]} />
                  <Text style={styles.annotationText(themeColors)}>{item.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.tableHeader(themeColors)}>
              <Text style={styles.headerCell(themeColors)}>{t('HISTORY.COLUMN.NAME')}</Text>
              <Text style={styles.headerCell(themeColors)}>{t('HISTORY.COLUMN.ATTEMPTS')}</Text>
              <Text style={styles.headerCell(themeColors)}>{t('HISTORY.COLUMN.GPA')}</Text>
              <Text style={styles.headerCell(themeColors)}>{t('HISTORY.COLUMN.SCORE_MAX')}</Text>
            </View>
            {filteredHistory.length === 0 ? (
              <Text style={styles.emptyMessage(themeColors)}>{t('HISTORY.TABLE.EMPTY')}</Text>
            ) : (
              filteredHistory.map((item, index) => (
                <View key={index} style={styles.row(themeColors)}>
                  <Text style={styles.cell(themeColors)}>{item.name}</Text>
                  <Text style={styles.cell(themeColors)}>{item.attempts}</Text>
                  <Text style={styles.cell(themeColors)}>{item.gpa}</Text>
                  <Text style={styles.cell(themeColors)}>{item.scoreMax}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
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
  chart: {
    marginBottom: 16,
    borderRadius: 16,
  },
  annotationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  annotationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 8,
  },
  annotationCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  annotationText: (themeColors) => ({
    color: themeColors.color5,
    fontSize: 14,
  }),
});

export default HistoryScreen;
