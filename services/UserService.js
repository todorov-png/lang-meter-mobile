import $api from '../http/index.js';

class UserService {
  static async create(data) {
    return $api.post('/user', data);
  }

  static async edit(data) {
    return $api.put('/user/edit', data);
  }

  static async getAll() {
    return $api.get('/user/all');
  }

  static async update(data) {
    return $api.put('/user', data);
  }

  static async delete(data) {
    return $api.delete('/user', { data });
  }
}

export default UserService;
