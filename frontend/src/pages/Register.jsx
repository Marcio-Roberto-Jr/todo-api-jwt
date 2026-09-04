import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/Alert';

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [email, setEmail]     = useState('');
  const [senha, setSenha]     = useState('');
  const [confirmSenha, setConfirmSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !senha || !confirmSenha) { setError('Preencha todos os campos.'); return; }
    if (senha !== confirmSenha) { setError('As senhas não coincidem.'); return; }
    if (senha.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return; }

    setError('');
    setLoading(true);
    try {
      await register(email, senha);
      setSuccess('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(typeof detail === 'string' ? detail : 'Erro ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-900">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-violet-600 shadow-xl shadow-violet-500/30 mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Criar conta</h1>
          <p className="text-slate-400 text-sm mt-1">Comece a organizar suas tarefas hoje</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800/70 border border-slate-700/60 rounded-2xl px-8 py-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {error   && <Alert type="error"   message={error}   onClose={() => setError('')} />}
            {success && <Alert type="success" message={success} />}

            {/* E-mail */}
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-email" className="text-sm font-medium text-slate-300">E-mail</label>
              <input
                id="reg-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/60 rounded-xl
                           text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500
                           transition-all duration-200"
              />
            </div>

            {/* Senha */}
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-senha" className="text-sm font-medium text-slate-300">Senha</label>
              <input
                id="reg-senha"
                type="password"
                autoComplete="new-password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/60 rounded-xl
                           text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500
                           transition-all duration-200"
              />
            </div>

            {/* Confirmar senha */}
            <div className="flex flex-col gap-2">
              <label htmlFor="reg-confirm" className="text-sm font-medium text-slate-300">Confirmar Senha</label>
              <input
                id="reg-confirm"
                type="password"
                autoComplete="new-password"
                value={confirmSenha}
                onChange={(e) => setConfirmSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/60 rounded-xl
                           text-white placeholder-slate-500 text-sm
                           focus:outline-none focus:ring-2 focus:ring-violet-500/60 focus:border-violet-500
                           transition-all duration-200"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !!success}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl
                         bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed
                         text-white font-semibold text-sm shadow-lg shadow-violet-500/30
                         transition-all duration-200 mt-1"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Criar Conta
            </button>
          </form>
        </div>

        {/* Link para login */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
