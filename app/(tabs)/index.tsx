import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

type Stats = {
  monthRevenue: number;
  monthVisits: number;
  totalDoctors: number;
  recentVisits: { id: string; visited_at: string; content: string | null; doctors: { name: string } }[];
};

export default function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    const [usageRes, visitRes, doctorRes, recentRes] = await Promise.all([
      supabase.from('product_usage').select('quantity, products(price)').gte('month', monthStart),
      supabase.from('visits').select('id', { count: 'exact' }).gte('visited_at', monthStart),
      supabase.from('doctors').select('id', { count: 'exact' }),
      supabase.from('visits').select('id, visited_at, content, doctors(name)').order('visited_at', { ascending: false }).limit(3),
    ]);

    const monthRevenue = (usageRes.data ?? []).reduce((sum: number, u: any) => sum + u.quantity * (u.products?.price ?? 0), 0);

    setStats({
      monthRevenue,
      monthVisits: visitRes.count ?? 0,
      totalDoctors: doctorRes.count ?? 0,
      recentVisits: (recentRes.data ?? []) as any,
    });
  };

  useEffect(() => { fetchStats().finally(() => setLoading(false)); }, []);
  useFocusEffect(useCallback(() => { fetchStats(); }, []));

  const name = user?.user_metadata?.full_name ?? '業務';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? '早安' : hour < 18 ? '午安' : '晚安';

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator style={{ flex: 1 }} color="#2563eb" /></SafeAreaView>;

  return (
    <SafeAreaView style={s.container}>
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.greeting}>{greeting}，{name} 👋</Text>
        <Text style={s.date}>{new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'long' })}</Text>

        <View style={s.revenueCard}>
          <Text style={s.revenueLabel}>本月業績貢獻</Text>
          <Text style={s.revenueValue}>NT$ {(stats?.monthRevenue ?? 0).toLocaleString()}</Text>
        </View>

        <View style={s.row}>
          <View style={[s.smallCard, { marginRight: 8 }]}>
            <Text style={s.smallLabel}>本月拜訪</Text>
            <Text style={s.smallValue}>{stats?.monthVisits ?? 0}</Text>
          </View>
          <View style={[s.smallCard, { marginLeft: 8 }]}>
            <Text style={s.smallLabel}>追蹤醫師</Text>
            <Text style={s.smallValue}>{stats?.totalDoctors ?? 0}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>最近拜訪</Text>
        {(stats?.recentVisits.length ?? 0) === 0
          ? <View style={s.emptyBox}><Text style={s.emptyText}>還沒有拜訪紀錄</Text></View>
          : stats!.recentVisits.map((v) => (
              <View key={v.id} style={s.visitCard}>
                <Text style={s.visitDoctor}>{v.doctors?.name}</Text>
                <Text style={s.visitDate}>{new Date(v.visited_at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}</Text>
                {v.content && <Text style={s.visitContent} numberOfLines={1}>{v.content}</Text>}
              </View>
            ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { padding: 20 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e' },
  date: { fontSize: 14, color: '#6c757d', marginBottom: 20 },
  revenueCard: { backgroundColor: '#2563eb', borderRadius: 16, padding: 20, marginBottom: 16 },
  revenueLabel: { color: '#bfdbfe', fontSize: 14 },
  revenueValue: { color: '#fff', fontSize: 36, fontWeight: 'bold', marginTop: 4 },
  row: { flexDirection: 'row', marginBottom: 16 },
  smallCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  smallLabel: { fontSize: 12, color: '#6c757d' },
  smallValue: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 12 },
  emptyBox: { backgroundColor: '#fff', borderRadius: 12, padding: 24, alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14 },
  visitCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  visitDoctor: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  visitDate: { fontSize: 13, color: '#9ca3af' },
  visitContent: { fontSize: 13, color: '#6c757d', width: '100%' },
});
