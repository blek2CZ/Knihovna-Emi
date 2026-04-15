/**
 * Exportní a importní operace (záloha dat).
 * Chování se liší podle platformy:
 *   - web:     Blob download / FileReader + file input
 *   - Android: expo-file-system + expo-sharing / expo-document-picker
 */
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { getBooks, importBooks } from './storage';

/**
 * Exportuje všechny knihy do souboru JSON.
 * Na webu spustí stažení souboru prohlížečem.
 * Na Androidu zapíše soubor do dočasného adresáře a nabídne sdílení.
 */
export async function exportBooks() {
  const books = await getBooks();
  const json = JSON.stringify(books, null, 2);
  const filename = `knihovna_emi_${new Date().toISOString().slice(0, 10)}.json`;

  if (Platform.OS === 'web') {
    // Webové prostředí – stáhnout soubor přes Blob
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
    return { success: true };
  }

  // Android / iOS – zapsat do dočasného souboru a sdílet
  const fileUri = FileSystem.documentDirectory + filename;
  await FileSystem.writeAsStringAsync(fileUri, json, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/json',
      dialogTitle: 'Exportovat zálohu knihovny',
    });
  }

  return { success: true };
}

/**
 * Importuje knihy ze souboru JSON vybranéhoho uživatelem.
 * Vrátí { success, count } nebo { success: false, cancelled: true }.
 * Při neplatném formátu vyhodí chybu.
 */
export async function importBooksFromFile() {
  if (Platform.OS === 'web') {
    // Webové prostředí – file input
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json,application/json';

      input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) {
          resolve({ success: false, cancelled: true });
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result);
            if (!Array.isArray(data)) {
              reject(new Error('Neplatný formát souboru. Očekáváno pole knih (JSON array).'));
              return;
            }
            await importBooks(data);
            resolve({ success: true, count: data.length });
          } catch (err) {
            reject(err);
          }
        };

        reader.onerror = () => reject(new Error('Nelze číst soubor.'));
        reader.readAsText(file);
      };

      // Detekce zrušení bez výběru souboru (fokus okna bez výběru)
      window.addEventListener(
        'focus',
        () => {
          setTimeout(() => {
            if (!input.files || input.files.length === 0) {
              resolve({ success: false, cancelled: true });
            }
          }, 500);
        },
        { once: true }
      );

      input.click();
    });
  }

  // Android / iOS – DocumentPicker
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', '*/*'],
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    return { success: false, cancelled: true };
  }

  const uri = result.assets[0].uri;
  const jsonText = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const data = JSON.parse(jsonText);
  if (!Array.isArray(data)) {
    throw new Error('Neplatný formát souboru. Očekáváno pole knih (JSON array).');
  }

  await importBooks(data);
  return { success: true, count: data.length };
}
