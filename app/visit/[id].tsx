import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

type VisitDetail = {
  id: string;
  visited_at: string;
  content: string | null;
  next_action: string | null;
  doctors: { id: string; name: string; title: string | null; hospitals: { id: string; name: string } };
};

export default function VisitDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [visit, setVisit] = useState<VisitDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('visits')
      .select('id, visited_at, content, next_action, doctors(id, name, title, hospitals(id, name))')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setVisit(data as any);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = () => {
    Alert.alert('刪除拜訪紀錄', '確定要刪除這筆紀錄嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除', style: 'destructive', onPress: async () => {
          await supabase.from('visits').delete().eq('id', id);
          router.back();
        }
      },
    ]);
  };

  if (loading) return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} color="#2563eb" /></SafeAreaView>;
  if (!visit) return <SafeAreaView style={styles.container}><Text style={{ padding: 20 }}>找不到紀錄</Text></SafeAreaView>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ 返回</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete}>
          <Text style={styles.delete}>刪除</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.date}>
          {new Date(visit.visited_at).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </Text>

        <TouchableOpacity
          style={styles.doctorCard}
          onPress={() => router.push(`/doctor/${visit.doctors.id}`)}
        >
          <View>
            <Text style={styles.doctorName}>{visit.doctors.name}</Text>
            {visit.doctors.title && <Text style={styles.doctorTitle}>{visit.doctors.title}</Text>}
            <Text style={styles.hospitalName}>{visit.doctors.hospitals.name}</Text>
          </View>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>拜訪內容</Text>
        <View style={styles.contentBox}>
          <Text style={styles.contentText}>{visit.content || '（無）'}</Text>
        </View>

        {visit.next_action && (
          <>
            <Text style={styles.sectionTitle}>下一步行動</Text>
            <View style={[styles.contentBox, styles.nextActionBox]}>
              <Text style={styles.nextActionText}>→ {visit.next_action}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  back: { color: '#2563eb', fontSize: 16 },
  delete: { color: '#ef4444', fontSize: 16 },
  content: { padding: 20 },
  date: { fontSize: 14, color: '#6c757d', marginBottom: 16 },
  doctorCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  doctorName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  doctorTitle: { fontSize: 13, color: '#6c757d', marginTop: 2 },
  hospitalName: { fontSize: 13, color: '#6c757d', marginTop: 2 },
  arrow: { fontSize: 18, color: '#9ca3af' },
  sectionTitle: { fontSize: 13, color: '#6c757d', marginBottom: 8, marginTop: 4 },
  contentBox: { backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  contentText: { fontSize: 15, color: '#1a1a2e', lineHeight: 24 },
  nextActionBox: { backgroundColor: '#eff6ff' },
  nextActionText: { fontSize: 15, color: '#2563eb', lineHeight: 24 },
});
