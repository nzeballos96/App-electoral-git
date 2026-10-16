import React, { useState, useEffect } from 'react';
import { fiscalService } from '../services/fiscalService';
import { useAuth } from '../context/AuthContext';
import { db } from '../db/db';
import {
  Vote,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  Clock,
  Check,
  Building,
  RotateCcw
} from 'lucide-react';

export function FiscalView({ selectedMesaId }) {
  const { user } = useAuth();
  const [mesaId, setMesaId] = useState(selectedMesaId || user?.id_mesa || 1);
  const [padronData, setPadronData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filtro, setFiltro] = useState('todos'); // 'todos' | 'votaron' | 'pendientes'
  const [mesasDisponibles, setMesasDisponibles] = useState([]);
  const [ultimoVotoMarcado, setUltimoVotoMarcado] = useState(null);

  useEffect(() => {
    async function loadMesas() {
      const mesas = await db.mesas.toArray();
      setMesasDisponibles(mesas);
    }
    loadMesas();
  }, []);

  const cargarPadron = async (id) => {
    try {
      setLoading(true);
      const data = await fiscalService.getPadronMesa(id);
      setPadronData(data);
    } catch (err) {
      console.error('Error cargando padrón:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedMesaId) {
      setMesaId(selectedMesaId);
    }
  }, [selectedMesaId]);

  useEffect(() => {
    cargarPadron(mesaId);
  }, [mesaId]);

  const handleToggleVoto = async (dni, nombreCompleto) => {
    try {
      const res = await fiscalService.toggleVoto(mesaId, dni, user?.username || 'fiscal');
      // Actualizar localmente de forma reactiva instantánea
      setPadronData(prev => {
        if (!prev) return prev;
        const nuevosVotantes = prev.votantes.map(v => {
          if (v.dni === dni) {
            return {
              ...v,
              ya_voto: res.estado,
              hora_voto: res.estado ? new Date().toISOString() : null,
            };
          }
          return v;
        });
        const nuevosVotaron = nuevosVotantes.filter(v => v.ya_voto).length;
        const nuevoPct = prev.total_votantes > 0 ? Number(((nuevosVotaron / prev.total_votantes) * 100).toFixed(1)) : 0;
        return {
          ...prev,
          votantes: nuevosVotantes,
          votaron: nuevosVotaron,
          porcentaje: nuevoPct,
        };
      });

      if (res.estado) {
        setUltimoVotoMarcado(`${nombreCompleto} (DNI ${dni})`);
        setTimeout(() => setUltimoVotoMarcado(null), 3000);
      }
    } catch (err) {
      alert('Error registrando voto: ' + err.message);
    }
  };

  // Filtrado de votantes
  let votantesFiltrados = padronData?.votantes || [];

  if (filtro === 'votaron') {
    votantesFiltrados = votantesFiltrados.filter(v => v.ya_voto);
  } else if (filtro === 'pendientes') {
    votantesFiltrados = votantesFiltrados.filter(v => !v.ya_voto);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    votantesFiltrados = votantesFiltrados.filter(v =>
      v.dni.includes(q) ||
      v.apellido.toLowerCase().includes(q) ||
      v.nombre.toLowerCase().includes(q)
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      
      {/* Selector de Mesa & Encabezado */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
              {padronData?.mesa?.localidad || 'Localidad'}
            </span>
            <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
              {padronData?.mesa?.lugar}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Vote className="w-6 h-6 text-blue-600" />
            Mesa {padronData?.mesa?.numero_mesa}
          </h1>
        </div>

        {/* Cambiar de Mesa (para Admin o Coordinadores) */}
        {user?.rol !== 'Fiscal' && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Cambiar Mesa:</label>
            <select
              value={mesaId}
              onChange={(e) => setMesaId(Number(e.target.value))}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            >
              {mesasDisponibles.map(m => (
                <option key={m.id} value={m.id}>Mesa {m.numero_mesa}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tarjeta de Progreso de la Mesa */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-lg shadow-blue-900/10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold tracking-wider uppercase text-blue-200">
            Participación de la Mesa
          </span>
          <span className="text-2xl font-black">
            {padronData?.porcentaje}%
          </span>
        </div>

        <div className="w-full bg-blue-950/40 rounded-full h-3 mb-4 overflow-hidden border border-white/10">
          <div
            className="bg-emerald-400 h-3 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${Math.min(100, padronData?.porcentaje || 0)}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-white/15">
          <div>
            <div className="text-xl font-bold">{padronData?.votaron}</div>
            <div className="text-[11px] text-blue-200">Votaron</div>
          </div>
          <div>
            <div className="text-xl font-bold">{(padronData?.total_votantes || 0) - (padronData?.votaron || 0)}</div>
            <div className="text-[11px] text-blue-200">Faltan</div>
          </div>
          <div>
            <div className="text-xl font-bold">{padronData?.total_votantes}</div>
            <div className="text-[11px] text-blue-200">Padrón Total</div>
          </div>
        </div>
      </div>

      {/* Alerta de Voto Marcado Recientemente */}
      {ultimoVotoMarcado && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-2xl shadow-md flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Check className="w-5 h-5 bg-white/20 rounded-full p-0.5" />
            <span>Voto registrado: {ultimoVotoMarcado}</span>
          </div>
        </div>
      )}

      {/* Buscador Rápido y Filtros */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por DNI, apellido o nombre..."
            className="w-full pl-12 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-base shadow-xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-1"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Tabs de Filtro */}
        <div className="flex gap-2">
          <button
            onClick={() => setFiltro('todos')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              filtro === 'todos' ? 'bg-slate-800 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Todos ({padronData?.total_votantes})
          </button>
          <button
            onClick={() => setFiltro('pendientes')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              filtro === 'pendientes' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Faltan ({padronData ? padronData.total_votantes - padronData.votaron : 0})
          </button>
          <button
            onClick={() => setFiltro('votaron')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              filtro === 'votaron' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Votaron ({padronData?.votaron})
          </button>
        </div>
      </div>

      {/* Lista de Votantes (Mobile-First) */}
      <div className="space-y-2.5">
        {loading ? (
          <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            Cargando padrón de la mesa...
          </div>
        ) : votantesFiltrados.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-slate-500">
            No se encontraron electores con los criterios de búsqueda.
          </div>
        ) : (
          votantesFiltrados.map((votante) => (
            <div
              key={votante.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                votante.ya_voto
                  ? 'bg-emerald-50/60 border-emerald-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-xs hover:border-blue-200'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    #{votante.orden}
                  </span>
                  <span className="text-xs font-extrabold text-blue-700 tracking-wide font-mono">
                    DNI {votante.dni}
                  </span>
                  {votante.genero && (
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">
                      ({votante.genero})
                    </span>
                  )}
                </div>
                <div className="text-base font-extrabold text-slate-800 leading-snug truncate">
                  {votante.apellido}, {votante.nombre}
                </div>
                {votante.ya_voto && votante.hora_voto && (
                  <div className="text-[11px] text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>Registrado {new Date(votante.hora_voto).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} hs</span>
                  </div>
                )}
              </div>

              {/* Botón Táctil de Voto */}
              <div className="flex-shrink-0">
                {votante.ya_voto ? (
                  <button
                    onClick={() => handleToggleVoto(votante.dni, `${votante.apellido}, ${votante.nombre}`)}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm transition active:scale-95"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>VOTÓ</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleVoto(votante.dni, `${votante.apellido}, ${votante.nombre}`)}
                    className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-blue-600 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95"
                  >
                    <span>Votar</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
