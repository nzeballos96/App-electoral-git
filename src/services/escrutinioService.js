import { db } from '../db/db';

export const escrutinioService = {
  /**
   * Obtiene los datos para cargar o ver el resultado de una mesa.
   */
  async getResultadosMesa(idMesa) {
    const mesa = await db.mesas.get(Number(idMesa));
    if (!mesa) throw new Error('Mesa no encontrada');

    const lugar = await db.lugares.get(mesa.id_lugar);
    const totalElectores = await db.votantes.where('id_mesa').equals(Number(idMesa)).and(v => v.estado === 'activo').count();
    const totalVotaron = await db.votos.where('id_mesa').equals(Number(idMesa)).count();

    const [listas, partidos, resultadosCargados] = await Promise.all([
      db.listas.toArray(),
      db.partidos.toArray(),
      db.resultados.where('id_mesa').equals(Number(idMesa)).toArray(),
    ]);

    const partidosMap = new Map(partidos.map(p => [p.id, p]));
    const resultadosMap = new Map(resultadosCargados.map(r => [r.tipo === 'positivo' ? `lista_${r.id_lista}` : r.tipo, r.votos]));

    const listasConVotos = listas.map(l => {
      const partido = partidosMap.get(l.id_partido);
      return {
        ...l,
        partido_nombre: partido?.nombre || '',
        partido_sigla: partido?.sigla || '',
        partido_color: partido?.color || '#3b82f6',
        votos: resultadosMap.get(`lista_${l.id}`) || 0,
      };
    });

    return {
      mesa: {
        id: mesa.id,
        numero_mesa: mesa.numero_mesa,
        lugar: lugar?.nombre || '',
      },
      total_electores: totalElectores,
      total_votaron: totalVotaron,
      listas: listasConVotos,
      votos_blancos: resultadosMap.get('blanco') || 0,
      votos_nulos: resultadosMap.get('nulo') || 0,
      votos_recurridos: resultadosMap.get('recurrido') || 0,
      ya_cargado: resultadosCargados.length > 0,
    };
  },

  /**
   * Carga o rectifica los resultados de una mesa de forma idempotente.
   */
  async guardarResultadosMesa(idMesa, carga, usuario = 'admin') {
    const mesaId = Number(idMesa);
    const totalElectores = await db.votantes.where('id_mesa').equals(mesaId).and(v => v.estado === 'activo').count();

    // Validar sumatoria
    let totalCargado = Number(carga.votos_blancos || 0) + Number(carga.votos_nulos || 0) + Number(carga.votos_recurridos || 0);
    carga.listas.forEach(l => {
      totalCargado += Number(l.votos || 0);
    });

    if (totalCargado > totalElectores) {
      throw new Error(`La suma total de votos (${totalCargado}) supera la cantidad de electores habilitados en la mesa (${totalElectores}).`);
    }

    await db.transaction('rw', [db.resultados, db.auditorias], async () => {
      // Borrar carga previa de esta mesa
      await db.resultados.where('id_mesa').equals(mesaId).delete();

      const nuevosResultados = [];
      carga.listas.forEach(l => {
        nuevosResultados.push({
          id_mesa: mesaId,
          id_lista: l.id,
          tipo: 'positivo',
          votos: Number(l.votos || 0),
        });
      });

      nuevosResultados.push(
        { id_mesa: mesaId, id_lista: null, tipo: 'blanco', votos: Number(carga.votos_blancos || 0) },
        { id_mesa: mesaId, id_lista: null, tipo: 'nulo', votos: Number(carga.votos_nulos || 0) },
        { id_mesa: mesaId, id_lista: null, tipo: 'recurrido', votos: Number(carga.votos_recurridos || 0) }
      );

      await db.resultados.bulkAdd(nuevosResultados);

      await db.auditorias.add({
        usuario,
        accion: 'cargar_escrutinio_mesa',
        entidad: 'Mesa',
        entidad_id: mesaId,
        fecha: new Date().toISOString(),
      });
    });

    return { success: true };
  },

  /**
   * Obtiene el acumulado de escrutinio general y por partido.
   */
  async getResumenGeneral() {
    const [mesas, resultados, listas, partidos] = await Promise.all([
      db.mesas.toArray(),
      db.resultados.toArray(),
      db.listas.toArray(),
      db.partidos.toArray(),
    ]);

    const mesasCargadasIds = new Set(resultados.map(r => r.id_mesa));
    const totalMesas = mesas.length;
    const mesasEscrutadas = mesasCargadasIds.size;
    const porcentajeMesas = totalMesas > 0 ? Number(((mesasEscrutadas / totalMesas) * 100).toFixed(1)) : 0;

    let votosPositivos = 0;
    let votosBlancos = 0;
    let votosNulos = 0;
    let votosRecurridos = 0;

    const votosPorLista = {};
    resultados.forEach(r => {
      if (r.tipo === 'positivo') {
        votosPositivos += r.votos;
        votosPorLista[r.id_lista] = (votosPorLista[r.id_lista] || 0) + r.votos;
      } else if (r.tipo === 'blanco') {
        votosBlancos += r.votos;
      } else if (r.tipo === 'nulo') {
        votosNulos += r.votos;
      } else if (r.tipo === 'recurrido') {
        votosRecurridos += r.votos;
      }
    });

    const totalVotosValidos = votosPositivos + votosBlancos;
    const totalVotosEmitidos = totalVotosValidos + votosNulos + votosRecurridos;

    const partidosMap = new Map(partidos.map(p => [p.id, p]));
    const rankingListas = listas.map(l => {
      const partido = partidosMap.get(l.id_partido);
      const votos = votosPorLista[l.id] || 0;
      const porcentaje = totalVotosValidos > 0 ? Number(((votos / totalVotosValidos) * 100).toFixed(2)) : 0;

      return {
        id: l.id,
        numero: l.numero,
        nombre: l.nombre,
        partido_nombre: partido?.nombre || '',
        partido_sigla: partido?.sigla || '',
        color: partido?.color || '#2563eb',
        votos,
        porcentaje,
      };
    }).sort((a, b) => b.votos - a.votos);

    return {
      total_mesas: totalMesas,
      mesas_escrutadas: mesasEscrutadas,
      porcentaje_mesas: porcentajeMesas,
      total_votos_emitidos: totalVotosEmitidos,
      total_votos_validos: totalVotosValidos,
      votos_positivos: votosPositivos,
      votos_blancos: votosBlancos,
      votos_nulos: votosNulos,
      votos_recurridos: votosRecurridos,
      listas: rankingListas,
    };
  }
};
