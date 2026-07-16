import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useListPizza, useListDishes } from '@workspace/api-client-react';
import { Feather } from '@expo/vector-icons';

type MenuTab = 'pizza' | 'gerichte';

function getImageUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `https://${process.env.EXPO_PUBLIC_DOMAIN}${url}`;
}

export default function MenuScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<MenuTab>('pizza');

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : 100;

  const {
    data: pizzaList,
    isLoading: pizzaLoading,
    error: pizzaError,
    refetch: refetchPizza,
  } = useListPizza();
  const {
    data: dishesList,
    isLoading: dishesLoading,
    error: dishesError,
    refetch: refetchDishes,
  } = useListDishes();

  const isLoading = activeTab === 'pizza' ? pizzaLoading : dishesLoading;
  const hasError = activeTab === 'pizza' ? !!pizzaError : !!dishesError;
  const refetch = activeTab === 'pizza' ? refetchPizza : refetchDishes;

  const items =
    activeTab === 'pizza'
      ? (pizzaList ?? []).map((p) => ({
          id: p.id,
          title: p.label,
          desc: '',
          imageUrl: p.imageUrl,
        }))
      : (dishesList ?? []).map((d) => ({
          id: d.id,
          title: d.name,
          desc: d.desc ?? '',
          imageUrl: d.imageUrl ?? '',
        }));

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 20,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Speisekarte
        </Text>

        {/* Segment control */}
        <View style={styles.segment}>
          {(['pizza', 'gerichte'] as MenuTab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.segmentBtn,
                {
                  backgroundColor:
                    activeTab === tab ? colors.primary : 'transparent',
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.segmentText,
                  {
                    color:
                      activeTab === tab ? '#FFFFFF' : colors.mutedForeground,
                  },
                ]}
              >
                {tab === 'pizza' ? 'Pizza' : 'Gerichte'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Laden…
          </Text>
        </View>
      ) : hasError ? (
        <View style={styles.center}>
          <Feather name="alert-circle" size={36} color={colors.mutedForeground} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Laden fehlgeschlagen
          </Text>
          <TouchableOpacity
            style={[styles.retryBtn, { borderColor: colors.primary }]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Erneut versuchen
            </Text>
          </TouchableOpacity>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={36} color={colors.mutedForeground} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Keine Einträge
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            { paddingBottom: bottomPad },
          ]}
          scrollEnabled={items.length > 0}
          onRefresh={refetch}
          refreshing={isLoading}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.border }]} />
          )}
          renderItem={({ item }) => (
            <View
              style={[
                styles.menuItem,
                { backgroundColor: colors.card },
              ]}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: getImageUrl(item.imageUrl) }}
                  style={styles.menuImage}
                  contentFit="cover"
                  transition={300}
                />
              ) : (
                <View
                  style={[
                    styles.menuImagePlaceholder,
                    { backgroundColor: colors.muted },
                  ]}
                >
                  <Feather
                    name="image"
                    size={22}
                    color={colors.mutedForeground}
                  />
                </View>
              )}
              <View style={styles.menuInfo}>
                <Text
                  style={[styles.menuTitle, { color: colors.foreground }]}
                >
                  {item.title}
                </Text>
                {!!item.desc && (
                  <Text
                    style={[styles.menuDesc, { color: colors.mutedForeground }]}
                    numberOfLines={2}
                  >
                    {item.desc}
                  </Text>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    gap: 14,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    letterSpacing: 1,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  segmentText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
    letterSpacing: 0.5,
  },
  list: {
    paddingTop: 0,
  },
  separator: {
    height: 1,
    marginHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  menuImage: {
    width: 80,
    height: 80,
    marginRight: 14,
  },
  menuImagePlaceholder: {
    width: 80,
    height: 80,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuInfo: {
    flex: 1,
    gap: 4,
  },
  menuTitle: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
  },
  menuDesc: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    lineHeight: 19,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 15,
    fontFamily: 'Quicksand_500Medium',
  },
  retryBtn: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
  },
  retryText: {
    fontSize: 14,
    fontFamily: 'Quicksand_600SemiBold',
  },
});
