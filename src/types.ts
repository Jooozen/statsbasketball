export interface Player {
  id: string;
  name: string;
  number: number;
}

export interface PlayerGameStats {
  playerId: string;
  fgMade: number;
  fgAttempted: number;
  threePtMade: number;
  threePtAttempted: number;
  ftMade: number;
  ftAttempted: number;
  offRebounds: number;
  defRebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  fouls: number;
}

export type StatAction =
  | 'fg_made' | 'fg_missed'
  | 'three_made' | 'three_missed'
  | 'ft_made' | 'ft_missed'
  | 'off_rebound' | 'def_rebound'
  | 'assist' | 'steal' | 'block'
  | 'turnover' | 'foul';

export interface GameEvent {
  id: string;
  playerId: string;
  action: StatAction;
  quarter: number;
  timestamp: number;
}

export interface Game {
  id: string;
  date: string;
  opponent: string;
  events: GameEvent[];
  quarter: number;
  isFinished: boolean;
  playerIds: string[];
  opponentScore: number;
}
