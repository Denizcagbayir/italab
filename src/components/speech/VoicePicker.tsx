import { useEffect, useState } from 'react';
import { getItalianVoices, initSpeech } from '../../lib/speech';
import { useProgress } from '../../store/progressStore';

export function VoicePicker() {
  const voiceName = useProgress((s) => s.voiceName);
  const setVoiceName = useProgress((s) => s.setVoiceName);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    void initSpeech().then(() => setVoices(getItalianVoices()));
  }, []);

  if (!voices.length) {
    return (
      <p className="muted small">
        İtalyanca ses bulunamadı. macOS’ta Sistem Ayarları → Erişilebilirlik →
        Konuşulan İçerik’ten İtalyanca ses ekleyebilirsin.
      </p>
    );
  }

  return (
    <label className="field">
      <span>İtalyanca ses</span>
      <select
        value={voiceName ?? voices[0]?.name ?? ''}
        onChange={(e) => setVoiceName(e.target.value)}
      >
        {voices.map((v, i) => (
          <option key={v.name} value={v.name}>
            {v.name}
            {i === 0 ? ' (önerilen)' : ''}
          </option>
        ))}
      </select>
    </label>
  );
}
