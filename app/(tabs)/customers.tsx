import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Hospital } from '../../types';

const LEVEL_COLOR: Record<string, string> = {
  '醫學中心': '#7c3aed',
  '區域醫院': '#2563eb',
  '地區醫院': '#059669',
  '診所': '#d97706',
};

export default function CustomersScreen() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHospitals = async () => {
    const { data } = await supabase
      .from('hospitals')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setHospitals(data);
  };

  useEffect(() => {
    fetchHospitals().finally(() => setLoading(false));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHospitals();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator style={{ flex: 1 }} color="#2563eb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>客戶</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/hospital/new')}
        >
          <Text style={styles.addButtonText}>＋ 新增醫院</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={hospitals}
        keyExtractor={(item) => item.id}
        contentContainerStyle={hospitals.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🏥</Text>
            <Text style={styles.emptyTitle}>還沒有客戶資料</Text>
            <Text style={styles.emptyText}>點右上角「新增醫院」開始建立客戶</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/hospital/${item.id}`)}
          >
            <View style={styles.cardLeft}>
              <Text style={styles.hospitalName}>{item.name}</Text>
              {item.address ? <Text style={styles.hospitalAddress}>{item.address}</Text> : null}
            </View>
            {item.level ? (
              <View style={[styles.levelBadge, { backgroundColor: LEVEL_COLOR[item.level] ?? '#6b7280' }]}>
                <Text style={styles.levelText}>{item.level}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        )}
      />
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
  addButtonText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  list: { padding: 16, gap: 10 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLeft: { flex: 1 },
  hospitalName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  hospitalAddress: { fontSize: 13, color: '#6c757d', marginTop: 2 },
  levelBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginLeft: 8,
  },
  levelText: { color: '#fff', fontSize: 11, fontWeight: '600' },
});
