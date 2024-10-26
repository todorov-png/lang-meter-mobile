import $api from '../http/index.js';

class TestService {
  static async getAll() {
    return $api.get('/test/all');
  }

  static async getList() {
    return $api.get('/test/list');
  }

  static async get(id) {
    return $api.get(`/test/${id}`);
  }
}

export default TestService;
