import { useState } from 'react';
import { speakText, stopSpeaking, isSpeaking } from '../../lib/speech';
import { useProgress } from '../../store/progressStore';

type Props = {
  text: string;
  label?: string;
  rate?: number;
  small?: boolean;
};

export function SpeakButton({ text, label, rate = 1, small }: Props) {
  const voiceName = useProgress((s) => s.voiceName);
  const slowDefault = useProgress((s) => s.settings.slowDefault);
  const [busy, setBusy] = useState(false);

  const play = async () => {
    if (!text) return;
    if (isSpeaking()) {
      stopSpeaking();
      setBusy(false);
      return;
    }
    setBusy(true);
    try {
      await speakText(text, {
        rate: rate ?? (slowDefault ? 0.8 : 1),
        voiceName,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      className={`speak-btn ${small ? 'small' : ''} ${busy ? 'busy' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        void play();
      }}
      title={label ?? 'Seslendir'}
      aria-label={label ?? 'Seslendir'}
    >
      {busy ? '⏹' : '🔊'}
      {label && !small ? <span>{label}</span> : null}
    </button>
  );
}
