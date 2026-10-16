import { db } from '../db/db';

export const consultaService = {
  /**
   * Determina el color del semáforo a partir de la fecha/hora del último voto.
   */
  calcularSemaforo(ultimoVotoIso) {
    if (!ultimoVotoIso) return 'rojo';
    const ahora = new Date().getTime();
    const tiempoVoto = new Date(ultimoVotoIso).getTime();
    const minutos = Math.max(0, Math.floor((ahora - tiempoVoto) / 60000));

    if (minutos < 30) return 'verde';
    if (minutos <= 60) return 'amarillo';
    return 'rojo';
  },

  /**
   * Obtiene el resumen general y el árbol jerárquico completo con semáforos.
   */
  async getResumenGeneral() {
    const [departamentos, localidades, lugares, mesas, votantes, votos] = await Promise.all([
      db.departamentos.toArray(),
      db.localidades.toArray(),
      db.lugares.toArray(),
      db.mesas.toArray(),
      db.votantes.where('estado').equals('activo').toArray(),
      db.votos.toArray(),
    ]);

    // Mapeo de votos por mesa y último timestamp
    const votosPorMesa = {};
    const ultimoVotoPorMesa = {};

    votos.forEach(v => {
      votosPorMesa[v.id_mesa] = (votosPorMesa[v.id_mesa] || 0) + 1;
      if (!ultimoVotoPorMesa[v.id_mesa] || new Date(v.hora) > new Date(ultimoVotoPorMesa[v.id_mesa])) {
        ultimoVotoPorMesa[v.id_mesa] = v.hora;
      }
    });

    // Mapeo de votantes totales por mesa
    const votantesPorMesa = {};
    votantes.forEach(v => {
      votantesPorMesa[v.id_mesa] = (votantesPorMesa[v.id_mesa] || 0) + 1;
    });

    // Enriquecer mesas
    const mesasEnriquecidas = mesas.map(m => {
      const total = votantesPorMesa[m.id] || 0;
      const votaron = votosPorMesa[m.id] || 0;
      const porcentaje = total > 0 ? Number(((votaron / total) * 100).toFixed(1)) : 0;
      const semaforo = this.calcularSemaforo(ultimoVotoPorMesa[m.id]);

      return {
        ...m,
        total_electores: total,
        votaron,
        porcentaje,
        ultimo_voto: ultimoVotoPorMesa[m.id] || null,
        semaforo,
      };
    });

    // Conteo global de semáforo
    const semaforosTotal = { verde: 0, amarillo: 0, rojo: 0 };
    mesasEnriquecidas.forEach(m => {
      semaforosTotal[m.semaforo]++;
    });

    const totalElectores = votantes.length;
    const totalVotaron = votos.length;
    const porcentajeParticipacion = totalElectores > 0
      ? Number(((totalVotaron / totalElectores) * 100).toFixed(1))
      : 0;

    // Estructurar árbol jerárquico
    const arbolDepartamentos = departamentos.map(dept => {
      const deptoLocalidades = localidades.filter(l => l.id_departamento === dept.id).map(loc => {
        const locLugares = lugares.filter(lug => lug.id_localidad === loc.id).map(lug => {
          const lugMesas = mesasEnriquecidas.filter(m => m.id_lugar === lug.id);
          const lugElectores = lugMesas.reduce((acc, m) => acc + m.total_electores, 0);
          const lugVotaron = lugMesas.reduce((acc, m) => acc + m.votaron, 0);
          const lugPorcentaje = lugElectores > 0 ? Number(((lugVotaron / lugElectores) * 100).toFixed(1)) : 0;

          return {
            ...lug,
            mesas: lugMesas,
            total_electores: lugElectores,
            votaron: lugVotaron,
            porcentaje: lugPorcentaje,
          };
        });

        const locElectores = locLugares.reduce((acc, l) => acc + l.total_electores, 0);
        const locVotaron = locLugares.reduce((acc, l) => acc + l.votaron, 0);

        return {
          ...loc,
          lugares: locLugares,
          total_electores: locElectores,
          votaron: locVotaron,
          porcentaje: locElectores > 0 ? Number(((locVotaron / locElectores) * 100).toFixed(1)) : 0,
        };
      });

      const deptElectores = deptoLocalidades.reduce((acc, l) => acc + l.total_electores, 0);
      const deptVotaron = deptoLocalidades.reduce((acc, l) => acc + l.votaron, 0);

      return {
        ...dept,
        localidades: deptoLocalidades,
        total_electores: deptElectores,
        votaron: deptVotaron,
        porcentaje: deptElectores > 0 ? Number(((deptVotaron / deptElectores) * 100).toFixed(1)) : 0,
      };
    });

    return {
      total_electores: totalElectores,
      total_votaron: totalVotaron,
      porcentaje_participacion: porcentajeParticipacion,
      semaforos: semaforosTotal,
      mesas: mesasEnriquecidas,
      departamentos: arbolDepartamentos,
    };
  }
};
