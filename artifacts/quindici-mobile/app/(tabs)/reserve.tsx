import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateReservation } from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30',
  '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30',
];
const GUEST_OPTIONS = ['1', '2', '3', '4', '5', '6', '7', '8+'];

export default function ReserveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : 100;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [guests, setGuests] = useState('2');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending } = useCreateReservation({
    mutation: {
      onSuccess: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSubmitted(true);
      },
      onError: () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          'Fehler',
          'Reservierung konnte nicht übermittelt werden. Bitte versuchen Sie es erneut.',
        );
      },
    },
  });

  const handleSubmit = () => {
    if (!firstName || !lastName || !email || !phone || !date || !time) {
      Alert.alert(
        'Pflichtfelder',
        'Bitte füllen Sie alle mit * markierten Felder aus.',
      );
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    mutate({
      data: { firstName, lastName, email, phone, date, time, guests, notes },
    });
  };

  const handleReset = () => {
    setSubmitted(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setDate('');
    setTime('');
    setGuests('2');
    setNotes('');
  };

  if (submitted) {
    return (
      <View
        style={[
          styles.successContainer,
          { backgroundColor: colors.background, paddingTop: topPad },
        ]}
      >
        <View style={[styles.successIconWrap, { backgroundColor: colors.primary }]}>
          <Feather name="check" size={40} color="#FFFFFF" />
        </View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>
          Vielen Dank!
        </Text>
        <Text style={[styles.successText, { color: colors.mutedForeground }]}>
          Ihre Reservierungsanfrage wurde erfolgreich übermittelt. Wir bestätigen
          Ihre Reservierung per E-Mail.
        </Text>
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Neue Reservierung</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{
        paddingTop: topPad + 20,
        paddingHorizontal: 20,
        paddingBottom: bottomPad,
      }}
      keyboardShouldPersistTaps="handled"
      bottomOffset={20}
    >
      <Text style={[styles.screenTitle, { color: colors.foreground }]}>
        Reservierung
      </Text>
      <Text style={[styles.screenSub, { color: colors.mutedForeground }]}>
        Tisch reservieren
      </Text>

      {/* Name row */}
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Vorname *" colors={colors} />
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
            ]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Max"
            placeholderTextColor={colors.mutedForeground}
            autoCorrect={false}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Nachname *" colors={colors} />
          <TextInput
            style={[
              styles.input,
              { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
            ]}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Mustermann"
            placeholderTextColor={colors.mutedForeground}
            autoCorrect={false}
          />
        </View>
      </View>

      <FieldLabel label="E-Mail *" colors={colors} />
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
        ]}
        value={email}
        onChangeText={setEmail}
        placeholder="max@beispiel.de"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <FieldLabel label="Telefon *" colors={colors} />
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
        ]}
        value={phone}
        onChangeText={setPhone}
        placeholder="+49 123 456789"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="phone-pad"
      />

      <FieldLabel label="Datum *" colors={colors} />
      <TextInput
        style={[
          styles.input,
          { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
        ]}
        value={date}
        onChangeText={setDate}
        placeholder="TT.MM.JJJJ"
        placeholderTextColor={colors.mutedForeground}
      />

      <FieldLabel label="Uhrzeit *" colors={colors} />
      <View style={styles.chipGrid}>
        {TIME_SLOTS.map((t) => {
          const selected = time === t;
          return (
            <TouchableOpacity
              key={t}
              style={[
                styles.timeChip,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setTime(t)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? '#FFFFFF' : colors.foreground },
                ]}
              >
                {t}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FieldLabel label="Personen *" colors={colors} />
      <View style={styles.chipGrid}>
        {GUEST_OPTIONS.map((g) => {
          const selected = guests === g;
          return (
            <TouchableOpacity
              key={g}
              style={[
                styles.guestChip,
                {
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.primary : colors.card,
                },
              ]}
              onPress={() => setGuests(g)}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? '#FFFFFF' : colors.foreground },
                ]}
              >
                {g}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FieldLabel label="Anmerkungen" colors={colors} />
      <TextInput
        style={[
          styles.textArea,
          { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground },
        ]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Allergien, besondere Wünsche…"
        placeholderTextColor={colors.mutedForeground}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[
          styles.primaryBtn,
          {
            backgroundColor: isPending ? colors.muted : colors.primary,
            marginTop: 28,
          },
        ]}
        onPress={handleSubmit}
        disabled={isPending}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.primaryBtnText,
            { color: isPending ? colors.mutedForeground : '#FFFFFF' },
          ]}
        >
          {isPending ? 'Wird übermittelt…' : 'Reservierung anfragen'}
        </Text>
      </TouchableOpacity>
    </KeyboardAwareScrollViewCompat>
  );
}

function FieldLabel({
  label,
  colors,
}: {
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
    letterSpacing: 1,
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Quicksand_400Regular',
  },
  textArea: {
    borderWidth: 1,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Quicksand_400Regular',
    minHeight: 90,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  guestChip: {
    borderWidth: 1,
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'Quicksand_500Medium',
  },
  primaryBtn: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontFamily: 'Quicksand_600SemiBold',
    letterSpacing: 0.5,
    color: '#FFFFFF',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  successIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 28,
    fontFamily: 'Quicksand_700Bold',
  },
  successText: {
    fontSize: 15,
    fontFamily: 'Quicksand_400Regular',
    textAlign: 'center',
    lineHeight: 24,
  },
});
