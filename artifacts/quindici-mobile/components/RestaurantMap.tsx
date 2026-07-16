import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';

interface Props {
  lat: number;
  lng: number;
  title: string;
}

// Web fallback — react-native-maps doesn't work on web
export function RestaurantMap({ lat, lng, title }: Props) {
  const colors = useColors();
  const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.muted }]}>
      <Feather name="map" size={32} color={colors.mutedForeground} />
      <Text style={[styles.label, { color: colors.mutedForeground }]}>
        {title}
      </Text>
      <TouchableOpacity
        style={[styles.btn, { borderColor: colors.primary }]}
        onPress={() => Linking.openURL(mapsUrl)}
      >
        <Text style={[styles.btnText, { color: colors.primary }]}>
          In Google Maps öffnen
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Quicksand_500Medium',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  btn: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  btnText: {
    fontSize: 13,
    fontFamily: 'Quicksand_600SemiBold',
  },
});
