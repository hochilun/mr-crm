import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const name = user?.user_metadata?.full_name ?? '業務';
  const email = user?.email ?? '';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.content}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>{name.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={s.name}>{name}</Text>
        <Text style={s.email}>{email}</Text>

        <View style={s.section}>
          <TouchableOpacity style={s.row} onPress={() => router.push('/product/index')}>
            <Text style={s.rowText}>💊 產品管理</Text>
            <Text style={s.arrow}>›</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={s.logoutButton} onPress={handleLogout}>
          <Text style={s.logoutText}>登出</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  avatarText: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  email: { fontSize: 14, color: '#6c757d', marginTop: 4, marginBottom: 32 },
  section: { width: '100%', backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  rowText: { fontSize: 16, color: '#1a1a2e' },
  arrow: { fontSize: 18, color: '#9ca3af' },
  logoutButton: { width: '100%', backgroundColor: '#fff', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
});
