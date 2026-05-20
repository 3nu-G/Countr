import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import { FAB, Text, Card, IconButton, useTheme, MD3LightTheme } from 'react-native-paper';
import { useSession } from '../context/SessionContext';
import { getAllSessions } from '../database/db';
import { Plus, Archive, Settings } from 'lucide-react-native';
import SettingsModal from '../components/SettingsModal';

type Session = {
  id: number;
  date: string;
  checkCount: number;
  crossCount: number;
  accuracy: number;
};

export default function Dashboard() {
  const theme = useTheme();
  const { startSession, history, loadHistory, bubbleSize, template, setBubbleSize, setTemplate } = useSession();
  const [settingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const requestOverlayPermission = async () => {
    if (Platform.OS !== 'android') return true;
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW,
        {
          title: 'Overlay Permission',
          message: 'Countr needs permission to show the floating counter on top of other apps.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      return false;
    }
  };

  const handleNewSession = async () => {
    const hasPermission = await requestOverlayPermission();
    if (!hasPermission) {
      ToastAndroid.show('Permission required to show floating counter', ToastAndroid.LONG);
      return;
    }
    startSession();
  };

  const renderSession = ({ item }: { item: Session }) => (
    <Card style={styles.card} mode="outlined">
      <Card.Title
        title={`Session ${item.id}`}
        subtitle={new Date(item.date).toLocaleDateString()}
        right={(props) => <Archive {...props} size={20} color={theme.colors.primary} />}
      />
      <Card.Content>
        <View style={styles.sessionStats}>
          <Text variant="bodyMedium">✔ {item.checkCount}</Text>
          <Text variant="bodyMedium">✖ {item.crossCount}</Text>
          <Text variant="bodyMedium">Accuracy: {Math.round(item.accuracy)}%</Text>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerIcons}>
        <IconButton
          icon={() => <Settings size={24} color={theme.colors.primary} />}
          onPress={() => setSettingsVisible(true)}
        />
      </View>
      <FlatList
        data={history}
        renderItem={renderSession}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="titleMedium">No sessions yet</Text>
            <Text variant="bodySmall">Tap + to start counting</Text>
          </View>
        }
      />
      <FAB
        icon={() => <Plus size={24} color="#fff" />}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleNewSession}
      />
      <SettingsModal
        visible={settingsVisible}
        onDismiss={() => setSettingsVisible(false)}
        bubbleSize={bubbleSize}
        template={template}
        setBubbleSize={setBubbleSize}
        setTemplate={setTemplate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBFE' },
  headerIcons: { alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, borderRadius: 16 },
  card: { marginHorizontal: 16, marginVertical: 8 },
  sessionStats: { flexDirection: 'row', justifyContent: 'space-between' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
});