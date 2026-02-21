import { useMemo } from 'react';
import { loadGames, loadPlayers } from '../storage';
import { GameEvent, PlayerGameStats } from '../types';

interface Props {
  gameId: string;
  onBack: () => void;
}

function computePlayerStats(events: GameEvent[], playerId: string): PlayerGameStats {
  const s: PlayerGameStats = {
    playerId,
    fgMade: 0, fgAttempted: 0,
    threePtMade: 0, threePtAttempted: 0,
    ftMade: 0, ftAttempted: 0,
    offRebounds: 0, defRebounds: 0,
    assists: 0, steals: 0, blocks: 0,
    turnovers: 0, fouls: 0,
  };
  for (const e of events) {
    if (e.playerId !== playerId) continue;
    switch (e.action) {
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
  return s;
}

function getPoints(s: PlayerGameStats): number {
  return s.fgMade * 2 + s.threePtMade * 3 + s.ftMade;
}

function pct(made: number, attempted: number): string {
  if (attempted === 0) return '-';
  return (made / attempted * 100).toFixed(1) + '%';
}

export default function GameSummary({ gameId, onBack }: Props) {
  const game = useMemo(() => loadGames().find(g => g.id === gameId)!, [gameId]);
  const players = useMemo(() => loadPlayers(), []);

  const playerStats = useMemo(() => {
    return game.playerIds.map(pid => ({
      player: players.find(p => p.id === pid),
      stats: computePlayerStats(game.events, pid),
    })).filter(item => item.player);
  }, [game, players]);

  const teamTotals = useMemo(() => {
    const total: PlayerGameStats = {
      playerId: 'team',
      fgMade: 0, fgAttempted: 0,
      threePtMade: 0, threePtAttempted: 0,
      ftMade: 0, ftAttempted: 0,
      offRebounds: 0, defRebounds: 0,
      assists: 0, steals: 0, blocks: 0,
      turnovers: 0, fouls: 0,
    };
    for (const { stats } of playerStats) {
      total.fgMade += stats.fgMade;
      total.fgAttempted += stats.fgAttempted;
      total.threePtMade += stats.threePtMade;
      total.threePtAttempted += stats.threePtAttempted;
      total.ftMade += stats.ftMade;
      total.ftAttempted += stats.ftAttempted;
      total.offRebounds += stats.offRebounds;
      total.defRebounds += stats.defRebounds;
      total.assists += stats.assists;
      total.steals += stats.steals;
      total.blocks += stats.blocks;
      total.turnovers += stats.turnovers;
      total.fouls += stats.fouls;
    }
    return total;
  }, [playerStats]);

  const teamScore = getPoints(teamTotals);

  return (
    <div className="page summary-page">
      <header className="header">
        <button className="btn btn-back" onClick={onBack}>← ホームへ</button>
        <h1>試合結果</h1>
      </header>

      <div className="summary-score">
        <span className="summary-date">{game.date}</span>
        <div className="summary-score-display">
          <span className="summary-team-name">自チーム</span>
          <span className="summary-score-number">{teamScore}</span>
          <span className="summary-score-divider">-</span>
          <span className="summary-score-number">{game.opponentScore}</span>
          <span className="summary-team-name">{game.opponent}</span>
        </div>
        <span className={`summary-result ${teamScore > game.opponentScore ? 'win' : teamScore < game.opponentScore ? 'lose' : 'draw'}`}>
          {teamScore > game.opponentScore ? '勝ち' : teamScore < game.opponentScore ? '負け' : '引分'}
        </span>
      </div>

      <div className="box-score-container">
        <table className="box-score">
          <thead>
            <tr>
              <th className="col-player">選手</th>
              <th>PTS</th>
              <th>FG</th>
              <th>FG%</th>
              <th>3P</th>
              <th>3P%</th>
              <th>FT</th>
              <th>FT%</th>
              <th>OR</th>
              <th>DR</th>
              <th>REB</th>
              <th>AST</th>
              <th>STL</th>
              <th>BLK</th>
              <th>TO</th>
              <th>PF</th>
            </tr>
          </thead>
          <tbody>
            {playerStats.map(({ player, stats }) => (
              <tr key={player!.id}>
                <td className="col-player">#{player!.number} {player!.name}</td>
                <td className="col-pts"><strong>{getPoints(stats)}</strong></td>
                <td>{stats.fgMade}/{stats.fgAttempted}</td>
                <td>{pct(stats.fgMade, stats.fgAttempted)}</td>
                <td>{stats.threePtMade}/{stats.threePtAttempted}</td>
                <td>{pct(stats.threePtMade, stats.threePtAttempted)}</td>
                <td>{stats.ftMade}/{stats.ftAttempted}</td>
                <td>{pct(stats.ftMade, stats.ftAttempted)}</td>
                <td>{stats.offRebounds}</td>
                <td>{stats.defRebounds}</td>
                <td>{stats.offRebounds + stats.defRebounds}</td>
                <td>{stats.assists}</td>
                <td>{stats.steals}</td>
                <td>{stats.blocks}</td>
                <td>{stats.turnovers}</td>
                <td>{stats.fouls}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="totals-row">
              <td className="col-player"><strong>合計</strong></td>
              <td className="col-pts"><strong>{teamScore}</strong></td>
              <td>{teamTotals.fgMade}/{teamTotals.fgAttempted}</td>
              <td>{pct(teamTotals.fgMade, teamTotals.fgAttempted)}</td>
              <td>{teamTotals.threePtMade}/{teamTotals.threePtAttempted}</td>
              <td>{pct(teamTotals.threePtMade, teamTotals.threePtAttempted)}</td>
              <td>{teamTotals.ftMade}/{teamTotals.ftAttempted}</td>
              <td>{pct(teamTotals.ftMade, teamTotals.ftAttempted)}</td>
              <td>{teamTotals.offRebounds}</td>
              <td>{teamTotals.defRebounds}</td>
              <td>{teamTotals.offRebounds + teamTotals.defRebounds}</td>
              <td>{teamTotals.assists}</td>
              <td>{teamTotals.steals}</td>
              <td>{teamTotals.blocks}</td>
              <td>{teamTotals.turnovers}</td>
              <td>{teamTotals.fouls}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
