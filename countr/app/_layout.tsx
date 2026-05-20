import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SessionProvider, useSession } from '../context/SessionContext';
import { FloatingBubbleView } from '@howljs/react-native-floating-bubble';
import BubbleContent from '../components/BubbleContent';
import { View, StyleSheet } from 'react-native';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6750A4',
    secondary: '#625B71',
    background: '#FFFBFE',
    surface: '#FFFBFE',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
  },
};

function BubbleContainer() {
  const { isActive, bubbleSize } = useSession();
  const size = bubbleSize === 'small' ? 120 : bubbleSize === 'large' ? 180 : 150;
  if (!isActive) return null;
  return (
    <FloatingBubbleView style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden' }}>
      <BubbleContent size={size} />
    </FloatingBubbleView>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <SessionProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" options={{ headerShown: true, title: 'Countr' }} />
          </Stack>
          <BubbleContainer />
        </SessionProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}