import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { FiscalView } from './views/FiscalView';
import { EscrutinioView } from './views/EscrutinioView';
import { AdminView } from './views/AdminView';
import { Database, Globe, ShieldCheck } from 'lucide-react';

export function App() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedMesaId, setSelectedMesaId] = useState(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-300">Cargando base de datos local...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const handleSelectMesa = (mesaId) => {
    setSelectedMesaId(mesaId);
    setActiveTab('fiscal');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <div>
        <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="pb-12">
          {activeTab === 'dashboard' && <DashboardView onSelectMesa={handleSelectMesa} />}
          {activeTab === 'fiscal' && <FiscalView selectedMesaId={selectedMesaId} />}
          {activeTab === 'escrutinio' && <EscrutinioView />}
          {activeTab === 'admin' && <AdminView />}
        </main>
      </div>

      {/* Footer Institucional con Status */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">App-Electoral Web</span>
            <span>·</span>
            <span>Provincia de Santa Fe</span>
            <span>·</span>
            <span>Elecciones Generales Dpto. Garay</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full">
              <Database className="w-3.5 h-3.5" />
              IndexedDB Persistente (Offline)
            </span>
            <span className="flex items-center gap-1.5 text-blue-700 font-semibold bg-blue-50 px-2.5 py-1 rounded-full">
              <Globe className="w-3.5 h-3.5" />
              GitHub Pages Ready
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default App;
