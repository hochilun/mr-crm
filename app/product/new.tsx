import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';

const UNITS = ['個', '組', '盒', '支', '條', '片', '套'];

export default function NewProductScreen() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('個');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('請輸入產品名稱'); return; }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum < 0) { Alert.alert('請輸入正確的售價'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('products').insert({
      user_id: user!.id,
      name: name.trim(),
      price: priceNum,
      unit,
    });
    setLoading(false);
    if (error) { Alert.alert('儲存失敗', error.message); }
    else { router.back(); }
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.cancel}>取消</Text></TouchableOpacity>
        <Text style={s.title}>新增產品</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#2563eb" /> : <Text style={s.save}>儲存</Text>}
        </TouchableOpacity>
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.label}>產品名稱 *</Text>
          <TextInput style={s.input} placeholder="例：手術縫合器" value={name} onChangeText={setName} autoFocus />

          <Text style={s.label}>售價（NT$）*</Text>
          <TextInput style={s.input} placeholder="例：15000" value={price} onChangeText={setPrice} keyboardType="numeric" />

          <Text style={s.label}>單位</Text>
          <View style={s.unitRow}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[s.unitBtn, unit === u && s.unitBtnActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[s.unitText, unit === u && s.unitTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef', backgroundColor: '#fff' },
  cancel: { color: '#6c757d', fontSize: 16 },
  title: { fontSize: 17, fontWeight: '600', color: '#1a1a2e' },
  save: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  content: { padding: 20 },
  label: { fontSize: 13, color: '#6c757d', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10, padding: 14, fontSize: 16 },
  unitRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  unitBtn: { borderWidth: 1, borderColor: '#dee2e6', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  unitBtnActive: { borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  unitText: { fontSize: 14, color: '#6c757d' },
  unitTextActive: { color: '#2563eb', fontWeight: '600' },
});
