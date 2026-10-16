# Módulo: Datos Reales Departamento Garay y Listas 1, 2, 3 y 4

> **Estado:** ✅ Finalizado y validado con éxito  
> **Fecha:** 2026-10-16  
> **Ubicación:** `doc/plan_datos_reales_garay.md`  

---

## 1. Diagnóstico y Requerimiento

El usuario solicita:
1. **Configurar las listas ficticias:** Lista 1, Lista 2, Lista 3 y Lista 4.
2. **Cargar todas las localidades reales del Departamento Garay (Provincia de Santa Fe):** Con sus escuelas / lugares de votación y mesas correspondientes.
3. **Mantener 100% intacto el diseño, estilos y componentes visuales** existentes en la aplicación.

### Análisis Geográfico y Electoral del Departamento Garay (Santa Fe)
El Departamento Garay está integrado por **5 localidades (comunas)**:
1. **Helvecia** (Cabecera departamental).
2. **Cayastá**.
3. **Santa Rosa de Calchines**.
4. **Saladero Mariano Cabal**.
5. **Colonia Mascías**.

Actualmente en `src/db/seeder.js`:
- Solo existían 3 localidades (Helvecia, Cayastá y Saladero Cabal).
- Faltaban **Santa Rosa de Calchines** y **Colonia Mascías**.
- Las listas tenían nombres genéricos mezclados (Santa Fe Puede, Elijo Hacer, etc.) en lugar de **Lista 1, Lista 2, Lista 3 y Lista 4**.
- Los números de mesa y escuelas estaban acotados a solo 5 mesas.

---

## 2. Alcance de los Cambios

### Archivo a intervenir:
- `src/db/seeder.js`:
  - Actualización del sembrado inicial de datos de IndexedDB (Dexie).
  - Incremento o resiembra forzada para que al recargar tome la nueva estructura de datos.

### 2.1. Definición de Listas y Partidos (Ficticios)
- **Lista 1:**
  - Número: 1
  - Nombre: `Lista 1 - Unión Garay`
  - Sigla: `L1` (Color azul: `#2563eb`)
  - Candidato a Senador: Roberto M. Giménez
  - Candidato a Presidente Comunal: Marcelo V. Benítez
- **Lista 2:**
  - Número: 2
  - Nombre: `Lista 2 - Frente de la Costa`
  - Sigla: `L2` (Color celeste: `#0284c7`)
  - Candidato a Senador: Laura G. Tourn
  - Candidato a Presidente Comunal: Juan Ignacio Mendoza
- **Lista 3:**
  - Número: 3
  - Nombre: `Lista 3 - Renovación y Futuro`
  - Sigla: `L3` (Color violeta: `#7c3aed`)
  - Candidato a Senador: Esteban D. Rivero
  - Candidato a Presidente Comunal: Sandra P. Quiroz
- **Lista 4:**
  - Número: 4
  - Nombre: `Lista 4 - Compromiso Comunal`
  - Sigla: `L4` (Color ámbar/rojo: `#e11d48`)
  - Candidato a Senador: Carlos A. Leguizamón
  - Candidato a Presidente Comunal: Andrea F. Romero

---

### 2.2. Definición de Localidades, Establecimientos y Mesas (Departamento Garay)

| ID Localidad | Localidad | Establecimiento Real | Mesas |
|---|---|---|---|
| 1 | **Helvecia** | Escuela N° 423 "República del Perú" | Mesas 101, 102 |
| 2 | **Cayastá** | Escuela N° 6102 "Gral. San Martín" | Mesas 201, 202 |
| 3 | **Santa Rosa de Calchines** | Escuela N° 426 "Mariano Moreno" | Mesas 301, 302 |
| 4 | **Saladero Mariano Cabal** | Escuela N° 6107 "Rosa Turner de Estrugamou" | Mesa 401 |
| 5 | **Colonia Mascías** | Escuela N° 6106 "Granaderos Argentinos" | Mesa 501 |

---

### 2.3. Padrón Electoral Simulado y Votos Iniciales
- Padrón representativo distribuido por mesa y orden de voto.
- Votos iniciales para mantener funcionando los 3 estados del semáforo:
  - **Mesa 101 (Helvecia):** Actividad reciente (&lt; 30 min) 🟢 Verde.
  - **Mesa 301 (Santa Rosa):** Actividad moderada (30 - 60 min) 🟡 Amarillo.
  - **Mesa 501 (Colonia Mascías):** Sin actividad inicial (&gt; 60 min) 🔴 Rojo.

---

### 2.4. Garantía de Diseño
- **No se modificará ningún componente JSX ni CSS**: `AdminView.jsx`, `DashboardView.jsx`, `EscrutinioView.jsx`, `FiscalView.jsx`, `App.jsx`, `index.css` y Tailwind se mantienen exactamente igual.
- Se agregará además un disparador automático o botón para aplicar la resiembra inmediata en el cliente sin requerir limpiar manualmente la base de IndexedDB.

---

## 4. Resolución de Falla en GitHub Actions: HttpError 404 Not Found en configure-pages

### Diagnóstico del Error:
```text
Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions, or consider exploring the enablement parameter for this action. Error: Not Found
```
- **Causa Raíz:** En repositorios nuevos de GitHub, GitHub Pages viene desactivado por defecto o configurado en `Deploy from a branch`. La API de GitHub devuelve `404 Not Found` hasta que el administrador del repositorio habilita Pages con la opción `GitHub Actions`.
- **Solución Técnica:**
  1. **Configuración en GitHub:** Ingresar a `https://github.com/nzeballos96/App-electoral-git/settings/pages` y en **Build and deployment -> Source** seleccionar **GitHub Actions**.
  2. **Ajuste en `.github/workflows/deploy.yml`:**
     - Actualizar `node-version: 22` para evitar warnings de deprecación de Node 20.
     - Añadir parámetro `enablement: true` en `actions/configure-pages@v5`.

