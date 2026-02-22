import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Play, ActionType, PlayerGameStats } from '../types';

const GAMES_STORAGE_KEY = 'basketball_stats_games';
const DEFAULT_TIMEOUTS = 3;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

// ============================================================
// 集計ヘルパー
// ============================================================
export function calcPlayerStats(plays: Play[], playerId: string): PlayerGameStats {
  const filtered = plays.filter((p) => p.playerId === playerId);

  const count = (type: ActionType) => filtered.filter((p) => p.actionType === type).length;

  const _2PM = count('2PM');
  const _2PA = count('2PA');
  const _3PM = count('3PM');
  const _3PA = count('3PA');
  const FTM  = count('FTM');
  const FTA  = count('FTA');
  const OREB = count('OREB');
  const DREB = count('DREB');

  const fgMade = _2PM + _3PM;
  const fgAtt  = _2PA + _3PA;

  return {
    playerId,
    '2PM': _2PM,
    '2PA': _2PA,
    '3PM': _3PM,
    '3PA': _3PA,
    FTM,
    FTA,
    OREB,
    DREB,
    AST: count('AST'),
    STL: count('STL'),
    BLK: count('BLK'),
    TO:  count('TO'),
    PF:  count('PF'),
    PTS: _2PM * 2 + _3PM * 3 + FTM,
    REB: OREB + DREB,
    FGP: fgAtt > 0 ? fgMade / fgAtt : 0,
    TPP: _3PA > 0 ? _3PM / _3PA : 0,
    FTP: FTA > 0 ? FTM / FTA : 0,
  };
}

// ============================================================
// Store
// ============================================================
interface GameState {
  games: Game[];
  currentGame: Game | null;
  isLoading: boolean;

  // ストレージ
  loadGames: () => Promise<void>;
  saveGames: () => Promise<void>;

  // 試合ライフサイクル
  createGame: (params: {
    teamId: string;
    opponent: string;
    quarterCount?: number;
    timeoutsLeft?: number;
  }) => void;
  finishGame: () => Promise<void>;
  resumeGame: (gameId: string) => void;
  deleteGame: (gameId: string) => Promise<void>;

  // クォーター・タイムアウト操作
  setQuarter: (quarter: number) => void;
  useTimeout: () => void;

  // プレイ記録
  addPlay: (playerId: string, actionType: ActionType) => void;
  undoLastPlay: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  currentGame: null,
  isLoading: true,

  // ──────────────────────────────────────────────
  // ストレージ
  // ──────────────────────────────────────────────
  loadGames: async () => {
    try {
      const data = await AsyncStorage.getItem(GAMES_STORAGE_KEY);
      set({ games: data ? JSON.parse(data) : [], isLoading: false });
    } catch (error) {
      console.error('Failed to load games:', error);
      set({ isLoading: false });
    }
  },

  saveGames: async () => {
    try {
      await AsyncStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(get().games));
    } catch (error) {
      console.error('Failed to save games:', error);
    }
  },

  // ──────────────────────────────────────────────
  // 試合ライフサイクル
  // ──────────────────────────────────────────────
  createGame: ({ teamId, opponent, quarterCount = 4, timeoutsLeft = DEFAULT_TIMEOUTS }) => {
    const now = Date.now();
    const newGame: Game = {
      id: generateId(),
      teamId,
      opponent,
      date: new Date().toISOString().split('T')[0],
      quarterCount,
      currentQuarter: 1,
      timeoutsLeft,
      plays: [],
      isFinished: false,
      createdAt: now,
      updatedAt: now,
    };
    set({ currentGame: newGame });
  },

  finishGame: async () => {
    const { currentGame, games } = get();
    if (!currentGame) return;

    const finished: Game = { ...currentGame, isFinished: true, updatedAt: Date.now() };
    const idx = games.findIndex((g) => g.id === finished.id);
    const updatedGames =
      idx >= 0
        ? games.map((g, i) => (i === idx ? finished : g))
        : [finished, ...games];

    set({ games: updatedGames, currentGame: null });
    await get().saveGames();
  },

  resumeGame: (gameId) => {
    const game = get().games.find((g) => g.id === gameId);
    if (game && !game.isFinished) {
      set({ currentGame: game });
    }
  },

  deleteGame: async (gameId) => {
    set((state) => ({ games: state.games.filter((g) => g.id !== gameId) }));
    await get().saveGames();
  },

  // ──────────────────────────────────────────────
  // クォーター・タイムアウト
  // ──────────────────────────────────────────────
  setQuarter: (quarter) => {
    const { currentGame } = get();
    if (!currentGame) return;
    set({ currentGame: { ...currentGame, currentQuarter: quarter, updatedAt: Date.now() } });
  },

  useTimeout: () => {
    const { currentGame } = get();
    if (!currentGame || currentGame.timeoutsLeft <= 0) return;
    set({
      currentGame: {
        ...currentGame,
        timeoutsLeft: currentGame.timeoutsLeft - 1,
        updatedAt: Date.now(),
      },
    });
  },

  // ──────────────────────────────────────────────
  // プレイ記録
  // ──────────────────────────────────────────────
  addPlay: (playerId, actionType) => {
    const { currentGame } = get();
    if (!currentGame) return;

    const play: Play = {
      id: generateId(),
      playerId,
      actionType,
      quarter: currentGame.currentQuarter,
      timestamp: Date.now(),
    };

    set({
      currentGame: {
        ...currentGame,
        plays: [...currentGame.plays, play],
        updatedAt: Date.now(),
      },
    });
  },

  undoLastPlay: () => {
    const { currentGame } = get();
    if (!currentGame || currentGame.plays.length === 0) return;
    set({
      currentGame: {
        ...currentGame,
        plays: currentGame.plays.slice(0, -1),
        updatedAt: Date.now(),
      },
    });
  },
}));
