/**
 * Obrazovka zálohy dat.
 * Export: uloží všechna data do souboru JSON.
 * Import: načte data ze souboru JSON (PŘEPÍŠE stávající data).
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { exportBooks, importBooksFromFile } from '../services/backup';
import { getBooks } from '../services/storage';

export default function BackupScreen() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [bookCount, setBookCount] = useState(0);
  const [message, setMessage] = useState(null); // { type: 'success'|'error'|'info', text: string }

  // Obnovit počet knih vždy při přepnutí na tuto záložku
  useFocusEffect(
    useCallback(() => {
      loadCount();
      setMessage(null);
    }, [])
  );

  async function loadCount() {
    const books = await getBooks();
    setBookCount(books.length);
  }

  // ── Export ──────────────────────────────────────────────────────────
  async function handleExport() {
    if (bookCount === 0) {
      setMessage({ type: 'info', text: 'Není co exportovat – knihovna je prázdná.' });
      return;
    }
    setExporting(true);
    setMessage(null);
    try {
      await exportBooks();
      setMessage({ type: 'success', text: 'Data byla úspěšně exportována.' });
    } catch (err) {
      setMessage({ type: 'error', text: `Export selhal: ${err.message}` });
    } finally {
      setExporting(false);
    }
  }

  // ── Import ──────────────────────────────────────────────────────────
  async function handleImport() {
    // Varování před přepsáním dat (na Androidu/iOS použijeme Alert; na webu je to hned)
    setImporting(true);
    setMessage(null);
    try {
      const result = await importBooksFromFile();
      if (result.cancelled) {
        setMessage({ type: 'info', text: 'Import byl zrušen.' });
      } else {
        setMessage({
          type: 'success',
          text: `Import úspěšný – načteno ${result.count} ${bookCountWord(result.count)}.`,
        });
        loadCount();
      }
    } catch (err) {
      setMessage({ type: 'error', text: `Import selhal: ${err.message}` });
    } finally {
      setImporting(false);
    }
  }

  const busy = exporting || importing;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Přehled */}
      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Knih v knihovně:</Text>
        <Text style={styles.infoCount}>{bookCount}</Text>
      </View>

      {/* Export */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📤  Export zálohy</Text>
        <Text style={styles.sectionDesc}>
          Uloží všechna data do souboru{' '}
          <Text style={styles.mono}>knihovna_emi_RRRR-MM-DD.json</Text>.{'\n'}
          Soubor si uložte na bezpečné místo.
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.exportButton, busy && styles.buttonDisabled]}
          onPress={handleExport}
          disabled={busy}
        >
          {exporting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Exportovat zálohu</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Import */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📥  Import zálohy</Text>
        <Text style={styles.sectionDesc}>
          Načte data ze souboru JSON.{'\n'}
          <Text style={styles.warning}>⚠️  Nahradí VŠECHNA stávající data!</Text>
        </Text>
        <TouchableOpacity
          style={[styles.button, styles.importButton, busy && styles.buttonDisabled]}
          onPress={handleImport}
          disabled={busy}
        >
          {importing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Importovat zálohu</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Stavová zpráva */}
      {message && (
        <View
          style={[
            styles.messageBox,
            message.type === 'success' && styles.msgSuccess,
            message.type === 'error' && styles.msgError,
            message.type === 'info' && styles.msgInfo,
          ]}
        >
          <Text style={styles.messageText}>{message.text}</Text>
        </View>
      )}

      {/* Formát zálohy – nápověda */}
      <View style={styles.helpBox}>
        <Text style={styles.helpTitle}>Formát zálohy</Text>
        <Text style={styles.helpText}>
          Záloha je soubor JSON obsahující pole knih s poli:{'\n'}
          id, umisteni, nazev_cz, nazev_original, autor,{'\n'}
          nakladatelstvi, format, hodnoceni, created_at, updated_at
        </Text>
      </View>
    </ScrollView>
  );
}

// Skloňování slova "kniha" pro 1-2-3-4 / 0+5
function bookCountWord(count) {
  if (count === 1) return 'knihy';
  if (count >= 2 && count <= 4) return 'knih';
  return 'knih';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  infoLabel: {
    fontSize: 15,
    color: '#555',
  },
  infoCount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3498db',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  mono: {
    fontFamily: 'monospace',
    backgroundColor: '#f0f0f0',
    fontSize: 12,
  },
  warning: {
    color: '#e67e22',
    fontWeight: '600',
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  exportButton: {
    backgroundColor: '#3498db',
  },
  importButton: {
    backgroundColor: '#e67e22',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  messageBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  msgSuccess: {
    backgroundColor: '#d4edda',
    borderLeftColor: '#28a745',
  },
  msgError: {
    backgroundColor: '#f8d7da',
    borderLeftColor: '#dc3545',
  },
  msgInfo: {
    backgroundColor: '#d1ecf1',
    borderLeftColor: '#17a2b8',
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  helpBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e8e8e8',
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
  },
  helpText: {
    fontSize: 12,
    color: '#888',
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
