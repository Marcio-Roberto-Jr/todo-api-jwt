import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import Alert from './Alert';

/**
 * Modal de criação / edição de tarefa.
 * @param {object|null} tarefa - Tarefa para editar (null = criação)
 * @param {Function} onSave  - Callback (dados) chamado ao salvar
 * @param {Function} onClose - Callback para fechar o modal
 */
export default function TaskModal({ tarefa = null, onSave, onClose }) {
  const [titulo, setTitulo]       = useState(tarefa?.titulo || '');
  const [descricao, setDescricao] = useState(tarefa?.descricao || '');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  // Fecha com Esc
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!titulo.trim()) { setError('O título é obrigatório.'); return; }
    setError('');
    setLoading(true);
    try {
      await onSave({ titulo: titulo.trim(), descricao: descricao.trim() || undefined });
    } catch (err) {
      setError(err.response?.data?.detail || 'Erro ao salvar tarefa.');
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Painel */}
      <div className="w-full max-w-md bg-slate-800 border border-slate-700/60 rounded-2xl shadow-2xl shadow-black/50 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-700/60">
          <h2 className="text-lg font-semibold text-white">
            {tarefa ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          {/* Título */}
          <div className="flex flex-col gap-2">
            <label htmlFor="modal-titulo" className="text-sm font-medium text-slate-300">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              id="modal-titulo"
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Comprar mantimentos"
              maxLength={120}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/60 rounded-xl
                         text-white placeholder-slate-500 text-sm
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500
                         transition-all duration-200"
            />
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-2">
            <label htmlFor="modal-desc" className="text-sm font-medium text-slate-300">
              Descrição <span className="text-slate-500 font-normal">(opcional)</span>
            </label>
            <textarea
              id="modal-desc"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes adicionais..."
              rows={3}
              maxLength={500}
              className="w-full px-4 py-3 bg-slate-900/60 border border-slate-600/60 rounded-xl
                         text-white placeholder-slate-500 text-sm resize-none
                         focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500
                         transition-all duration-200"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600/60 text-slate-300
                         hover:bg-slate-700 hover:text-white font-medium text-sm transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !titulo.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                         bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white font-semibold text-sm shadow-lg shadow-indigo-500/25
                         transition-all duration-200"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {tarefa ? 'Salvar' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
