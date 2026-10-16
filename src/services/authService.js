import { db } from '../db/db';

const STORAGE_KEY = 'app_electoral_user';

export const authService = {
  async login(username, password) {
    const user = await db.usuarios.where('username').equalsIgnoreCase(username).first();
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    if (user.password !== password) {
      throw new Error('Contraseña incorrecta');
    }

    const sessionData = {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
      id_mesa: user.id_mesa || null,
      id_departamento: user.id_departamento || null,
      id_lugar: user.id_lugar || null,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    return sessionData;
  },

  getCurrentUser() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem(STORAGE_KEY);
  },

  async getDemoUsers() {
    return await db.usuarios.toArray();
  },

  async fastLogin(username) {
    const user = await db.usuarios.where('username').equalsIgnoreCase(username).first();
    if (!user) return null;
    const sessionData = {
      id: user.id,
      username: user.username,
      nombre: user.nombre,
      rol: user.rol,
      id_mesa: user.id_mesa || null,
      id_departamento: user.id_departamento || null,
      id_lugar: user.id_lugar || null,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    return sessionData;
  }
};
