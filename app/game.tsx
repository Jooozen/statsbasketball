import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useGameStore, calcTeamScore } from '../src/stores/gameStore';
import { ActionType } from '../src/types';
import ScoreHeader from '../src/components/game/ScoreHeader';
import PlayerListPanel from '../src/components/game/PlayerListPanel';
import ShootingPanel, { ShotMode } from '../src/components/game/ShootingPanel';
import BottomActions from '../src/components/game/BottomActions';

const MAX_TIMEOUTS = 3;

export default function GameScreen() {
  const game = useGameStore((s) => s.currentGame);
  const addPlay = useGameStore((s) => s.addPlay);
  const undoLastPlay = useGameStore((s) => s.undoLastPlay);
  const setQuarter = useGameStore((s) => s.setQuarter);
  const adjustGameClock = useGameStore((s) => s.adjustGameClock);
  const useHomeTimeout = useGameStore((s) => s.useHomeTimeout);
  const useOpponentTimeout = useGameStore((s) => s.useOpponentTimeout);

  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [shotMode, setShotMode] = useState<ShotMode>(null);

  // プレイヤー選択
  const handleSelectPlayer = useCallback((playerId: string) => {
    setSelectedPlayerId((prev) => (prev === playerId ? null : playerId));
    setShotMode(null);
  }, []);

  // シュート種別選択
  const handleShotTypeSelect = useCallback((type: '2P' | '3P' | 'FT') => {
    setShotMode((prev) => (prev === type ? null : type));
  }, []);

  // シュート結果
  const handleShotResult = useCallback((success: boolean) => {
    if (!selectedPlayerId || !shotMode) return;

    const actionMap: Record<string, ActionType> = {
      '2P_true':  '2PM', '2P_false':  '2PA',
      '3P_true':  '3PM', '3P_false':  '3PA',
      'FT_true':  'FTM', 'FT_false':  'FTA',
    };
    const action = actionMap[`${shotMode}_${success}`];
    if (action) {
      addPlay(selectedPlayerId, action);
      setShotMode(null);
    }
  }, [selectedPlayerId, shotMode, addPlay]);

  // クイックアクション（ファウル、リバウンド等）
  const handleQuickAction = useCallback((actionType: ActionType) => {
    if (!selectedPlayerId) return;
    addPlay(selectedPlayerId, actionType);
    setShotMode(null);
  }, [selectedPlayerId, addPlay]);

  // キャンセル
  const handleCancel = useCallback(() => {
    setSelectedPlayerId(null);
    setShotMode(null);
  }, []);

  // 取消
  const handleUndo = useCallback(() => {
    undoLastPlay();
  }, [undoLastPlay]);

  // スコア計算
  const homeScore = useMemo(() => {
    if (!game) return 0;
    return calcTeamScore(game.plays, game.homePlayers.map((p) => p.id));
  }, [game?.plays, game?.homePlayers]);

  const opponentScore = useMemo(() => {
    if (!game) return 0;
    return calcTeamScore(game.plays, game.opponentPlayers.map((p) => p.id));
  }, [game?.plays, game?.opponentPlayers]);

  // 全選手リスト
  const allPlayers = useMemo(() => {
    if (!game) return [];
    return [...game.homePlayers, ...game.opponentPlayers];
  }, [game?.homePlayers, game?.opponentPlayers]);

  // 直近のプレイ
  const lastPlay = game && game.plays.length > 0
    ? game.plays[game.plays.length - 1]
    : null;

  if (!game) return null;

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.root}>
        {/* ── 上部: スコアヘッダー ── */}
        <ScoreHeader
          currentQuarter={game.currentQuarter}
          quarterCount={game.quarterCount}
          gameClockSeconds={game.gameClockSeconds}
          teamName={game.teamName}
          opponentName={game.opponent}
          homeScore={homeScore}
          opponentScore={opponentScore}
          homeTimeoutsLeft={game.homeTimeoutsLeft}
          opponentTimeoutsLeft={game.opponentTimeoutsLeft}
          maxTimeouts={MAX_TIMEOUTS}
          onQuarterChange={setQuarter}
          onClockAdjust={adjustGameClock}
          onHomeTimeout={useHomeTimeout}
          onOpponentTimeout={useOpponentTimeout}
        />

        {/* ── 中段: 選手リスト + シューティングパネル ── */}
        <View style={s.middleRow}>
          {/* 左: 自チーム */}
          <View style={s.playerColumn}>
            <PlayerListPanel
              players={game.homePlayers}
              plays={game.plays}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={handleSelectPlayer}
              side="home"
              onMemberChange={() => {}}
            />
          </View>

          {/* 中央: シューティング */}
          <View style={s.centerColumn}>
            <ShootingPanel
              selectedPlayerId={selectedPlayerId}
              shotMode={shotMode}
              onShotTypeSelect={handleShotTypeSelect}
              onResult={handleShotResult}
            />
          </View>

          {/* 右: 相手チーム */}
          <View style={s.playerColumn}>
            <PlayerListPanel
              players={game.opponentPlayers}
              plays={game.plays}
              selectedPlayerId={selectedPlayerId}
              onSelectPlayer={handleSelectPlayer}
              side="opponent"
              onMemberChange={() => {}}
            />
          </View>
        </View>

        {/* ── 下部: アクション ── */}
        <BottomActions
          selectedPlayerId={selectedPlayerId}
          lastPlay={lastPlay}
          allPlayers={allPlayers}
          onAction={handleQuickAction}
          onUndo={handleUndo}
          onCancel={handleCancel}
        />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  root: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  middleRow: {
    flex: 1,
    flexDirection: 'row',
  },
  playerColumn: {
    width: '18%',
  },
  centerColumn: {
    flex: 1,
  },
});
