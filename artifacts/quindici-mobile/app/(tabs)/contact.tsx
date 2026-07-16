import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import { RestaurantMap } from '@/components/RestaurantMap';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

const RESTAURANT = {
  name: 'Quindici Trattoria Pizzeria',
  address: 'Musterstraße 15, 12345 Musterstadt',
  phone: '+49 123 456 7890',
  email: 'info@quindici.de',
  lat: 48.1351,
  lng: 11.582,
};

const HOURS = [
  { day: 'Montag', time: 'Ruhetag' },
  { day: 'Dienstag – Freitag', time: '11:30 – 14:30 · 17:30 – 22:00' },
  { day: 'Samstag', time: '12:00 – 22:30' },
  { day: 'Sonntag', time: '12:00 – 21:30' },
];

export default function ContactScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : 100;

  const openMaps = () => {
    const query = encodeURIComponent(RESTAURANT.address);
    const url =
      Platform.OS === 'ios'
        ? `maps://?q=${query}`
        : `geo:0,0?q=${query}`;
    Linking.openURL(url).catch(() =>
      Linking.openURL(
        `https://maps.google.com/?q=${query}`,
      ),
    );
  };

  const openPhone = () => Linking.openURL(`tel:${RESTAURANT.phone}`);
  const openEmail = () => Linking.openURL(`mailto:${RESTAURANT.email}`);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad + 20,
        paddingBottom: bottomPad,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.screenTitle, { color: colors.foreground, paddingHorizontal: 20 }]}>
        Kontakt
      </Text>

      {/* Map */}
      <View style={[styles.mapContainer, { borderColor: colors.border }]}>
        <RestaurantMap
          lat={RESTAURANT.lat}
          lng={RESTAURANT.lng}
          title={RESTAURANT.name}
        />
      </View>

      {/* Info cards */}
      <View style={[styles.section, { paddingHorizontal: 20 }]}>
        {/* Address */}
        <TouchableOpacity
          style={[styles.infoRow, { borderBottomColor: colors.border }]}
          onPress={openMaps}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
            <Feather name="map-pin" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              Adresse
            </Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {RESTAURANT.address}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Phone */}
        <TouchableOpacity
          style={[styles.infoRow, { borderBottomColor: colors.border }]}
          onPress={openPhone}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
            <Feather name="phone" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              Telefon
            </Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {RESTAURANT.phone}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {/* Email */}
        <TouchableOpacity
          style={[styles.infoRow, { borderBottomColor: 'transparent' }]}
          onPress={openEmail}
          activeOpacity={0.7}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
            <Feather name="mail" size={18} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>
              E-Mail
            </Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>
              {RESTAURANT.email}
            </Text>
          </View>
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      {/* Directions button */}
      <View style={{ paddingHorizontal: 20, marginTop: 4 }}>
        <TouchableOpacity
          style={[styles.directionsBtn, { backgroundColor: colors.primary }]}
          onPress={openMaps}
          activeOpacity={0.8}
        >
          <Feather name="navigation" size={18} color="#FFFFFF" />
          <Text style={styles.directionsBtnText}>Route starten</Text>
        </TouchableOpacity>
      </View>

      {/* Opening hours */}
      <View style={{ paddingHorizontal: 20, marginTop: 28 }}>
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          Öffnungszeiten
        </Text>
        <View style={[styles.hoursCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {HOURS.map((h, i) => (
            <View
              key={h.day}
              style={[
                styles.hoursRow,
                i < HOURS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
              ]}
            >
              <Text style={[styles.hoursDay, { color: colors.mutedForeground }]}>
                {h.day}
              </Text>
              <Text
                style={[
                  styles.hoursTime,
                  {
                    color:
                      h.time === 'Ruhetag' ? colors.mutedForeground : colors.foreground,
                    fontStyle: h.time === 'Ruhetag' ? 'italic' : 'normal',
                  },
                ]}
              >
                {h.time}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    letterSpacing: 1,
    marginBottom: 16,
  },
  mapContainer: {
    marginHorizontal: 20,
    height: 180,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  map: {
    flex: 1,
  },
  section: {
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: 'Quicksand_500Medium',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    marginTop: 16,
  },
  directionsBtnText: {
    fontSize: 15,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Quicksand_600SemiBold',
    marginBottom: 12,
  },
  hoursCard: {
    borderWidth: 1,
  },
  hoursRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  hoursDay: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    flex: 1,
  },
  hoursTime: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    textAlign: 'right',
    flex: 1,
  },
});
