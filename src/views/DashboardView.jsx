import React, { useState, useEffect } from 'react';
import { consultaService } from '../services/consultaService';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Users,
  Vote,
  Clock,
  Building2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';

export function DashboardView({ onSelectMesa }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterSemaforo, setFilterSemaforo] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const res = await consultaService.getResumenGeneral();
      setData(res);
    } catch (err) {
      console.error('Error cargando monitoreo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 10000); // Polling cada 10 seg
    return () => clearInterval(interval);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  // Filtrar mesas según rol
  let mesasFiltradas = data?.mesas || [];
  if (user?.rol === 'CoordinadorDepartamental' && user.id_departamento) {
    // Si hubiese múltiples deptos
  } else if (user?.rol === 'CoordinadorLugar' && user.id_lugar) {
    mesasFiltradas = mesasFiltradas.filter(m => m.id_lugar === user.id_lugar);
  } else if (user?.rol === 'Fiscal' && user.id_mesa) {
    mesasFiltradas = mesasFiltradas.filter(m => m.id === user.id_mesa);
  }

  // Filtro por semáforo
  if (filterSemaforo !== 'todos') {
    mesasFiltradas = mesasFiltradas.filter(m => m.semaforo === filterSemaforo);
  }

  // Filtro por búsqueda
  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    mesasFiltradas = mesasFiltradas.filter(m => 
      m.numero_mesa.toString().includes(q)
    );
  }

  const formatTiempoRelativo = (isoDate) => {
    if (!isoDate) return 'Sin actividad';
    const min = Math.floor((new Date().getTime() - new Date(isoDate).getTime()) / 60000);
    if (min < 1) return 'Hace instantes';
    if (min === 1) return 'Hace 1 min';
    if (min < 60) return `Hace ${min} min`;
    const horas = Math.floor(min / 60);
    return `Hace ${horas}h ${min % 60}m`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Activity className="w-7 h-7 text-blue-600" />
            Monitoreo en Tiempo Real
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Seguimiento de concurrencia y semáforo de sincronización electoral
          </p>
        </div>
        <button
          onClick={cargarDatos}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          Actualizar ahora
        </button>
      </div>

      {/* Tarjetas de Métricas Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Electores */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Electores Habilitados</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-extrabold text-slate-800">
            {data?.total_electores.toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            En {data?.mesas.length} mesas del departamento
          </div>
        </div>

        {/* Total Votos Emitidos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Votos Emitidos</span>
            <Vote className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {data?.total_votaron.toLocaleString('es-AR')}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Registrados por fiscales de mesa
          </div>
        </div>

        {/* Porcentaje Participación */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Participación</span>
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {data?.porcentaje_participacion}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, data?.porcentaje_participacion || 0)}%` }}
            />
          </div>
        </div>

        {/* Resumen Semáforo */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Semáforo Mesas</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="grid grid-cols-3 gap-2 text-center pt-1">
            <div className="bg-emerald-50 border border-emerald-200/70 rounded-xl py-1.5">
              <span className="text-emerald-700 font-extrabold text-lg block leading-none">
                {data?.semaforos.verde}
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Activas (&lt;30m)</span>
            </div>
            <div className="bg-amber-50 border border-amber-200/70 rounded-xl py-1.5">
              <span className="text-amber-700 font-extrabold text-lg block leading-none">
                {data?.semaforos.amarillo}
              </span>
              <span className="text-[10px] text-amber-600 font-medium">Demora (30-60m)</span>
            </div>
            <div className="bg-red-50 border border-red-200/70 rounded-xl py-1.5">
              <span className="text-red-700 font-extrabold text-lg block leading-none">
                {data?.semaforos.rojo}
              </span>
              <span className="text-[10px] text-red-600 font-medium">Alerta (&gt;60m)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">Filtrar:</span>
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setFilterSemaforo('todos')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterSemaforo === 'todos' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas ({data?.mesas.length})
            </button>
            <button
              onClick={() => setFilterSemaforo('verde')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                filterSemaforo === 'verde' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Verdes ({data?.semaforos.verde})
            </button>
            <button
              onClick={() => setFilterSemaforo('amarillo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                filterSemaforo === 'amarillo' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
              Amarillas ({data?.semaforos.amarillo})
            </button>
            <button
              onClick={() => setFilterSemaforo('rojo')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                filterSemaforo === 'rojo' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              Rojas ({data?.semaforos.rojo})
            </button>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar mesa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mesasFiltradas.map((mesa) => {
          const semColorClass =
            mesa.semaforo === 'verde'
              ? 'border-emerald-300 bg-emerald-50/30'
              : mesa.semaforo === 'amarillo'
              ? 'border-amber-300 bg-amber-50/30'
              : 'border-red-300 bg-red-50/30';

          const badgeColorClass =
            mesa.semaforo === 'verde'
              ? 'bg-emerald-100 text-emerald-800'
              : mesa.semaforo === 'amarillo'
              ? 'bg-amber-100 text-amber-800'
              : 'bg-red-100 text-red-800';

          return (
            <div
              key={mesa.id}
              className={`bg-white rounded-2xl p-5 border-2 ${semColorClass} shadow-xs hover:shadow-md transition flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-extrabold text-slate-800">
                      Mesa {mesa.numero_mesa}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeColorClass}`}>
                      {mesa.semaforo}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatTiempoRelativo(mesa.ultimo_voto)}</span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Participación:</span>
                    <span className="font-bold text-slate-800">
                      {mesa.votaron} de {mesa.total_electores} ({mesa.porcentaje}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        mesa.semaforo === 'verde'
                          ? 'bg-emerald-500'
                          : mesa.semaforo === 'amarillo'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, mesa.porcentaje)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 truncate max-w-[170px]">
                  ID Mesa: {mesa.id}
                </span>
                <button
                  onClick={() => onSelectMesa && onSelectMesa(mesa.id)}
                  className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold transition"
                >
                  <span>Abrir Fiscal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {mesasFiltradas.length === 0 && (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
          No se encontraron mesas con los filtros seleccionados.
        </div>
      )}
    </div>
  );
}
