import { useState, useCallback, useMemo } from 'react';
import { loadGames, loadPlayers, saveGame } from '../storage';
import { Game, GameEvent, PlayerGameStats, StatAction } from '../types';

interface Props {
  gameId: string;
  onBack: () => void;
  onFinish: (gameId: string) => void;
}

function createEmptyStats(playerId: string): PlayerGameStats {
  return {
    playerId,
    fgMade: 0, fgAttempted: 0,
    threePtMade: 0, threePtAttempted: 0,
    ftMade: 0, ftAttempted: 0,
    offRebounds: 0, defRebounds: 0,
    assists: 0, steals: 0, blocks: 0,
    turnovers: 0, fouls: 0,
  };
}

function computeStats(events: GameEvent[], playerIds: string[]): Record<string, PlayerGameStats> {
  const stats: Record<string, PlayerGameStats> = {};
  for (const pid of playerIds) {
    stats[pid] = createEmptyStats(pid);
  }
  for (const event of events) {
    const s = stats[event.playerId];
    if (!s) continue;
    switch (event.action) {
      case 'fg_made': s.fgMade++; s.fgAttempted++; break;
      case 'fg_missed': s.fgAttempted++; break;
      case 'three_made': s.threePtMade++; s.threePtAttempted++; break;
      case 'three_missed': s.threePtAttempted++; break;
      case 'ft_made': s.ftMade++; s.ftAttempted++; break;
      case 'ft_missed': s.ftAttempted++; break;
      case 'off_rebound': s.offRebounds++; break;
      case 'def_rebound': s.defRebounds++; break;
      case 'assist': s.assists++; break;
      case 'steal': s.steals++; break;
      case 'block': s.blocks++; break;
      case 'turnover': s.turnovers++; break;
      case 'foul': s.fouls++; break;
    }
  }
  return stats;
}

function getPoints(stats: PlayerGameStats): number {
  return stats.fgMade * 2 + stats.threePtMade * 3 + stats.ftMade;
}

const STAT_BUTTONS: { action: StatAction; label: string; className: string }[] = [
  { action: 'fg_made', label: '2点○', className: 'btn-stat-success' },
  { action: 'fg_missed', label: '2点✕', className: 'btn-stat-fail' },
  { action: 'three_made', label: '3点○', className: 'btn-stat-success' },
  { action: 'three_missed', label: '3点✕', className: 'btn-stat-fail' },
  { action: 'ft_made', label: 'FT○', className: 'btn-stat-success' },
  { action: 'ft_missed', label: 'FT✕', className: 'btn-stat-fail' },
  { action: 'off_rebound', label: 'OR', className: 'btn-stat-neutral' },
  { action: 'def_rebound', label: 'DR', className: 'btn-stat-neutral' },
  { action: 'assist', label: 'AST', className: 'btn-stat-neutral' },
  { action: 'steal', label: 'STL', className: 'btn-stat-neutral' },
  { action: 'block', label: 'BLK', className: 'btn-stat-neutral' },
  { action: 'turnover', label: 'TO', className: 'btn-stat-warning' },
  { action: 'foul', label: 'PF', className: 'btn-stat-warning' },
];

export default function GameRecorder({ gameId, onBack, onFinish }: Props) {
  const [game, setGame] = useState<Game>(() => {
    const games = loadGames();
    return games.find(g => g.id === gameId)!;
  });
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const players = useMemo(() => loadPlayers(), []);

  const allStats = useMemo(
    () => computeStats(game.events, game.playerIds),
    [game.events, game.playerIds]
  );

  const teamScore = useMemo(
    () => Object.values(allStats).reduce((sum, s) => sum + getPoints(s), 0),
    [allStats]
  );

  const recordStat = useCallback((action: StatAction) => {
    if (!selectedPlayerId) return;
    const event: GameEvent = {
      id: crypto.randomUUID(),
      playerId: selectedPlayerId,
      action,
      quarter: game.quarter,
      timestamp: Date.now(),
    };
    const updated = { ...game, events: [...game.events, event] };
    setGame(updated);
    saveGame(updated);
  }, [selectedPlayerId, game]);

  const undo = useCallback(() => {
    if (game.events.length === 0) return;
    const updated = { ...game, events: game.events.slice(0, -1) };
    setGame(updated);
    saveGame(updated);
  }, [game]);

  const setQuarter = useCallback((q: number) => {
    const updated = { ...game, quarter: q };
    setGame(updated);
    saveGame(updated);
  }, [game]);

  const updateOpponentScore = useCallback((delta: number) => {
    const updated = { ...game, opponentScore: Math.max(0, game.opponentScore + delta) };
    setGame(updated);
    saveGame(updated);
  }, [game]);

  const finishGame = useCallback(() => {
    if (!confirm('試合を終了しますか？')) return;
    const updated = { ...game, isFinished: true };
    setGame(updated);
    saveGame(updated);
    onFinish(game.id);
  }, [game, onFinish]);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);
  const selectedStats = selectedPlayerId ? allStats[selectedPlayerId] : null;

  const lastEvent = game.events[game.events.length - 1];
  const lastEventPlayer = lastEvent ? players.find(p => p.id === lastEvent.playerId) : null;
  const lastEventLabel = lastEvent ? STAT_BUTTONS.find(b => b.action === lastEvent.action)?.label : null;

  return (
    <div className="page recorder-page">
      <header className="recorder-header">
        <button className="btn btn-back" onClick={onBack}>← 戻る</button>
        <span className="recorder-opponent">vs {game.opponent}</span>
        <div className="quarter-selector">
          {[1, 2, 3, 4].map(q => (
            <button
              key={q}
              className={`btn btn-quarter ${game.quarter === q ? 'active' : ''}`}
              onClick={() => setQuarter(q)}
            >
              Q{q}
            </button>
          ))}
          <button
            className={`btn btn-quarter ${game.quarter === 5 ? 'active' : ''}`}
            onClick={() => setQuarter(5)}
          >
            OT
          </button>
        </div>
        <div className="scoreboard">
          <span className="score-team">{teamScore}</span>
          <span className="score-divider">-</span>
          <div className="score-opponent">
            <button className="btn btn-score-adj" onClick={() => updateOpponentScore(-1)}>−</button>
            <span>{game.opponentScore}</span>
            <button className="btn btn-score-adj" onClick={() => updateOpponentScore(1)}>＋</button>
          </div>
        </div>
        <button className="btn btn-finish" onClick={finishGame}>試合終了</button>
      </header>

      <div className="recorder-body">
        <div className="player-sidebar">
          {game.playerIds.map(pid => {
            const player = players.find(p => p.id === pid);
            if (!player) return null;
            const stats = allStats[pid];
            const pts = getPoints(stats);
            return (
              <button
                key={pid}
                className={`player-select-btn ${selectedPlayerId === pid ? 'selected' : ''}`}
                onClick={() => setSelectedPlayerId(pid)}
              >
                <span className="player-select-number">#{player.number}</span>
                <span className="player-select-name">{player.name}</span>
                <span className="player-select-pts">{pts}pts</span>
              </button>
            );
          })}
        </div>

        <div className="stat-panel">
          {selectedPlayer && selectedStats ? (
            <>
              <div className="selected-player-info">
                #{selectedPlayer.number} {selectedPlayer.name}
              </div>

              <div className="stat-buttons">
                <div className="stat-group">
                  <h3>シュート</h3>
                  <div className="stat-button-grid shooting-grid">
                    {STAT_BUTTONS.slice(0, 6).map(btn => (
                      <button
                        key={btn.action}
                        className={`btn btn-stat ${btn.className}`}
                        onClick={() => recordStat(btn.action)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="stat-group">
                  <h3>その他</h3>
                  <div className="stat-button-grid other-grid">
                    {STAT_BUTTONS.slice(6).map(btn => (
                      <button
                        key={btn.action}
                        className={`btn btn-stat ${btn.className}`}
                        onClick={() => recordStat(btn.action)}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="current-stats">
                <div className="stat-line">
                  <span className="stat-item">
                    <span className="stat-label">得点</span>
                    <span className="stat-value">{getPoints(selectedStats)}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">FG</span>
                    <span className="stat-value">{selectedStats.fgMade}/{selectedStats.fgAttempted}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">3P</span>
                    <span className="stat-value">{selectedStats.threePtMade}/{selectedStats.threePtAttempted}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">FT</span>
                    <span className="stat-value">{selectedStats.ftMade}/{selectedStats.ftAttempted}</span>
                  </span>
                </div>
                <div className="stat-line">
                  <span className="stat-item">
                    <span className="stat-label">REB</span>
                    <span className="stat-value">{selectedStats.offRebounds + selectedStats.defRebounds}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">AST</span>
                    <span className="stat-value">{selectedStats.assists}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">STL</span>
                    <span className="stat-value">{selectedStats.steals}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">BLK</span>
                    <span className="stat-value">{selectedStats.blocks}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">TO</span>
                    <span className="stat-value">{selectedStats.turnovers}</span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">PF</span>
                    <span className="stat-value">{selectedStats.fouls}</span>
                  </span>
                </div>
              </div>

              <div className="undo-section">
                <button className="btn btn-undo" onClick={undo} disabled={game.events.length === 0}>
                  ↩ 元に戻す
                  {lastEvent && lastEventPlayer && (
                    <span className="undo-detail">
                      （#{lastEventPlayer.number} {lastEventPlayer.name} - {lastEventLabel}）
                    </span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="no-player-selected">
              <p>← 選手を選択してください</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
