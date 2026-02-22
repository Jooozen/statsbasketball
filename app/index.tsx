import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, FontSizes, Spacing } from '../src/constants/theme';
import { useGameStore } from '../src/stores/gameStore';
import { Player } from '../src/types';

// デモ用サンプル選手データ
const DEMO_HOME_PLAYERS: Player[] = [
  { id: 'h1', name: '佐藤', number: '4',  position: 'PG' },
  { id: 'h2', name: '鈴木', number: '5',  position: 'SG' },
  { id: 'h3', name: '高橋', number: '7',  position: 'SF' },
  { id: 'h4', name: '伊藤', number: '11', position: 'PF' },
  { id: 'h5', name: '渡辺', number: '15', position: 'C' },
];

const DEMO_OPPONENT_PLAYERS: Player[] = [
  { id: 'a1', name: '田中', number: '3',  position: 'PG' },
  { id: 'a2', name: '山田', number: '8',  position: 'SG' },
  { id: 'a3', name: '中村', number: '10', position: 'SF' },
  { id: 'a4', name: '小林', number: '12', position: 'PF' },
  { id: 'a5', name: '加藤', number: '14', position: 'C' },
];

export default function HomeScreen() {
  const router = useRouter();
  const createGame = useGameStore((s) => s.createGame);

  const handleStartDemo = () => {
    createGame({
      teamId: 'demo-team',
      teamName: 'チームA',
      opponent: 'チームB',
      homePlayers: DEMO_HOME_PLAYERS,
      opponentPlayers: DEMO_OPPONENT_PLAYERS,
    });
    router.push('/game');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Basketball Stats</Text>
        <Text style={styles.subtitle}>バスケットボール スタッツ記録</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable style={styles.button} onPress={handleStartDemo}>
          <Text style={styles.buttonText}>デモ試合を開始</Text>
          <Text style={styles.buttonSub}>サンプル選手で試す</Text>
        </Pressable>

        <Pressable style={[styles.button, styles.secondaryButton]}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            新しい試合を始める
          </Text>
        </Pressable>

        <Pressable style={[styles.button, styles.secondaryButton]}>
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            試合履歴を見る
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: FontSizes.title,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSizes.lg,
    color: Colors.textLight,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 400,
    gap: Spacing.lg,
  },
  button: {
    backgroundColor: Colors.accent,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.xl,
    fontWeight: 'bold',
  },
  buttonSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  secondaryButton: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  secondaryButtonText: {
    color: Colors.primary,
  },
});
