import { Alert } from 'react-native';

export const logoutContext = {
  dispatch: null,
  navigation: null,
};

export const handleLogout = async () => {
  try {
    const { dispatch, navigation } = logoutContext;
    if (!dispatch || !navigation) return;
    const { logout } = await import('../store/index.js');
    const response = await dispatch(logout()).unwrap();
    if (response.success) {
      navigation.navigate('Login');
    } else {
      Alert.alert(response.messageError);
    }
  } catch (e) {
    console.error(e);
  }
};
