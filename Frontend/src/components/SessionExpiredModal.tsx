import { AlertTriangle } from 'lucide-react';

interface SessionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  countdown: number;
}

export const SessionExpiredModal = ({ isOpen, onClose, countdown }: SessionExpiredModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-surface border border-border-subtle rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-status-warning/20 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-status-warning" />
          </div>
          
          <h2 className="text-2xl font-bold text-text-primary mb-2">Session Expiring</h2>
          <p className="text-text-secondary mb-6">
            Your session will expire due to inactivity. You will be logged out in:
          </p>
          
          <div className="text-5xl font-bold text-status-warning mb-8 font-mono">
            {countdown}s
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-3 bg-brand-primary hover:bg-brand-primary-hover text-white rounded-xl font-semibold shadow-lg shadow-indigo-900/20 transition-all"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredModal;
