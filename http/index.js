import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { handleLogout } from '../helpers/logoutHandler.js';
import { i18n } from '../i18n/index.js';
import { API_URL } from '@env';

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

$api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (refreshToken) config.headers.Cookie = `refreshToken=${refreshToken}`;
  config.headers['Accept-Language'] = i18n.language;
  config.headers['Client-Type'] = 'mobile';
  return config;
});

$api.interceptors.response.use(
  async (response) => {
    const setCookie = response.headers['set-cookie'];
    if (setCookie) {
      const refreshTokenCookie = setCookie.find((cookie) => cookie.startsWith('refreshToken='));
      if (refreshTokenCookie) {
        const refreshToken = refreshTokenCookie.split(';')[0].split('=')[1];
        await AsyncStorage.setItem('refreshToken', refreshToken);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status == 401 && originalRequest && !originalRequest._isRetry) {
      originalRequest._isRetry = true;
      try {
        const response = await axios.get(`${API_URL}/refresh`, {
          withCredentials: true,
        });
        await AsyncStorage.setItem('token', response.data.accessToken);
        await AsyncStorage.setItem('refreshToken', response.data.refreshToken);
        return $api.request(originalRequest);
      } catch (e) {
        await handleLogout();
        console.log('Не авторизован', e);
      }
    }
    throw error;
  }
);

export default $api;
