import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  FlatList, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Product } from '../../types';

export default function ProductListScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name');
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts().finally(() => setLoading(false)); }, []);

  const onRefresh = async () => { setRefreshing(true); await fetchProducts(); setRefreshing(false); };

  const handleDelete = (id: string, name: string) => {
    Alert.alert(`刪除「${name}」？`, '相關的用量紀錄也會一併刪除。', [
      { text: '取消', style: 'cancel' },
      { text: '刪除', style: 'destructive', onPress: async () => {
        await supabase.from('products').delete().eq('id', id);
        setProducts((prev) => prev.filter((p) => p.id !== id));
      }},
    ]);
  };

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator style={{ flex: 1 }} color="#2563eb" /></SafeAreaView>;

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={s.back}>‹ 返回</Text></TouchableOpacity>
        <Text style={s.title}>產品管理</Text>
        <TouchableOpacity onPress={() => router.push('/product/new')}><Text style={s.add}>＋ 新增</Text></TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={(i) => i.id}
        contentContainerStyle={products.length === 0 ? s.emptyContainer : s.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>💊</Text>
            <Text style={s.emptyTitle}>還沒有產品</Text>
            <Text style={s.emptyText}>點右上角「新增」加入你負責的產品</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardLeft}>
              <Text style={s.productName}>{item.name}</Text>
              <Text style={s.productPrice}>NT$ {item.price.toLocaleString()} / {item.unit}</Text>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.id, item.name)}>
              <Text style={s.deleteBtn}>刪除</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e9ecef', backgroundColor: '#fff' },
  back: { color: '#2563eb', fontSize: 16 },
  title: { fontSize: 17, fontWeight: '600', color: '#1a1a2e' },
  add: { color: '#2563eb', fontSize: 16, fontWeight: '600' },
  list: { padding: 16, gap: 8 },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyBox: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: '600', color: '#1a1a2e', marginBottom: 6 },
  emptyText: { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardLeft: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  productPrice: { fontSize: 13, color: '#6c757d', marginTop: 2 },
  deleteBtn: { color: '#ef4444', fontSize: 14 },
});
