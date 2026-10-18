import { QueryClient } from '@tanstack/react-query';
import { connectOnlineManager } from '@danbro96/lupira-expo-query/online';

connectOnlineManager();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
