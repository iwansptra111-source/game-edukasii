type SettingsDialogProps = {
  musicEnabled: boolean
  onToggleMusic: () => void
  onClose: () => void
}

function SettingsDialog({ musicEnabled, onToggleMusic, onClose }: SettingsDialogProps) {
  return (
    <div className="settings-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <section className="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <button className="settings-dialog__close" type="button" onClick={onClose} aria-label="Tutup pengaturan">×</button>
        <span className="settings-dialog__eyebrow">PENGATURAN PERMAINAN</span>
        <h2 id="settings-title">Pengaturan</h2>
        <div className="settings-dialog__music-row">
          <span className="settings-dialog__music-icon" aria-hidden="true">♫</span>
          <div>
            <strong>Musik permainan</strong>
            <small>{musicEnabled ? 'Musik semangat sedang aktif' : 'Musik sedang mati'}</small>
          </div>
          <button className={`settings-dialog__toggle${musicEnabled ? ' is-on' : ''}`} type="button" role="switch" aria-checked={musicEnabled} onClick={onToggleMusic}>
            {musicEnabled ? 'Nyala' : 'Mati'}
          </button>
        </div>
      </section>
    </div>
  )
}

export default SettingsDialog
