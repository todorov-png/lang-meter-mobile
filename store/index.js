import AuthService from '../services/AuthService.js';
import UserService from '../services/UserService.js';
import TestService from '../services/TestService.js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createSlice, createAsyncThunk, configureStore } from '@reduxjs/toolkit';
import { i18n } from '../i18n/index.js';

const initialState = {
  user: {},
  isAuth: false,
  isLoading: false,
  tests: [],
  theme: 'light',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setAuth: (state, action) => {
      state.isAuth = action.payload;
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setTests: (state, action) => {
      state.tests = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const { setLoading, setAuth, setUser, setTests, setTheme } = appSlice.actions;

export const store = configureStore({
  reducer: appSlice.reducer,
});

export const login = createAsyncThunk('app/login', async (userData, { dispatch }) => {
  try {
    const { email, password } = userData;
    const response = await AuthService.login(email, password);
    await AsyncStorage.setItem('token', response.data.accessToken);
    dispatch(setAuth(true));
    dispatch(setUser(response.data.user));
    return { success: true };
  } catch (e) {
    if (e.response?.data?.message) {
      return { success: false, messageError: e.response.data.message };
    }
    return { success: false, messageError: i18n.t('TOAST.DETAIL.SERVER_ERROR') };
  }
});

export const registration = createAsyncThunk('app/registration', async (userData, { dispatch }) => {
  try {
    const { username, email, password, repeatPassword } = userData;
    const response = await AuthService.registration(username, email, password, repeatPassword);
    await AsyncStorage.setItem('token', response.data.accessToken);
    dispatch(setAuth(true));
    dispatch(setUser(response.data.user));
    return { success: true };
  } catch (e) {
    if (e.response?.data?.message) {
      return { success: false, messageError: e.response.data.message };
    }
    return { success: false, messageError: i18n.t('TOAST.DETAIL.SERVER_ERROR') };
  }
});

export const logout = createAsyncThunk('app/logout', async (_, { dispatch }) => {
  try {
    dispatch(setLoading(true));
    await AuthService.logout();
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
    dispatch(setAuth(false));
    dispatch(setUser({}));
    dispatch(setTests([]));
    return { success: true };
  } catch (e) {
    if (e.response?.data?.message) {
      return { success: false, messageError: e.response.data.message };
    }
    return { success: false, messageError: i18n.t('TOAST.DETAIL.SERVER_ERROR') };
  } finally {
    dispatch(setLoading(false));
  }
});

export const checkPermissions = (state, namePage) => {
  const permissions = state.app.user.permissions || {};
  switch (namePage) {
    case 'users':
      return !!(
        permissions.assignRole ||
        permissions.assignTeam ||
        permissions.deleteUser ||
        permissions.createUser
      );
    case 'teams':
      return !!(permissions.createTeam || permissions.deleteTeam);
    case 'roles':
      return !!(permissions.createRole || permissions.deleteRole);
    default:
      return true;
  }
};

export const updateUser = createAsyncThunk('user/updateUser', async (userData, { dispatch }) => {
  try {
    const response = await UserService.edit(userData);
    dispatch(setUser(response.data));
    return { success: true };
  } catch (e) {
    if (e.response?.data?.message) {
      return { success: false, messageError: e.response.data.message };
    }
    return { success: false, messageError: i18n.t('TOAST.DETAIL.SERVER_ERROR') };
  }
});

export const getTests = createAsyncThunk('tests/getTests', async (_, { dispatch }) => {
  try {
    const response = await TestService.getAll();
    dispatch(setTests(response.data));
    return { success: true };
  } catch (e) {
    if (e.response?.data?.message) {
      return { success: false, messageError: e.response.data.message };
    }
    return { success: false, messageError: i18n.t('TOAST.DETAIL.SERVER_ERROR') };
  }
});

export const initializeSettings = createAsyncThunk('app/initializeSettings', async (_, { dispatch }) => {
  try {
    const savedTheme = await AsyncStorage.getItem('theme') || 'light';
    const savedLang = await AsyncStorage.getItem('lang') || 'en';

    dispatch(setTheme(savedTheme));
    i18n.changeLanguage(savedLang);
  } catch (error) {
    console.error('Ошибка при инициализации настроек:', error);
  }
});
