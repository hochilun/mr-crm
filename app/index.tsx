import { Redirect } from 'expo-router';

export default function Index() {
  // TODO: 檢查登入狀態，已登入導向 tabs，未登入導向 login
  return <Redirect href="/(auth)/login" />;
}
