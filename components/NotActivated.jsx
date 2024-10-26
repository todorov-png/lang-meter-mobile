import React from 'react';
import AuthService from '../services/AuthService';
import EmailSvg from '../assets/img/svg/email.svg';
import useErrorHandler from '../helpers/errorHandler.js';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { Button } from 'react-native-elements';
import { useTranslation } from 'react-i18next';

const NotActivated = () => {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const handleError = useErrorHandler();

  const sendNewActivationCode = async () => {
    try {
      await AuthService.sendActivationCode();
      Alert.alert(
        t('NOT_ACTIVATED.TOAST_SEND_CODE.SUMMARY'),
        t('NOT_ACTIVATED.TOAST_SEND_CODE.DETAIL')
      );
    } catch (e) {
      handleError(e);
    }
  };

  const confirmSendEmail = () => {
    Alert.alert(
      t('NOT_ACTIVATED.CONFIRM'),
      '',
      [
        { text: t('CONFIRM_MODAL.BUTTONS.CANCEL'), style: 'cancel' },
        { text: t('CONFIRM_MODAL.BUTTONS.YES'), onPress: sendNewActivationCode },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container(themeColors)}>
      <View style={styles.card(themeColors)}>
        <EmailSvg style={styles.image} />
        <Text style={styles.title(themeColors)}>{t('NOT_ACTIVATED.TITLE')}</Text>
        <Text style={styles.subtitle(themeColors)}>{t('NOT_ACTIVATED.SUBTITLE')}</Text>
        <Text style={styles.content(themeColors)}>{t('NOT_ACTIVATED.CONTENT')}</Text>
        <Button
          title={t('NOT_ACTIVATED.BUTTON')}
          icon={{ name: 'mail', type: 'material', size: 22, color: 'white' }}
          onPress={confirmSendEmail}
          buttonStyle={styles.button(themeColors)}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: (themeColors) => ({
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: themeColors.color1,
  }),
  card: (themeColors) => ({
    width: '90%',
    maxWidth: 400,
    padding: 16,
    borderRadius: 8,
    backgroundColor: themeColors.color2,
    alignItems: 'center',
  }),
  image: {
    width: 110,
    height: 110,
    marginBottom: 16,
  },
  title: (themeColors) => ({
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 8,
    color: themeColors.color5,
  }),
  subtitle: (themeColors) => ({
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: themeColors.color5,
  }),
  content: (themeColors) => ({
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: themeColors.color5,
  }),
  button: (themeColors) => ({
    backgroundColor: themeColors.color3,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 4,
  }),
});

export default NotActivated;
