import React, { useCallback } from 'react';
import TestScreen from './TestScreen.jsx';
import HomeScreen from './HomeScreen.jsx';
import RolesScreen from './RolesScreen.jsx';
import TeamsScreen from './TeamsScreen.jsx';
import UsersScreen from './UsersScreen.jsx';
import LoginScreen from './LoginScreen.jsx';
import HistoryScreen from './HistoryScreen.jsx';
import ProfileScreen from './ProfileScreen.jsx';
import HeaderMenu from '../components/HeaderMenu.jsx';
import RegistrationScreen from './RegistrationScreen.jsx';
import { NavigationContainer, useNavigation, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { logoutContext } from '../helpers/logoutHandler.js';
import { useThemeColors } from '../styles/themeColors.js';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

const Stack = createNativeStackNavigator();

const LogoutContextProvider = ({ children }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  useFocusEffect(
    useCallback(() => {
      logoutContext.navigation = navigation;
      logoutContext.dispatch = dispatch;
    }, [navigation, dispatch])
  );

  return <>{children}</>;
};

export const Navigation = () => {
  const { t } = useTranslation();
  const themeColors = useThemeColors();
  const isAuth = useSelector((state) => state.isAuth);
  const headerRight = useCallback(() => {
    return isAuth ? <HeaderMenu /> : null;
  }, [isAuth]);

  return (
    <NavigationContainer>
      <LogoutContextProvider>
        <Stack.Navigator
          screenOptions={{
            headerTitleAlign: 'center',
            headerBackVisible: false,
            headerRight: headerRight,
            headerStyle: {
              backgroundColor: themeColors.color1,
            },
            headerTintColor: themeColors.color5,
            gestureEnabled: false,
            animation: 'slide_from_right',
          }}
        >
          {isAuth ? (
            <>
              <Stack.Screen
                name="Home"
                component={HomeScreen}
                options={{ title: t('HEADER.TITLE.HOME') }}
              />
              <Stack.Screen
                name="Test"
                component={TestScreen}
                options={{ title: t('HEADER.TITLE.TEST') }}
              />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ title: t('HEADER.TITLE.HISTORY') }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ title: t('HEADER.TITLE.PROFILE') }}
              />
              <Stack.Screen
                name="Roles"
                component={RolesScreen}
                options={{ title: t('HEADER.TITLE.ROLES') }}
              />
              <Stack.Screen
                name="Teams"
                component={TeamsScreen}
                options={{ title: t('HEADER.TITLE.TEAMS') }}
              />
              <Stack.Screen
                name="Users"
                component={UsersScreen}
                options={{ title: t('HEADER.TITLE.USERS') }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ title: t('AUTH.LOGIN') }}
              />
              <Stack.Screen
                name="Registration"
                component={RegistrationScreen}
                options={{ title: t('AUTH.REGISTRATION') }}
              />
            </>
          )}
        </Stack.Navigator>
      </LogoutContextProvider>
    </NavigationContainer>
  );
};
