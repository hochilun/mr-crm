import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal, FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Product, Doctor } from '../../types';

export default function NewUsageScreen() {
  const { doctor_id } = useLocalSearchParams<{ doctor_id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.from('doctors').select('*').eq('id', doctor_id).single()
      .then(({ data }) => { if (data) setDoctor(data); });
    supabase.from('products').select('*').order('name')
      .then(({ data }) => { if (data) setProducts(data); });
  }, [doctor_id]);

  const handleSave = async () => {
    if (!selectedProduct) { Alert.alert('請選擇產品'); return; }
    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) { Alert.alert('請輸入正確的用量'); return; }
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('product_usage').upsert({
      user_id: user!.id,
      doctor_id,
      product_id: selectedProduct.id,
      month: `${month}-01`,
      quantity: qty,
    }, { onConflict: 'doctor_id,product_id,month' });
    setLoading(false);
    if (error) { Alert.alert('儲存失敗', error.message); }
    else { router.back(); }
  };

  const revenue = selectedProduct && quantity ? parseFloat(quantity) * selectedProduct.price : 0;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.cancel}>取消</Text></TouchableOpacity>
        <Text style={s.title}>記錄用量</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#2563eb" /> : <Text style={s.save}>儲存</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.content}>
          {doctor && (
            <View style={s.doctorBanner}>
              <Text style={s.doctorBannerText}>醫師：{doctor.name}</Text>
            </View>
          )}

          <Text style={s.label}>產品 *</Text>
          <TouchableOpacity style={s.selector} onPress={() => setShowProductPicker(true)}>
            <Text style={selectedProduct ? s.selectorText : s.selectorPlaceholder}>
              {selectedProduct ? `${selectedProduct.name}　NT$ ${selectedProduct.price.toLocaleString()} / ${selectedProduct.unit}` : '請選擇產品'}
            </Text>
            <Text style={s.chevron}>›</Text>
          </TouchableOpacity>

          <Text style={s.label}>月份 *</Text>
          <TextInput style={s.input} value={month} onChangeText={setMonth} placeholder="YYYY-MM" />

          <Text style={s.label}>用量（{selectedProduct?.unit ?? '個'}）*</Text>
          <TextInput style={s.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" placeholder="0" />

          {revenue > 0 && (
            <View style={s.revenueBox}>
              <Text style={s.revenueLabel}>預估業績貢獻</Text>
              <Text style={s.revenueValue}>NT$ {revenue.toLocaleString()}</Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showProductPicker} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
          <View style={s.modalHeader}>
            <TouchableOpacity onPress={() => setShowProductPicker(false)}><Text style={s.cancel}>關閉</Text></TouchableOpacity>
            <Text style={s.title}>選擇產品</Text>
            <View style={{ width: 40 }} />
          </View>
          {products.length === 0
            ? <View style={s.emptyBox}><Text style={s.emptyText}>還沒有產品，請先到「我的 → 產品管理」新增</Text></View>
            : <FlatList
                data={products}
                keyExtractor={(i) => i.id}
                contentContainerStyle={{ padding: 16, gap: 8 }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.productItem, selectedProduct?.id === item.id && s.productItemActive]}
                    onPress={() => { setSelectedProduct(item); setShowProductPicker(false); }}
                  >
                    <Text style={s.productName}>{item.name}</Text>
                    <Text style={s.productPrice}>NT$ {item.price.toLocaleString()} / {item.unit}</Text>
                  </TouchableOpacity>
                )}
              />
          }
        </SafeAreaView>
      </Modal>
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
  doctorBanner: { backgroundColor: '#eff6ff', borderRadius: 10, padding: 12, marginBottom: 4 },
  doctorBannerText: { color: '#2563eb', fontSize: 14, fontWeight: '600' },
  label: { fontSize: 13, color: '#6c757d', marginBottom: 6, marginTop: 14 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10, padding: 14, fontSize: 16 },
  selector: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#dee2e6', borderRadius: 10, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectorText: { fontSize: 16, color: '#1a1a2e', flex: 1 },
  selectorPlaceholder: { fontSize: 16, color: '#adb5bd', flex: 1 },
  chevron: { fontSize: 18, color: '#9ca3af' },
  revenueBox: { backgroundColor: '#f0fdf4', borderRadius: 12, padding: 16, marginTop: 20, alignItems: 'center' },
  revenueLabel: { fontSize: 13, color: '#059669', marginBottom: 4 },
  revenueValue: { fontSize: 28, fontWeight: 'bold', color: '#059669' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef', backgroundColor: '#fff' },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { color: '#9ca3af', textAlign: 'center', fontSize: 14, lineHeight: 22 },
  productItem: { backgroundColor: '#fff', borderRadius: 10, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  productItemActive: { borderWidth: 1.5, borderColor: '#2563eb', backgroundColor: '#eff6ff' },
  productName: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  productPrice: { fontSize: 13, color: '#6c757d', marginTop: 2 },
});
