/**
 * Obrazovka zalohy dat.
 */
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
  Animated,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  exportBooks,
  pickBackupFile,
  processImportContent,
  getBackupDirUri,
  pickBackupDir,
  setBackupDirUri,
} from '../services/backup';
import { getBooks } from '../services/storage';
import { useTheme } from '../context/ThemeContext';

function useToast() {
  const [toast, setToast] = useState(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const timer = useRef(null);

  function show(type, text) {
    if (timer.current) clearTimeout(timer.current);
    setToast({ type, text });
    opacity.setValue(0);
    translateY.setValue(20);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();
    timer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 20, duration: 300, useNativeDriver: true }),
      ]).start(() => setToast(null));
    }, 5000);
  }

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return { toast, show, opacity, translateY };
}

export default function BackupScreen() {
  const { colors } = useTheme();
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [bookCount, setBookCount] = useState(0);
  const [backupDirUri, setBackupDirUriState] = useState(null);
  const [pendingFile, setPendingFile] = useState(null);
  const { toast, show: showToast, opacity: toastOpacity, translateY: toastY } = useToast();

  useFocusEffect(
    useCallback(() => {
      loadCount();
      if (Platform.OS === 'android') {
        getBackupDirUri().then(setBackupDirUriState);
      }
    }, [])
  );

  async function loadCount() {
    const books = await getBooks();
    setBookCount(books.length);
  }

  async function handleExport() {
    if (bookCount === 0) {
      showToast('info', 'Neni co exportovat - knihovna je prazdna.');
      return;
    }
    setExporting(true);
    try {
      const { filename, savedTo } = await exportBooks();
      const where = savedTo
        ? `Ulozeno do: ${savedTo}`
        : 'Zvolte misto ulozeni v dialogu sdileni.';
      showToast('success', `\u2713  ${filename}\n${where}`);
    } catch (err) {
      showToast('error', `Export selhal: ${err.message}`);
    } finally {
      setExporting(false);
    }
  }

  async function handleImport() {
    setImporting(true);
    try {
      const file = await pickBackupFile();
      if (!file) {
        showToast('info', 'Import byl zrusen.');
        setImporting(false);
        return;
      }
      // Zobrazit vlastni potvrzovaci dialog
      setPendingFile(file);
    } catch (err) {
      showToast('error', `Import selhal: ${err.message}`);
      setImporting(false);
    }
  }

  function cancelImport() {
    setPendingFile(null);
    setImporting(false);
  }

  async function confirmImport() {
    const file = pendingFile;
    setPendingFile(null);
    await doImport(file);
  }

  async function doImport(file) {
    try {
      const count = await processImportContent(file.content);
      showToast('success', `\u2713  Nacteno ${count} ${bookCountWord(count)}\nSoubor: ${file.filename}`);
      loadCount();
    } catch (err) {
      showToast('error', `Import selhal: ${err.message}`);
    } finally {
      setImporting(false);
    }
  }

  async function handlePickDir() {
    const uri = await pickBackupDir();
    if (uri) {
      setBackupDirUriState(uri);
      showToast('success', `\u2713  Zalohovaci slozka nastavena.`);
    }
  }

  async function handleClearDir() {
    await setBackupDirUri(null);
    setBackupDirUriState(null);
    showToast('info', 'Zalohovaci slozka byla resetovana.');
  }

  const busy = exporting || importing;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.bg }]} contentContainerStyle={styles.content}>
        <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoLabel, { color: colors.textSub }]}>Knih v knihovne:</Text>
          <Text style={styles.infoCount}>{bookCount}</Text>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{'\uD83D\uDCE4'}  Export zalohy</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSub }]}>
            Ulozi vsechna data do souboru{' '}
            <Text style={[styles.mono, { backgroundColor: colors.chip, color: colors.text }]}>
              knihovna_emi_RRRR-MM-DD.json
            </Text>.
            {'\n'}Soubor si ulozite na bezpecne misto.
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.exportButton, busy && styles.buttonDisabled]}
            onPress={handleExport}
            disabled={busy}
          >
            {exporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Exportovat zalohu</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{'\uD83D\uDCE5'}  Import zalohy</Text>
          <Text style={[styles.sectionDesc, { color: colors.textSub }]}>
            Nacte data ze souboru JSON.{'\n'}
            <Text style={styles.warning}>{'\u26A0\uFE0F'}  Nahradi VSECHNA stavajici data!</Text>
          </Text>
          <TouchableOpacity
            style={[styles.button, styles.importButton, busy && styles.buttonDisabled]}
            onPress={handleImport}
            disabled={busy}
          >
            {importing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Importovat zalohu</Text>
            )}
          </TouchableOpacity>
        </View>

        {Platform.OS === 'android' && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{'\uD83D\uDCC1'}  Zalohovaci slozka</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSub }]}>
              {backupDirUri
                ? `Nastavena slozka:\n${backupDirUri}`
                : 'Neni nastaveno - zaloha se ulozi pres dialog sdileni.'}
            </Text>
            <View style={styles.rowButtons}>
              <TouchableOpacity
                style={[styles.button, styles.dirButton, { flex: 1, marginRight: 8 }]}
                onPress={handlePickDir}
                disabled={busy}
              >
                <Text style={styles.buttonText}>Vybrat slozku</Text>
              </TouchableOpacity>
              {backupDirUri && (
                <TouchableOpacity
                  style={[styles.button, styles.clearButton]}
                  onPress={handleClearDir}
                  disabled={busy}
                >
                  <Text style={styles.buttonText}>Reset</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {Platform.OS === 'web' && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{'\uD83D\uDCC1'}  Zalohovaci slozka</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSub }]}>
              Soubory se stahuji do vychozi slozky pro stahovani ve vasem prohlizeci.{'\n'}
              Umisteni lze zmenit v nastaveni prohlizece.
            </Text>
          </View>
        )}

        <View style={[styles.helpBox, { backgroundColor: colors.helpBox, borderColor: colors.helpBorder }]}>
          <Text style={[styles.helpTitle, { color: colors.textSub }]}>Format zalohy</Text>
          <Text style={[styles.helpText, { color: colors.textMuted }]}>
            Zaloha je soubor JSON obsahujici pole knih s poli:{'\n'}
            id, umisteni, nazev_cz, nazev_original, autor,{'\n'}
            nakladatelstvi, format, hodnoceni, created_at, updated_at
          </Text>
        </View>
      </ScrollView>

      {/* Potvrzovaci dialog pro import */}
      <Modal visible={!!pendingFile} transparent animationType="fade" onRequestClose={cancelImport}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalDialog, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Importovat zalohu?</Text>
            <Text style={[styles.modalMsg, { color: colors.textSub }]}>
              {`Soubor: ${pendingFile?.filename}\n\nTato akce PREPISE vsechna stavajici data v knihovne!`}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: colors.cancelBtn ?? '#ccc' }]} onPress={cancelImport}>
                <Text style={[styles.modalBtnText, { color: colors.cancelText ?? '#333' }]}>Zrusit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.modalBtnDanger]} onPress={confirmImport}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Importovat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {toast && (
        <Animated.View
          style={[
            styles.toast,
            toast.type === 'success' && styles.toastSuccess,
            toast.type === 'error' && styles.toastError,
            toast.type === 'info' && styles.toastInfo,
            { opacity: toastOpacity, transform: [{ translateY: toastY }] },
          ]}
        >
          <Text style={styles.toastText}>{toast.text}</Text>
        </Animated.View>
      )}
    </View>
  );
}

function bookCountWord(count) {
  if (count === 1) return 'knihy';
  if (count >= 2 && count <= 4) return 'knih';
  return 'knih';
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  infoCard: {
    borderRadius: 12, padding: 18, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 20, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  infoLabel: { fontSize: 15 },
  infoCount: { fontSize: 26, fontWeight: 'bold', color: '#3498db' },
  section: {
    borderRadius: 12, padding: 18, marginBottom: 16, elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 8 },
  sectionDesc: { fontSize: 13, lineHeight: 20, marginBottom: 16 },
  mono: { fontFamily: 'monospace', fontSize: 12 },
  warning: { color: '#e67e22', fontWeight: '600' },
  rowButtons: { flexDirection: 'row', alignItems: 'center' },
  button: { padding: 14, borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 48 },
  exportButton: { backgroundColor: '#3498db' },
  importButton: { backgroundColor: '#e67e22' },
  dirButton: { backgroundColor: '#27ae60' },
  clearButton: { backgroundColor: '#95a5a6', paddingHorizontal: 16 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  helpBox: { borderRadius: 12, padding: 16, borderWidth: 1 },
  helpTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  helpText: { fontSize: 12, lineHeight: 18, fontFamily: 'monospace' },
  toast: {
    position: 'absolute', bottom: 24, left: 20, right: 20,
    borderRadius: 12, padding: 16, elevation: 8,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
  },
  toastSuccess: { backgroundColor: '#1e7e34' },
  toastError: { backgroundColor: '#c0392b' },
  toastInfo: { backgroundColor: '#2471a3' },
  toastText: { color: '#fff', fontSize: 14, lineHeight: 20 },
  modalOverlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 20,
  },
  modalDialog: {
    borderRadius: 14, padding: 24, width: '100%', maxWidth: 400,
    elevation: 10, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalMsg: { fontSize: 14, lineHeight: 20, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  modalBtn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 8, minWidth: 80, alignItems: 'center' },
  modalBtnDanger: { backgroundColor: '#e74c3c' },
  modalBtnText: { fontSize: 14, fontWeight: '600' },
});