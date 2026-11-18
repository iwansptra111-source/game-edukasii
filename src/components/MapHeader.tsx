function MapHeader({ onOpenSettings }: { onOpenSettings: () => void }) {
  return (
    <header className="map-header" aria-label="Profil dan mata uang pemain">
      <img className="map-header__profile" src="/map-player-profile.png" alt="Siswa Rizki, Level 3" />
      <img className="map-header__currency" src="/map-currency-bar.png" alt="120 bintang dan 45 berlian" />
      <button className="map-header__settings" onClick={onOpenSettings} type="button" aria-label="Buka pengaturan">
        <img src="/map-settings-button.png" alt="" />
      </button>
    </header>
  )
}

export default MapHeader
