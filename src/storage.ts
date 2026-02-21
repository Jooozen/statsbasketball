import { Player, Game } from './types';

const PLAYERS_KEY = 'basketball_players';
const GAMES_KEY = 'basketball_games';

export function loadPlayers(): Player[] {
  const data = localStorage.getItem(PLAYERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function savePlayers(players: Player[]): void {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

export function loadGames(): Game[] {
  const data = localStorage.getItem(GAMES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveGames(games: Game[]): void {
  localStorage.setItem(GAMES_KEY, JSON.stringify(games));
}

export function saveGame(game: Game): void {
  const games = loadGames();
  const index = games.findIndex(g => g.id === game.id);
  if (index >= 0) {
    games[index] = game;
  } else {
    games.push(game);
  }
  saveGames(games);
}

export function deleteGame(gameId: string): void {
  const games = loadGames().filter(g => g.id !== gameId);
  saveGames(games);
}
