import React, { useState, useEffect } from 'react';
import { padronService } from '../services/padronService';
import { db } from '../db/db';
import {
  FileSpreadsheet,
  Upload,
  CheckCircle,
  AlertCircle,
  Download,
  Calendar,
  Shield,
  Clock,
  History
} from 'lucide-react';

export function AdminView() {
  const [elecciones, setElecciones] = useState([]);
  const [auditorias, setAuditorias] = useState([]);
  const [archivoTexto, setArchivoTexto] = useState('');
  const [nombreArchivo, setNombreArchivo] = useState('');
  const [importando, setImportando] = useState(false);
  const [resultadoImport, setResultadoImport] = useState(null);
  const [errorImport, setErrorImport] = useState('');

  // Nueva elección
  const [nombreEleccion, setNombreEleccion] = useState('');

  const cargarDatos = async () => {
    const el = await db.elecciones.toArray();
    setElecciones(el);
    const aud = await db.auditorias.reverse().limit(15).toArray();
    setAuditorias(aud);
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNombreArchivo(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      setArchivoTexto(event.target.result);
    };
    reader.readAsText(file);
  };

  const handleImportar = async (e) => {
    e.preventDefault();
    if (!archivoTexto) {
      setErrorImport('Por favor selecciona un archivo CSV primero');
      return;
    }

    setImportando(true);
    setErrorImport('');
    setResultadoImport(null);
    try {
      const res = await padronService.importarCSV(archivoTexto);
      setResultadoImport(res);
      cargarDatos();
    } catch (err) {
      setErrorImport(err.message || 'Error importando archivo');
    } finally {
      setImportando(false);
    }
  };

  const handleCrearEleccion = async (e) => {
    e.preventDefault();
    if (!nombreEleccion.trim()) return;

    await db.elecciones.add({
      nombre: nombreEleccion,
      fecha: new Date().toISOString().split('T')[0],
      estado: 'activa',
    });
    setNombreEleccion('');
    cargarDatos();
  };

  const handleDescargarEjemplo = () => {
    const csvContent = "dni;nombre;apellido;escuela;mesa\n" +
      "45123987;LUCAS EZEQUIEL;GOMEZ;Escuela N° 423 República del Perú;101\n" +
      "46897456;VALENTINA ROCIO;FERREYRA;Escuela N° 423 República del Perú;101\n" +
      "41235689;FACUNDO NAHUEL;ACOSTA;Escuela N° 6102 Gral. San Martín;201\n";

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'ejemplo_padron.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
          <FileSpreadsheet className="w-7 h-7 text-blue-600" />
          Gestión de Padrones y Elecciones
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Carga masiva de electores, creación de eventos electorales y bitácora de auditoría
        </p>
      </div>

      {/* SECCIÓN 1: IMPORTACIÓN DE PADRÓN CSV */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Cargar Padrón Electoral (CSV)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Formato: <code className="bg-slate-100 text-blue-700 px-1.5 py-0.5 rounded font-mono">dni;nombre;apellido;escuela;numero_mesa</code>
            </p>
          </div>

          <button
            onClick={handleDescargarEjemplo}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200/60 transition self-start"
          >
            <Download className="w-3.5 h-3.5" />
            Descargar Plantilla CSV
          </button>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-start gap-2.5">
          <Shield className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
          <div>
            <strong className="font-bold">Regla de Padrón Histórico:</strong> Los electores ausentes en la nueva carga pasan al estado <code className="font-mono font-bold">baja</code>; nunca se eliminan y sus votos en elecciones previas se conservan intactos.
          </div>
        </div>

        {errorImport && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorImport}</span>
          </div>
        )}

        {resultadoImport && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>Importación completada con éxito</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div>Líneas procesadas: <span className="font-bold">{resultadoImport.total_lineas}</span></div>
              <div>Nuevos agregados: <span className="font-bold">{resultadoImport.insertados}</span></div>
              <div>Actualizados: <span className="font-bold">{resultadoImport.actualizados}</span></div>
            </div>
          </div>
        )}

        <form onSubmit={handleImportar} className="space-y-4">
          <div className="border-2 border-dashed border-slate-300 hover:border-blue-400 rounded-2xl p-6 text-center transition bg-slate-50">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-file-input"
            />
            <label
              htmlFor="csv-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <FileSpreadsheet className="w-8 h-8 text-blue-500" />
              <div className="text-sm font-semibold text-slate-700">
                {nombreArchivo ? nombreArchivo : 'Haz clic para seleccionar o arrastra tu archivo CSV'}
              </div>
              <div className="text-xs text-slate-400">
                Separado por punto y coma (;), codificación UTF-8
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={importando || !archivoTexto}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>{importando ? 'Procesando padrón en el cliente...' : 'Procesar e Importar al Padrón Local'}</span>
          </button>
        </form>
      </div>

      {/* SECCIÓN 2: ELECCIONES */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          Elecciones Registradas
        </h2>

        <form onSubmit={handleCrearEleccion} className="flex gap-2">
          <input
            type="text"
            value={nombreEleccion}
            onChange={(e) => setNombreEleccion(e.target.value)}
            placeholder="Nombre de la nueva elección..."
            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition"
          >
            Crear
          </button>
        </form>

        <div className="divide-y divide-slate-100">
          {elecciones.map((el) => (
            <div key={el.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">
                  {el.nombre}
                </span>
                <span className="text-slate-400">Fecha: {el.fecha}</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                el.estado === 'activa' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
              }`}>
                {el.estado}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 3: BITÁCORA DE AUDITORÍA */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Bitácora de Auditoría Reciente
        </h2>

        <div className="divide-y divide-slate-100">
          {auditorias.map((aud) => (
            <div key={aud.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {aud.usuario}
                </span>
                <span className="font-medium text-slate-700">
                  {aud.accion.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-slate-400 text-[11px]">
                {new Date(aud.fecha).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
