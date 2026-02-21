import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Player, StatEntry, StatType } from '../types';

const GAMES_STORAGE_KEY = 'basketball_stats_games';

interface GameState {
  // 保存済み試合一覧
  games: Game[];
  // 現在記録中の試合
  currentGame: Game | null;
  // ロード状態
  isLoading: boolean;

  // 試合一覧の操作
  loadGames: () => Promise<void>;
  saveGames: () => Promise<void>;

  // 試合の作成・管理
  createGame: (teamName: string, opponent: string, players: Player[], quarters?: number) => void;
  finishGame: () => Promise<void>;
  resumeGame: (gameId: string) => void;
  deleteGame: (gameId: string) => Promise<void>;

  // スタッツ記録
  addStat: (playerId: string, statType: StatType) => void;
  undoLastStat: () => void;
  setQuarter: (quarter: number) => void;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  currentGame: null,
  isLoading: true,

  loadGames: async () => {
    try {
      const data = await AsyncStorage.getItem(GAMES_STORAGE_KEY);
      if (data) {
        set({ games: JSON.parse(data), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load games:', error);
      set({ isLoading: false });
    }
  },

  saveGames: async () => {
    try {
      const { games } = get();
      await AsyncStorage.setItem(GAMES_STORAGE_KEY, JSON.stringify(games));
    } catch (error) {
      console.error('Failed to save games:', error);
    }
  },

  createGame: (teamName, opponent, players, quarters = 4) => {
    const newGame: Game = {
      id: generateId(),
      date: new Date().toISOString().split('T')[0],
      teamName,
      opponent,
      players,
      statEntries: [],
      quarters,
      currentQuarter: 1,
      isFinished: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set({ currentGame: newGame });
  },

  finishGame: async () => {
    const { currentGame, games } = get();
    if (!currentGame) return;

    const finishedGame = { ...currentGame, isFinished: true, updatedAt: Date.now() };
    const existingIndex = games.findIndex((g) => g.id === finishedGame.id);
    const updatedGames =
      existingIndex >= 0
        ? games.map((g, i) => (i === existingIndex ? finishedGame : g))
        : [finishedGame, ...games];

    set({ games: updatedGames, currentGame: null });
    await get().saveGames();
  },

  resumeGame: (gameId) => {
    const { games } = get();
    const game = games.find((g) => g.id === gameId);
    if (game && !game.isFinished) {
      set({ currentGame: game });
    }
  },

  deleteGame: async (gameId) => {
    const { games } = get();
    set({ games: games.filter((g) => g.id !== gameId) });
    await get().saveGames();
  },

  addStat: (playerId, statType) => {
    const { currentGame } = get();
    if (!currentGame) return;

    const entry: StatEntry = {
      id: generateId(),
      playerId,
      statType,
      quarter: currentGame.currentQuarter,
      timestamp: Date.now(),
    };

    set({
      currentGame: {
        ...currentGame,
        statEntries: [...currentGame.statEntries, entry],
        updatedAt: Date.now(),
      },
    });
  },

  undoLastStat: () => {
    const { currentGame } = get();
    if (!currentGame || currentGame.statEntries.length === 0) return;

    set({
      currentGame: {
        ...currentGame,
        statEntries: currentGame.statEntries.slice(0, -1),
        updatedAt: Date.now(),
      },
    });
  },

  setQuarter: (quarter) => {
    const { currentGame } = get();
    if (!currentGame) return;

    set({
      currentGame: {
        ...currentGame,
        currentQuarter: quarter,
        updatedAt: Date.now(),
      },
    });
  },
}));
