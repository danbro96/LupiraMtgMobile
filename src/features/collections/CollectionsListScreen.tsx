import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  listCollections,
  createCollection,
} from '../../api/generated/collections/collections';
import type {
  CollectionDto,
} from '../../api/generated/models';
import { MtgTabParamList, RootStackParamList } from '../../navigation/types';
import { Button } from '@danbro96/lupira-expo-paper/components/Button';
import { TextField } from '@danbro96/lupira-expo-paper/components/TextField';
import { Screen } from '@danbro96/lupira-expo-paper/components/Screen';
import { StatusBanner } from '@danbro96/lupira-expo-paper/components/StatusBanner';
import { offlineBannerState } from '@danbro96/lupira-expo-paper/status';
import { cardSurface, spacing, useColors, type Palette } from '../../ui/theme';
import { ICONS } from '../../ui/icons';
import { useOnline } from '../../query/online';
import { toastError } from '@danbro96/lupira-expo-feedback/toast';

type Nav = CompositeNavigationProp<BottomTabNavigationProp<MtgTabParamList, 'Collections'>, NativeStackNavigationProp<RootStackParamList>>;

export function CollectionsListScreen() {
  const navigation = useNavigation<Nav>();
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const c = useColors();
  const online = useOnline();
  const styles = makeStyles(c);

  const collections = useQuery({
    queryKey: ['collections'],
    queryFn: () => listCollections(),
  });

  const create = useMutation<CollectionDto, Error, string>({
    mutationFn: (name: string) => createCollection({ name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['collections'] });
      setNewName('');
    },
    onError: (e: Error) => toastError(`Create failed: ${e.message}`),
  });

  return (
    <Screen banner={<StatusBanner state={offlineBannerState(online)} />}>
      <View style={styles.createRow}>
        <TextField
          style={styles.grow}
          value={newName}
          onChangeText={setNewName}
          placeholder="New collection name"
          maxLength={64}
        />
        <Button
          title="Create"
          onPress={() => create.mutate(newName.trim())}
          disabled={!newName.trim()}
          loading={create.isPending}
          style={styles.createButton}
        />
      </View>

      {collections.isError ? (
        <Text variant="bodyMedium" style={styles.errorText}>{(collections.error as Error).message}</Text>
      ) : null}

      <FlatList
        data={collections.data ?? []}
        keyExtractor={col => col.id}
        renderItem={({ item }) => (
          <Row
            collection={item}
            styles={styles}
            palette={c}
            onPress={() => navigation.navigate('CollectionDetail', { collectionId: item.id })}
          />
        )}
        ListEmptyComponent={
          collections.isLoading ? (
            <ActivityIndicator style={styles.center} />
          ) : (
            <Text variant="bodyMedium" style={styles.emptyText}>No collections yet. Create one above or commit a scan selection.</Text>
          )
        }
        contentContainerStyle={styles.list}
        refreshing={collections.isFetching && !collections.isLoading}
        onRefresh={() => collections.refetch()}
      />
    </Screen>
  );
}

function Row({
  collection,
  styles,
  palette,
  onPress,
}: {
  collection: CollectionDto;
  styles: ReturnType<typeof makeStyles>;
  palette: Palette;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View style={styles.rowText}>
        <Text variant="titleMedium" style={styles.rowName}>{collection.name}</Text>
        <Text variant="bodySmall" style={styles.rowMeta}>{collection.cardCount} card(s)</Text>
      </View>
      <MaterialIcons name={ICONS.chevronRight} size={24} color={palette.textSubtle} />
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    createRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.lg },
    grow: { flex: 1 },
    createButton: { justifyContent: 'center' },
    list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.sm },
    row: { ...cardSurface(c), flexDirection: 'row', alignItems: 'center' },
    rowText: { flex: 1, gap: 2 },
    rowName: { color: c.text },
    rowMeta: { color: c.textMuted },
    emptyText: { color: c.textSubtle, textAlign: 'center', padding: spacing.xl },
    errorText: { color: c.danger, padding: spacing.lg },
    center: { padding: spacing.xl, alignItems: 'center' },
  });
