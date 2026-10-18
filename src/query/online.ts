import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

export function wireOnlineManager() {
  onlineManager.setEventListener(setOnline =>
    NetInfo.addEventListener(s => setOnline(s.isInternetReachable ?? s.isConnected ?? true)),
  );
}

export function useOnline(): boolean {
  return useSyncExternalStore(onlineManager.subscribe, () => onlineManager.isOnline());
}
