import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {Modal, StyleSheet, Text, View} from 'react-native';

import {taskApi, userApi} from '../../api';
import {AppButton} from '../../components/AppButton';
import {Card} from '../../components/Card';
import {DatePickerRow} from '../../components/DatePickerRow';
import {EmptyState} from '../../components/EmptyState';
import {Field} from '../../components/Field';
import {message} from '../../components/MessageHost';
import {OptionTabs} from '../../components/OptionTabs';
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
        <OptionTabs options={statusOptions} value={status} onChange={setStatus} />
      </View>
      {manager && memberOptions.length > 0 ? (
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>成员</Text>
          <OptionTabs
            options={memberOptions}
            value={userId ?? ''}
            onChange={value => setUserId(value || undefined)}
          />
        </View>
      ) : null}

      {tasks.length === 0 ? (
        <Card>
          <EmptyState title="没有符合条件的任务" />
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

      <Modal
        animationType="slide"
        transparent
        visible={!!confirmingTask}
        onRequestClose={() => setConfirmingTask(null)}>
        <View style={styles.modalMask}>
          <Card>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>确认突触</Text>
              <Text style={styles.meta}>{confirmingTask?.name}</Text>
              <Field
                keyboardType="numeric"
                label="发放血清素"
                onChangeText={setConfirmPoints}
                value={confirmPoints}
              />
              <Field
                label="确认备注"
                multiline
                onChangeText={setConfirmRemark}
                placeholder="可选"
                value={confirmRemark}
              />
              <View style={styles.actions}>
                <AppButton
                  title="取消"
                  variant="ghost"
                  onPress={() => setConfirmingTask(null)}
                />
                <AppButton
                  disabled={!confirmPoints.trim() || Number.isNaN(Number(confirmPoints))}
                  loading={confirmMutation.isPending}
                  title="确认并发放"
                  onPress={() => {
                    if (confirmingTask) {
                      confirmMutation.mutate({
                        task: confirmingTask,
                        points: Number(confirmPoints),
                        remark: confirmRemark.trim(),
                      });
                    }
                  }}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={!!rejectingTask}
        onRequestClose={() => setRejectingTask(null)}>
        <View style={styles.modalMask}>
          <Card>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>打回突触</Text>
              <Text style={styles.meta}>{rejectingTask?.name}</Text>
              <Field
                label="打回原因"
                multiline
                onChangeText={setRejectReason}
                placeholder="请输入打回原因"
                value={rejectReason}
              />
              <View style={styles.actions}>
                <AppButton
                  title="取消"
                  variant="ghost"
                  onPress={() => setRejectingTask(null)}
                />
                <AppButton
                  disabled={!rejectReason.trim()}
                  loading={rejectMutation.isPending}
                  title="提交"
                  variant="danger"
                  onPress={() => {
                    if (rejectingTask) {
                      rejectMutation.mutate({
                        task: rejectingTask,
                        reason: rejectReason.trim(),
                      });
                    }
                  }}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
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
    <Card>
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

      <View style={styles.actions}>
        {!manager && isSelfTask && (task.status === 'PENDING' || task.status === 'REJECTED') ? (
          <AppButton
            loading={completing}
            onPress={onComplete}
            title="完成打卡"
          />
        ) : null}
        {manager && task.status === 'COMPLETED' ? (
          <>
            <AppButton
              loading={confirming}
              onPress={onConfirm}
              title="确认"
            />
            <AppButton
              onPress={onReject}
              title="打回"
              variant="danger"
            />
          </>
        ) : null}
      </View>
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
  modalMask: {
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
  },
  modalBody: {
    gap: spacing.md,
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
});
