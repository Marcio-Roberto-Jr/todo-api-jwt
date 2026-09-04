import { LogOut, CheckSquare, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Cabeçalho da aplicação com branding, email do usuário e botão de logout.
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-900/90 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <CheckSquare className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="font-bold text-white tracking-tight text-lg">
            Todo<span className="text-indigo-400">App</span>
          </span>
        </div>

        {/* User info + Logout */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <User className="w-4 h-4" />
              <span className="max-w-48 truncate">{user.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
                         text-slate-300 hover:text-white hover:bg-slate-700/60
                         border border-slate-700/60 hover:border-slate-600
                         transition-all duration-200 group"
              title="Sair"
            >
              <LogOut className="w-4 h-4 group-hover:text-red-400 transition-colors" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
