import { db } from './db';

export async function seedDatabase(force = false) {
  const countElecciones = await db.elecciones.count();
  if (countElecciones > 0 && !force) {
    return; // Ya fue sembrado
  }

  // Limpiar todas las tablas
  await db.transaction('rw', db.tables, async () => {
    for (const table of db.tables) {
      await table.clear();
    }

    // 1. Elección
    const eleccionId = await db.elecciones.add({
      id: 1,
      nombre: 'Elecciones Generales - Departamento Garay',
      fecha: new Date().toISOString().split('T')[0],
      estado: 'activa',
    });

    // 2. Departamento
    await db.departamentos.add({ id: 1, nombre: 'Garay' });

    // 3. Localidades
    await db.localidades.bulkAdd([
      { id: 1, id_departamento: 1, nombre: 'Helvecia' },
      { id: 2, id_departamento: 1, nombre: 'Cayastá' },
      { id: 3, id_departamento: 1, nombre: 'Saladero Cabal' },
    ]);

    // 4. Lugares de Votación
    await db.lugares.bulkAdd([
      { id: 1, id_departamento: 1, id_localidad: 1, nombre: 'Escuela N° 423 República del Perú', direccion: 'San Martín 650' },
      { id: 2, id_departamento: 1, id_localidad: 2, nombre: 'Escuela N° 6102 Gral. San Martín', direccion: 'Hernandarias 320' },
      { id: 3, id_departamento: 1, id_localidad: 3, nombre: 'Escuela N° 6107 Rosa Turner', direccion: 'Ruta Pcial 1 Km 120' },
    ]);

    // 5. Mesas
    await db.mesas.bulkAdd([
      { id: 1, id_eleccion: eleccionId, id_lugar: 1, numero_mesa: 101 },
      { id: 2, id_eleccion: eleccionId, id_lugar: 1, numero_mesa: 102 },
      { id: 3, id_eleccion: eleccionId, id_lugar: 2, numero_mesa: 201 },
      { id: 4, id_eleccion: eleccionId, id_lugar: 2, numero_mesa: 202 },
      { id: 5, id_eleccion: eleccionId, id_lugar: 3, numero_mesa: 301 },
    ]);

    // 6. Partidos y Listas
    await db.partidos.bulkAdd([
      { id: 1, nombre: 'Unidos para Cambiar Santa Fe', sigla: 'UCSF', color: '#2563eb' },
      { id: 2, nombre: 'Juntos Avancemos', sigla: 'JA', color: '#0284c7' },
      { id: 3, nombre: 'Viva la Libertad', sigla: 'VLL', color: '#7c3aed' },
      { id: 4, nombre: 'Frente Amplio por la Soberanía', sigla: 'FAS', color: '#e11d48' },
    ]);

    await db.cargos.bulkAdd([
      { id: 1, nombre: 'Senador Departamental' },
      { id: 2, nombre: 'Presidente Comunal' },
    ]);

    await db.listas.bulkAdd([
      { id: 1, id_partido: 1, numero: 101, nombre: 'Santa Fe Puede' },
      { id: 2, id_partido: 2, numero: 202, nombre: 'Elijo Hacer' },
      { id: 3, id_partido: 3, numero: 303, nombre: 'Inquebrantables' },
      { id: 4, id_partido: 4, numero: 404, nombre: 'Recuperemos Soberanía' },
    ]);

    await db.candidatos.bulkAdd([
      { id: 1, id_lista: 1, id_cargo: 1, nombre: 'Germana Figueroa Casas', orden: 1 },
      { id: 2, id_lista: 2, id_cargo: 1, nombre: 'Marcelo Lewandowski', orden: 1 },
      { id: 3, id_lista: 3, id_cargo: 1, nombre: 'Carlos Rovasio', orden: 1 },
      { id: 4, id_lista: 4, id_cargo: 1, nombre: 'Claudia Balagué', orden: 1 },
    ]);

    // 7. Usuarios Demo
    await db.usuarios.bulkAdd([
      { id: 1, username: 'admin', password: '123', rol: 'SuperAdmin', nombre: 'Administrador General' },
      { id: 2, username: 'coord_garay', password: '123', rol: 'CoordinadorDepartamental', id_departamento: 1, nombre: 'Coordinador Dpto. Garay' },
      { id: 3, username: 'coord_helvecia', password: '123', rol: 'CoordinadorLugar', id_departamento: 1, id_lugar: 1, nombre: 'Coordinador Esc. 423' },
      { id: 4, username: 'fiscal_mesa1', password: '123', rol: 'Fiscal', id_mesa: 1, nombre: 'Fiscal Mesa 101' },
    ]);

    // 8. Padrón Demo de Votantes (~15 por mesa)
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
    for (let mesaId = 1; mesaId <= 5; mesaId++) {
      for (let i = 0; i < personas.length; i++) {
        const p = personas[i];
        // DNI único por mesa
        const dniMod = `${p.dni.slice(0, 7)}${mesaId}`;
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
    // Mesa 1: 5 votos recientes (Verde < 30 min)
    const votosMesa1 = votantes.filter(v => v.id_mesa === 1).slice(0, 5);
    for (let i = 0; i < votosMesa1.length; i++) {
      const hora = new Date(now.getTime() - (5 + i * 2) * 60000).toISOString();
      await db.votos.add({ id_mesa: 1, dni: votosMesa1[i].dni, hora });
    }

    // Mesa 3: 3 votos de hace 40 minutos (Amarillo 30-60 min)
    const votosMesa3 = votantes.filter(v => v.id_mesa === 3).slice(0, 3);
    for (let i = 0; i < votosMesa3.length; i++) {
      const hora = new Date(now.getTime() - (38 + i * 4) * 60000).toISOString();
      await db.votos.add({ id_mesa: 3, dni: votosMesa3[i].dni, hora });
    }

    // Mesa 5: Sin votos registrados aún (Rojo > 60 min)

    // 10. Auditoría inicial
    await db.auditorias.add({
      usuario: 'sistema',
      accion: 'seeder_ejecutado',
      entidad: 'BaseLocal',
      entidad_id: 1,
      fecha: new Date().toISOString(),
    });
  });

  console.log('✅ Base de datos local sembrada con éxito');
}
