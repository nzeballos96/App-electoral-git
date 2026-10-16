import React, { useState, useEffect } from 'react';
import { escrutinioService } from '../services/escrutinioService';
import { db } from '../db/db';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  Vote,
  Save,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  RefreshCw,
  Award
} from 'lucide-react';

export function EscrutinioView() {
  const { user } = useAuth();
  const [subTab, setSubTab] = useState('totales'); // 'totales' | 'carga'
  const [resumenGeneral, setResumenGeneral] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados de carga por mesa
  const [mesas, setMesas] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(1);
  const [mesaData, setMesaData] = useState(null);
  const [formData, setFormData] = useState({
    listas: [],
    votos_blancos: 0,
    votos_nulos: 0,
    votos_recurridos: 0,
  });
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorCarga, setErrorCarga] = useState('');

  const cargarTotales = async () => {
    try {
      setLoading(true);
      const data = await escrutinioService.getResumenGeneral();
      setResumenGeneral(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cargarMesas = async () => {
    const m = await db.mesas.toArray();
    setMesas(m);
    if (m.length > 0 && !mesaSeleccionada) {
      setMesaSeleccionada(m[0].id);
    }
  };

  const cargarDatosMesa = async (id) => {
    try {
      const data = await escrutinioService.getResultadosMesa(id);
      setMesaData(data);
      setFormData({
        listas: data.listas.map(l => ({ id: l.id, nombre: l.nombre, sigla: l.partido_sigla, color: l.partido_color, votos: l.votos })),
        votos_blancos: data.votos_blancos,
        votos_nulos: data.votos_nulos,
        votos_recurridos: data.votos_recurridos,
      });
      setErrorCarga('');
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarTotales();
    cargarMesas();
  }, []);

  useEffect(() => {
    if (subTab === 'carga' && mesaSeleccionada) {
      cargarDatosMesa(mesaSeleccionada);
    }
  }, [subTab, mesaSeleccionada]);

  const handleListaVoteChange = (id, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    setFormData(prev => ({
      ...prev,
      listas: prev.listas.map(l => l.id === id ? { ...l, votos: num } : l),
    }));
  };

  const totalSumaVotos = (formData.listas.reduce((acc, l) => acc + (Number(l.votos) || 0), 0)) +
    Number(formData.votos_blancos || 0) +
    Number(formData.votos_nulos || 0) +
    Number(formData.votos_recurridos || 0);

  const totalElectoresMesa = mesaData?.total_electores || 0;
  const esExcedido = totalSumaVotos > totalElectoresMesa;

  const handleGuardarResultados = async (e) => {
    e.preventDefault();
    if (esExcedido) {
      setErrorCarga(`Total (${totalSumaVotos}) supera el padrón (${totalElectoresMesa})`);
      return;
    }

    setGuardando(true);
    setErrorCarga('');
    try {
      await escrutinioService.guardarResultadosMesa(mesaSeleccionada, formData, user?.username || 'admin');
      setMensajeExito('Resultados de la mesa guardados con éxito');
      setTimeout(() => setMensajeExito(''), 3000);
      cargarTotales();
      cargarDatosMesa(mesaSeleccionada);
    } catch (err) {
      setErrorCarga(err.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      
      {/* Header y Selector de Sub-Tab */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Escrutinio y Resultados
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Cómputo provisorio de votos válidos por lista y telegramas de mesa
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => { setSubTab('totales'); cargarTotales(); }}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              subTab === 'totales' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Totales Generales
          </button>
          <button
            onClick={() => setSubTab('carga')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
              subTab === 'carga' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Carga de Telegrama
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: TOTALES GENERALES */}
      {subTab === 'totales' && (
        <div className="space-y-6">
          {/* Métricas Principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Mesas Escrutadas
              </span>
              <div className="text-2xl font-black text-slate-800">
                {resumenGeneral?.mesas_escrutadas} de {resumenGeneral?.total_mesas}
              </div>
              <div className="text-xs text-blue-600 font-bold mt-1">
                {resumenGeneral?.porcentaje_mesas}% computado
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Votos Válidos
              </span>
              <div className="text-2xl font-black text-emerald-600">
                {resumenGeneral?.total_votos_validos.toLocaleString('es-AR')}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Positivos + Blancos
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Votos en Blanco
              </span>
              <div className="text-2xl font-black text-slate-700">
                {resumenGeneral?.votos_blancos.toLocaleString('es-AR')}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Votos válidos sin preferencia
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Nulos / Recurridos
              </span>
              <div className="text-2xl font-black text-red-600">
                {(Number(resumenGeneral?.votos_nulos || 0) + Number(resumenGeneral?.votos_recurridos || 0)).toLocaleString('es-AR')}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Para control en escrutinio
              </div>
            </div>
          </div>

          {/* Gráfico y Ranking de Listas */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Resultados por Lista (Senador Departamental)
            </h2>

            {resumenGeneral?.listas.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                No hay listas electorales registradas.
              </div>
            ) : (
              <div className="space-y-4">
                {resumenGeneral?.listas.map((lista, index) => (
                  <div key={lista.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${
                          index === 0 ? 'bg-amber-500 shadow-xs' : 'bg-slate-400'
                        }`}>
                          {index + 1}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-800">
                            Lista {lista.numero} — {lista.nombre}
                          </span>
                          <span className="text-xs text-slate-400 ml-2 font-medium">
                            ({lista.partido_sigla})
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-black text-slate-900 text-base">
                          {lista.porcentaje}%
                        </span>
                        <span className="text-xs text-slate-400 ml-2">
                          ({lista.votos.toLocaleString('es-AR')} votos)
                        </span>
                      </div>
                    </div>

                    {/* Barra de Porcentaje */}
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, lista.porcentaje)}%`,
                          backgroundColor: lista.color || '#2563eb',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: CARGA POR MESA (TELEGRAMA) */}
      {subTab === 'carga' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Carga de Resultados por Mesa
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Ingresa los votos del telegrama firmado por el presidente de mesa
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Mesa:</label>
              <select
                value={mesaSeleccionada}
                onChange={(e) => setMesaSeleccionada(Number(e.target.value))}
                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {mesas.map(m => (
                  <option key={m.id} value={m.id}>Mesa {m.numero_mesa}</option>
                ))}
              </select>
            </div>
          </div>

          {errorCarga && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorCarga}</span>
            </div>
          )}

          {mensajeExito && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{mensajeExito}</span>
            </div>
          )}

          <form onSubmit={handleGuardarResultados} className="space-y-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Votos Positivos por Lista
              </h3>

              {formData.listas.map((lista) => (
                <div
                  key={lista.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: lista.color || '#2563eb' }}
                    />
                    <div>
                      <div className="font-extrabold text-sm text-slate-800">
                        {lista.nombre}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {lista.sigla}
                      </div>
                    </div>
                  </div>

                  <input
                    type="number"
                    min="0"
                    max={totalElectoresMesa}
                    value={lista.votos}
                    onChange={(e) => handleListaVoteChange(lista.id, e.target.value)}
                    className="w-24 text-right px-3 py-2 border border-slate-300 rounded-lg text-base font-extrabold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              ))}
            </div>

            {/* Votos Especiales */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Otros Votos
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Votos en Blanco
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.votos_blancos}
                    onChange={(e) => setFormData({ ...formData, votos_blancos: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-full text-right px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                  />
                </div>

                <div className="p-3 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Votos Nulos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.votos_nulos}
                    onChange={(e) => setFormData({ ...formData, votos_nulos: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-full text-right px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                  />
                </div>

                <div className="p-3 border border-slate-200 rounded-xl">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Votos Recurridos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.votos_recurridos}
                    onChange={(e) => setFormData({ ...formData, votos_recurridos: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                    className="w-full text-right px-3 py-1.5 border border-slate-300 rounded-lg text-sm font-bold text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Resumen de Validación */}
            <div className={`p-4 rounded-xl border flex items-center justify-between text-xs font-bold ${
              esExcedido ? 'bg-red-50 border-red-300 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}>
              <div>
                <span>Suma total de votos en telegrama: </span>
                <span className="text-sm font-black">{totalSumaVotos}</span>
              </div>
              <div>
                <span>Padrón habilitado en la mesa: </span>
                <span className="text-sm font-black">{totalElectoresMesa}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={guardando || esExcedido}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{guardando ? 'Guardando Telegrama...' : 'Guardar y Computar Mesa'}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
