import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { seedDatabase } from '../db/seeder';
import {
  Activity,
  Vote,
  BarChart3,
  FileSpreadsheet,
  RefreshCw,
  LogOut,
  User,
  ShieldCheck,
  CheckCircle2,
  Database
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab }) {
  const { user, fastLogin, logout } = useAuth();
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState('');

  const handleResetDemo = async () => {
    if (window.confirm('¿Deseas restablecer todos los datos de prueba al estado inicial del Departamento Garay?')) {
      setResetting(true);
      try {
        await seedDatabase(true);
        setResetMessage('Datos restablecidos');
        setTimeout(() => setResetMessage(''), 3000);
        window.location.reload();
      } catch (err) {
        alert('Error restableciendo datos: ' + err.message);
      } finally {
        setResetting(false);
      }
    }
  };

  const handleQuickRoleChange = async (username) => {
    await fastLogin(username);
    // Redirigir a vista adecuada
    if (username === 'fiscal_mesa1') {
      setActiveTab('fiscal');
    } else {
      setActiveTab('dashboard');
    }
  };

  const isSuperAdmin = user?.rol === 'SuperAdmin';
  const isFiscal = user?.rol === 'Fiscal';

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-lg tracking-tight block leading-tight">
                App-Electoral
              </span>
              <span className="text-xs text-blue-600 font-semibold tracking-wide uppercase">
                Santa Fe — Garay
              </span>
            </div>
          </div>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Activity className="w-4 h-4" />
              Monitoreo
            </button>

            <button
              onClick={() => setActiveTab('fiscal')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'fiscal'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Vote className="w-4 h-4" />
              Fiscal de Mesa {isFiscal && <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-bold">Mesa 101</span>}
            </button>

            <button
              onClick={() => setActiveTab('escrutinio')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'escrutinio'
                  ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Escrutinio
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Padrones
              </button>
            )}
          </nav>

          {/* Acciones & Usuario */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
                <User className="w-3 h-3" /> Rol:
              </span>
              <button
                onClick={() => handleQuickRoleChange('admin')}
                className={`px-2 py-1 text-xs rounded font-medium transition ${
                  user?.username === 'admin' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => handleQuickRoleChange('coord_garay')}
                className={`px-2 py-1 text-xs rounded font-medium transition ${
                  user?.username === 'coord_garay' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Coord. Dpto
              </button>
              <button
                onClick={() => handleQuickRoleChange('fiscal_mesa1')}
                className={`px-2 py-1 text-xs rounded font-medium transition ${
                  user?.username === 'fiscal_mesa1' ? 'bg-white shadow-xs text-blue-700 font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fiscal
              </button>
            </div>

            {/* Reset Demo BD */}
            <button
              onClick={handleResetDemo}
              disabled={resetting}
              title="Restablecer base de datos local al estado original"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 border border-slate-200 rounded-lg font-medium transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin text-blue-600' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>

            {/* Logout */}
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Mobile subnav */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-slate-50 py-2 px-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded ${
            activeTab === 'dashboard' ? 'text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <Activity className="w-4 h-4" />
          Monitoreo
        </button>
        <button
          onClick={() => setActiveTab('fiscal')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded ${
            activeTab === 'fiscal' ? 'text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <Vote className="w-4 h-4" />
          Fiscal Mesa
        </button>
        <button
          onClick={() => setActiveTab('escrutinio')}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded ${
            activeTab === 'escrutinio' ? 'text-blue-700 font-bold' : 'text-slate-600'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Escrutinio
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 text-[11px] font-medium py-1 px-2 rounded ${
              activeTab === 'admin' ? 'text-blue-700 font-bold' : 'text-slate-600'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            Padrones
          </button>
        )}
      </div>
    </header>
  );
}
