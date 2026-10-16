import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Vote, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export function LoginView() {
  const { login, fastLogin } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || 'Error de credenciales');
    } finally {
      setLoading(false);
    }
  };

  const handleFastLogin = async (user) => {
    setError('');
    setLoading(true);
    try {
      await fastLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 items-center justify-center text-white shadow-xl shadow-blue-500/30 mb-4 animate-soft-pulse">
          <Vote className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          App-Electoral Web
        </h1>
        <p className="mt-2 text-sm text-slate-300">
          Monitoreo de participación y escrutinio en tiempo real
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-white/20">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="admin"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="123"
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition"
            >
              <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Acceso Rápido Demo */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Acceso Rápido para Pruebas
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFastLogin('admin')}
                className="p-2.5 text-left border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-xs font-medium text-slate-700"
              >
                <div className="font-bold text-blue-700">SuperAdmin</div>
                <div className="text-[10px] text-slate-400">Control General</div>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('coord_garay')}
                className="p-2.5 text-left border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-xs font-medium text-slate-700"
              >
                <div className="font-bold text-slate-800">Coord. Garay</div>
                <div className="text-[10px] text-slate-400">Dpto. Completo</div>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('coord_helvecia')}
                className="p-2.5 text-left border border-slate-200 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition text-xs font-medium text-slate-700"
              >
                <div className="font-bold text-slate-800">Coord. Escuela</div>
                <div className="text-[10px] text-slate-400">Esc. 423 Helvecia</div>
              </button>

              <button
                type="button"
                onClick={() => handleFastLogin('fiscal_mesa1')}
                className="p-2.5 text-left border border-slate-200 rounded-xl hover:bg-emerald-50 hover:border-emerald-200 transition text-xs font-medium text-slate-700"
              >
                <div className="font-bold text-emerald-700">Fiscal de Mesa</div>
                <div className="text-[10px] text-slate-400">Mesa 101 (Móvil)</div>
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Base Local Offline (IndexedDB)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
