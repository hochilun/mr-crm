import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';

const COMMON_DEPARTMENTS = [
  '心臟內科', '胸腔內科', '腸胃內科', '腎臟內科', '神經內科',
  '一般外科', '心臟外科', '胸腔外科', '神經外科', '骨科',
  '婦產科', '小兒科', '泌尿科', '眼科', '耳鼻喉科',
  '皮膚科', '精神科', '急診科', '麻醉科', '放射科',
];

export default function NewDepartmentScreen() {
  const { hospital_id } = useLocalSearchParams<{ hospital_id: string }>();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async (deptName: string) => {
    if (!deptName.trim()) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('departments').insert({
      user_id: user!.id,
      hospital_id,
      name: deptName.trim(),
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
        <Text style={styles.title}>新增科別</Text>
        <TouchableOpacity onPress={() => handleSave(name)} disabled={loading}>
          {loading ? <ActivityIndicator color="#2563eb" /> : <Text style={styles.save}>儲存</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="輸入科別名稱"
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <Text style={styles.label}>常用科別</Text>
          <View style={styles.chipContainer}>
            {COMMON_DEPARTMENTS.map((dept) => (
              <TouchableOpacity
                key={dept}
                style={styles.chip}
                onPress={() => handleSave(dept)}
              >
                <Text style={styles.chipText}>{dept}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    backgroundColor: '#fff',
  },
  cancel: { color: '#6c757d', fontSize: 16 },
  title: { fontSize: 17, fontWeight: '600', color: '#1a1a2e' },
  save: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  content: { padding: 20 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 20,
  },
  label: { fontSize: 13, color: '#6c757d', marginBottom: 10 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  chipText: { fontSize: 14, color: '#495057' },
});
