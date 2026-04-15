/**
 * Komponenta pro zobrazení hvězdičkového hodnocení nebo "DNF".
 *   hodnoceni == 0  →  "DNF" (červeně)
 *   hodnoceni 1–5   →  hvězdičky ★★★☆☆
 */
import React from 'react';
import { Text, StyleSheet } from 'react-native';

export default function RatingDisplay({ hodnoceni, style }) {
  if (Number(hodnoceni) === 0) {
    return <Text style={[styles.dnf, style]}>DNF</Text>;
  }

  const filled = Math.min(5, Math.max(0, Number(hodnoceni)));
  const stars = '★'.repeat(filled) + '☆'.repeat(5 - filled);

  return <Text style={[styles.stars, style]}>{stars}</Text>;
}

const styles = StyleSheet.create({
  dnf: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 13,
  },
  stars: {
    color: '#f39c12',
    fontSize: 15,
    letterSpacing: 1,
  },
});
