import React from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Paw, Verified } from '../icons';
import { BookingRow, fetchMyBookings, subscribeMyBookings } from '../supabase';
import { colors, fonts, shadows, type } from '../theme';

export function MyWalks({ onClose }: { onClose: () => void }) {
  const [rows, setRows] = React.useState<BookingRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [flashId, setFlashId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetchMyBookings().then((data) => {
      if (alive) {
        setRows(data);
        setLoading(false);
      }
    });
    const unsub = subscribeMyBookings((row) => {
      setRows((prev) => (prev.some((r) => r.id === row.id) ? prev : [row, ...prev]));
      setFlashId(row.id);
      setTimeout(() => setFlashId((id) => (id === row.id ? null : id)), 2200);
    });
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={type.screenTitleSm}>My walks</Text>
        <View style={styles.headerRight}>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live</Text>
          </View>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>Close</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <Text style={styles.muted}>Loading…</Text>
        ) : rows.length === 0 ? (
          <View style={styles.empty}>
            <Paw size={40} color={colors.cream300} />
            <Text style={styles.emptyTitle}>No walks yet</Text>
            <Text style={styles.emptyDesc}>Book a walk and it’ll show up here — live.</Text>
          </View>
        ) : (
          rows.map((r) => <WalkCard key={r.id} row={r} flash={flashId === r.id} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function WalkCard({ row, flash }: { row: BookingRow; flash: boolean }) {
  const glow = React.useRef(new Animated.Value(flash ? 1 : 0)).current;
  React.useEffect(() => {
    if (flash) {
      glow.setValue(1);
      Animated.timing(glow, { toValue: 0, duration: 2000, useNativeDriver: false }).start();
    }
  }, [flash]);
  const borderColor = glow.interpolate({ inputRange: [0, 1], outputRange: [colors.line, colors.terracotta] });

  return (
    <Animated.View style={[styles.card, { borderColor }]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{row.sitter_name[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={styles.sitter}>{row.sitter_name}</Text>
          <Verified size={14} color={colors.sage} />
        </View>
        <View style={styles.metaRow}>
          <Calendar size={13} color={colors.inkSoft} />
          <Text style={styles.meta}>
            {row.dow}, Jun {row.day} · {row.time} · {row.duration} min
          </Text>
        </View>
        <Text style={styles.dog}>{row.dog_breed ? `${row.dog_name} · ${row.dog_breed}` : row.dog_name}</Text>
      </View>
      <Text style={styles.total}>${row.total}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingVertical: 12 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.sage100, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 11 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.live },
  liveText: { fontFamily: fonts.body800, fontSize: 11, color: colors.sage600, letterSpacing: 0.3 },
  close: { fontFamily: fonts.body800, fontSize: 14, color: colors.muted },
  list: { paddingHorizontal: 18, paddingTop: 6, paddingBottom: 24, gap: 12 },
  muted: { fontFamily: fonts.body600, fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 30 },
  empty: { alignItems: 'center', marginTop: 70, gap: 8 },
  emptyTitle: { fontFamily: fonts.display700, fontSize: 18, color: colors.ink, marginTop: 6 },
  emptyDesc: { fontFamily: fonts.body600, fontSize: 14, color: colors.inkSoft, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 18,
    padding: 14,
    ...shadows.soft,
  },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.coral100, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: fonts.display700, fontSize: 18, color: colors.terracotta600 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sitter: { fontFamily: fonts.display700, fontSize: 16, color: colors.ink },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  meta: { fontFamily: fonts.body600, fontSize: 12.5, color: colors.inkSoft },
  dog: { fontFamily: fonts.body700, fontSize: 12.5, color: colors.muted, marginTop: 3 },
  total: { fontFamily: fonts.display800, fontSize: 18, color: colors.terracotta600 },
});
