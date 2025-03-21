import React, {useState, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Switch,
  Pressable,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PreferencesModal = ({
  visible,
  onClose,
  initialHalfwayAlertsEnabled,
  onSave,
}) => {
  const colorScheme = useColorScheme();
  const [halfwayEnabled, setHalfwayEnabled] = useState(
    initialHalfwayAlertsEnabled,
  );

  useEffect(() => {
    setHalfwayEnabled(initialHalfwayAlertsEnabled);
  }, [initialHalfwayAlertsEnabled]);

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem(
        'HALFWAY_ALERTS',
        JSON.stringify(halfwayEnabled),
      );
    } catch (error) {
      console.error('Error saving preference:', error);
    }
    onSave(halfwayEnabled);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View
          style={[
            styles.modalContainer,
            colorScheme === 'dark' && styles.modalContainerDark,
          ]}>
          <Text
            style={[
              styles.modalTitle,
              colorScheme === 'dark' && styles.modalTitleDark,
            ]}>
            Preferences
          </Text>
          <View style={styles.optionRow}>
            <Text
              style={[
                styles.optionLabel,
                colorScheme === 'dark' && styles.optionLabelDark,
              ]}>
              Enable Halfway Alerts
            </Text>
            <Switch value={halfwayEnabled} onValueChange={setHalfwayEnabled} />
          </View>
          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={handleSave}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>
                Cancel
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalContainerDark: {
    backgroundColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  modalTitleDark: {
    color: '#fff',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  optionLabel: {
    fontSize: 16,
    color: '#000',
  },
  optionLabelDark: {
    color: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#0F56B3',
    borderRadius: 6,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#000',
  },
});

export default PreferencesModal;
