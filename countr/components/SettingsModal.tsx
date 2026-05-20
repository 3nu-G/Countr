import React from 'react';
import { Modal, Portal, Text, Button, RadioButton, useTheme } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  bubbleSize: 'small' | 'medium' | 'large';
  template: 'standard' | 'compact';
  setBubbleSize: (size: 'small' | 'medium' | 'large') => void;
  setTemplate: (tpl: 'standard' | 'compact') => void;
}

export default function SettingsModal({ visible, onDismiss, bubbleSize, template, setBubbleSize, setTemplate }: Props) {
  const theme = useTheme();

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modal}>
        <Text variant="titleLarge" style={{ marginBottom: 16 }}>Bubble Settings</Text>
        <Text variant="bodyMedium">Size</Text>
        <RadioButton.Group onValueChange={(value) => setBubbleSize(value as any)} value={bubbleSize}>
          <RadioButton.Item label="Small" value="small" />
          <RadioButton.Item label="Medium" value="medium" />
          <RadioButton.Item label="Large" value="large" />
        </RadioButton.Group>
        <Text variant="bodyMedium" style={{ marginTop: 16 }}>Template</Text>
        <RadioButton.Group onValueChange={(value) => setTemplate(value as any)} value={template}>
          <RadioButton.Item label="Standard (buttons + numbers)" value="standard" />
          <RadioButton.Item label="Compact (minimal)" value="compact" />
        </RadioButton.Group>
        <Button mode="contained" onPress={onDismiss} style={{ marginTop: 24 }}>
          Done
        </Button>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#FFFBFE',
    padding: 20,
    margin: 20,
    borderRadius: 16,
  },
});