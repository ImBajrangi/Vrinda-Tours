import { useEffect, useState, useCallback } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import './UI.css';

export default function Toast({ message, type = 'error', onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => { setVisible(false); setTimeout(onDismiss, 300); }, 3000);
      return () => clearTimeout(t);
    }
  }, [message, onDismiss]);

  if (!message) return null;
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`toast ${type} ${visible ? 'visible' : ''}`}>
      <Icon size={20} className="toast-icon" />
      <span className="toast-message">{message}</span>
    </div>
  );
}
