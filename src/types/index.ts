// 選手情報
export interface Player {
  id: string;
  name: string;
  number: string; // 背番号
}

// スタッツの種類
export type StatType =
  | 'FGM'   // フィールドゴール成功
  | 'FGA'   // フィールドゴール試投
  | '3PM'   // 3ポイント成功
  | '3PA'   // 3ポイント試投
  | 'FTM'   // フリースロー成功
  | 'FTA'   // フリースロー試投
  | 'OREB'  // オフェンスリバウンド
  | 'DREB'  // ディフェンスリバウンド
  | 'AST'   // アシスト
  | 'STL'   // スティール
  | 'BLK'   // ブロック
  | 'TO'    // ターンオーバー
  | 'PF';   // ファウル

// 個々のスタッツ記録
export interface StatEntry {
  id: string;
  playerId: string;
  statType: StatType;
  quarter: number;
  timestamp: number;
}

// 選手ごとの集計スタッツ
export interface PlayerStats {
  playerId: string;
  FGM: number;
  FGA: number;
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
  PTS: number;  // 得点（計算値）
  REB: number;  // 総リバウンド（計算値）
}

// 試合情報
export interface Game {
  id: string;
  date: string;
  opponent: string;
  teamName: string;
  players: Player[];
  statEntries: StatEntry[];
  quarters: number;       // クォーター数（デフォルト4）
  currentQuarter: number;
  isFinished: boolean;
  createdAt: number;
  updatedAt: number;
}
