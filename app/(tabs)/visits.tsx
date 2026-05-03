import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

type VisitWithDoctor = {
  id: string;
  visited_at: string;
  content: string | null;
  next_action: string | null;
  doctors: { name: string; hospitals: { name: string } } | null;
};

export default function VisitsScreen() {
  const [visits, setVisits] = useState<VisitWithDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchVisits = async () => {
    const { data } = await supabase
      .from('visits')
      .select('id, visited_at, content, next_action, doctors(name, hospitals(name))')
      .order('visited_at', { ascending: false });
    if (data) setVisits(data as any);
  };

  useEffect(() => {
    fetchVisits().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchVisits();
    setRefreshing(false);
  };

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} color="#2563eb" /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>拜訪紀錄</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/visit/new')}>
          <Text style={styles.addButtonText}>＋ 新增</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visits}
        keyExtractor={(item) => item.id}
        contentContainerStyle={visits.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>還沒有拜訪紀錄</Text>
            <Text style={styles.emptyText}>點右上角「新增」記錄今天的拜訪</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/visit/${item.id}`)}>
            <View style={styles.cardTop}>
              <Text style={styles.doctorName}>{item.doctors?.name ?? '未知醫師'}</Text>
              <Text style={styles.date}>
                {new Date(item.visited_at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}
              </Text>
            </View>
            {item.doctors?.hospitals?.name && (
              <Text style={styles.hospitalName}>{item.doctors.hospitals.name}</Text>
            )}
            {item.content && (
              <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
            )}
            {item.next_action && (
              <Text style={styles.nextAction}>→ {item.next_action}</Text>
            )}
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 20, paddingBottom: 12,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  addButton: { backgroundColor: '#2563eb', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  doctorName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  date: { fontSize: 13, color: '#9ca3af' },
  hospitalName: { fontSize: 13, color: '#6c757d', marginBottom: 6 },
  content: { fontSize: 14, color: '#495057', lineHeight: 20, marginTop: 4 },
  nextAction: { fontSize: 13, color: '#2563eb', marginTop: 6 },
});
