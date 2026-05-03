import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { HospitalLevel } from '../../types';

const LEVELS: HospitalLevel[] = ['醫學中心', '區域醫院', '地區醫院', '診所'];

export default function NewHospitalScreen() {
  const [name, setName] = useState('');
  const [level, setLevel] = useState<HospitalLevel | null>(null);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('請輸入醫院名稱');
      return;
    }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('hospitals').insert({
      user_id: user!.id,
      name: name.trim(),
      level,
      address: address.trim() || null,
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
        <Text style={styles.title}>新增醫院</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#2563eb" />
            : <Text style={styles.save}>儲存</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.label}>醫院名稱 *</Text>
          <TextInput
            style={styles.input}
            placeholder="例：台大醫院"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>醫院等級</Text>
          <View style={styles.levelRow}>
            {LEVELS.map((l) => (
              <TouchableOpacity
                key={l}
                style={[styles.levelBtn, level === l && styles.levelBtnActive]}
                onPress={() => setLevel(level === l ? null : l)}
              >
                <Text style={[styles.levelBtnText, level === l && styles.levelBtnTextActive]}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>地址</Text>
          <TextInput
            style={styles.input}
            placeholder="例：台北市中正區中山南路7號"
            value={address}
            onChangeText={setAddress}
          />

          <Text style={styles.label}>電話</Text>
          <TextInput
            style={styles.input}
            placeholder="例：02-2312-3456"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>備註</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="其他備注..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
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
  content: { padding: 20, gap: 4 },
  label: { fontSize: 13, color: '#6c757d', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  textarea: { height: 100, textAlignVertical: 'top' },
  levelRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  levelBtn: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: '#fff',
  },
  levelBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  levelBtnText: { fontSize: 14, color: '#6c757d' },
  levelBtnTextActive: { color: '#2563eb', fontWeight: '600' },
});
