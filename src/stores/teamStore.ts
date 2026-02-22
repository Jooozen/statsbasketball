import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Team, Player } from '../types';

const TEAMS_STORAGE_KEY = 'basketball_stats_teams';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

interface TeamState {
  teams: Team[];
  isLoading: boolean;

  loadTeams: () => Promise<void>;
  saveTeams: () => Promise<void>;

  addTeam: (name: string) => Team;
  updateTeam: (teamId: string, name: string) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;

  addPlayer: (teamId: string, player: Omit<Player, 'id'>) => Promise<void>;
  updatePlayer: (teamId: string, player: Player) => Promise<void>;
  removePlayer: (teamId: string, playerId: string) => Promise<void>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [],
  isLoading: true,

  loadTeams: async () => {
    try {
      const data = await AsyncStorage.getItem(TEAMS_STORAGE_KEY);
      if (data) {
        set({ teams: JSON.parse(data), isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load teams:', error);
      set({ isLoading: false });
    }
  },

  saveTeams: async () => {
    try {
      const { teams } = get();
      await AsyncStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    } catch (error) {
      console.error('Failed to save teams:', error);
    }
  },

  addTeam: (name) => {
    const now = Date.now();
    const newTeam: Team = {
      id: generateId(),
      name,
      players: [],
      createdAt: now,
      updatedAt: now,
    };
    set((state) => ({ teams: [...state.teams, newTeam] }));
    get().saveTeams();
    return newTeam;
  },

  updateTeam: async (teamId, name) => {
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, name, updatedAt: Date.now() } : t
      ),
    }));
    await get().saveTeams();
  },

  deleteTeam: async (teamId) => {
    set((state) => ({ teams: state.teams.filter((t) => t.id !== teamId) }));
    await get().saveTeams();
  },

  addPlayer: async (teamId, playerData) => {
    const newPlayer: Player = { ...playerData, id: generateId() };
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId
          ? { ...t, players: [...t.players, newPlayer], updatedAt: Date.now() }
          : t
      ),
    }));
    await get().saveTeams();
  },

  updatePlayer: async (teamId, player) => {
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              players: t.players.map((p) => (p.id === player.id ? player : p)),
              updatedAt: Date.now(),
            }
          : t
      ),
    }));
    await get().saveTeams();
  },

  removePlayer: async (teamId, playerId) => {
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId
          ? {
              ...t,
              players: t.players.filter((p) => p.id !== playerId),
              updatedAt: Date.now(),
            }
          : t
      ),
    }));
    await get().saveTeams();
  },
}));
