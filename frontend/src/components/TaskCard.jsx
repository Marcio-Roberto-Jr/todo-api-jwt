import { useState } from 'react';
import { Check, Trash2, Pencil, Clock, CheckCircle2, Loader2 } from 'lucide-react';

/**
 * Card individual de tarefa com toggle de status, editar e deletar.
 * @param {object}   tarefa    - Dados da tarefa
 * @param {Function} onToggle  - Toggle de status (concluida ↔ pendente)
 * @param {Function} onDelete  - Deletar tarefa
 * @param {Function} onEdit    - Abrir modal de edição
 */
export default function TaskCard({ tarefa, onToggle, onDelete, onEdit }) {
  const [loadingToggle, setLoadingToggle]   = useState(false);
  const [loadingDelete, setLoadingDelete]   = useState(false);
  const [confirmDelete, setConfirmDelete]   = useState(false);

  const concluida = tarefa.status === true;

  async function handleToggle() {
    setLoadingToggle(true);
    try { await onToggle(tarefa); }
    finally { setLoadingToggle(false); }
  }

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return; }
    setLoadingDelete(true);
    try { await onDelete(tarefa.id); }
    finally { setLoadingDelete(false); setConfirmDelete(false); }
  }

  const dataFormatada = new Date(tarefa.data_criacao).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  return (
    <div className={`group relative flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-300
                     bg-slate-800/60 hover:bg-slate-800 backdrop-blur-sm
                     ${concluida
                       ? 'border-emerald-600/30 hover:border-emerald-500/50'
                       : 'border-slate-700/60 hover:border-indigo-500/40'
                     } animate-fade-in`}
    >
      {/* Badge de status */}
      <div className="flex items-start justify-between gap-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full
                          ${concluida
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/25'
                          }`}
        >
          {concluida
            ? <><CheckCircle2 className="w-3 h-3" /> Concluída</>
            : <><Clock className="w-3 h-3" /> Pendente</>
          }
        </span>

        {/* Ações rápidas */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Editar */}
          <button
            onClick={() => onEdit(tarefa)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10
                       transition-all duration-200"
            title="Editar"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Deletar */}
          <button
            onClick={handleDelete}
            disabled={loadingDelete}
            className={`p-1.5 rounded-lg transition-all duration-200
                        ${confirmDelete
                          ? 'text-red-400 bg-red-500/15 border border-red-500/30 animate-pulse'
                          : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10'
                        }`}
            title={confirmDelete ? 'Clique novamente para confirmar' : 'Excluir'}
          >
            {loadingDelete
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Trash2 className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex flex-col gap-1.5 flex-1">
        <h3 className={`font-semibold text-base leading-snug transition-colors
                        ${concluida ? 'text-slate-400 line-through' : 'text-white'}`}>
          {tarefa.titulo}
        </h3>
        {tarefa.descricao && (
          <p className={`text-sm leading-relaxed ${concluida ? 'text-slate-600' : 'text-slate-400'}`}>
            {tarefa.descricao}
          </p>
        )}
      </div>

      {/* Footer: data + botão toggle */}
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-slate-600">{dataFormatada}</span>

        <button
          onClick={handleToggle}
          disabled={loadingToggle}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg
                      border transition-all duration-200
                      ${concluida
                        ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10'
                        : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'
                      } disabled:opacity-50`}
          title={concluida ? 'Marcar como pendente' : 'Marcar como concluída'}
        >
          {loadingToggle
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Check className="w-3 h-3" />
          }
          {concluida ? 'Reabrir' : 'Concluir'}
        </button>
      </div>
    </div>
  );
}
