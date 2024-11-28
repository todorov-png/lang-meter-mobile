import ProfileSvg from '../assets/img/svg/profile.svg';
import PasswordInput from '../components/PasswordInput.jsx';
import RadioButtonGroup from '../components/RadioButtonGroup.jsx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { updateUser, setTheme } from '../store/index.js';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'react-native-elements';
import { useTranslation } from 'react-i18next';
import { i18n } from '../i18n/index.js';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const username = useSelector((state) => state.user.username || t('PROFILE.FORM.USERNAME'));
  const email = useSelector((state) => state.user.email || t('PROFILE.FORM.EMAIL'));
  const themeFromStore = useSelector((state) => state.theme);
  const [theme, setThemeState] = useState(themeFromStore);
  const [lang, setLang] = useState('en');
  const [newUsername, setNewUsername] = useState(username);
  const [newEmail, setNewEmail] = useState(email);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const languageOptions = [
    { label: 'EN', value: 'en' },
    { label: 'UK', value: 'uk' },
  ];

  const themeOptions = [
    { label: t('PROFILE.THEME.DARK'), value: 'dark' },
    { label: t('PROFILE.THEME.LIGHT'), value: 'light' },
  ];

  const updateTheme = async () => {
    try {
      const themeValue = (await AsyncStorage.getItem('theme')) || 'light';
      dispatch(setTheme(themeValue));
      setThemeState(themeValue);
    } catch (error) {
      console.error('Ошибка при получении темы:', error);
    }
  };

  const updateLang = async () => {
    try {
      const value = (await AsyncStorage.getItem('lang')) || i18n.language || 'en';
      i18n.changeLanguage(value);
      setLang(value);
    } catch (error) {
      console.error('Ошибка при получении языка:', error);
    }
  };

  const changeTheme = async (value) => {
    setThemeState(value);
    dispatch(setTheme(value));
    await AsyncStorage.setItem('theme', value);
  };

  const changeLang = async (value) => {
    setLang(value);
    i18n.changeLanguage(value);
    await AsyncStorage.setItem('lang', value);
  };

  const saveData = async () => {
    setLoadingSubmit(true);
    const response = await dispatch(
      updateUser({
        username: newUsername,
        email: newEmail,
        password: currentPassword,
        newPassword: newPassword,
      })
    ).unwrap();
    if (response.success) {
      setNewUsername('');
      setNewEmail('');
      setNewPassword('');
      setCurrentPassword('');
      Alert.alert(t('TOAST.SUMMARY.SUCCESSFUL'), t('PROFILE.TOAST.DETAIL'));
    } else {
      Alert.alert(t('TOAST.SUMMARY.ERROR'), response.messageError);
    }
    setLoadingSubmit(false);
  };

  useEffect(() => {
    updateTheme();
    updateLang();
  }, []);

  return (
    <View style={styles.container(themeColors)}>
      <View style={styles.fieldset(themeColors)}>
        <ProfileSvg style={styles.image} />
        <View style={styles.inputGroup}>
          <View style={styles.containerRadioButtons}>
            <RadioButtonGroup
              selectedValue={lang}
              options={languageOptions}
              onValueChange={changeLang}
            />
            <RadioButtonGroup
              selectedValue={theme}
              options={themeOptions}
              onValueChange={changeTheme}
            />
          </View>
          <TextInput
            style={styles.input(themeColors)}
            placeholder={username}
            placeholderTextColor={themeColors.color7}
            value={newUsername}
            onChangeText={setNewUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input(themeColors)}
            placeholder={email}
            placeholderTextColor={themeColors.color7}
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <PasswordInput
            placeholder={t('PROFILE.FORM.CURRENT_PASSWORD')}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <PasswordInput
            placeholder={t('PROFILE.FORM.NEW_PASSWORD')}
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <View style={styles.buttonGroup}>
          <Button
            title={t('PROFILE.BUTTONS.SAVE')}
            icon={{ name: 'save', size: 22, color: 'white' }}
            buttonStyle={styles.button(themeColors.color3)}
            onPress={saveData}
            loading={loadingSubmit}
          />
          <Button
            title={t('BASE.HOME')}
            icon={{ name: 'home', size: 22, color: 'white' }}
            buttonStyle={styles.button(themeColors.color7)}
            onPress={() => navigation.navigate('Home')}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: (themeColors) => ({
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: themeColors.color1,
  }),
  fieldset: (themeColors) => ({
    borderWidth: 1,
    borderColor: themeColors.color6,
    borderRadius: 8,
    padding: 16,
  }),
  image: {
    width: 110,
    height: 110,
    marginBottom: 24,
    marginHorizontal: 'auto',
  },
  containerRadioButtons: {
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 16,
  },
  input: (themeColors) => ({
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    height: 42,
    borderColor: themeColors.color6,
    color: themeColors.color5,
  }),
  buttonGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    marginTop: 16,
    gap: 10,
  },
  button: (backgroundColor) => ({
    padding: 10,
    backgroundColor,
  }),
});

export default ProfileScreen;
