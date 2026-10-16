import Dexie from 'dexie';

export class AppElectoralDatabase extends Dexie {
  constructor() {
    super('AppElectoralDB');
    this.version(1).stores({
      elecciones: '++id, nombre, fecha, estado',
      departamentos: '++id, nombre',
      localidades: '++id, id_departamento, nombre',
      lugares: '++id, id_departamento, id_localidad, nombre',
      mesas: '++id, id_eleccion, id_lugar, numero_mesa',
      votantes: '++id, id_eleccion, id_mesa, dni, orden, nombre, apellido, estado',
      votos: '++id, id_mesa, dni, hora',
      partidos: '++id, nombre, sigla, color',
      listas: '++id, id_partido, numero, nombre',
      cargos: '++id, nombre',
      candidatos: '++id, id_lista, id_cargo, nombre, orden',
      resultados: '++id, id_mesa, id_lista, tipo',
      usuarios: '++id, username, rol, id_mesa, id_departamento, id_lugar, dni',
      auditorias: '++id, usuario, accion, entidad, entidad_id, fecha',
    });
  }
}

export const db = new AppElectoralDatabase();
