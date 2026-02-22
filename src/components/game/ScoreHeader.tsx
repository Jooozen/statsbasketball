import React, { useRef, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface Props {
  currentQuarter: number;
  quarterCount: number;
  gameClockSeconds: number;
  teamName: string;
  opponentName: string;
  homeScore: number;
  opponentScore: number;
  homeTimeoutsLeft: number;
  opponentTimeoutsLeft: number;
  maxTimeouts: number;
  onQuarterChange: (q: number) => void;
  onClockAdjust: (delta: number) => void;
  onHomeTimeout: () => void;
  onOpponentTimeout: () => void;
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ScoreHeader({
  currentQuarter, quarterCount, gameClockSeconds,
  teamName, opponentName, homeScore, opponentScore,
  homeTimeoutsLeft, opponentTimeoutsLeft, maxTimeouts,
  onQuarterChange, onClockAdjust, onHomeTimeout, onOpponentTimeout,
}: Props) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRepeat = useCallback((delta: number) => {
    intervalRef.current = setInterval(() => onClockAdjust(delta), 80);
  }, [onClockAdjust]);

  const stopRepeat = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const quarters = Array.from({ length: quarterCount }, (_, i) => i + 1);

  return (
    <View style={s.container}>
      {/* クォーター選択 */}
      <View style={s.quarterRow}>
        {quarters.map((q) => (
          <Pressable
            key={q}
            style={[s.quarterBtn, currentQuarter === q && s.quarterBtnActive]}
            onPress={() => onQuarterChange(q)}
          >
            <Text style={[s.quarterText, currentQuarter === q && s.quarterTextActive]}>
              {q}Q
            </Text>
          </Pressable>
        ))}
        <Pressable
          style={[s.quarterBtn, currentQuarter === quarterCount + 1 && s.quarterBtnActive]}
          onPress={() => onQuarterChange(quarterCount + 1)}
        >
          <Text style={[s.quarterText, currentQuarter === quarterCount + 1 && s.quarterTextActive]}>
            OT
          </Text>
        </Pressable>
      </View>

      {/* 時計 + スコア + タイムアウト */}
      <View style={s.mainRow}>
        {/* 自チームタイムアウト */}
        <Pressable style={s.timeoutArea} onPress={onHomeTimeout}>
          <View style={s.timeoutDots}>
            {Array.from({ length: maxTimeouts }, (_, i) => (
              <View key={i} style={[s.dot, i < homeTimeoutsLeft ? s.dotActive : s.dotUsed]} />
            ))}
          </View>
          <Text style={s.timeoutLabel}>TO</Text>
        </Pressable>

        {/* チーム名 + スコア */}
        <View style={s.scoreArea}>
          <Text style={s.teamNameText}>{teamName}</Text>
          <Text style={s.scoreText}>{homeScore}</Text>
        </View>

        {/* 時計 */}
        <View style={s.clockArea}>
          <Pressable
            style={s.clockBtn}
            onPress={() => onClockAdjust(-1)}
            onLongPress={() => startRepeat(-1)}
            onPressOut={stopRepeat}
          >
            <Text style={s.clockBtnText}>◀</Text>
          </Pressable>
          <Text style={s.clockText}>{formatClock(gameClockSeconds)}</Text>
          <Pressable
            style={s.clockBtn}
            onPress={() => onClockAdjust(1)}
            onLongPress={() => startRepeat(1)}
            onPressOut={stopRepeat}
          >
            <Text style={s.clockBtnText}>▶</Text>
          </Pressable>
        </View>

        {/* 相手スコア + チーム名 */}
        <View style={s.scoreArea}>
          <Text style={s.scoreText}>{opponentScore}</Text>
          <Text style={s.teamNameText}>{opponentName}</Text>
        </View>

        {/* 相手タイムアウト */}
        <Pressable style={s.timeoutArea} onPress={onOpponentTimeout}>
          <View style={s.timeoutDots}>
            {Array.from({ length: maxTimeouts }, (_, i) => (
              <View key={i} style={[s.dot, i < opponentTimeoutsLeft ? s.dotActive : s.dotUsed]} />
            ))}
          </View>
          <Text style={s.timeoutLabel}>TO</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    paddingTop: 4,
    paddingBottom: 6,
    paddingHorizontal: 12,
  },
  // ── クォーター行 ──
  quarterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  quarterBtn: {
    paddingVertical: 4,
    paddingHorizontal: 14,
    borderRadius: 6,
    backgroundColor: '#2d3a5e',
  },
  quarterBtnActive: {
    backgroundColor: '#f59e0b',
  },
  quarterText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  quarterTextActive: {
    color: '#1a1a2e',
  },
  // ── メイン行 ──
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  // タイムアウト
  timeoutArea: {
    alignItems: 'center',
    minWidth: 60,
  },
  timeoutDots: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotActive: {
    backgroundColor: '#f59e0b',
  },
  dotUsed: {
    backgroundColor: '#4a5568',
  },
  timeoutLabel: {
    color: '#94a3b8',
    fontSize: 9,
  },
  // スコア
  scoreArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamNameText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  scoreText: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'center',
  },
  // 時計
  clockArea: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1117',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginHorizontal: 12,
  },
  clockBtn: {
    padding: 6,
  },
  clockBtnText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  clockText: {
    color: '#22c55e',
    fontSize: 28,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    minWidth: 80,
    textAlign: 'center',
  },
});
