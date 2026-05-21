import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useSession } from '../context/SessionContext';
import { hideFloatingBubble } from 'react-native-floating-bubble';
import { Check, X } from 'lucide-react-native';
import { useTheme } from 'react-native-paper';

interface Props {
  size: number; // width/height of the bubble
}

export default function BubbleContent({ size }: Props) {
  const { checkCount, crossCount, accuracy, incrementCheck, incrementCross, endSession, template } = useSession();
  const theme = useTheme();
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const closeSession = () => {
    hideFloatingBubble();
    endSession();
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      isDragging.value = true;
    })
    .onUpdate((event) => {
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      isDragging.value = false;
      if (event.translationY > 50) {
        runOnJS(closeSession)();
      } else {
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const total = checkCount + crossCount;
  const accuracyPercent = total > 0 ? Math.round(accuracy) : 0;

  const isCompact = template === 'compact';

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }, animatedStyle]}>
        {isDragging.value && (
          <Text style={styles.dragHint}>Drag down to close</Text>
        )}
        <View style={styles.content}>
          {isCompact ? (
            // Compact template: small circles
            <View style={styles.compactRow}>
              <Pressable onPress={incrementCheck} style={[styles.compactBtn, { backgroundColor: '#E8DEF8' }]}>
                <Check size={20} color={theme.colors.primary} />
              </Pressable>
              <View style={styles.compactCenter}>
                <Text style={styles.accuracySmall}>{accuracyPercent}%</Text>
              </View>
              <Pressable onPress={incrementCross} style={[styles.compactBtn, { backgroundColor: '#FFD8E4' }]}>
                <X size={20} color="#B71C1C" />
              </Pressable>
            </View>
          ) : (
            // Standard template: larger buttons with counts
            <View style={styles.standardLayout}>
              <View style={styles.countRow}>
                <Pressable onPress={incrementCheck} style={[styles.button, styles.checkButton]}>
                  <Check size={28} color="#FFFFFF" />
                  <Text style={styles.buttonCount}>{checkCount}</Text>
                </Pressable>
                <Text style={styles.accuracy}>{accuracyPercent}%</Text>
                <Pressable onPress={incrementCross} style={[styles.button, styles.crossButton]}>
                  <X size={28} color="#FFFFFF" />
                  <Text style={styles.buttonCount}>{crossCount}</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFBFE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  content: { flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' },
  dragHint: {
    position: 'absolute',
    top: 5,
    fontSize: 10,
    color: '#999',
    zIndex: 10,
  },
  standardLayout: { width: '100%', alignItems: 'center' },
  countRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '100%', paddingHorizontal: 10 },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkButton: { backgroundColor: '#6750A4' },
  crossButton: { backgroundColor: '#B71C1C' },
  buttonCount: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginTop: -2 },
  accuracy: { fontSize: 18, fontWeight: 'bold', color: '#333', width: 50, textAlign: 'center' },
  // Compact styles
  compactRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', width: '100%' },
  compactBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  compactCenter: { alignItems: 'center' },
  accuracySmall: { fontSize: 14, fontWeight: 'bold', color: '#333' },
});