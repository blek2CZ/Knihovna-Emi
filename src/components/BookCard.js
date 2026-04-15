/**
 * Karta jedné knihy v seznamu.
 * Zobrazuje: název, autor, umístění, formát a hodnocení.
 * Obsahuje tlačítka pro úpravu a smazání.
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RatingDisplay from './RatingDisplay';

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
  const formatLabel = FORMAT_LABELS[book.format] || book.format;
  const formatColor = FORMAT_COLORS[book.format] || '#888';

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        {/* Název knihy */}
        <Text style={styles.title} numberOfLines={2}>
          {book.nazev_cz}
        </Text>

        {/* Autor */}
        <Text style={styles.author} numberOfLines={1}>
          {book.autor}
        </Text>

        {/* Umístění a formát */}
        <View style={styles.meta}>
          <Text style={styles.location}>📍 {book.umisteni}</Text>
          <View style={[styles.formatBadge, { backgroundColor: formatColor }]}>
            <Text style={styles.formatText}>{formatLabel}</Text>
          </View>
        </View>

        {/* Hodnocení */}
        <RatingDisplay hodnoceni={book.hodnoceni} />
      </View>

      {/* Akce: upravit / smazat */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onEdit(book)}
          accessibilityLabel="Upravit knihu"
        >
          <Text style={styles.actionIcon}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onDelete(book)}
          accessibilityLabel="Smazat knihu"
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    // Stín pro Android
    elevation: 2,
    // Stín pro iOS / web
    shadowColor: '#000',
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
    color: '#222',
    marginBottom: 2,
  },
  author: {
    fontSize: 13,
    color: '#555',
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
    color: '#666',
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
