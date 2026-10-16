import { db } from './db';

export async function seedDatabase(force = false) {
  const countElecciones = await db.elecciones.count();
  const countLocalidades = await db.localidades.count();

  // Si ya tiene las 5 localidades completas y no se fuerza, no hace nada
  if (countElecciones > 0 && countLocalidades >= 5 && !force) {
    return;
  }

  // Limpiar todas las tablas para sembrado limpio
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }

    // 1. Elección Departamental
    const eleccionId = await db.elecciones.add({
      id: 1,
      nombre: 'Elecciones Generales - Departamento Garay',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'activa',
    });

    // 2. Departamento
    await db.departamentos.add({ id: 1, nombre: 'Garay' });

    // 3. Localidades Reales del Departamento Garay (Santa Fe)
    await db.localidades.bulkAdd([
      { id: 1, id_departamento: 1, nombre: 'Helvecia' },
      { id: 2, id_departamento: 1, nombre: 'Cayastá' },
      { id: 3, id_departamento: 1, nombre: 'Santa Rosa de Calchines' },
      { id: 4, id_departamento: 1, nombre: 'Saladero Mariano Cabal' },
      { id: 5, id_departamento: 1, nombre: 'Colonia Mascías' },
    ]);

    // 4. Lugares / Establecimientos de Votación Reales
    await db.lugares.bulkAdd([
      { id: 1, id_departamento: 1, id_localidad: 1, nombre: 'Escuela N° 423 República del Perú', direccion: 'San Martín 650' },
      { id: 2, id_departamento: 1, id_localidad: 2, nombre: 'Escuela N° 6102 Gral. San Martín', direccion: 'Hernandarias 320' },
      { id: 3, id_departamento: 1, id_localidad: 3, nombre: 'Escuela N° 426 Mariano Moreno', direccion: 'Fray Antonio Rossi 480' },
      { id: 4, id_departamento: 1, id_localidad: 4, nombre: 'Escuela N° 6107 Rosa Turner de Estrugamou', direccion: 'Ruta Pcial 1 Km 120' },
      { id: 5, id_departamento: 1, id_localidad: 5, nombre: 'Escuela N° 6106 Granaderos Argentinos', direccion: 'Zona Urbana S/N' },
    ]);

    // 5. Mesas Electorales por Localidad y Escuela
    await db.mesas.bulkAdd([
      // Helvecia (Escuela 423)
      { id: 1, id_eleccion: eleccionId, id_lugar: 1, numero_mesa: 101 },
      { id: 2, id_eleccion: eleccionId, id_lugar: 1, numero_mesa: 102 },
      // Cayastá (Escuela 6102)
      { id: 3, id_eleccion: eleccionId, id_lugar: 2, numero_mesa: 201 },
      { id: 4, id_eleccion: eleccionId, id_lugar: 2, numero_mesa: 202 },
      // Santa Rosa de Calchines (Escuela 426)
      { id: 5, id_eleccion: eleccionId, id_lugar: 3, numero_mesa: 301 },
      { id: 6, id_eleccion: eleccionId, id_lugar: 3, numero_mesa: 302 },
      // Saladero Mariano Cabal (Escuela 6107)
      { id: 7, id_eleccion: eleccionId, id_lugar: 4, numero_mesa: 401 },
      // Colonia Mascías (Escuela 6106)
      { id: 8, id_eleccion: eleccionId, id_lugar: 5, numero_mesa: 501 },
    ]);

    // 6. Partidos y Listas (Lista 1, 2, 3 y 4)
    await db.partidos.bulkAdd([
      { id: 1, nombre: 'Lista 1', sigla: 'Lista 1', color: '#2563eb' },
      { id: 2, nombre: 'Lista 2', sigla: 'Lista 2', color: '#0284c7' },
      { id: 3, nombre: 'Lista 3', sigla: 'Lista 3', color: '#7c3aed' },
      { id: 4, nombre: 'Lista 4', sigla: 'Lista 4', color: '#e11d48' },
    ]);

    await db.cargos.bulkAdd([
      { id: 1, nombre: 'Senador Departamental' },
      { id: 2, nombre: 'Presidente Comunal' },
    ]);

    await db.listas.bulkAdd([
      { id: 1, id_partido: 1, numero: 1, nombre: 'Lista 1' },
      { id: 2, id_partido: 2, numero: 2, nombre: 'Lista 2' },
      { id: 3, id_partido: 3, numero: 3, nombre: 'Lista 3' },
      { id: 4, id_partido: 4, numero: 4, nombre: 'Lista 4' },
    ]);

    await db.candidatos.bulkAdd([
      // Lista 1
      { id: 1, id_lista: 1, id_cargo: 1, nombre: 'Roberto M. Giménez', orden: 1 },
      { id: 2, id_lista: 1, id_cargo: 2, nombre: 'Marcelo V. Benítez', orden: 1 },
      // Lista 2
      { id: 3, id_lista: 2, id_cargo: 1, nombre: 'Laura G. Tourn', orden: 1 },
      { id: 4, id_lista: 2, id_cargo: 2, nombre: 'Juan Ignacio Mendoza', orden: 1 },
      // Lista 3
      { id: 5, id_lista: 3, id_cargo: 1, nombre: 'Esteban D. Rivero', orden: 1 },
      { id: 6, id_lista: 3, id_cargo: 2, nombre: 'Sandra P. Quiroz', orden: 1 },
      // Lista 4
      { id: 7, id_lista: 4, id_cargo: 1, nombre: 'Carlos A. Leguizamón', orden: 1 },
      { id: 8, id_lista: 4, id_cargo: 2, nombre: 'Andrea F. Romero', orden: 1 },
    ]);

    // 7. Usuarios Demo de Acceso Rápido
    await db.usuarios.bulkAdd([
      { id: 1, username: 'admin', password: '123', rol: 'SuperAdmin', nombre: 'Administrador General' },
      { id: 2, username: 'coord_garay', password: '123', rol: 'CoordinadorDepartamental', id_departamento: 1, nombre: 'Coordinador Dpto. Garay' },
      { id: 3, username: 'coord_helvecia', password: '123', rol: 'CoordinadorLugar', id_departamento: 1, id_lugar: 1, nombre: 'Coordinador Esc. 423 Helvecia' },
      { id: 4, username: 'coord_santarosa', password: '123', rol: 'CoordinadorLugar', id_departamento: 1, id_lugar: 3, nombre: 'Coordinador Esc. 426 Santa Rosa' },
      { id: 5, username: 'fiscal_mesa1', password: '123', rol: 'Fiscal', id_mesa: 1, nombre: 'Fiscal Mesa 101 (Helvecia)' },
      { id: 6, username: 'fiscal_mesa5', password: '123', rol: 'Fiscal', id_mesa: 5, nombre: 'Fiscal Mesa 301 (Santa Rosa)' },
    ]);

    // 8. Padrón Demo de Votantes (~15 por cada mesa)
    const personas = [
      { dni: '20456123', nombre: 'JUAN MANUEL', apellido: 'GARCIA', genero: 'M', clase: '1975' },
      { dni: '22894561', nombre: 'MARIA ELENA', apellido: 'MARTINEZ', genero: 'F', clase: '1979' },
      { dni: '25412893', nombre: 'RODRIGO MARTIN', apellido: 'LOPEZ', genero: 'M', clase: '1982' },
      { dni: '28634129', nombre: 'LUCIA BEATRIZ', apellido: 'FERNANDEZ', genero: 'F', clase: '1985' },
      { dni: '31529841', nombre: 'GONZALO ARIEL', apellido: 'GONZALEZ', genero: 'M', clase: '1988' },
      { dni: '34128963', nombre: 'CAROLINA INES', apellido: 'PEREZ', genero: 'F', clase: '1991' },
      { dni: '37894512', nombre: 'MATEO VALENTIN', apellido: 'RODRIGUEZ', genero: 'M', clase: '1994' },
      { dni: '40125896', nombre: 'SOFIA AGUSTINA', apellido: 'SANCHEZ', genero: 'F', clase: '1997' },
      { dni: '42589631', nombre: 'TOMAS IGNACIO', apellido: 'ROMERO', genero: 'M', clase: '2000' },
      { dni: '44896325', nombre: 'CAMILA VICTORIA', apellido: 'DIAZ', genero: 'F', clase: '2003' },
      { dni: '46123456', nombre: 'FRANCO DANIEL', apellido: 'ALVAREZ', genero: 'M', clase: '2005' },
      { dni: '18562341', nombre: 'ANA MARIA', apellido: 'BENITEZ', genero: 'F', clase: '1970' },
      { dni: '16987452', nombre: 'CARLOS ALBERTO', apellido: 'RUIZ', genero: 'M', clase: '1965' },
      { dni: '23456789', nombre: 'PATRICIA LAURA', apellido: 'CASTILLO', genero: 'F', clase: '1980' },
      { dni: '30123987', nombre: 'ESTEBAN JAVIER', apellido: 'MEDINA', genero: 'M', clase: '1986' },
    ];

    const votantes = [];
    let idVotante = 1;
    // Sembrar votantes en las 8 mesas
    for (let mesaId = 1; mesaId <= 8; mesaId++) {
      for (let i = 0; i < personas.length; i++) {
        const p = personas[i];
        const dniMod = `${p.dni.slice(0, 6)}${mesaId.toString().padStart(2, '0')}`;
        votantes.push({
          id: idVotante++,
          id_eleccion: 1,
          id_mesa: mesaId,
          dni: dniMod,
          orden: i + 1,
          nombre: p.nombre,
          apellido: p.apellido,
          genero: p.genero,
          clase: p.clase,
          estado: 'activo',
        });
      }
    }
    await db.votantes.bulkAdd(votantes);

    // 9. Votos Iniciales para Demostración del Semáforo
    const now = new Date();
    // Mesa 1 (Helvecia - 101): 6 votos recientes (< 30 min) -> 🟢 Verde
    const votosMesa1 = votantes.filter(v => v.id_mesa === 1).slice(0, 6);
    for (let i = 0; i < votosMesa1.length; i++) {
      const hora = new Date(now.getTime() - (3 + i * 3) * 60000).toISOString();
      await db.votos.add({ id_mesa: 1, dni: votosMesa1[i].dni, hora });
    }

    // Mesa 5 (Santa Rosa - 301): 4 votos de hace ~45 min -> 🟡 Amarillo
    const votosMesa5 = votantes.filter(v => v.id_mesa === 5).slice(0, 4);
    for (let i = 0; i < votosMesa5.length; i++) {
      const hora = new Date(now.getTime() - (40 + i * 4) * 60000).toISOString();
      await db.votos.add({ id_mesa: 5, dni: votosMesa5[i].dni, hora });
    }

    // Mesa 8 (Colonia Mascías - 501): Sin votos iniciales -> 🔴 Rojo

    // 10. Resultados / Telegramas Escrutados Demo (para gráficos de Barras y Tortas)
    await db.resultados.bulkAdd([
      // Mesa 1 (Helvecia - Mesa 101)
      { id_mesa: 1, id_lista: 1, tipo: 'positivo', votos: 5 },
      { id_mesa: 1, id_lista: 2, tipo: 'positivo', votos: 4 },
      { id_mesa: 1, id_lista: 3, tipo: 'positivo', votos: 3 },
      { id_mesa: 1, id_lista: 4, tipo: 'positivo', votos: 1 },
      { id_mesa: 1, id_lista: null, tipo: 'blanco', votos: 1 },
      { id_mesa: 1, id_lista: null, tipo: 'nulo', votos: 0 },
      { id_mesa: 1, id_lista: null, tipo: 'recurrido', votos: 0 },

      // Mesa 3 (Cayastá - Mesa 201)
      { id_mesa: 3, id_lista: 1, tipo: 'positivo', votos: 3 },
      { id_mesa: 3, id_lista: 2, tipo: 'positivo', votos: 6 },
      { id_mesa: 3, id_lista: 3, tipo: 'positivo', votos: 2 },
      { id_mesa: 3, id_lista: 4, tipo: 'positivo', votos: 2 },
      { id_mesa: 3, id_lista: null, tipo: 'blanco', votos: 1 },
      { id_mesa: 3, id_lista: null, tipo: 'nulo', votos: 0 },
      { id_mesa: 3, id_lista: null, tipo: 'recurrido', votos: 0 },

      // Mesa 5 (Santa Rosa de Calchines - Mesa 301)
      { id_mesa: 5, id_lista: 1, tipo: 'positivo', votos: 4 },
      { id_mesa: 5, id_lista: 2, tipo: 'positivo', votos: 3 },
      { id_mesa: 5, id_lista: 3, tipo: 'positivo', votos: 5 },
      { id_mesa: 5, id_lista: 4, tipo: 'positivo', votos: 2 },
      { id_mesa: 5, id_lista: null, tipo: 'blanco', votos: 0 },
      { id_mesa: 5, id_lista: null, tipo: 'nulo', votos: 1 },
      { id_mesa: 5, id_lista: null, tipo: 'recurrido', votos: 0 },

      // Mesa 7 (Saladero Mariano Cabal - Mesa 401)
      { id_mesa: 7, id_lista: 1, tipo: 'positivo', votos: 2 },
      { id_mesa: 7, id_lista: 2, tipo: 'positivo', votos: 2 },
      { id_mesa: 7, id_lista: 3, tipo: 'positivo', votos: 2 },
      { id_mesa: 7, id_lista: 4, tipo: 'positivo', votos: 4 },
      { id_mesa: 7, id_lista: null, tipo: 'blanco', votos: 1 },
      { id_mesa: 7, id_lista: null, tipo: 'nulo', votos: 0 },
      { id_mesa: 7, id_lista: null, tipo: 'recurrido', votos: 0 },
    ]);

    // 11. Auditoría inicial
    await db.auditorias.add({
      usuario: 'sistema',
      accion: 'seeder_ejecutado',
      entidad: 'BaseLocal',
      entidad_id: 1,
      fecha: new Date().toISOString(),
    });
  });

  console.log('✅ Base de datos local sembrada con éxito: 5 Localidades de Garay y Listas 1, 2, 3 y 4');
}
