import {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Portal, Snackbar, Text} from 'react-native-paper';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {colors, spacing} from '../theme/theme';

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
    <Portal>
      <Snackbar
        duration={5000}
        elevation={4}
        icon="close"
        onDismiss={() => setCurrentMessage(null)}
        onIconPress={() => setCurrentMessage(null)}
        style={[styles.message, styles[currentMessage.type]]}
        visible={!!currentMessage}
        wrapperStyle={[styles.host, {bottom: insets.bottom + 72}]}>
        <View style={styles.content}>
          <Text style={styles.title}>{currentMessage.title}</Text>
          {currentMessage.description ? (
            <Text style={styles.description}>{currentMessage.description}</Text>
          ) : null}
        </View>
      </Snackbar>
    </Portal>
  );
}

const styles = StyleSheet.create({
  host: {
    marginHorizontal: spacing.md,
  },
  message: {
    borderLeftWidth: 4,
  },
  content: {
    gap: spacing.xs,
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
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  description: {
    color: '#e5e7eb',
    fontSize: 13,
    lineHeight: 18,
  },
});
