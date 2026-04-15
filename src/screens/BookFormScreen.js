/**
 * Formulář pro přidání nebo úpravu knihy.
 * Přijímá route.params.book – pokud je null, jde o novou knihu; jinak editace.
 * Obsahuje validaci všech povinných polí a automatické nastavení umístění pro audio/ekniha.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { generateUUID } from '../utils/uuid';
import { validateBook } from '../utils/validation';
import { addBook, updateBook } from '../services/storage';

// Možnosti formátu
const FORMAT_ITEMS = [
  { label: 'Fyzická kniha', value: 'fyzicka' },
  { label: 'Audiokniha', value: 'audio' },
  { label: 'E-kniha', value: 'ekniha' },
];

// Možnosti hodnocení (0 = DNF, 1–5 = hvězdičky)
const RATING_ITEMS = [
  { label: '0 – DNF (nedočteno)', value: 0 },
  { label: '1 ★☆☆☆☆', value: 1 },
  { label: '2 ★★☆☆☆', value: 2 },
  { label: '3 ★★★☆☆', value: 3 },
  { label: '4 ★★★★☆', value: 4 },
  { label: '5 ★★★★★', value: 5 },
];

// Výchozí stav formuláře pro novou knihu
const DEFAULT_FORM = {
  umisteni: '',
  nazev_cz: '',
  nazev_original: '',
  autor: '',
  nakladatelstvi: '',
  format: 'fyzicka',
  hodnoceni: 3,
};

export default function BookFormScreen({ route, navigation }) {
  const existingBook = route.params?.book ?? null;
  const isEditing = existingBook !== null;

  // Inicializace formuláře
  const [form, setForm] = useState(
    isEditing
      ? {
          umisteni: existingBook.umisteni ?? '',
          nazev_cz: existingBook.nazev_cz ?? '',
          nazev_original: existingBook.nazev_original ?? '',
          autor: existingBook.autor ?? '',
          nakladatelstvi: existingBook.nakladatelstvi ?? '',
          format: existingBook.format ?? 'fyzicka',
          hodnoceni: Number(existingBook.hodnoceni ?? 3),
        }
      : { ...DEFAULT_FORM }
  );

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Automaticky nastaví umístění na "X" pro audio / e-knihu;
  // při přepnutí na fyzickou knihu vyčistí pole pokud začíná X
  useEffect(() => {
    if (form.format === 'audio' || form.format === 'ekniha') {
      setForm((prev) => ({ ...prev, umisteni: 'X' }));
    } else if (form.format === 'fyzicka') {
      setForm((prev) => ({
        ...prev,
        umisteni: prev.umisteni.toUpperCase().startsWith('X') ? '' : prev.umisteni,
      }));
    }
  }, [form.format]);

  // Zobecněná změna pole formuláře (zároveň maže chybu daného pole)
  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  // Uložení knihy (přidat nebo aktualizovat)
  async function handleSave() {
    const validationErrors = validateBook(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const now = new Date().toISOString();
      if (isEditing) {
        await updateBook({
          ...existingBook,
          ...form,
          hodnoceni: Number(form.hodnoceni),
          updated_at: now,
        });
      } else {
        await addBook({
          id: generateUUID(),
          ...form,
          hodnoceni: Number(form.hodnoceni),
          created_at: now,
          updated_at: now,
        });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Chyba', 'Nepodařilo se uložit knihu. Zkuste to znovu.');
    } finally {
      setSaving(false);
    }
  }

  // Pole umístění je jen pro čtení, pokud je formát audio nebo e-kniha
  const umisteniLocked = form.format === 'audio' || form.format === 'ekniha';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── FORMÁT ── */}
        <Text style={styles.label}>Formát *</Text>
        <View style={[styles.pickerWrapper, errors.format && styles.fieldError]}>
          <Picker
            selectedValue={form.format}
            onValueChange={(v) => handleChange('format', v)}
            style={pickerStyle()}
          >
            {FORMAT_ITEMS.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
        {errors.format ? <Text style={styles.errorText}>{errors.format}</Text> : null}

        {/* ── UMÍSTĚNÍ ── */}
        <Text style={styles.label}>Umístění *</Text>
        <TextInput
          style={[
            styles.input,
            umisteniLocked && styles.inputLocked,
            errors.umisteni && styles.fieldError,
          ]}
          value={form.umisteni}
          onChangeText={(v) => handleChange('umisteni', v.toUpperCase())}
          placeholder='Např. "A1B2C" nebo "X"'
          maxLength={5}
          editable={!umisteniLocked}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        {umisteniLocked && (
          <Text style={styles.hint}>
            Pro audio / e-knihu se umístění automaticky nastaví na „X".
          </Text>
        )}
        {errors.umisteni ? <Text style={styles.errorText}>{errors.umisteni}</Text> : null}

        {/* ── ČESKÝ NÁZEV ── */}
        <Text style={styles.label}>Český název *</Text>
        <TextInput
          style={[styles.input, errors.nazev_cz && styles.fieldError]}
          value={form.nazev_cz}
          onChangeText={(v) => handleChange('nazev_cz', v)}
          placeholder="Název knihy česky"
          returnKeyType="next"
        />
        {errors.nazev_cz ? <Text style={styles.errorText}>{errors.nazev_cz}</Text> : null}

        {/* ── ORIGINÁLNÍ NÁZEV ── */}
        <Text style={styles.label}>Originální název</Text>
        <TextInput
          style={styles.input}
          value={form.nazev_original}
          onChangeText={(v) => handleChange('nazev_original', v)}
          placeholder="Originální název (nepovinné)"
          returnKeyType="next"
        />

        {/* ── AUTOR ── */}
        <Text style={styles.label}>Autor *</Text>
        <TextInput
          style={[styles.input, errors.autor && styles.fieldError]}
          value={form.autor}
          onChangeText={(v) => handleChange('autor', v)}
          placeholder="Jméno autora"
          returnKeyType="next"
        />
        {errors.autor ? <Text style={styles.errorText}>{errors.autor}</Text> : null}

        {/* ── NAKLADATELSTVÍ ── */}
        <Text style={styles.label}>Nakladatelství</Text>
        <TextInput
          style={styles.input}
          value={form.nakladatelstvi}
          onChangeText={(v) => handleChange('nakladatelstvi', v)}
          placeholder="Nakladatelství (nepovinné)"
          returnKeyType="next"
        />

        {/* ── HODNOCENÍ ── */}
        <Text style={styles.label}>Hodnocení *</Text>
        <View style={[styles.pickerWrapper, errors.hodnoceni && styles.fieldError]}>
          <Picker
            selectedValue={form.hodnoceni}
            onValueChange={(v) => handleChange('hodnoceni', v)}
            style={pickerStyle()}
          >
            {RATING_ITEMS.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
        {errors.hodnoceni ? <Text style={styles.errorText}>{errors.hodnoceni}</Text> : null}

        {/* ── TLAČÍTKA ── */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelText}>Zrušit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, saving && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.saveText}>
              {saving ? 'Ukládám...' : isEditing ? 'Uložit změny' : 'Přidat knihu'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Výška Pickeru závisí na platformě (iOS spinner vs. Android dropdown)
function pickerStyle() {
  return {
    height: Platform.OS === 'ios' ? 180 : 50,
    width: '100%',
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f7',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#222',
  },
  inputLocked: {
    backgroundColor: '#f0f0f0',
    color: '#888',
  },
  fieldError: {
    borderColor: '#e74c3c',
  },
  pickerWrapper: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  hint: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    flex: 1,
  },
  cancelText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#3498db',
    flex: 2,
  },
  saveText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
