import $api from '../http/index.js';

class HistoryService {
  static async getAll() {
    return $api.get('/history/all');
  }

  static async create(data) {
    return $api.post('/history', data);
  }
}

export default HistoryService;
