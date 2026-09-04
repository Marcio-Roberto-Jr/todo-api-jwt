import { CheckCircle, AlertCircle, X } from 'lucide-react';

const config = {
  success: {
    bg: 'bg-emerald-500/15 border-emerald-500/30',
    text: 'text-emerald-300',
    icon: <CheckCircle className="w-5 h-5 shrink-0" />,
  },
  error: {
    bg: 'bg-red-500/15 border-red-500/30',
    text: 'text-red-300',
    icon: <AlertCircle className="w-5 h-5 shrink-0" />,
  },
};

/**
 * Componente de feedback visual.
 * @param {string} type - 'success' | 'error'
 * @param {string} message - Texto da mensagem
 * @param {Function} onClose - Callback para fechar
 */
export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  const { bg, text, icon } = config[type] || config.error;

  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border ${bg} ${text} animate-fade-in`}>
      {icon}
      <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="opacity-60 hover:opacity-100 transition-opacity ml-1 -mt-0.5"
          aria-label="Fechar alerta"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
