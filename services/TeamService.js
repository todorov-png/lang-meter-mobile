import $api from '../http/index.js';

class TeamService {
  static async getAll() {
    return $api.get('/team/all');
  }

  static async getList() {
    return $api.get('/team/list');
  }

  static async create(data) {
    return $api.post('/team', data);
  }

  static async update(data) {
    return $api.put('/team', data);
  }

  static async delete(data) {
    return $api.delete('/team', { data });
  }
}

export default TeamService;
