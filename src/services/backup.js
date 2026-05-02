/**
 * Exportni a importni operace (zaloha dat).
 * Chovani se lisi podle platformy:
 *   - web:     Blob download / FileReader + file input
 *   - Android: expo-file-system (SAF nebo documentDirectory) + expo-sharing / expo-document-picker
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBooks, importBooks } from './storage';

// Nativni moduly se importuji jen na ne-webovych platformach (web je nepodporuje)
const FileSystem = Platform.OS !== 'web' ? require('expo-file-system') : null;
const Sharing = Platform.OS !== 'web' ? require('expo-sharing') : null;
const DocumentPicker = Platform.OS !== 'web' ? require('expo-document-picker') : null;

const BACKUP_DIR_KEY = 'backup_dir_uri';

/** Vrati ulozene URI zalohovaci slozky (jen Android). */
export async function getBackupDirUri() {
  if (Platform.OS !== 'android') return null;
  return await AsyncStorage.getItem(BACKUP_DIR_KEY);
}

/** Ulozi URI zalohovaci slozky (null = smazat nastaveni). */
export async function setBackupDirUri(uri) {
  if (uri) {
    await AsyncStorage.setItem(BACKUP_DIR_KEY, uri);
  } else {
    await AsyncStorage.removeItem(BACKUP_DIR_KEY);
  }
}

/**
 * Zobrazi systemovy picker pro vyber slozky (Android SAF).
 * Vrati URI zvolene slozky nebo null, pokud uzivatel zrusil.
 */
export async function pickBackupDir() {
  if (Platform.OS !== 'android') return null;
  const result = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
  if (!result.granted) return null;
  await setBackupDirUri(result.directoryUri);
  return result.directoryUri;
}

/**
 * Exportuje vsechny knihy do souboru JSON.
 * Vrati { filename, savedTo } kde savedTo je citelny popis mista ulozeni.
 */
export async function exportBooks() {
  const books = await getBooks();
  const json = JSON.stringify(books, null, 2);
  const filename = `knihovna_emi_${new Date().toISOString().slice(0, 10)}.json`;

  if (Platform.OS === 'web') {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return { filename, savedTo: 'Vychozi slozka stahovani prohlizece' };
  }

  const dirUri = await getBackupDirUri();
  if (dirUri) {
    try {
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        dirUri,
        filename,
        'application/json'
      );
      await FileSystem.writeAsStringAsync(fileUri, json, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return { filename, savedTo: dirUri };
    } catch {
      // SAF selhalo - pokracujeme s fallbackem
    }
  }

  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Exportovat zalohu knihovny',
    });
  }

  return { filename, savedTo: null };
}

/**
 * Vybere soubor a vrati jeho obsah + jmeno, ale NEZPRACUJE ho.
 * Vrati { content, filename } nebo null (zruseno).
 */
export async function pickBackupFile() {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      let settled = false;
      function settle(val) {
        if (!settled) { settled = true; resolve(val); }
      }

      input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) { settle(null); return; }
        const reader = new FileReader();
        reader.onload = (e) => settle({ content: e.target.result, filename: file.name });
        reader.onerror = () => settle(null);
        reader.readAsText(file);
      };

      // Detekce zavření dialogu bez výběru souboru
      window.addEventListener('focus', () => {
        setTimeout(() => {
          if (!input.files || input.files.length === 0) settle(null);
        }, 400);
      }, { once: true });

      input.click();
    });
  }

  // Android / iOS - DocumentPicker
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  const content = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  return { content, filename: asset.name || 'zaloha.json' };
}

/**
 * Zpracuje (naimportuje) obsah souboru zalohy.
 * Vrati pocet nactenych knih.
 */
export async function processImportContent(content) {
  const data = JSON.parse(content);
  if (!Array.isArray(data)) {
    throw new Error('Neplatny format souboru. Ocekavano pole knih (JSON array).');
  }
  await importBooks(data);
  return data.length;
}