import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CustomersScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>客戶</Text>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>＋ 新增</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🏥</Text>
          <Text style={styles.emptyTitle}>還沒有客戶資料</Text>
          <Text style={styles.emptyText}>點右上角「新增」加入第一間醫院</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  addButton: {
    backgroundColor: '#2563eb',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  addButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  content: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
});
