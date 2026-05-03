import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Doctor, Department, Visit } from '../../types';

export default function DoctorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [department, setDepartment] = useState<Department | null>(null);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: doc } = await supabase.from('doctors').select('*').eq('id', id).single();
      if (doc) {
        setDoctor(doc);
        if (doc.department_id) {
          const { data: dept } = await supabase.from('departments').select('*').eq('id', doc.department_id).single();
          if (dept) setDepartment(dept);
        }
        const { data: v } = await supabase.from('visits').select('*').eq('doctor_id', id).order('visited_at', { ascending: false }).limit(10);
        if (v) setVisits(v);
      }
    };
    fetchData().finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} color="#2563eb" /></SafeAreaView>;
  if (!doctor) return <SafeAreaView style={styles.container}><Text style={{ padding: 20 }}>找不到醫師資料</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ 返回</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.name}>{doctor.name}</Text>
        {doctor.title && <Text style={styles.title}>{doctor.title}</Text>}
        {department && <Text style={styles.info}>🏥 {department.name}</Text>}
        {doctor.phone && <Text style={styles.info}>📞 {doctor.phone}</Text>}
        {doctor.notes && <Text style={styles.notes}>{doctor.notes}</Text>}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>拜訪紀錄（{visits.length}）</Text>
          <TouchableOpacity onPress={() => router.push(`/visit/new?doctor_id=${id}&hospital_id=${doctor.hospital_id}`)}>
            <Text style={styles.addLink}>＋ 新增拜訪</Text>
          </TouchableOpacity>
        </View>

        {visits.length === 0
          ? <Text style={styles.empty}>尚無拜訪紀錄</Text>
          : visits.map((v) => (
              <TouchableOpacity key={v.id} style={styles.visitCard} onPress={() => router.push(`/visit/${v.id}`)}>
                <Text style={styles.visitDate}>
                  {new Date(v.visited_at).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })}
                </Text>
                {v.content && <Text style={styles.visitContent} numberOfLines={2}>{v.content}</Text>}
                {v.next_action && <Text style={styles.nextAction}>→ {v.next_action}</Text>}
              </TouchableOpacity>
            ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { padding: 16, paddingBottom: 0 },
  back: { color: '#2563eb', fontSize: 16 },
  content: { padding: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  title: { fontSize: 14, color: '#6c757d', marginBottom: 8 },
  info: { fontSize: 14, color: '#495057', marginBottom: 4 },
  notes: { fontSize: 14, color: '#6c757d', marginTop: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  addLink: { color: '#2563eb', fontSize: 14 },
  empty: { color: '#9ca3af', fontSize: 14 },
  visitCard: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  visitDate: { fontSize: 13, color: '#6c757d', marginBottom: 4 },
  visitContent: { fontSize: 15, color: '#1a1a2e', lineHeight: 20 },
  nextAction: { fontSize: 13, color: '#2563eb', marginTop: 6 },
});
