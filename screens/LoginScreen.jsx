import React, { useState } from 'react';
import PasswordInput from '../components/PasswordInput.jsx';
import { View, TextInput, StyleSheet, Alert } from 'react-native';
import { useThemeColors } from '../styles/themeColors.js';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from 'react-native-elements';
import { useDispatch } from 'react-redux';
import { login } from '../store/index.js';

const LoginScreen = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const themeColors = useThemeColors();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const submitForm = async () => {
    setLoadingSubmit(true);
    const response = await dispatch(login({ email, password })).unwrap();
    setLoadingSubmit(false);
    if (response.success) {
      navigation.navigate('Home');
    } else {
      Alert.alert(t('TOAST.SUMMARY.ERROR'), response.messageError);
    }
  };

  return (
    <View style={styles.container(themeColors)}>
      <View style={styles.gridContainer(themeColors)}>
        <TextInput
          style={styles.input(themeColors)}
          placeholder={t('AUTH.EMAIL')}
          placeholderTextColor={themeColors.color7}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <PasswordInput
          placeholder={t('AUTH.PASSWORD')}
          placeholderTextColor={themeColors.color7}
          value={password}
          onChangeText={setPassword}
        />
        <Button
          title={t('AUTH.BUTTONS.SING_IN')}
          icon={{ name: 'login', type: 'material', size: 22, color: themeColors.color4 }}
          onPress={submitForm}
          loading={loadingSubmit}
          buttonStyle={styles.button(themeColors.color3)}
        />
        <Button
          title={t('AUTH.BUTTONS.REGISTRATION')}
          icon={{ name: 'person-add', type: 'material', size: 22, color: themeColors.color4 }}
          onPress={() => navigation.navigate('Registration')}
          buttonStyle={styles.button(themeColors.color7)}
        />
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
  gridContainer: (themeColors) => ({
    display: 'flex',
    flexDirection: 'column',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    gap: 12,
    backgroundColor: themeColors.color2,
    borderColor: themeColors.color6,
  }),
  input: (themeColors) => ({
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    height: 42,
    borderColor: themeColors.color6,
    color: themeColors.color5,
  }),
  button: (backgroundColor) => ({
    padding: 10,
    backgroundColor,
  }),
});

export default LoginScreen;
