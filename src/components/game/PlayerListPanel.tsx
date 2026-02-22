import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Player, Play } from '../../types';
import { calcPlayerStats } from '../../stores/gameStore';

interface Props {
  players: Player[];
  plays: Play[];
  selectedPlayerId: string | null;
  onSelectPlayer: (id: string) => void;
  side: 'home' | 'opponent';
  onMemberChange?: () => void;
}

export default function PlayerListPanel({
  players, plays, selectedPlayerId, onSelectPlayer, side, onMemberChange,
}: Props) {
  return (
    <View style={[s.container, side === 'opponent' && s.containerRight]}>
      <ScrollView contentContainerStyle={s.list} showsVerticalScrollIndicator={false}>
        {players.map((player) => {
          const stats = calcPlayerStats(plays, player.id);
          const isSelected = selectedPlayerId === player.id;
          return (
            <Pressable
              key={player.id}
              style={[s.playerCard, isSelected && s.playerCardSelected]}
              onPress={() => onSelectPlayer(player.id)}
            >
              <Text style={[s.number, isSelected && s.textSelected]}>
                #{player.number}
              </Text>
              <Text style={[s.name, isSelected && s.textSelected]} numberOfLines={1}>
                {player.name}
              </Text>
              <View style={s.statsRow}>
                <Text style={[s.statText, isSelected && s.textSelected]}>
                  {stats.PTS}pts
                </Text>
                <Text style={[s.statText, s.foulText, isSelected && s.textSelected]}>
                  F:{stats.PF}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {onMemberChange && (
        <Pressable style={s.memberChangeBtn} onPress={onMemberChange}>
          <Text style={s.memberChangeText}>メンバーチェンジ</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  containerRight: {},
  list: {
    gap: 4,
  },
  playerCard: {
    backgroundColor: '#2d3a5e',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playerCardSelected: {
    backgroundColor: '#92400e',
    borderColor: '#f59e0b',
  },
  number: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: 'bold',
  },
  name: {
    color: '#cbd5e1',
    fontSize: 13,
    marginTop: 1,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  statText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
  },
  foulText: {
    color: '#f87171',
  },
  textSelected: {
    color: '#fef3c7',
  },
  memberChangeBtn: {
    marginTop: 6,
    backgroundColor: '#374151',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  memberChangeText: {
    color: '#d1d5db',
    fontSize: 11,
    fontWeight: '600',
  },
});
