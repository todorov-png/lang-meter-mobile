import React, { useState, useEffect } from 'react';
import TestService from '../services/TestService.js';
import HistoryService from '../services/HistoryService.js';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Button, Dialog, RadioButton } from 'react-native-paper';
import { useThemeColors } from '../styles/themeColors.js';
import { useTranslation } from 'react-i18next';

const TestScreen = () => {
  const route = useRoute();
  const { id } = route.params;
  const { t } = useTranslation();
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [questions, setQuestions] = useState([]);
  const [statusCheck, setStatusCheck] = useState(false);
  const [testName, setTestName] = useState(null);
  const [visible, setVisible] = useState(false);
  const [textResult, setTextResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await TestService.get(id);
      setTestName(response.data.name);
      setQuestions(sortArrayQuestions(response.data.questions));
    } finally {
      setLoading(false);
    }
  };

  const sortArrayQuestions = (questions) => {
    const questionsLength = questions.length;
    const allСycles = questionsLength < 20 ? questionsLength : 20;
    const arrayIndex = [];
    const arrayQuestions = [];

    for (let i = 0; i < questionsLength; i++) {
      arrayIndex.push(i);
    }
    for (let i = 0; i < allСycles; i++) {
      const randomIndex = Math.floor(Math.random() * arrayIndex.length);
      const removedIndex = arrayIndex.splice(randomIndex, 1)[0];
      arrayQuestions.push(questions[removedIndex]);
    }
    return arrayQuestions;
  };

  const checkAnswers = async () => {
    setStatusCheck(true);
    let counterAnswers = 0;
    questions.forEach((question) => {
      if (
        Object.prototype.hasOwnProperty.call(question, 'selected') &&
        question.answers[question.selected].value
      ) {
        counterAnswers++;
      }
    });
    const level = levelDetection(counterAnswers);
    setTextResult(t('TESTS.RESULT_TEXT', { count: counterAnswers, level }));
    setVisible(true);
    await HistoryService.create({
      correctAnswers: counterAnswers,
      test: id,
    });
  };

  const handleRadioPress = (indexQuestions, indexAnswer) => {
    if (!statusCheck) {
      const newQuestions = [...questions];
      newQuestions[indexQuestions].selected = indexAnswer;
      setQuestions(newQuestions);
    }
  };

  const levelDetection = (answers) => {
    let result = '';
    switch (true) {
      case answers < 2:
        result = 'STARTER';
        break;
      case answers < 3:
        result = 'BEGGINER 1';
        break;
      case answers < 5:
        result = 'BEGGINER 2';
        break;
      case answers < 7:
        result = 'ELEMENTARY 1';
        break;
      case answers < 10:
        result = 'ELEMENTARY 2';
        break;
      case answers < 11:
        result = 'PRE-INTERMIDIATE 1';
        break;
      case answers < 12:
        result = 'PRE-INTERMIDIATE 2';
        break;
      case answers < 13:
        result = 'INTERMIDIATE 1';
        break;
      case answers < 14:
        result = 'INTERMIDIATE 2';
        break;
      case answers < 15:
        result = 'UPPER-INTERMIDIATE 1';
        break;
      case answers < 16:
        result = 'UPPER-INTERMIDIATE 2';
        break;
      case answers < 17:
        result = 'ADVANCED 1';
        break;
      case answers < 18:
        result = 'ADVANCED 2';
        break;
      case answers < 19:
        result = 'MASTER 1';
        break;
      default:
        result = 'MASTER 2';
        break;
    }
    return result;
  };

  useEffect(() => {
    fetchData();
  }, [route.params.id]);

  return (
    <View style={styles.wrap(themeColors)}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <>
          <Text style={styles.title(themeColors)}>{testName}</Text>
          <ScrollView>
            {questions.map((question, indexQuestions) => (
              <View key={indexQuestions} style={styles.question(themeColors)}>
                <Text style={styles.questionTitle(themeColors)}>
                  {`${indexQuestions + 1}) ${question.title}`}
                </Text>
                <View style={styles.questionAnswers}>
                  {question.answers.map((answer, indexAnswer) => (
                    <TouchableOpacity
                      key={indexAnswer}
                      onPress={() => handleRadioPress(indexQuestions, indexAnswer)}
                      disabled={statusCheck}
                    >
                      <View style={styles.questionAnswersItem}>
                        <RadioButton
                          value={indexAnswer}
                          status={question.selected === indexAnswer ? 'checked' : 'unchecked'}
                          onPress={() => handleRadioPress(indexQuestions, indexAnswer)}
                          uncheckedColor={themeColors.color5}
                          color={themeColors.color5}
                          theme={{ dark: true }}
                        />
                        <Text
                          style={[
                            styles.questionText(themeColors),
                            statusCheck && answer.value ? styles.correctAnswer : null,
                          ]}
                        >
                          {answer.text}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
                {statusCheck && (
                  <Text style={styles.questionRule(themeColors)}>{question.rule}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </>
      )}
      <Button
        mode="contained"
        disabled={loading}
        style={styles.button}
        onPress={statusCheck ? () => navigation.navigate('Home') : checkAnswers}
      >
        {statusCheck ? t('BASE.HOME') : t('BASE.CHECK')}
      </Button>
      <Dialog style={styles.dialogWrap} visible={visible} onDismiss={() => setVisible(false)}>
        <Dialog.Title style={styles.centeredText}>
          {`${t('TESTS.RESULT')} "${testName}"`}
        </Dialog.Title>
        <Dialog.Content>
          <Text style={styles.centeredText}>{textResult}</Text>
        </Dialog.Content>
      </Dialog>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: (themeColors) => ({
    flex: 1,
    padding: 10,
    backgroundColor: themeColors.color1,
  }),
  title: (themeColors) => ({
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 18,
    color: themeColors.color5,
  }),
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  question: (themeColors) => ({
    borderWidth: 2,
    borderColor: themeColors.color5,
    borderRadius: 5,
    marginBottom: 10,
    padding: 10,
  }),
  questionTitle: (themeColors) => ({
    marginBottom: 5,
    fontSize: 18,
    color: themeColors.color5,
  }),
  questionAnswers: {
    flexDirection: 'column',
  },
  questionAnswersItem: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  questionText: (themeColors) => ({
    color: themeColors.color5,
  }),
  questionRule: (themeColors) => ({
    color: themeColors.color5,
    marginTop: 10,
    fontSize: 16,
    fontStyle: 'italic',
  }),
  correctAnswer: {
    color: 'green',
  },
  button: {
    marginTop: 10,
  },
  centeredText: {
    textAlign: 'center',
  },
  dialogWrap: {
    marginTop: -45,
  },
});

export default TestScreen;
