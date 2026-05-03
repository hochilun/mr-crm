import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Department } from '../../types';

const TITLES = ['主治醫師', '住院醫師', '主任', '教授', '院長'];

export default function NewDoctorScreen() {
  const { hospital_id } = useLocalSearchParams<{ hospital_id: string }>();
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [departmentId, setDepartmentId] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('departments').select('*').eq('hospital_id', hospital_id).order('name')
      .then(({ data }) => { if (data) setDepartments(data); });
  }, [hospital_id]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('請輸入醫師姓名');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('doctors').insert({
      user_id: user!.id,
      hospital_id,
      department_id: departmentId,
      name: name.trim(),
      title: title.trim() || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
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
        <Text style={styles.title}>新增醫師</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#2563eb" /> : <Text style={styles.save}>儲存</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>醫師姓名 *</Text>
          <TextInput style={styles.input} placeholder="例：王大明" value={name} onChangeText={setName} />

          <Text style={styles.label}>職稱</Text>
          <View style={styles.row}>
            {TITLES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, title === t && styles.chipActive]}
                onPress={() => setTitle(title === t ? '' : t)}
              >
                <Text style={[styles.chipText, title === t && styles.chipTextActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {departments.length > 0 && (
            <>
              <Text style={styles.label}>所屬科別</Text>
              <View style={styles.row}>
                {departments.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.chip, departmentId === d.id && styles.chipActive]}
                    onPress={() => setDepartmentId(departmentId === d.id ? null : d.id)}
                  >
                    <Text style={[styles.chipText, departmentId === d.id && styles.chipTextActive]}>{d.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <Text style={styles.label}>電話</Text>
          <TextInput style={styles.input} placeholder="例：0912-345-678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.label}>備註</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="拜訪習慣、偏好..." value={notes} onChangeText={setNotes} multiline numberOfLines={4} />
        </ScrollView>
      </KeyboardAvoidingView>
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
  textarea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#fff' },
  chipActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  chipText: { fontSize: 14, color: '#6c757d' },
  chipTextActive: { color: '#2563eb', fontWeight: '600' },
});
