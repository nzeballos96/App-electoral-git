# App-Electoral Web — Sistema Integral de Monitoreo y Escrutinio

> Aplicación web moderna (SPA) desarrollada en **React + Vite + Tailwind CSS**, respaldada por una base de datos local en el navegador (**IndexedDB / Dexie.js**) y preparada para despliegue automatizado en **GitHub Pages**.

---

## 🌟 Características Principales

1. **Base de Datos Local Persistente (IndexedDB):**
   - No requiere servidor backend ni base de datos externa para funcionar.
   - Datos iniciales pre-cargados (Departamento Garay completo: Helvecia, Cayastá, Santa Rosa de Calchines, Saladero Mariano Cabal y Colonia Mascías).
   - Botón de "Reset Demo" para reiniciar el estado en cualquier momento.
   - Soporte de trabajo 100% offline.

2. **Módulo de Fiscal de Mesa (Reemplazo Móvil Responsive):**
   - Interfaz táctil adaptada para celulares y tablets.
   - Buscador en tiempo real por DNI, Apellido o Nombre.
   - Marcado de votos en un toque con registro de hora.
   - Indicador de participación de la mesa en tiempo real.

3. **Monitoreo en Tiempo Real con Semáforo:**
   - Métricas globales de participación por ámbito jerárquico.
   - Semáforo reactivo:
     - 🟢 **Verde:** Actividad reciente (&lt; 30 min).
     - 🟡 **Amarillo:** Demora en sincronización (30 - 60 min).
     - 🔴 **Rojo:** Alerta / sin actividad (&gt; 60 min).

4. **Escrutinio y Carga de Telegramas:**
   - Cómputo provisorio de votos válidos por lista (Lista 1, Lista 2, Lista 3 y Lista 4) y votos especiales (blanco, nulo, recurrido).
   - Validación automática de sumatoria contra el padrón de la mesa.
   - Gráficos de barras con colores oficiales de cada partido.

5. **Gestión de Padrones y Elecciones (SuperAdmin):**
   - Importador de padrones en CSV (`dni;nombre;apellido;escuela;mesa`).
   - Principio de padrón histórico: los electores ausentes pasan a "baja", conservando votos previos.
   - Bitácora de auditoría de operaciones en tiempo real.

---

## 🚀 Puesta en Marcha Local

### Requisitos
- Node.js ≥ 18.x
- npm ≥ 9.x

### Instalación y ejecución
```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

### Usuarios Demo para Pruebas
| Usuario | Contraseña | Rol | Alcance |
|---|---|---|---|
| `admin` | `123` | `SuperAdmin` | Control total, padrones y escrutinio |
| `coord_garay` | `123` | `CoordinadorDepartamental` | Monitoreo general Dpto. Garay |
| `coord_helvecia` | `123` | `CoordinadorLugar` | Monitoreo Esc. 423 Helvecia |
| `coord_santarosa` | `123` | `CoordinadorLugar` | Monitoreo Esc. 426 Santa Rosa de Calchines |
| `fiscal_mesa1` | `123` | `Fiscal` | Padrón y registro de votos Mesa 101 (Helvecia) |
| `fiscal_mesa5` | `123` | `Fiscal` | Padrón y registro de votos Mesa 301 (Santa Rosa) |

*(También puedes cambiar de rol con un solo clic desde la barra superior).*

---

## 🌐 Despliegue en GitHub Pages (`gitpage`)

El proyecto incluye el workflow automatizado en `.github/workflows/deploy.yml`.

### Pasos para activar en GitHub:
1. Sube este repositorio a GitHub.
2. En tu repositorio, ve a **Settings** → **Pages**.
3. En **Build and deployment** → **Source**, selecciona **GitHub Actions**.
4. Cada `git push origin main` compilará y publicará la web automáticamente.
