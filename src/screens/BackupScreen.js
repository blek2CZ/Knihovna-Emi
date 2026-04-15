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
import { useTheme } from '../context/ThemeContext';

export default function BackupScreen() {
  const { colors } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [bookCount, setBookCount] = useState(0);
  const [message, setMessage] = useState(null);

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
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
      {/* Přehled */}
      <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.infoLabel, { color: colors.textSub }]}>Knih v knihovně:</Text>
        <Text style={styles.infoCount}>{bookCount}</Text>
      </View>

      {/* Export */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📤  Export zálohy</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSub }]}>
          Uloží všechna data do souboru{' '}
          <Text style={[styles.mono, { backgroundColor: colors.chip, color: colors.text }]}>knihovna_emi_RRRR-MM-DD.json</Text>.{'\n'}
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
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>📥  Import zálohy</Text>
        <Text style={[styles.sectionDesc, { color: colors.textSub }]}>
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
          <Text style={[styles.messageText, { color: colors.text }]}>{message.text}</Text>
        </View>
      )}

      {/* Formát zálohy – nápověda */}
      <View style={[styles.helpBox, { backgroundColor: colors.helpBox, borderColor: colors.helpBorder }]}>
        <Text style={[styles.helpTitle, { color: colors.textSub }]}>Formát zálohy</Text>
        <Text style={[styles.helpText, { color: colors.textMuted }]}>
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
  },
  content: {
    padding: 20,
    paddingBottom: 48,
  },
  infoCard: {
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
  },
  infoCount: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#3498db',
  },
  section: {
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
    marginBottom: 8,
  },
  sectionDesc: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 16,
  },
  mono: {
    fontFamily: 'monospace',
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
    lineHeight: 20,
  },
  helpBox: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  helpTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  helpText: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: 'monospace',
  },
});
