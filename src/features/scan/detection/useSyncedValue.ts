import { useState } from 'react';
import { createSynchronizable, type Synchronizable } from 'react-native-worklets';

/**
 * Bridges the old `useSharedValue` ergonomics from worklets-core to Software Mansion's
 * `react-native-worklets` `Synchronizable` model. Reads use `.getDirty()` from both the JS and worklet threads
 * (fast, possibly slightly stale — `getBlocking` is for strict cross-runtime reads, unnecessary for our single
 * camera thread + JS thread pattern); writes use `.setBlocking(value)`. Created lazily via useState so the
 * underlying native object survives re-renders.
 */
export function useSyncedValue<T>(initial: T): Synchronizable<T> {
  const [synced] = useState(() => createSynchronizable<T>(initial));
  return synced;
}
