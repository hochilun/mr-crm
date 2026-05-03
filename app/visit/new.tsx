import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView,
  Platform, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Doctor, Hospital } from '../../types';

export default function NewVisitScreen() {
  const { doctor_id, hospital_id } = useLocalSearchParams<{ doctor_id?: string; hospital_id?: string }>();

  const [doctors, setDoctors] = useState<(Doctor & { hospitals: Hospital })[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<(Doctor & { hospitals: Hospital }) | null>(null);
  const [showDoctorPicker, setShowDoctorPicker] = useState(false);

  const [visitedAt, setVisitedAt] = useState(new Date().toISOString().split('T')[0]);
  const [content, setContent] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data } = await supabase
        .from('doctors')
        .select('*, hospitals(*)')
        .order('name');
      if (data) {
        setDoctors(data as any);
        if (doctor_id) {
          const found = (data as any).find((d: Doctor) => d.id === doctor_id);
          if (found) setSelectedDoctor(found);
        }
      }
      setFetchingDoctors(false);
    };
    fetchDoctors();
  }, []);

  const handleSave = async () => {
    if (!selectedDoctor) {
      Alert.alert('請選擇醫師');
      return;
    }
    if (!content.trim()) {
      Alert.alert('請填寫拜訪內容');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('visits').insert({
      user_id: user!.id,
      doctor_id: selectedDoctor.id,
      hospital_id: selectedDoctor.hospital_id,
      visited_at: new Date(visitedAt).toISOString(),
      content: content.trim(),
      next_action: nextAction.trim() || null,
    });
    setLoading(false);
    if (error) {
      Alert.alert('儲存失敗', error.message);
    } else {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>取消</Text>
        </TouchableOpacity>
        <Text style={styles.title}>新增拜訪</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#2563eb" /> : <Text style={styles.save}>儲存</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>

          <Text style={styles.label}>拜訪醫師 *</Text>
          <TouchableOpacity
            style={styles.selector}
            onPress={() => setShowDoctorPicker(true)}
            disabled={fetchingDoctors}
          >
            {fetchingDoctors
              ? <ActivityIndicator color="#2563eb" />
              : <Text style={selectedDoctor ? styles.selectorText : styles.selectorPlaceholder}>
                  {selectedDoctor
                    ? `${selectedDoctor.name}　${selectedDoctor.hospitals?.name ?? ''}`
                    : '請選擇醫師'}
                </Text>
            }
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <Text style={styles.label}>拜訪日期 *</Text>
          <TextInput
            style={styles.input}
            value={visitedAt}
            onChangeText={setVisitedAt}
            placeholder="YYYY-MM-DD"
          />

          <Text style={styles.label}>拜訪內容 *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="聊了什麼、討論了哪些產品、客戶的反應..."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />

          <Text style={styles.label}>下一步行動</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="例：下週安排手術試用、寄送產品資料..."
            value={nextAction}
            onChangeText={setNextAction}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showDoctorPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDoctorPicker(false)}>
              <Text style={styles.cancel}>關閉</Text>
            </TouchableOpacity>
            <Text style={styles.title}>選擇醫師</Text>
            <View style={{ width: 40 }} />
          </View>
          {doctors.length === 0
            ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>還沒有醫師資料{'\n'}請先到「客戶」頁面新增</Text>
              </View>
            )
            : (
              <FlatList
                data={doctors}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: 16, gap: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.doctorItem, selectedDoctor?.id === item.id && styles.doctorItemActive]}
                    onPress={() => { setSelectedDoctor(item); setShowDoctorPicker(false); }}
                  >
                    <Text style={styles.doctorItemName}>{item.name}</Text>
                    <Text style={styles.doctorItemHospital}>{item.hospitals?.name ?? ''}</Text>
                  </TouchableOpacity>
                )}
              />
            )
          }
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef', backgroundColor: '#fff',
  },
  cancel: { color: '#6c757d', fontSize: 16 },
  title: { fontSize: 17, fontWeight: '600', color: '#1a1a2e' },
  save: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  content: { padding: 20 },
  label: { fontSize: 13, color: '#6c757d', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10, padding: 14, fontSize: 16 },
  textarea: { minHeight: 100 },
  selector: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10,
    padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  selectorText: { fontSize: 16, color: '#1a1a2e', flex: 1 },
  selectorPlaceholder: { fontSize: 16, color: '#adb5bd', flex: 1 },
  chevron: { fontSize: 18, color: '#9ca3af' },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef', backgroundColor: '#fff',
  },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#9ca3af', textAlign: 'center', fontSize: 14, lineHeight: 22 },
  doctorItem: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  doctorItemActive: { borderWidth: 1.5, borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  doctorItemName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  doctorItemHospital: { fontSize: 13, color: '#6c757d', marginTop: 2 },
});
