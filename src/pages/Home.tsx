import { useState } from 'react';
import { loadGames, loadPlayers, saveGame, deleteGame } from '../storage';
import { Game } from '../types';

interface Props {
  onNavigateTeam: () => void;
  onNavigateGame: (gameId: string) => void;
  onNavigateSummary: (gameId: string) => void;
}

export default function Home({ onNavigateTeam, onNavigateGame, onNavigateSummary }: Props) {
  const [games, setGames] = useState<Game[]>(loadGames);
  const [showNewGame, setShowNewGame] = useState(false);
  const [opponent, setOpponent] = useState('');
  const players = loadPlayers();

  const createGame = () => {
    if (!opponent.trim()) return;
    if (players.length === 0) {
      alert('先にチーム管理から選手を登録してください');
      return;
    }
    const game: Game = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      opponent: opponent.trim(),
      events: [],
      quarter: 1,
      isFinished: false,
      playerIds: players.map(p => p.id),
      opponentScore: 0,
    };
    saveGame(game);
    setGames(prev => [...prev, game]);
    setOpponent('');
    setShowNewGame(false);
    onNavigateGame(game.id);
  };

  const handleDeleteGame = (e: React.MouseEvent, gameId: string) => {
    e.stopPropagation();
    if (!confirm('この試合を削除しますか？')) return;
    deleteGame(gameId);
    setGames(prev => prev.filter(g => g.id !== gameId));
  };

  const activeGames = games.filter(g => !g.isFinished);
  const finishedGames = games.filter(g => g.isFinished).reverse();

  return (
    <div className="page home-page">
      <header className="header">
        <h1>バスケスタッツ</h1>
      </header>

      <div className="home-actions">
        <button className="btn btn-primary btn-large" onClick={() => setShowNewGame(true)}>
          + 新しい試合
        </button>
        <button className="btn btn-secondary btn-large" onClick={onNavigateTeam}>
          チーム管理
        </button>
      </div>

      {showNewGame && (
        <div className="modal-overlay" onClick={() => setShowNewGame(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>新しい試合</h2>
            <div className="form-group">
              <label>対戦相手</label>
              <input
                type="text"
                value={opponent}
                onChange={e => setOpponent(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createGame()}
                placeholder="相手チーム名"
                autoFocus
                className="input-large"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowNewGame(false)}>
                キャンセル
              </button>
              <button className="btn btn-primary" onClick={createGame}>
                試合開始
              </button>
            </div>
          </div>
        </div>
      )}

      {activeGames.length > 0 && (
        <section className="game-section">
          <h2>進行中の試合</h2>
          <div className="game-list">
            {activeGames.map(game => (
              <div key={game.id} className="game-card game-card-active" onClick={() => onNavigateGame(game.id)}>
                <div className="game-card-info">
                  <span className="game-date">{game.date}</span>
                  <span className="game-opponent">vs {game.opponent}</span>
                  <span className="game-quarter">Q{game.quarter}</span>
                </div>
                <div className="game-card-actions">
                  <button className="btn btn-small btn-delete" onClick={(e) => handleDeleteGame(e, game.id)}>
                    削除
                  </button>
                  <span className="game-card-arrow">▶</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {finishedGames.length > 0 && (
        <section className="game-section">
          <h2>過去の試合</h2>
          <div className="game-list">
            {finishedGames.map(game => {
              const totalPoints = game.events.reduce((sum, e) => {
                if (e.action === 'fg_made') return sum + 2;
                if (e.action === 'three_made') return sum + 3;
                if (e.action === 'ft_made') return sum + 1;
                return sum;
              }, 0);
              return (
                <div key={game.id} className="game-card" onClick={() => onNavigateSummary(game.id)}>
                  <div className="game-card-info">
                    <span className="game-date">{game.date}</span>
                    <span className="game-opponent">vs {game.opponent}</span>
                    <span className="game-score">{totalPoints} - {game.opponentScore}</span>
                  </div>
                  <div className="game-card-actions">
                    <button className="btn btn-small btn-delete" onClick={(e) => handleDeleteGame(e, game.id)}>
                      削除
                    </button>
                    <span className="game-card-arrow">▶</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {games.length === 0 && (
        <div className="empty-state">
          <p className="empty-state-icon">🏀</p>
          <p>まだ試合がありません</p>
          <p>「チーム管理」から選手を登録して、試合を始めましょう！</p>
        </div>
      )}
    </div>
  );
}
