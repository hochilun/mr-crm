import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.greeting}>早安，業務 👋</Text>
        <Text style={styles.date}>今天是 {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>本月業績貢獻</Text>
          <Text style={styles.cardValue}>$ 0</Text>
          <Text style={styles.cardSub}>尚無資料</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.smallCard, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.smallCardTitle}>本月拜訪</Text>
            <Text style={styles.smallCardValue}>0</Text>
          </View>
          <View style={[styles.smallCard, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.smallCardTitle}>追蹤客戶</Text>
            <Text style={styles.smallCardValue}>0</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>最近拜訪</Text>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>還沒有拜訪紀錄，點「拜訪」開始記錄吧</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  date: { fontSize: 14, color: '#6c757d', marginBottom: 20 },
  card: {
    backgroundColor: '#2563eb',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { color: '#bfdbfe', fontSize: 14 },
  cardValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginVertical: 4 },
  cardSub: { color: '#bfdbfe', fontSize: 12 },
  row: { flexDirection: 'row', marginBottom: 16 },
  smallCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  smallCardTitle: { fontSize: 12, color: '#6c757d' },
  smallCardValue: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 12 },
  emptyBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: { color: '#9ca3af', textAlign: 'center', fontSize: 14 },
});
