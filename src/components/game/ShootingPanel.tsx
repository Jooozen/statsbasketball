import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

export type ShotMode = '2P' | '3P' | 'FT' | null;

interface Props {
  selectedPlayerId: string | null;
  shotMode: ShotMode;
  onShotTypeSelect: (type: '2P' | '3P' | 'FT') => void;
  onResult: (success: boolean) => void;
}

export default function ShootingPanel({
  selectedPlayerId, shotMode, onShotTypeSelect, onResult,
}: Props) {
  const disabled = !selectedPlayerId;

  return (
    <View style={s.container}>
      {/* 成功 / フリースロー / 失敗 */}
      <View style={s.topRow}>
        <Pressable
          style={[s.resultBtn, s.successBtn, (!shotMode || disabled) && s.disabled]}
          onPress={() => shotMode && onResult(true)}
          disabled={!shotMode || disabled}
        >
          <Text style={s.resultText}>成功</Text>
        </Pressable>

        <Pressable
          style={[s.shotTypeBtn, s.ftBtn, disabled && s.disabled, shotMode === 'FT' && s.shotTypeActive]}
          onPress={() => onShotTypeSelect('FT')}
          disabled={disabled}
        >
          <Text style={s.shotTypeText}>フリースロー</Text>
        </Pressable>

        <Pressable
          style={[s.resultBtn, s.failBtn, (!shotMode || disabled) && s.disabled]}
          onPress={() => shotMode && onResult(false)}
          disabled={!shotMode || disabled}
        >
          <Text style={s.resultText}>失敗</Text>
        </Pressable>
      </View>

      {/* 2P / 3P */}
      <View style={s.shotRow}>
        <Pressable
          style={[s.shotTypeBtn, s.twoPBtn, disabled && s.disabled, shotMode === '2P' && s.shotTypeActive]}
          onPress={() => onShotTypeSelect('2P')}
          disabled={disabled}
        >
          <Text style={s.shotTypeText}>2P</Text>
        </Pressable>

        <Pressable
          style={[s.shotTypeBtn, s.threePBtn, disabled && s.disabled, shotMode === '3P' && s.shotTypeActive]}
          onPress={() => onShotTypeSelect('3P')}
          disabled={disabled}
        >
          <Text style={s.shotTypeText}>3P</Text>
        </Pressable>
      </View>

      {/* コート図用エリア（将来用） */}
      <View style={s.courtPlaceholder}>
        <Text style={s.courtPlaceholderText}>
          {disabled ? '選手を選択してください' : shotMode ? `${shotMode}を選択中 → 成功/失敗を押してください` : '2P / 3P / FT を選択'}
        </Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  topRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  resultBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    maxWidth: 140,
  },
  successBtn: {
    backgroundColor: '#16a34a',
  },
  failBtn: {
    backgroundColor: '#dc2626',
  },
  resultText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shotRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  shotTypeBtn: {
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    alignItems: 'center',
  },
  twoPBtn: {
    backgroundColor: '#4f46e5',
  },
  threePBtn: {
    backgroundColor: '#7c3aed',
  },
  ftBtn: {
    flex: 1,
    backgroundColor: '#2563eb',
    maxWidth: 140,
  },
  shotTypeActive: {
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  shotTypeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.35,
  },
  courtPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    borderStyle: 'dashed',
    borderRadius: 12,
    width: '90%',
    marginTop: 4,
    marginBottom: 8,
  },
  courtPlaceholderText: {
    color: '#64748b',
    fontSize: 13,
  },
});
