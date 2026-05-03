import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Hospital, Department, Doctor } from '../../types';

export default function HospitalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const [h, d, doc] = await Promise.all([
      supabase.from('hospitals').select('*').eq('id', id).single(),
      supabase.from('departments').select('*').eq('hospital_id', id).order('name'),
      supabase.from('doctors').select('*').eq('hospital_id', id).order('name'),
    ]);
    if (h.data) setHospital(h.data);
    if (d.data) setDepartments(d.data);
    if (doc.data) setDoctors(doc.data);
  };

  useEffect(() => {
    fetchData().finally(() => setLoading(false));
  }, [id]);

  const addDepartment = () => router.push(`/department/new?hospital_id=${id}`);
  const addDoctor = () => router.push(`/doctor/new?hospital_id=${id}`);

  if (loading) {
    return <SafeAreaView style={styles.container}><ActivityIndicator style={{ flex: 1 }} color="#2563eb" /></SafeAreaView>;
  }

  if (!hospital) {
    return <SafeAreaView style={styles.container}><Text style={{ padding: 20 }}>找不到醫院資料</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>‹ 返回</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hospitalName}>{hospital.name}</Text>
        {hospital.level && <Text style={styles.level}>{hospital.level}</Text>}
        {hospital.address && <Text style={styles.info}>📍 {hospital.address}</Text>}
        {hospital.phone && <Text style={styles.info}>📞 {hospital.phone}</Text>}
        {hospital.notes && <Text style={styles.notes}>{hospital.notes}</Text>}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>科別（{departments.length}）</Text>
          <TouchableOpacity onPress={addDepartment}>
            <Text style={styles.addLink}>＋ 新增</Text>
          </TouchableOpacity>
        </View>
        {departments.length === 0
          ? <Text style={styles.empty}>尚無科別</Text>
          : departments.map((d) => (
              <View key={d.id} style={styles.chip}>
                <Text style={styles.chipText}>{d.name}</Text>
              </View>
            ))
        }

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>醫師（{doctors.length}）</Text>
          <TouchableOpacity onPress={addDoctor}>
            <Text style={styles.addLink}>＋ 新增</Text>
          </TouchableOpacity>
        </View>
        {doctors.length === 0
          ? <Text style={styles.empty}>尚無醫師</Text>
          : doctors.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.doctorCard}
                onPress={() => router.push(`/doctor/${doc.id}`)}
              >
                <View>
                  <Text style={styles.doctorName}>{doc.name}</Text>
                  {doc.title && <Text style={styles.doctorTitle}>{doc.title}</Text>}
                </View>
                <Text style={styles.arrow}>›</Text>
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
  hospitalName: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 4 },
  level: { color: '#6c757d', fontSize: 14, marginBottom: 8 },
  info: { fontSize: 14, color: '#495057', marginBottom: 4 },
  notes: { fontSize: 14, color: '#6c757d', marginTop: 8, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  addLink: { color: '#2563eb', fontSize: 14 },
  empty: { color: '#9ca3af', fontSize: 14, marginBottom: 8 },
  chip: { backgroundColor: '#eff6ff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6, alignSelf: 'flex-start' },
  chipText: { color: '#2563eb', fontSize: 14 },
  doctorCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  doctorName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  doctorTitle: { fontSize: 13, color: '#6c757d', marginTop: 2 },
  arrow: { fontSize: 18, color: '#9ca3af' },
});
