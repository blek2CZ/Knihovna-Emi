/**
 * Karta jedné knihy v seznamu.
 * Zobrazuje: název, autor, umístění, formát a hodnocení.
 * Obsahuje tlačítka pro úpravu a smazání.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RatingDisplay from './RatingDisplay';
import { useTheme } from '../context/ThemeContext';

// Popisky formátů v češtině
const FORMAT_LABELS = {
  fyzicka: 'Fyzická',
  audio: 'Audio',
  ekniha: 'E-kniha',
};

// Barvy štítků formátů
const FORMAT_COLORS = {
  fyzicka: '#27ae60',
  audio: '#8e44ad',
  ekniha: '#2980b9',
};

export default function BookCard({ book, onEdit, onDelete }) {
  const { colors } = useTheme();
  const formatLabel = FORMAT_LABELS[book.format] || book.format;
  const formatColor = FORMAT_COLORS[book.format] || '#888';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder, shadowColor: colors.shadow }]}>
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {book.nazev_cz}
        </Text>
        <Text style={[styles.author, { color: colors.textSub }]} numberOfLines={1}>
          {book.autor}
        </Text>
        <View style={styles.meta}>
          <Text style={[styles.location, { color: colors.textMuted }]}>📍 {book.umisteni}</Text>
          <View style={[styles.formatBadge, { backgroundColor: formatColor }]}>
            <Text style={styles.formatText}>{formatLabel}</Text>
          </View>
        </View>
        <RatingDisplay hodnoceni={book.hodnoceni} />
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onEdit(book)} accessibilityLabel="Upravit knihu">
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onDelete(book)} accessibilityLabel="Smazat knihu">
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    elevation: 2,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  author: {
    fontSize: 13,
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  location: {
    fontSize: 12,
  },
  formatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  formatText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingLeft: 8,
    gap: 4,
  },
  actionBtn: {
    padding: 6,
  },
  actionIcon: {
    fontSize: 20,
  },
});
