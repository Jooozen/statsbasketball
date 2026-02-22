import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ActionType, ACTION_LABELS, Play, Player } from '../../types';

interface Props {
  selectedPlayerId: string | null;
  lastPlay: Play | null;
  allPlayers: Player[];
  onAction: (actionType: ActionType) => void;
  onUndo: () => void;
  onCancel: () => void;
}

function getPlayDescription(play: Play, allPlayers: Player[]): string {
  const player = allPlayers.find((p) => p.id === play.playerId);
  const name = player ? `#${player.number} ${player.name}` : '??';
  return `${name} ${ACTION_LABELS[play.actionType]}`;
}

// 下部アクションボタンの定義（2段 × 4列）
const ROW1: { type: ActionType; label: string; color: string }[] = [
  { type: 'PF',   label: 'ファウル',        color: '#b91c1c' },
  { type: 'OREB', label: 'OFリバウンド',    color: '#0369a1' },
  { type: 'TO',   label: 'ターンオーバー',  color: '#9333ea' },
  { type: 'BLK',  label: 'ブロック',        color: '#0d9488' },
];

const ROW2: { type: ActionType | 'CANCEL'; label: string; color: string }[] = [
  { type: 'STL',  label: 'スティール',      color: '#ca8a04' },
  { type: 'DREB', label: 'DFリバウンド',    color: '#1d4ed8' },
  { type: 'AST',  label: 'アシスト',        color: '#059669' },
  { type: 'CANCEL', label: 'キャンセル',    color: '#6b7280' },
];

export default function BottomActions({
  selectedPlayerId, lastPlay, allPlayers, onAction, onUndo, onCancel,
}: Props) {
  const disabled = !selectedPlayerId;

  return (
    <View style={s.container}>
      {/* 直近のプレイ */}
      <View style={s.recentPlayBar}>
        {lastPlay ? (
          <View style={s.recentPlayContent}>
            <Text style={s.recentPlayText} numberOfLines={1}>
              直近: {getPlayDescription(lastPlay, allPlayers)}
            </Text>
            <Pressable style={s.undoBtn} onPress={onUndo}>
              <Text style={s.undoText}>取消</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={s.recentPlayEmpty}>プレイを記録してください</Text>
        )}
      </View>

      {/* アクションボタン 1段目 */}
      <View style={s.actionRow}>
        {ROW1.map((item) => (
          <Pressable
            key={item.type}
            style={[s.actionBtn, { backgroundColor: item.color }, disabled && s.disabled]}
            onPress={() => onAction(item.type)}
            disabled={disabled}
          >
            <Text style={s.actionText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* アクションボタン 2段目 */}
      <View style={s.actionRow}>
        {ROW2.map((item) => (
          <Pressable
            key={item.type}
            style={[
              s.actionBtn,
              { backgroundColor: item.color },
              item.type === 'CANCEL' ? {} : disabled && s.disabled,
            ]}
            onPress={() => {
              if (item.type === 'CANCEL') {
                onCancel();
              } else {
                onAction(item.type);
              }
            }}
            disabled={item.type === 'CANCEL' ? false : disabled}
          >
            <Text style={s.actionText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#111827',
    paddingHorizontal: 10,
    paddingBottom: 8,
    paddingTop: 4,
  },
  // 直近のプレイ
  recentPlayBar: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  recentPlayContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recentPlayText: {
    color: '#e2e8f0',
    fontSize: 13,
    flex: 1,
  },
  recentPlayEmpty: {
    color: '#64748b',
    fontSize: 13,
    textAlign: 'center',
  },
  undoBtn: {
    backgroundColor: '#dc2626',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginLeft: 8,
  },
  undoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // アクションボタン
  actionRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.35,
  },
});
