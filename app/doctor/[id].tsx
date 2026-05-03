import { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Doctor, Department, Visit } from '../../types';

type UsageRow = {
  id: string;
  month: string;
  quantity: number;
  products: { name: string; price: number; unit: string };
};

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [usages, setUsages] = useState<UsageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [docRes, visitRes, usageRes] = await Promise.all([
      supabase.from('doctors').select('*').eq('id', id).single(),
      supabase.from('visits').select('*').eq('doctor_id', id).order('visited_at', { ascending: false }).limit(5),
      supabase.from('product_usage').select('id, month, quantity, products(name, price, unit)').eq('doctor_id', id).order('month', { ascending: false }),
    ]);
    if (docRes.data) {
      setDoctor(docRes.data);
      if (docRes.data.department_id) {
        const { data: dept } = await supabase.from('departments').select('*').eq('id', docRes.data.department_id).single();
        if (dept) setDepartment(dept);
      }
    }
    if (visitRes.data) setVisits(visitRes.data);
    if (usageRes.data) setUsages(usageRes.data as any);
  };

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, [id]);
  useFocusEffect(useCallback(() => { fetchData(); }, [id]));

  const totalRevenue = usages.reduce((sum, u) => sum + u.quantity * u.products.price, 0);

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator style={{ flex: 1 }} color="#2563eb" /></SafeAreaView>;
  if (!doctor) return <SafeAreaView style={s.container}><Text style={{ padding: 20 }}>找不到醫師資料</Text></SafeAreaView>;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>‹ 返回</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.name}>{doctor.name}</Text>
        {doctor.title && <Text style={s.sub}>{doctor.title}</Text>}
        {department && <Text style={s.sub}>🏥 {department.name}</Text>}
        {doctor.phone && <Text style={s.sub}>📞 {doctor.phone}</Text>}
        {doctor.notes && <Text style={s.notes}>{doctor.notes}</Text>}

        {/* 業績貢獻卡 */}
        <View style={s.revenueCard}>
          <Text style={s.revenueLabel}>累計業績貢獻</Text>
          <Text style={s.revenueValue}>NT$ {totalRevenue.toLocaleString()}</Text>
          <TouchableOpacity onPress={() => router.push(`/usage/new?doctor_id=${id}`)}>
            <Text style={s.revenueAdd}>＋ 記錄用量</Text>
          </TouchableOpacity>
        </View>

        {/* 用量明細 */}
        {usages.length > 0 && (
          <>
            <Text style={s.sectionTitle}>用量紀錄</Text>
            {usages.map((u) => (
              <View key={u.id} style={s.usageRow}>
                <View>
                  <Text style={s.usageProduct}>{u.products.name}</Text>
                  <Text style={s.usageMonth}>{u.month.slice(0, 7)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.usageQty}>{u.quantity} {u.products.unit}</Text>
                  <Text style={s.usageRevenue}>NT$ {(u.quantity * u.products.price).toLocaleString()}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* 拜訪紀錄 */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>拜訪紀錄（{visits.length}）</Text>
          <TouchableOpacity onPress={() => router.push(`/visit/new?doctor_id=${id}&hospital_id=${doctor.hospital_id}`)}>
            <Text style={s.addLink}>＋ 新增拜訪</Text>
          </TouchableOpacity>
        </View>
        {visits.length === 0
          ? <Text style={s.empty}>尚無拜訪紀錄</Text>
          : visits.map((v) => (
              <TouchableOpacity key={v.id} style={s.visitCard} onPress={() => router.push(`/visit/${v.id}`)}>
                <Text style={s.visitDate}>{new Date(v.visited_at).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}</Text>
                {v.content && <Text style={s.visitContent} numberOfLines={2}>{v.content}</Text>}
                {v.next_action && <Text style={s.nextAction}>→ {v.next_action}</Text>}
              </TouchableOpacity>
            ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  topBar: { padding: 16, paddingBottom: 0 },
  back: { color: '#2563eb', fontSize: 16 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  sub: { fontSize: 14, color: '#6c757d', marginBottom: 3 },
  notes: { fontSize: 14, color: '#6c757d', marginTop: 6, marginBottom: 4 },
  revenueCard: { backgroundColor: '#2563eb', borderRadius: 16, padding: 20, marginTop: 16, marginBottom: 8 },
  revenueLabel: { color: '#bfdbfe', fontSize: 13, marginBottom: 4 },
  revenueValue: { color: '#fff', fontSize: 32, fontWeight: 'bold' },
  revenueAdd: { color: '#bfdbfe', fontSize: 13, marginTop: 10 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginTop: 20, marginBottom: 10 },
  addLink: { color: '#2563eb', fontSize: 14 },
  empty: { color: '#9ca3af', fontSize: 14 },
  usageRow: { backgroundColor: '#fff', borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  usageProduct: { fontSize: 14, fontWeight: '600', color: '#1a1a2e' },
  usageMonth: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  usageQty: { fontSize: 13, color: '#495057', textAlign: 'right' },
  usageRevenue: { fontSize: 14, fontWeight: '600', color: '#059669', marginTop: 2 },
  visitCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  visitDate: { fontSize: 13, color: '#6c757d', marginBottom: 4 },
  visitContent: { fontSize: 15, color: '#1a1a2e', lineHeight: 20 },
  nextAction: { fontSize: 13, color: '#2563eb', marginTop: 6 },
});
