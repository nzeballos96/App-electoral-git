import { db } from '../db/db';

export const padronService = {
  /**
   * Procesa un archivo CSV con formato dni;nombre;apellido;escuela;mesa o dni;nombre;apellido;mesa
   */
  async importarCSV(contenidoTexto, idEleccion = 1, idLugarFallback = 1) {
    const lineas = contenidoTexto.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (lineas.length === 0) {
      throw new Error('El archivo CSV está vacío');
    }

    // Saltar encabezado si existe
    const primeraLinea = lineas[0].toLowerCase();
    const inicio = (primeraLinea.includes('dni') || primeraLinea.includes('documento')) ? 1 : 0;

    const lugaresExistentes = await db.lugares.toArray();
    const mesasExistentes = await db.mesas.where('id_eleccion').equals(idEleccion).toArray();
    const votantesPrevios = await db.votantes.where('id_eleccion').equals(idEleccion).toArray();
    const votantesMap = new Map(votantesPrevios.map(v => [v.dni, v]));

    const lugaresMap = new Map();
    lugaresExistentes.forEach(l => {
      lugaresMap.set(l.nombre.toLowerCase().trim(), l.id);
    });

    const mesasMap = new Map();
    mesasExistentes.forEach(m => {
      mesasMap.set(`${m.id_lugar}_${m.numero_mesa}`, m.id);
    });

    let insertados = 0;
    let actualizados = 0;
    let errores = [];
    const dnisEncontrados = new Set();

    await db.transaction('rw', [db.lugares, db.mesas, db.votantes, db.auditorias], async () => {
      for (let i = inicio; i < lineas.length; i++) {
        const fila = lineas[i];
        const cols = fila.split(';').map(c => c.trim().replace(/^["']|["']$/g, ''));
        if (cols.length < 4) {
          errores.push(`Línea ${i + 1}: columnas insuficientes (${cols.length})`);
          continue;
        }

        let dni = cols[0];
        let nombre = cols[1];
        let apellido = cols[2];
        let nombreEscuela = '';
        let numeroMesa = 0;

        if (cols.length >= 5) {
          nombreEscuela = cols[3];
          numeroMesa = parseInt(cols[4], 10);
        } else {
          numeroMesa = parseInt(cols[3], 10);
        }

        if (!dni || isNaN(numeroMesa) || numeroMesa <= 0) {
          errores.push(`Línea ${i + 1}: DNI o número de mesa inválido`);
          continue;
        }

        dnisEncontrados.add(dni);

        // Resolver lugar/escuela
        let idLugar = idLugarFallback;
        if (nombreEscuela) {
          const keyEscuela = nombreEscuela.toLowerCase().trim();
          if (lugaresMap.has(keyEscuela)) {
            idLugar = lugaresMap.get(keyEscuela);
          } else {
            // Crear lugar automáticamente
            idLugar = await db.lugares.add({
              id_departamento: 1,
              id_localidad: 1,
              nombre: nombreEscuela,
              direccion: 'A confirmar',
            });
            lugaresMap.set(keyEscuela, idLugar);
          }
        }

        // Resolver mesa
        const keyMesa = `${idLugar}_${numeroMesa}`;
        let idMesa = mesasMap.get(keyMesa);
        if (!idMesa) {
          idMesa = await db.mesas.add({
            id_eleccion: idEleccion,
            id_lugar: idLugar,
            numero_mesa: numeroMesa,
          });
          mesasMap.set(keyMesa, idMesa);
        }

        // Insertar o actualizar votante
        if (votantesMap.has(dni)) {
          const vActual = votantesMap.get(dni);
          await db.votantes.update(vActual.id, {
            nombre,
            apellido,
            id_mesa: idMesa,
            estado: 'activo',
          });
          actualizados++;
        } else {
          await db.votantes.add({
            id_eleccion: idEleccion,
            id_mesa: idMesa,
            dni,
            orden: i + 1,
            nombre,
            apellido,
            estado: 'activo',
          });
          insertados++;
        }
      }

      // Principio de padrón histórico: los ausentes pasan a "baja"
      let dadosDeBaja = 0;
      for (const v of votantesPrevios) {
        if (!dnisEncontrados.has(v.dni) && v.estado === 'activo') {
          await db.votantes.update(v.id, { estado: 'baja' });
          dadosDeBaja++;
        }
      }

      await db.auditorias.add({
        usuario: 'admin',
        accion: 'importar_padron_csv',
        entidad: 'Padron',
        entidad_id: idEleccion,
        fecha: new Date().toISOString(),
      });
    });

    return {
      total_lineas: lineas.length - inicio,
      insertados,
      actualizados,
      errores,
    };
  }
};
