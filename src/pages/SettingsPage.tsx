import { useRef } from 'react';
import { VoicePicker } from '../components/speech/VoicePicker';
import { useProgress } from '../store/progressStore';
import { speakText } from '../lib/speech';

export function SettingsPage() {
  const settings = useProgress((s) => s.settings);
  const setSettings = useProgress((s) => s.setSettings);
  const speakEnabled = useProgress((s) => s.speakEnabled);
  const setSpeakEnabled = useProgress((s) => s.setSpeakEnabled);
  const dailyGoal = useProgress((s) => s.dailyGoalMinutes);
  const setDailyGoal = useProgress((s) => s.setDailyGoal);
  const voiceName = useProgress((s) => s.voiceName);
  const resetProgress = useProgress((s) => s.resetProgress);
  const exportJson = useProgress((s) => s.exportJson);
  const importJson = useProgress((s) => s.importJson);
  const fileRef = useRef<HTMLInputElement>(null);

  const download = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `italab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Ayarlar</h1>
        <p className="lede">Ses, cevap kontrolü ve yedekleme</p>
      </header>

      <div className="settings-stack">
        <section className="settings-block">
          <h2>Ses</h2>
          <p className="section-desc">İtalyanca seslendirme ve konuşma alıştırmaları</p>
          <VoicePicker />
          <div className="settings-actions">
            <button
              type="button"
              className="btn ghost"
              onClick={() =>
                void speakText('Ciao! Facciamo pratica con ITAlab.', {
                  voiceName,
                })
              }
            >
              Sesi test et
            </button>
          </div>
          <div className="check-list">
            <label className="check">
              <input
                type="checkbox"
                checked={speakEnabled}
                onChange={(e) => setSpeakEnabled(e.target.checked)}
              />
              <span>Konuşma alıştırmaları açık</span>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={settings.slowDefault}
                onChange={(e) => setSettings({ slowDefault: e.target.checked })}
              />
              <span>Varsayılan yavaş dinleme</span>
            </label>
          </div>
        </section>

        <section className="settings-block">
          <h2>Cevap kontrolü</h2>
          <p className="section-desc">Yazılı cevaplar nasıl puanlanır</p>
          <div className="check-list">
            <label className="check">
              <input
                type="checkbox"
                checked={settings.ignoreCase}
                onChange={(e) => setSettings({ ignoreCase: e.target.checked })}
              />
              <span>Büyük/küçük harf önemsiz</span>
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={settings.ignoreAccents}
                onChange={(e) => setSettings({ ignoreAccents: e.target.checked })}
              />
              <span>Aksanları yok say (e = è)</span>
            </label>
          </div>
          <label className="field field-narrow">
            <span>Günlük hedef (dakika)</span>
            <input
              type="number"
              min={5}
              max={120}
              inputMode="numeric"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value) || 15)}
            />
          </label>
        </section>

        <section className="settings-block">
          <h2>Veri</h2>
          <p className="section-desc">İlerlemeni yedekle veya sıfırla</p>
          <div className="settings-actions">
            <button type="button" className="btn primary" onClick={download}>
              İlerlemeyi dışa aktar
            </button>
            <button
              type="button"
              className="btn ghost"
              onClick={() => fileRef.current?.click()}
            >
              İçe aktar
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const text = await file.text();
                const ok = importJson(text);
                alert(ok ? 'İçe aktarıldı' : 'Dosya geçersiz');
                e.target.value = '';
              }}
            />
          </div>
          <div className="settings-danger">
            <button
              type="button"
              className="btn bad"
              onClick={() => {
                if (confirm('Tüm ilerleme silinsin mi? Bu işlem geri alınamaz.')) {
                  resetProgress();
                }
              }}
            >
              İlerlemeyi sıfırla
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
