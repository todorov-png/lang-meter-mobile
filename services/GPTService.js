import $api from '../http/index.js';

class GPTService {
  static async sendMessage(data) {
    return $api.post('/gpt', data);
  }
}

export default GPTService;
