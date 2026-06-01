import {useIsFocused} from '@react-navigation/native';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {useCallback, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {CodeScanner, type Barcode} from 'react-native-vision-camera-barcode-scanner';
import {useCameraDevice, useCameraPermission} from 'react-native-vision-camera';
import {ActivityIndicator, Button, Card, Text} from 'react-native-paper';

import {storeApi} from '../../api';
import {message} from '../../components/MessageHost';
import {StatusPill} from '../../components/StatusPill';
import {colors, spacing} from '../../theme/theme';
import type {RedeemOrderScan} from '../../types/domain';
import {orderStatusLabel} from '../../utils/format';

const QR_PAYLOAD_PREFIX = 'familyhub://redeem-confirm?code=';

export function RedeemScanScreen() {
  const queryClient = useQueryClient();
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const {hasPermission, requestPermission} = useCameraPermission();
  const [scanLocked, setScanLocked] = useState(false);
  const [scanCode, setScanCode] = useState<string | null>(null);
  const [order, setOrder] = useState<RedeemOrderScan | null>(null);

  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const resetScan = () => {
    setScanLocked(false);
    setScanCode(null);
    setOrder(null);
  };

  const previewMutation = useMutation({
    mutationFn: storeApi.previewRedeemScan,
    onSuccess: data => {
      setOrder(data);
    },
    onError: error => {
      message.error('扫码失败', error.message);
      setScanLocked(false);
      setScanCode(null);
    },
  });

  const confirmMutation = useMutation({
    mutationFn: storeApi.confirmRedeemScan,
    onSuccess: data => {
      setOrder(data);
      message.success('兑换已确认', `${data.rewardName} 已完成兑换。`);
      queryClient.invalidateQueries({queryKey: ['redeem-orders']});
      queryClient.invalidateQueries({queryKey: ['points']});
      queryClient.invalidateQueries({queryKey: ['rewards']});
    },
    onError: error => message.error('确认失败', error.message),
  });

  const handleBarcodeScanned = useCallback(
    (barcodes: Barcode[]) => {
      if (scanLocked || previewMutation.isPending || confirmMutation.isPending) {
        return;
      }
      const rawValue = barcodes.find(barcode => barcode.rawValue)?.rawValue?.trim();
      if (!rawValue) {
        return;
      }

      let code = rawValue;
      if (rawValue.startsWith(QR_PAYLOAD_PREFIX)) {
        code = rawValue.slice(QR_PAYLOAD_PREFIX.length);
      }
      try {
        code = decodeURIComponent(code);
      } catch {
        message.error('二维码无效', '请确认扫描的是家庭小助手兑换二维码。');
        return;
      }
      if (!code) {
        message.error('二维码无效', '没有读取到兑换码。');
        return;
      }

      setScanLocked(true);
      setScanCode(code);
      previewMutation.mutate(code);
    },
    [confirmMutation.isPending, previewMutation, scanLocked],
  );

  const scannerActive = isFocused && hasPermission && !!device && !scanLocked;

  return (
    <View style={styles.page}>
      <View style={styles.heading}>
        <Text style={styles.title}>扫一扫确认</Text>
        <Text style={styles.subtitle}>扫描孩子出示的兑换二维码，核对后确认兑换。</Text>
      </View>

      <View style={styles.scannerBox}>
        {hasPermission && device ? (
          <CodeScanner
            barcodeFormats={['qr-code']}
            isActive={scannerActive}
            onBarcodeScanned={handleBarcodeScanned}
            onError={error => {
              message.error('相机不可用', error.message);
            }}
            style={styles.scanner}
          />
        ) : (
          <View style={styles.placeholder}>
            {!hasPermission ? (
              <>
                <Text style={styles.placeholderTitle}>需要相机权限</Text>
                <Text style={styles.placeholderText}>授权后才能扫描兑换二维码。</Text>
                <Button mode="contained" onPress={requestPermission}>
                  授权相机
                </Button>
              </>
            ) : (
              <>
                <Text style={styles.placeholderTitle}>未找到后置摄像头</Text>
                <Text style={styles.placeholderText}>请换一台设备后重试。</Text>
              </>
            )}
          </View>
        )}
        {previewMutation.isPending ? (
          <View style={styles.loadingMask}>
            <ActivityIndicator color="#ffffff" />
            <Text style={styles.loadingText}>正在读取兑换信息</Text>
          </View>
        ) : null}
      </View>

      {order ? (
        <Card mode="outlined">
          <Card.Content>
            <View style={styles.orderHead}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderTitle}>{order.rewardName}</Text>
                <Text style={styles.meta}>
                  {order.userNickname} · {order.pointsCost} 血清素
                </Text>
                <Text style={styles.meta}>{order.createdAt ?? '无申请时间'}</Text>
              </View>
              <StatusPill label={orderStatusLabel(order.status)} tone="warning" />
            </View>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            {order.status === 'PENDING' && scanCode ? (
              <Button
                loading={confirmMutation.isPending}
                mode="contained"
                onPress={() => confirmMutation.mutate(scanCode)}>
                确认兑换
              </Button>
            ) : null}
            <Button mode="outlined" onPress={resetScan}>
              继续扫描
            </Button>
          </Card.Actions>
        </Card>
      ) : (
        <Card mode="outlined">
          <Card.Content>
            <Text style={styles.meta}>将二维码放入扫描框内，读取成功后会显示兑换详情。</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  heading: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  scannerBox: {
    aspectRatio: 1,
    backgroundColor: '#0f172a',
    borderRadius: 8,
    overflow: 'hidden',
  },
  scanner: {
    flex: 1,
  },
  placeholder: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  placeholderTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  placeholderText: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  loadingMask: {
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    bottom: 0,
    gap: spacing.md,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  loadingText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  orderHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  orderInfo: {
    flex: 1,
    gap: 4,
  },
  orderTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
