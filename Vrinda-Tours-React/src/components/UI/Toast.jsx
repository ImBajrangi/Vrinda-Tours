import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import './UI.css';

export default function Toast({ message, type = 'error', onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const t = setTimeout(() => { 
        setVisible(false); 
        setTimeout(onDismiss, 250); 
      }, 2800);
      return () => clearTimeout(t);
    }
  }, [message, onDismiss]);

  if (!message) return null;
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
  const cleanMessage = String(message)
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <div 
      className={`toast ${type} ${visible ? 'visible' : ''}`}
      onClick={() => { setVisible(false); setTimeout(onDismiss, 200); }}
      role="alert"
    >
      <div className="toast-icon-badge">
        <Icon size={16} />
      </div>
      <span className="toast-message">{cleanMessage}</span>
    </div>
  );
}
