import * as SecureStore from 'expo-secure-store';
import { breadcrumb, type BreadcrumbCategory } from '../observability/breadcrumb';

export function deleteOrLog(key: string, category: BreadcrumbCategory): Promise<void> {
  return SecureStore.deleteItemAsync(key).catch((e: unknown) => {
    breadcrumb(category, 'persist-error', { key, detail: e instanceof Error ? e.message : String(e) }, 'warning');
  });
}
