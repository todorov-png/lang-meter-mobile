import $api from '../http/index.js';

class RoleService {
  static async getAll() {
    return $api.get('/role/all');
  }

  static async getList() {
    return $api.get('/role/list');
  }

  static async create(data) {
    return $api.post('/role', data);
  }

  static async update(data) {
    return $api.put('/role', data);
  }

  static async deleteList(data) {
    return $api.delete('/role/list', { data });
  }

  static async delete(data) {
    return $api.delete('/role', { data });
  }
}

export default RoleService;
