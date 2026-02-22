import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Play, Player, ActionType, PlayerGameStats } from '../types';

const GAMES_STORAGE_KEY = 'basketball_stats_games';
const DEFAULT_QUARTER_SECONDS = 600; // 10分
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
    '2PM': _2PM, '2PA': _2PA,
    '3PM': _3PM, '3PA': _3PA,
    FTM, FTA, OREB, DREB,
    AST: count('AST'),
    STL: count('STL'),
    BLK: count('BLK'),
    TO:  count('TO'),
    PF:  count('PF'),
    PTS: _2PM * 2 + _3PM * 3 + FTM,
    REB: OREB + DREB,
    FGP: fgAtt > 0 ? fgMade / fgAtt : 0,
    TPP: _3PA  > 0 ? _3PM / _3PA : 0,
    FTP: FTA   > 0 ? FTM  / FTA  : 0,
  };
}

/** チーム合計スコアを算出 */
export function calcTeamScore(plays: Play[], playerIds: string[]): number {
  const idSet = new Set(playerIds);
  return plays
    .filter((p) => idSet.has(p.playerId))
    .reduce((sum, p) => {
      if (p.actionType === '2PM') return sum + 2;
      if (p.actionType === '3PM') return sum + 3;
      if (p.actionType === 'FTM') return sum + 1;
      return sum;
    }, 0);
}

// ============================================================
// Store
// ============================================================
interface GameState {
  games: Game[];
  currentGame: Game | null;
  isLoading: boolean;

  loadGames: () => Promise<void>;
  saveGames: () => Promise<void>;

  createGame: (params: {
    teamId: string;
    teamName: string;
    opponent: string;
    homePlayers: Player[];
    opponentPlayers: Player[];
    quarterCount?: number;
    quarterSeconds?: number;
    timeouts?: number;
  }) => void;
  finishGame: () => Promise<void>;
  resumeGame: (gameId: string) => void;
  deleteGame: (gameId: string) => Promise<void>;
  saveCurrentGame: () => Promise<void>;

  setQuarter: (quarter: number) => void;
  setGameClock: (seconds: number) => void;
  adjustGameClock: (delta: number) => void;
  useHomeTimeout: () => void;
  useOpponentTimeout: () => void;

  addPlay: (playerId: string, actionType: ActionType) => void;
  undoLastPlay: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  currentGame: null,
  isLoading: true,

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

  createGame: ({
    teamId, teamName, opponent, homePlayers, opponentPlayers,
    quarterCount = 4, quarterSeconds = DEFAULT_QUARTER_SECONDS, timeouts = DEFAULT_TIMEOUTS,
  }) => {
    const now = Date.now();
    const newGame: Game = {
      id: generateId(),
      teamId,
      teamName,
      opponent,
      homePlayers,
      opponentPlayers,
      date: new Date().toISOString().split('T')[0],
      quarterCount,
      currentQuarter: 1,
      gameClockSeconds: quarterSeconds,
      homeTimeoutsLeft: timeouts,
      opponentTimeoutsLeft: timeouts,
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

  saveCurrentGame: async () => {
    const { currentGame, games } = get();
    if (!currentGame) return;
    const idx = games.findIndex((g) => g.id === currentGame.id);
    const updated = { ...currentGame, updatedAt: Date.now() };
    const updatedGames =
      idx >= 0
        ? games.map((g, i) => (i === idx ? updated : g))
        : [updated, ...games];
    set({ games: updatedGames });
    await get().saveGames();
  },

  setQuarter: (quarter) => {
    const { currentGame } = get();
    if (!currentGame) return;
    set({ currentGame: { ...currentGame, currentQuarter: quarter, updatedAt: Date.now() } });
  },

  setGameClock: (seconds) => {
    const { currentGame } = get();
    if (!currentGame) return;
    set({ currentGame: { ...currentGame, gameClockSeconds: Math.max(0, seconds), updatedAt: Date.now() } });
  },

  adjustGameClock: (delta) => {
    const { currentGame } = get();
    if (!currentGame) return;
    const next = Math.max(0, Math.min(999, currentGame.gameClockSeconds + delta));
    set({ currentGame: { ...currentGame, gameClockSeconds: next, updatedAt: Date.now() } });
  },

  useHomeTimeout: () => {
    const { currentGame } = get();
    if (!currentGame || currentGame.homeTimeoutsLeft <= 0) return;
    set({
      currentGame: {
        ...currentGame,
        homeTimeoutsLeft: currentGame.homeTimeoutsLeft - 1,
        updatedAt: Date.now(),
      },
    });
  },

  useOpponentTimeout: () => {
    const { currentGame } = get();
    if (!currentGame || currentGame.opponentTimeoutsLeft <= 0) return;
    set({
      currentGame: {
        ...currentGame,
        opponentTimeoutsLeft: currentGame.opponentTimeoutsLeft - 1,
        updatedAt: Date.now(),
      },
    });
  },

  addPlay: (playerId, actionType) => {
    const { currentGame } = get();
    if (!currentGame) return;

    const play: Play = {
      id: generateId(),
      playerId,
      actionType,
      quarter: currentGame.currentQuarter,
      gameClockSeconds: currentGame.gameClockSeconds,
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
