import { db } from '../db/db';

export const fiscalService = {
  /**
   * Obtiene el padrón de la mesa especificada con el estado de voto de cada persona.
   */
  async getPadronMesa(idMesa) {
    const mesa = await db.mesas.get(Number(idMesa));
    if (!mesa) throw new Error('Mesa no encontrada');

    const lugar = await db.lugares.get(mesa.id_lugar);
    const localidad = lugar ? await db.localidades.get(lugar.id_localidad) : null;

    const votantes = await db.votantes
      .where('id_mesa')
      .equals(Number(idMesa))
      .and(v => v.estado === 'activo')
      .sortBy('orden');

    const votos = await db.votos.where('id_mesa').equals(Number(idMesa)).toArray();
    const votosMap = new Map(votos.map(v => [v.dni, v.hora]));

    const padronEnriquecido = votantes.map(v => ({
      ...v,
      ya_voto: votosMap.has(v.dni),
      hora_voto: votosMap.get(v.dni) || null,
    }));

    return {
      mesa: {
        id: mesa.id,
        numero_mesa: mesa.numero_mesa,
        lugar: lugar?.nombre || 'Escuela',
        direccion: lugar?.direccion || '',
        localidad: localidad?.nombre || '',
      },
      total_votantes: votantes.length,
      votaron: votos.length,
      porcentaje: votantes.length > 0 ? Number(((votos.length / votantes.length) * 100).toFixed(1)) : 0,
      votantes: padronEnriquecido,
    };
  },

  /**
   * Marca o desmarca un voto de forma idempotente.
   */
  async toggleVoto(idMesa, dni, usuario = 'fiscal') {
    const votoExistente = await db.votos
      .where(['id_mesa', 'dni'])
      .equals([Number(idMesa), dni])
      .first() || await db.votos.where('dni').equals(dni).filter(v => v.id_mesa === Number(idMesa)).first();

    let accion = '';
    if (votoExistente) {
      await db.votos.delete(votoExistente.id);
      accion = 'desmarcar_voto';
    } else {
      await db.votos.add({
        id_mesa: Number(idMesa),
        dni,
        hora: new Date().toISOString(),
      });
      accion = 'marcar_voto';
    }

    // Registrar en auditoría
    await db.auditorias.add({
      usuario,
      accion,
      entidad: 'Voto',
      entidad_id: dni,
      fecha: new Date().toISOString(),
    });

    return { success: true, estado: accion === 'marcar_voto' };
  }
};
