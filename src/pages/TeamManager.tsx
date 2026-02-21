import { useState } from 'react';
import { loadPlayers, savePlayers } from '../storage';
import { Player } from '../types';

interface Props {
  onBack: () => void;
}

export default function TeamManager({ onBack }: Props) {
  const [players, setPlayers] = useState<Player[]>(loadPlayers);
  const [name, setName] = useState('');
  const [number, setNumber] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const addOrUpdatePlayer = () => {
    if (!name.trim() || !number.trim()) return;
    const num = parseInt(number);
    if (isNaN(num) || num < 0 || num > 99) {
      alert('背番号は0〜99の数字を入力してください');
      return;
    }

    let updated: Player[];
    if (editingId) {
      updated = players.map(p =>
        p.id === editingId ? { ...p, name: name.trim(), number: num } : p
      );
      setEditingId(null);
    } else {
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: name.trim(),
        number: num,
      };
      updated = [...players, newPlayer];
    }

    updated.sort((a, b) => a.number - b.number);
    setPlayers(updated);
    savePlayers(updated);
    setName('');
    setNumber('');
  };

  const editPlayer = (player: Player) => {
    setEditingId(player.id);
    setName(player.name);
    setNumber(String(player.number));
  };

  const removePlayer = (id: string) => {
    if (!confirm('この選手を削除しますか？')) return;
    const updated = players.filter(p => p.id !== id);
    setPlayers(updated);
    savePlayers(updated);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName('');
    setNumber('');
  };

  return (
    <div className="page team-page">
      <header className="header">
        <button className="btn btn-back" onClick={onBack}>← 戻る</button>
        <h1>チーム管理</h1>
        <span className="header-count">{players.length}人</span>
      </header>

      <div className="team-form">
        <div className="form-row">
          <div className="form-group">
            <label>背番号</label>
            <input
              type="number"
              value={number}
              onChange={e => setNumber(e.target.value)}
              placeholder="#"
              min="0"
              max="99"
              className="input-number"
            />
          </div>
          <div className="form-group form-group-grow">
            <label>名前</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addOrUpdatePlayer()}
              placeholder="選手名"
              className="input-large"
            />
          </div>
          <button className="btn btn-primary btn-form-action" onClick={addOrUpdatePlayer}>
            {editingId ? '更新' : '追加'}
          </button>
          {editingId && (
            <button className="btn btn-secondary btn-form-action" onClick={cancelEdit}>
              キャンセル
            </button>
          )}
        </div>
      </div>

      <div className="player-list">
        {players.map(player => (
          <div key={player.id} className={`player-card ${editingId === player.id ? 'editing' : ''}`}>
            <span className="player-number">#{player.number}</span>
            <span className="player-name">{player.name}</span>
            <div className="player-actions">
              <button className="btn btn-small btn-edit" onClick={() => editPlayer(player)}>編集</button>
              <button className="btn btn-small btn-delete" onClick={() => removePlayer(player.id)}>削除</button>
            </div>
          </div>
        ))}
        {players.length === 0 && (
          <div className="empty-state">
            <p className="empty-state-icon">👥</p>
            <p>選手が登録されていません</p>
            <p>上のフォームから選手を追加してください</p>
          </div>
        )}
      </div>
    </div>
  );
}
