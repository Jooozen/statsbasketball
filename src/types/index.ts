// ============================================================
// ポジション
// ============================================================
export type Position = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

export const POSITION_LABELS: Record<Position, string> = {
  PG: 'ポイントガード',
  SG: 'シューティングガード',
  SF: 'スモールフォワード',
  PF: 'パワーフォワード',
  C: 'センター',
};

// ============================================================
// Player（選手）
// ============================================================
export interface Player {
  id: string;
  name: string;
  number: string;        // 背番号
  position: Position;
}

// ============================================================
// Team（チーム）
// ============================================================
export interface Team {
  id: string;
  name: string;
  players: Player[];
  createdAt: number;
  updatedAt: number;
}

// ============================================================
// ActionType（アクション種別）
// ============================================================
export type ActionType =
  // シュート
  | '2PM'   // 2ポイント成功
  | '2PA'   // 2ポイント失敗
  | '3PM'   // 3ポイント成功
  | '3PA'   // 3ポイント失敗
  | 'FTM'   // フリースロー成功
  | 'FTA'   // フリースロー失敗
  // リバウンド
  | 'OREB'  // オフェンスリバウンド
  | 'DREB'  // ディフェンスリバウンド
  // その他
  | 'AST'   // アシスト
  | 'STL'   // スティール
  | 'BLK'   // ブロック
  | 'TO'    // ターンオーバー
  | 'PF';   // ファウル

export const ACTION_LABELS: Record<ActionType, string> = {
  '2PM': '2P成功',
  '2PA': '2P失敗',
  '3PM': '3P成功',
  '3PA': '3P失敗',
  FTM:   'FT成功',
  FTA:   'FT失敗',
  OREB:  'OFリバウンド',
  DREB:  'DFリバウンド',
  AST:   'アシスト',
  STL:   'スティール',
  BLK:   'ブロック',
  TO:    'ターンオーバー',
  PF:    'ファウル',
};

// カテゴリ分け（UI で使用）
export const ACTION_CATEGORIES = {
  shooting: ['2PM', '2PA', '3PM', '3PA', 'FTM', 'FTA'] as ActionType[],
  rebound:  ['OREB', 'DREB'] as ActionType[],
  other:    ['AST', 'STL', 'BLK', 'TO', 'PF'] as ActionType[],
};

// ============================================================
// Play（1つ1つの記録）
// ============================================================
export interface Play {
  id: string;
  playerId: string;
  actionType: ActionType;
  quarter: number;
  gameClockSeconds: number;   // その時点の試合時計（秒）
  timestamp: number;          // 記録した実時刻 (Date.now())
}

// ============================================================
// Game（試合）
// ============================================================
export interface Game {
  id: string;
  teamId: string;
  teamName: string;
  opponent: string;
  homePlayers: Player[];          // 自チーム出場選手
  opponentPlayers: Player[];      // 相手チーム出場選手
  date: string;                   // "YYYY-MM-DD"
  quarterCount: number;           // クォーター数（デフォルト4）
  currentQuarter: number;
  gameClockSeconds: number;       // 残り時間（秒） デフォルト600=10分
  homeTimeoutsLeft: number;       // 自チームタイムアウト残数
  opponentTimeoutsLeft: number;   // 相手チームタイムアウト残数
  plays: Play[];
  isFinished: boolean;
  createdAt: number;
  updatedAt: number;
}

// ============================================================
// PlayerGameStats（選手ごとの集計 — 計算用ヘルパー型）
// ============================================================
export interface PlayerGameStats {
  playerId: string;
  '2PM': number;
  '2PA': number;
  '3PM': number;
  '3PA': number;
  FTM: number;
  FTA: number;
  OREB: number;
  DREB: number;
  AST: number;
  STL: number;
  BLK: number;
  TO: number;
  PF: number;
  // 計算値
  PTS: number;   // 得点 = 2PM*2 + 3PM*3 + FTM
  REB: number;   // 総リバウンド = OREB + DREB
  FGP: number;   // FG% = (2PM+3PM) / (2PA+3PA)  ※ 0 除算時は 0
  TPP: number;   // 3P% = 3PM / 3PA
  FTP: number;   // FT% = FTM / FTA
}
