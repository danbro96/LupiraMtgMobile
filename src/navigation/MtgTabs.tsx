import React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AccountMenu } from '../features/me/AccountMenu';
import { SearchScreen } from '../features/search/SearchScreen';
import { ScanScreen } from '../features/scan/ScanScreen';
import { CollectionsListScreen } from '../features/collections/CollectionsListScreen';
import { MtgTabParamList } from './types';
import { useColors } from '../ui/theme';
import { ICONS } from '../ui/icons';

const Tab = createBottomTabNavigator<MtgTabParamList>();

export function MtgTabs() {
  const c = useColors();
  return (
    <Tab.Navigator
      screenOptions={{
        headerRight: () => <AccountMenu />,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.textMuted,
      }}
    >
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: 'Cards',
          tabBarIcon: ({ color, size }) => <MaterialIcons name={ICONS.search} size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <MaterialIcons name={ICONS.scan} size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Collections"
        component={CollectionsListScreen}
        options={{
          title: 'Collections',
          tabBarIcon: ({ color, size }) => <MaterialIcons name={ICONS.folder} size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
