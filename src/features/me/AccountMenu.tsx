import { AccountButton } from '@danbro96/lupira-expo-paper/components/AccountButton';
import { useAuth } from '../../store/auth-store';

export function AccountMenu() {
  const user = useAuth(s => s.user);
  return <AccountButton name={user?.displayName ?? user?.sub ?? 'Account'} />;
}
