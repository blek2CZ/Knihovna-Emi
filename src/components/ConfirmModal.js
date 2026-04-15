/**
 * Modální potvrzovací dialog pro destruktivní akce (smazání knihy).
 * Zobrazuje nadpis, zprávu a tlačítka "Zrušit" / "Smazat".
 */
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel }) {
  const { colors } = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
        <View style={[styles.dialog, { backgroundColor: colors.modalBg }]}>
          {title ? <Text style={[styles.title, { color: colors.text }]}>{title}</Text> : null}
          {message ? <Text style={[styles.message, { color: colors.textSub }]}>{message}</Text> : null}
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.button, { backgroundColor: colors.cancelBtn }]} onPress={onCancel}>
              <Text style={[styles.cancelText, { color: colors.cancelText }]}>Zrušit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.confirmText}>Smazat</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    borderRadius: 14,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {},
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#e74c3c',
  },
  confirmText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
