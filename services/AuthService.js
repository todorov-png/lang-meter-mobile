import $api from '../http/index.js';

class AuthService {
  static async login(email, password) {
    return $api.post('/login', { email, password });
  }

  static async registration(username, email, password, repeatPassword) {
    return $api.post('/registration', { username, email, password, repeatPassword });
  }

  static async logout() {
    return $api.post('/logout');
  }

  static async sendActivationCode() {
    return $api.post('/activation-code');
  }
}

export default AuthService;
