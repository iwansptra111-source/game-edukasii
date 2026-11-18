import DailyMission from './DailyMission'
import Icon from './Icon'
import PlayerProfile from './PlayerProfile'
import ResourceCounter from './ResourceCounter'

function GameHeader({ starCount = 120, onOpenSettings }: { starCount?: number; onOpenSettings: () => void }) {
  return (
    <header className="game-header">
      <PlayerProfile />
      <div className="game-header__right">
        <div className="game-header__resources" aria-label="Sumber daya">
          <ResourceCounter icon="star" label="bintang" value={starCount} />
          <ResourceCounter icon="gem" label="berlian" value={45} />
          <button className="game-header__settings" onClick={onOpenSettings} type="button" aria-label="Buka pengaturan">
            <Icon name="settings" />
          </button>
        </div>
        <DailyMission />
      </div>
    </header>
  )
}

export default GameHeader

