import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {Button, Card, Dialog, Portal, Text, TextInput} from 'react-native-paper';

import {taskApi, userApi} from '../../api';
import {ChoiceChips} from '../../components/ChoiceChips';
import {DatePickerRow} from '../../components/DatePickerRow';
import {EmptyState} from '../../components/EmptyState';
import {message} from '../../components/MessageHost';
import {Screen} from '../../components/Screen';
import {StatusPill} from '../../components/StatusPill';
import {useAuthStore} from '../../store/authStore';
import {colors, spacing} from '../../theme/theme';
import {isManagerRole, taskStatusLabel, todayString} from '../../utils/format';
import type {DailyTask} from '../../types/domain';

const statusOptions = [
  {label: '全部', value: ''},
  {label: '待完成', value: 'PENDING'},
  {label: '待确认', value: 'COMPLETED'},
  {label: '已确认', value: 'CONFIRMED'},
  {label: '已打回', value: 'REJECTED'},
];

export function TasksScreen() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const manager = isManagerRole(user?.role);
  const [status, setStatus] = useState('');
  const [taskDate, setTaskDate] = useState(todayString());
  const [userId, setUserId] = useState<string | undefined>(user?.id);
  const [rejectingTask, setRejectingTask] = useState<DailyTask | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmingTask, setConfirmingTask] = useState<DailyTask | null>(null);
  const [confirmPoints, setConfirmPoints] = useState('');
  const [confirmRemark, setConfirmRemark] = useState('');

  const membersQuery = useQuery({
    queryKey: ['members'],
    queryFn: userApi.familyMembers,
    enabled: manager,
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', taskDate, status, userId],
    queryFn: () =>
      taskApi.list({
        status: status || undefined,
        taskDate,
        userId,
      }),
    enabled: !!user,
  });

  const invalidateTasks = () => {
    queryClient.invalidateQueries({queryKey: ['tasks']});
    queryClient.invalidateQueries({queryKey: ['points']});
  };

  const completeMutation = useMutation({
    mutationFn: (task: DailyTask) => taskApi.complete(task.id, task.userId),
    onSuccess: invalidateTasks,
    onError: error => message.error('操作失败', error.message),
  });

  const confirmMutation = useMutation({
    mutationFn: ({
      task,
      points,
      remark,
    }: {
      task: DailyTask;
      points?: number;
      remark?: string;
    }) => taskApi.confirm(task.id, points, remark),
    onSuccess: () => {
      setConfirmingTask(null);
      setConfirmPoints('');
      setConfirmRemark('');
      invalidateTasks();
    },
    onError: error => message.error('操作失败', error.message),
  });

  const rejectMutation = useMutation({
    mutationFn: ({task, reason}: {task: DailyTask; reason: string}) =>
      taskApi.reject(task.id, reason),
    onSuccess: () => {
      setRejectingTask(null);
      setRejectReason('');
      invalidateTasks();
    },
    onError: error => message.error('操作失败', error.message),
  });

  const memberOptions = [
    ...(manager
      ? (membersQuery.data ?? []).map(member => ({
          label: member.nickname || member.username,
          value: member.id,
        }))
      : []),
  ];

  const tasks = tasksQuery.data ?? [];

  const openConfirm = (task: DailyTask) => {
    setConfirmingTask(task);
    setConfirmPoints(String(task.points));
    setConfirmRemark('');
  };

  return (
    <Screen
      title="突触管理"
      subtitle="查看每日任务，完成后等待家长确认"
      refreshing={tasksQuery.isFetching}
      onRefresh={() => {
        tasksQuery.refetch();
      }}>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>日期</Text>
        <DatePickerRow value={taskDate} onChange={setTaskDate} />
      </View>
      <View style={styles.filterGroup}>
        <Text style={styles.filterLabel}>状态</Text>
        <ChoiceChips options={statusOptions} value={status} onChange={setStatus} />
      </View>
      {manager && memberOptions.length > 0 ? (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>成员</Text>
          <ChoiceChips
            options={memberOptions}
            value={userId ?? ''}
            onChange={value => setUserId(value || undefined)}
          />
        </View>
      ) : null}

      {tasks.length === 0 ? (
        <Card mode="outlined">
          <Card.Content>
            <EmptyState title="没有符合条件的任务" />
          </Card.Content>
        </Card>
      ) : (
        tasks.map(task => (
          <TaskCard
            completing={completeMutation.isPending}
            confirming={confirmMutation.isPending}
            currentUserId={user?.id}
            key={task.id}
            manager={manager}
            onComplete={() => completeMutation.mutate(task)}
            onConfirm={() => openConfirm(task)}
            onReject={() => {
              setRejectingTask(task);
              setRejectReason('');
            }}
            task={task}
          />
        ))
      )}

      <Portal>
        <Dialog
          visible={!!confirmingTask}
          onDismiss={() => setConfirmingTask(null)}>
          <Dialog.Title>确认突触</Dialog.Title>
          <Dialog.Content>
            <View style={styles.modalBody}>
              <Text style={styles.meta}>{confirmingTask?.name}</Text>
              <TextInput
                keyboardType="numeric"
                label="发放血清素"
                mode="outlined"
                onChangeText={setConfirmPoints}
                value={confirmPoints}
              />
              <TextInput
                label="确认备注"
                mode="outlined"
                multiline
                onChangeText={setConfirmRemark}
                placeholder="可选"
                value={confirmRemark}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmingTask(null)}>取消</Button>
            <Button
              disabled={!confirmPoints.trim() || Number.isNaN(Number(confirmPoints))}
              loading={confirmMutation.isPending}
              mode="contained"
              onPress={() => {
                if (confirmingTask) {
                  confirmMutation.mutate({
                    task: confirmingTask,
                    points: Number(confirmPoints),
                    remark: confirmRemark.trim(),
                  });
                }
              }}>
              确认并发放
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog
          visible={!!rejectingTask}
          onDismiss={() => setRejectingTask(null)}>
          <Dialog.Title>打回突触</Dialog.Title>
          <Dialog.Content>
            <View style={styles.modalBody}>
              <Text style={styles.meta}>{rejectingTask?.name}</Text>
              <TextInput
                label="打回原因"
                mode="outlined"
                multiline
                onChangeText={setRejectReason}
                placeholder="请输入打回原因"
                value={rejectReason}
              />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRejectingTask(null)}>取消</Button>
            <Button
              buttonColor={colors.danger}
              disabled={!rejectReason.trim()}
              loading={rejectMutation.isPending}
              mode="contained"
              onPress={() => {
                if (rejectingTask) {
                  rejectMutation.mutate({
                    task: rejectingTask,
                    reason: rejectReason.trim(),
                  });
                }
              }}>
              提交
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </Screen>
  );
}

function TaskCard({
  task,
  manager,
  currentUserId,
  completing,
  confirming,
  onComplete,
  onConfirm,
  onReject,
}: {
  task: DailyTask;
  manager: boolean;
  currentUserId?: string;
  completing: boolean;
  confirming: boolean;
  onComplete: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  const isSelfTask = currentUserId === task.userId;

  return (
    <Card mode="outlined">
      <Card.Content>
        <View style={styles.taskHead}>
          <View style={styles.taskInfo}>
            <Text style={styles.title}>{task.name}</Text>
            <Text style={styles.meta}>
              {task.category || '日常'} · {task.points} 血清素
            </Text>
          </View>
          <StatusPill
            label={taskStatusLabel(task.status)}
            tone={task.status === 'REJECTED' ? 'danger' : task.status === 'PENDING' ? 'warning' : 'success'}
          />
        </View>

        {task.deadlineTime ? (
          <Text style={styles.meta}>截止时间：{task.deadlineTime}</Text>
        ) : null}
      </Card.Content>

      <Card.Actions style={styles.actions}>
        {!manager && isSelfTask && (task.status === 'PENDING' || task.status === 'REJECTED') ? (
          <Button
            loading={completing}
            mode="contained"
            onPress={onComplete}
          >
            完成打卡
          </Button>
        ) : null}
        {manager && task.status === 'COMPLETED' ? (
          <>
            <Button
              loading={confirming}
              mode="contained"
              onPress={onConfirm}
            >
              确认
            </Button>
            <Button
              buttonColor={colors.danger}
              mode="contained"
              onPress={onReject}
            >
              打回
            </Button>
          </>
        ) : null}
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  taskHead: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  taskInfo: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  meta: {
    color: colors.muted,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  filterGroup: {
    gap: spacing.sm,
  },
  filterLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  modalBody: {
    gap: spacing.md,
  },
});
