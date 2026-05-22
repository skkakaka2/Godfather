import {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors, radius, spacing} from '../theme/theme';

type MessageType = 'success' | 'error' | 'info';

type MessagePayload = {
  id: number;
  type: MessageType;
  title: string;
  description?: string;
};

let currentListener: ((payload: MessagePayload) => void) | null = null;
let nextMessageId = 0;

function showMessage(type: MessageType, title: string, description?: string) {
  currentListener?.({
    description,
    id: nextMessageId + 1,
    title,
    type,
  });
  nextMessageId += 1;
}

export const message = {
  error(title: string, description?: string) {
    showMessage('error', title, description);
  },
  info(title: string, description?: string) {
    showMessage('info', title, description);
  },
  success(title: string, description?: string) {
    showMessage('success', title, description);
  },
};

export function MessageHost() {
  const insets = useSafeAreaInsets();
  const [currentMessage, setCurrentMessage] = useState<MessagePayload | null>(
    null,
  );

  useEffect(() => {
    currentListener = setCurrentMessage;
    return () => {
      currentListener = null;
    };
  }, []);

  useEffect(() => {
    if (!currentMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentMessage(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [currentMessage]);

  if (!currentMessage) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={[styles.host, {top: insets.top + spacing.md}]}>
      <View style={[styles.message, styles[currentMessage.type]]}>
        <Text style={styles.title}>{currentMessage.title}</Text>
        {currentMessage.description ? (
          <Text style={styles.description}>{currentMessage.description}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    left: spacing.lg,
    position: 'absolute',
    right: spacing.lg,
    zIndex: 1000,
  },
  message: {
    backgroundColor: colors.surface,
    borderLeftWidth: 4,
    borderRadius: radius.md,
    elevation: 8,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000000',
    shadowOffset: {height: 4, width: 0},
    shadowOpacity: 0.16,
    shadowRadius: 12,
  },
  success: {
    borderLeftColor: colors.success,
  },
  error: {
    borderLeftColor: colors.danger,
  },
  info: {
    borderLeftColor: colors.info,
  },
  title: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  description: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
});
