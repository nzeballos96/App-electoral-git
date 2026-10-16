# Módulo: Gráficos de Barras y Tortas por Localidad y Departamental en Escrutinio

> **Estado:** ✅ Finalizado y validado con éxito  
> **Fecha:** 2026-10-16  
> **Ubicación:** `doc/plan_graficos_barras_tortas_escrutinio.md`  

---

## 1. Diagnóstico y Requerimiento

El usuario solicita:
> *"y a Escrutinio y Resultados agreguemos una opcion mas que sea grafico de barras con opcion de tortas que muestre los partidos con votos por localidad y uno a nivel departamental"*

### Necesidad Técnica y Funcional:
1. **Selector de Ámbito Geográfico:**
   - **Nivel Departamental (General):** Acumulado de todas las mesas del Departamento Garay.
   - **Por Localidad:** Filtro para seleccionar individualmente cada una de las 5 localidades de Garay:
     - Helvecia
     - Cayastá
     - Santa Rosa de Calchines
     - Saladero Mariano Cabal
     - Colonia Mascías
2. **Selector de Tipo de Gráfico:**
   - **Gráfico de Barras:** Barras comparativas con colores oficiales de cada partido, porcentajes y votos nominales.
   - **Gráfico de Tortas / Donut:** Gráfico circular SVG interactivo y responsive con distribución proporcional de votos por lista y leyenda de referencias.
3. **Persistencia y Datos en Dexie:**
   - Permitir filtrar cómputos por localidad en `escrutinioService.js`.
   - Incorporar datos iniciales de telegramas escrutados en `seeder.js` para que la visualización tenga datos inmediatos tanto a nivel general como por localidad.

4. **Ajuste de Visualización de Listas (Simplificación):**
   - Retirar todo subtítulo o mención de partidos/alianzas junto a las listas.
   - Mostrar única y exclusivamente: **"Lista 1"**, **"Lista 2"**, **"Lista 3"** y **"Lista 4"** de manera limpia en:
     - Gráfico de Barras.
     - Gráfico de Tortas / Donut (leyenda lateral).
     - Formulario de Carga de Telegrama.
     - Base de datos en `seeder.js`.

---

## 2. Alcance y Arquitectura de la Solución

### 2.1. Archivos a Intervenir
1. `src/services/escrutinioService.js`:
   - Modificar `getResumenGeneral(idLocalidad = null)` para que acepte un parámetro opcional `idLocalidad`.
   - Si se especifica `idLocalidad`, filtrar las mesas pertenecientes a lugares de dicha localidad.
   - Retornar totales, mesas computadas y ranking de listas correspondiente al ámbito seleccionado.

2. `src/views/EscrutinioView.jsx`:
   - Agregar en la sección de Totales Generales:
     - **Control de Ámbito Geográfico:** Botones / Select para elegir entre "Todo el Departamento" o una localidad específica.
     - **Control de Tipo de Gráfico:** Botones toggle para alternar entre "Barras" (`BarChart3`) y "Torta" (`PieChart`).
     - **Componente SVG de Gráfico de Torta / Donut:** Implementado con SVG puro nativo (cero dependencias externas pesadas, responsive, accesible y animado), con segmentos de arco coloreados según cada lista, porcentaje en el centro y tabla/leyenda lateral.
     - **Componente de Barras:** Manteniendo y puliendo las barras proporcionales existentes.

3. `src/db/seeder.js`:
   - Sembrar telegramas escrutados de demostración en varias mesas para que al seleccionar "Departamental", "Helvecia", "Cayastá" o "Santa Rosa de Calchines" se visualicen porcentajes y votos reales.

---

## 3. Plan de Pruebas
1. **Prueba de selector de ámbito:**
   - Cambiar entre "Todo el Departamento" y cada una de las 5 localidades.
   - Verificar que los votos y porcentajes se recalculen instantáneamente.
2. **Prueba de selector de gráfico:**
   - Alternar entre modo "Barras" y modo "Torta".
   - Comprobar que el gráfico de torta renderice los arcos con los colores de Lista 1 (Azul), Lista 2 (Celeste), Lista 3 (Violeta) y Lista 4 (Rojo), mostrando porcentajes y votos.
3. **Validación de Carga de Telegrama:**
   - Cargar un nuevo telegrama en una mesa de una localidad y verificar que el gráfico departamental y el de esa localidad se actualicen automáticamente.
4. **Verificación de build:**
   - Ejecutar `npm run build` para asegurar que el despliegue a GitHub Pages continúe funcionando perfectamente sin errores.
