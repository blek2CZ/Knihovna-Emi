/**
 * Hlavní obrazovka – seznam všech knih.
 * Funkce: vyhledávání (název/autor), filtr dle formátu, řazení, FAB pro přidání.
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getBooks, deleteBook } from '../services/storage';
import BookCard from '../components/BookCard';
import ConfirmModal from '../components/ConfirmModal';

// Možnosti filtru podle formátu
const FORMAT_OPTIONS = [
  { label: 'Vše', value: 'all' },
  { label: 'Fyzická', value: 'fyzicka' },
  { label: 'Audio', value: 'audio' },
  { label: 'E-kniha', value: 'ekniha' },
];

// Možnosti řazení
const SORT_OPTIONS = [
  { label: 'Název', value: 'nazev_cz' },
  { label: 'Autor', value: 'autor' },
  { label: 'Umístění', value: 'umisteni' },
];

export default function HomeScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [filterFormat, setFilterFormat] = useState('all');
  const [sortBy, setSortBy] = useState('nazev_cz');
  const [deleteTarget, setDeleteTarget] = useState(null); // kniha ke smazání
  const [loading, setLoading] = useState(true);

  // Načíst knihy vždy při přechodu na tuto obrazovku (např. po přidání/editaci)
  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  async function loadBooks() {
    setLoading(true);
    const data = await getBooks();
    setBooks(data);
    setLoading(false);
  }

  // Filtrovat a řadit knihy dle stavu
  const filteredBooks = books
    .filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        b.nazev_cz.toLowerCase().includes(q) ||
        b.autor.toLowerCase().includes(q);
      const matchFormat = filterFormat === 'all' || b.format === filterFormat;
      return matchSearch && matchFormat;
    })
    .sort((a, b) => {
      const aVal = (a[sortBy] || '').toLowerCase();
      const bVal = (b[sortBy] || '').toLowerCase();
      return aVal.localeCompare(bVal, 'cs');
    });

  // Provede smazání po potvrzení v modálním dialogu
  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteBook(deleteTarget.id);
    setDeleteTarget(null);
    loadBooks();
  }

  // Pomocná funkce pro český tvar slova "kniha"
  function bookCountLabel(count) {
    if (count === 1) return '1 kniha';
    if (count >= 2 && count <= 4) return `${count} knihy`;
    return `${count} knih`;
  }

  return (
    <View style={styles.container}>
      {/* Pole vyhledávání */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍  Hledat podle názvu nebo autora..."
        value={search}
        onChangeText={setSearch}
        clearButtonMode="while-editing"
        returnKeyType="search"
      />

      {/* Filtry formátu (horizontální čipy) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersRow}
        contentContainerStyle={styles.filtersContent}
      >
        {FORMAT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.chip,
              filterFormat === opt.value && styles.chipActive,
            ]}
            onPress={() => setFilterFormat(opt.value)}
          >
            <Text
              style={[
                styles.chipText,
                filterFormat === opt.value && styles.chipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Řazení */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Řadit:</Text>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.chip,
              styles.chipSort,
              sortBy === opt.value && styles.chipSortActive,
            ]}
            onPress={() => setSortBy(opt.value)}
          >
            <Text
              style={[
                styles.chipText,
                sortBy === opt.value && styles.chipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Počet výsledků */}
      <Text style={styles.countText}>
        {bookCountLabel(filteredBooks.length)}
        {search || filterFormat !== 'all' ? ' (filtrováno)' : ''}
      </Text>

      {/* Seznam knih */}
      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            onEdit={(book) => navigation.navigate('BookForm', { book })}
            onDelete={(book) => setDeleteTarget(book)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>
              {loading
                ? 'Načítám...'
                : search || filterFormat !== 'all'
                ? 'Žádné výsledky pro zadaný filtr.'
                : 'Zatím žádné knihy.\nPřidejte první knihu tlačítkem +'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* FAB – přidat knihu */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('BookForm', { book: null })}
        accessibilityLabel="Přidat knihu"
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      {/* Potvrzovací dialog pro smazání */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Smazat knihu"
        message={`Opravdu chcete smazat knihu\n„${deleteTarget?.nazev_cz}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
    padding: 12,
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
  },
  filtersRow: {
    flexGrow: 0,
    marginBottom: 6,
  },
  filtersContent: {
    paddingRight: 8,
    gap: 8,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  sortLabel: {
    fontSize: 13,
    color: '#666',
    marginRight: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  chipActive: {
    backgroundColor: '#3498db',
  },
  chipSort: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipSortActive: {
    backgroundColor: '#2ecc71',
  },
  chipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  countText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  listContent: {
    paddingBottom: 88, // rezerva pro FAB
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Plovoucí akční tlačítko
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    lineHeight: 34,
  },
});
