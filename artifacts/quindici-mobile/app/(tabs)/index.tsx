import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const LOGO_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/logo.png`;

interface QuickCardProps {
  icon: string;
  title: string;
  subtitle: string;
  onPress: () => void;
  primary?: boolean;
}

function QuickCard({ icon, title, subtitle, onPress, primary }: QuickCardProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[
        styles.card,
        primary
          ? { backgroundColor: colors.primary }
          : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <Feather
        name={icon as any}
        size={26}
        color={primary ? '#FFFFFF' : colors.primary}
      />
      <Text
        style={[
          styles.cardTitle,
          { color: primary ? '#FFFFFF' : colors.foreground },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.cardSub,
          { color: primary ? 'rgba(255,255,255,0.8)' : colors.mutedForeground },
        ]}
      >
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : 100;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: topPad + 28, paddingBottom: bottomPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: LOGO_URL }}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.name, { color: colors.foreground }]}>Quindici</Text>
        <Text style={[styles.sub, { color: colors.mutedForeground }]}>
          Trattoria · Pizzeria
        </Text>
        <View style={[styles.rule, { backgroundColor: colors.primary }]} />
        <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
          Authentische italienische Küche – herzlich willkommen
        </Text>
      </View>

      {/* Divider */}
      <View style={[styles.sectionDivider, { backgroundColor: colors.border }]} />

      {/* Quick-access cards */}
      <View style={styles.cards}>
        <QuickCard
          icon="book-open"
          title="Speisekarte"
          subtitle="Pizza, Pasta & Gerichte"
          onPress={() => router.push('/(tabs)/menu')}
        />
        <QuickCard
          icon="calendar"
          title="Reservierung"
          subtitle="Jetzt einen Tisch buchen"
          onPress={() => router.push('/(tabs)/reserve')}
          primary
        />
        <QuickCard
          icon="map-pin"
          title="Kontakt"
          subtitle="Anfahrt & Öffnungszeiten"
          onPress={() => router.push('/(tabs)/contact')}
        />
      </View>

      {/* Footer note */}
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>
        Wir freuen uns auf Ihren Besuch
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 28,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 20,
  },
  name: {
    fontSize: 44,
    fontFamily: 'Quicksand_700Bold',
    letterSpacing: 5,
    marginBottom: 6,
  },
  sub: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  rule: {
    width: 40,
    height: 2,
    marginBottom: 20,
  },
  tagline: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    textAlign: 'center',
    lineHeight: 22,
  },
  sectionDivider: {
    height: 1,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  cards: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    padding: 22,
    gap: 6,
  },
  cardTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    marginTop: 6,
  },
  cardSub: {
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
  },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    fontFamily: 'Quicksand_400Regular',
    fontStyle: 'italic',
    marginTop: 32,
    paddingHorizontal: 20,
  },
});
