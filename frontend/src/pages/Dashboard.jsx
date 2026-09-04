import { useState, useEffect, useCallback } from 'react';
import { Plus, ListTodo, ClipboardList, CheckCheck } from 'lucide-react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import Alert from '../components/Alert';

const TABS = [
  { key: 'todas',     label: 'Todas',     icon: ListTodo },
  { key: 'pendente',  label: 'Pendentes', icon: ClipboardList },
  { key: 'concluida', label: 'Concluídas', icon: CheckCheck },
];

/** Skeleton de carregamento */
function SkeletonCard() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-5 animate-pulse flex flex-col gap-3">
      <div className="h-4 bg-slate-700 rounded w-24" />
      <div className="h-5 bg-slate-700 rounded w-3/4" />
      <div className="h-3 bg-slate-700/60 rounded w-full" />
      <div className="h-3 bg-slate-700/60 rounded w-1/2" />
    </div>
  );
}

export default function Dashboard() {
  const [tarefas, setTarefas]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [editTarefa, setEditTarefa] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  function showFeedback(type, msg) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback({ type: '', msg: '' }), 4000);
  }

  /** Carrega tarefas do backend com filtro de status */
  const loadTarefas = useCallback(async (filtro = 'todas') => {
    setLoading(true);
    try {
      const params = filtro !== 'todas' ? { status: filtro } : {};
      const { data } = await api.get('/tarefas', { params });
      setTarefas(data);
    } catch {
      showFeedback('error', 'Não foi possível carregar as tarefas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTarefas(tab); }, [tab, loadTarefas]);

  /** Cria tarefa */
  async function handleCreate(dados) {
    await api.post('/tarefas', dados);
    setShowModal(false);
    showFeedback('success', 'Tarefa criada com sucesso!');
    loadTarefas(tab);
  }

  /** Edita tarefa */
  async function handleEdit(dados) {
    await api.put(`/tarefas/${editTarefa.id}`, dados);
    setEditTarefa(null);
    showFeedback('success', 'Tarefa atualizada!');
    loadTarefas(tab);
  }

  /** Toggle de status */
  async function handleToggle(tarefa) {
    const novoStatus = tarefa.status ? 'pendente' : 'concluida';
    await api.put(`/tarefas/${tarefa.id}`, { status: novoStatus });
    loadTarefas(tab);
  }

  /** Deleta tarefa */
  async function handleDelete(id) {
    await api.delete(`/tarefas/${id}`);
    showFeedback('success', 'Tarefa removida.');
    loadTarefas(tab);
  }

  const tarefasFiltradas = tarefas; // já filtradas pelo backend

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 flex flex-col gap-6">

        {/* Header da página */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Minhas Tarefas</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              {tarefas.length === 0 && !loading
                ? 'Nenhuma tarefa por aqui ainda.'
                : `${tarefas.length} tarefa${tarefas.length !== 1 ? 's' : ''} nesta visão`}
            </p>
          </div>
          <button
            onClick={() => { setEditTarefa(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                       bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm
                       shadow-lg shadow-indigo-500/30 transition-all duration-200 animate-pulse-glow
                       self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Nova Tarefa
          </button>
        </div>

        {/* Feedback */}
        {feedback.msg && (
          <Alert
            type={feedback.type}
            message={feedback.msg}
            onClose={() => setFeedback({ type: '', msg: '' })}
          />
        )}

        {/* Abas de filtro */}
        <div className="flex gap-1 p-1 bg-slate-800/50 border border-slate-700/50 rounded-xl w-fit">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                          ${tab === key
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                          }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Grid de tarefas */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : tarefasFiltradas.length === 0 ? (
          /* Estado vazio */
          <div className="flex flex-col items-center justify-center py-24 gap-4 animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700/60 flex items-center justify-center">
              <ListTodo className="w-10 h-10 text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-400">Nenhuma tarefa encontrada</p>
              <p className="text-slate-600 text-sm mt-1">
                {tab === 'todas'
                  ? 'Crie sua primeira tarefa clicando em "+ Nova Tarefa".'
                  : `Você não tem tarefas ${tab === 'pendente' ? 'pendentes' : 'concluídas'}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tarefasFiltradas.map((t) => (
              <TaskCard
                key={t.id}
                tarefa={t}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onEdit={(t) => { setEditTarefa(t); setShowModal(true); }}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de criação/edição */}
      {showModal && (
        <TaskModal
          tarefa={editTarefa}
          onSave={editTarefa ? handleEdit : handleCreate}
          onClose={() => { setShowModal(false); setEditTarefa(null); }}
        />
      )}
    </div>
  );
}
