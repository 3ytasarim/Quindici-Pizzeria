import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { useColors } from '@/hooks/useColors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useLookupReservations,
  useCancelReservation,
} from '@workspace/api-client-react';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

const STATUS_LABELS: Record<string, string> = {
  neu: 'Anfrage eingegangen',
  bestätigt: 'Bestätigt',
  storniert: 'Storniert',
};

const STATUS_COLORS: Record<string, string> = {
  neu: '#c9a96e',
  bestätigt: '#4caf50',
  storniert: '#9e9e9e',
};

export default function MyReservationScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 120 : 100;

  const [email, setEmail] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const {
    data,
    isFetching,
    isError,
    refetch,
  } = useLookupReservations(
    { email: submittedEmail },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { query: { enabled: !!submittedEmail, retry: 1 } as any }
  );

  const { mutate: cancelMutate } = useCancelReservation({
    mutation: {
      onSuccess: (_data, variables) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setCancellingId(null);
        refetch();
      },
      onError: (_err, _variables) => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setCancellingId(null);
        Alert.alert(
          'Fehler',
          'Stornierung konnte nicht durchgeführt werden. Bitte versuchen Sie es erneut.',
        );
      },
    },
  });

  const handleLookup = () => {
    if (!email.trim()) {
      Alert.alert('E-Mail fehlt', 'Bitte geben Sie Ihre E-Mail-Adresse ein.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSubmittedEmail(email.trim());
  };

  const handleCancel = (id: string) => {
    Alert.alert(
      'Reservierung stornieren',
      'Möchten Sie diese Reservierung wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Stornieren',
          style: 'destructive',
          onPress: () => {
            setCancellingId(id);
            cancelMutate({ id, data: { email: submittedEmail } });
          },
        },
      ],
    );
  };

  const reservations = data?.reservations ?? [];

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
        Meine Reservierung
      </Text>
      <Text style={[styles.screenSub, { color: colors.mutedForeground }]}>
        Reservierung nachschlagen oder stornieren
      </Text>

      {/* Email lookup */}
      <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
        E-Mail-Adresse
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
            color: colors.foreground,
          },
        ]}
        value={email}
        onChangeText={setEmail}
        placeholder="max@beispiel.de"
        placeholderTextColor={colors.mutedForeground}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        onSubmitEditing={handleLookup}
        returnKeyType="search"
      />

      <TouchableOpacity
        style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 16 }]}
        onPress={handleLookup}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryBtnText}>Reservierungen suchen</Text>
      </TouchableOpacity>

      {/* Loading */}
      {isFetching && (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.statusText, { color: colors.mutedForeground }]}>
            Reservierungen werden geladen…
          </Text>
        </View>
      )}

      {/* Error */}
      {isError && !isFetching && (
        <View style={[styles.emptyBox, { borderColor: colors.border }]}>
          <Feather name="alert-circle" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Reservierungen konnten nicht geladen werden. Bitte versuchen Sie es erneut.
          </Text>
        </View>
      )}

      {/* Results */}
      {!isFetching && !isError && submittedEmail && reservations.length === 0 && (
        <View style={[styles.emptyBox, { borderColor: colors.border }]}>
          <Feather name="calendar" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Keine Reservierungen für diese E-Mail-Adresse gefunden.
          </Text>
        </View>
      )}

      {!isFetching && reservations.length > 0 && (
        <View style={styles.resultsList}>
          {reservations.map((r) => {
            const isCancelled = r.status === 'storniert';
            const isCancelling = cancellingId === r.id;
            const statusColor = STATUS_COLORS[r.status] ?? colors.mutedForeground;
            const statusLabel = STATUS_LABELS[r.status] ?? r.status;

            return (
              <View
                key={r.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: isCancelled ? 0.6 : 1,
                  },
                ]}
              >
                {/* Status badge */}
                <View style={styles.cardHeader}>
                  <View
                    style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}
                  >
                    <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>

                {/* Reservation details */}
                <View style={styles.detailRow}>
                  <Feather name="calendar" size={15} color={colors.mutedForeground} />
                  <Text style={[styles.detailText, { color: colors.foreground }]}>
                    {r.date}
                  </Text>
                  <Feather
                    name="clock"
                    size={15}
                    color={colors.mutedForeground}
                    style={styles.detailSpacer}
                  />
                  <Text style={[styles.detailText, { color: colors.foreground }]}>
                    {r.time} Uhr
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="users" size={15} color={colors.mutedForeground} />
                  <Text style={[styles.detailText, { color: colors.foreground }]}>
                    {r.guests} {r.guests === '1' ? 'Person' : 'Personen'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Feather name="user" size={15} color={colors.mutedForeground} />
                  <Text style={[styles.detailText, { color: colors.foreground }]}>
                    {r.firstName} {r.lastName}
                  </Text>
                </View>

                {r.notes ? (
                  <View style={styles.detailRow}>
                    <Feather name="message-square" size={15} color={colors.mutedForeground} />
                    <Text
                      style={[styles.detailText, { color: colors.mutedForeground }]}
                      numberOfLines={2}
                    >
                      {r.notes}
                    </Text>
                  </View>
                ) : null}

                {/* Cancel button — only for non-cancelled reservations */}
                {!isCancelled && (
                  <TouchableOpacity
                    style={[
                      styles.cancelBtn,
                      {
                        borderColor: isCancelling ? colors.border : '#e57373',
                        opacity: isCancelling ? 0.6 : 1,
                      },
                    ]}
                    onPress={() => handleCancel(r.id)}
                    disabled={isCancelling}
                    activeOpacity={0.7}
                  >
                    {isCancelling ? (
                      <ActivityIndicator size="small" color="#e57373" />
                    ) : (
                      <>
                        <Feather name="x-circle" size={15} color="#e57373" />
                        <Text style={styles.cancelBtnText}>Stornieren</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>
      )}
    </KeyboardAwareScrollViewCompat>
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
  centerBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
  },
  emptyBox: {
    marginTop: 32,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  resultsList: {
    marginTop: 24,
    gap: 16,
  },
  card: {
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontFamily: 'Quicksand_600SemiBold',
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailSpacer: {
    marginLeft: 12,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Quicksand_400Regular',
    flex: 1,
  },
  cancelBtn: {
    marginTop: 6,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cancelBtnText: {
    fontSize: 13,
    fontFamily: 'Quicksand_600SemiBold',
    color: '#e57373',
    letterSpacing: 0.3,
  },
});
