import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {Alert, Modal, Pressable, StyleSheet, Text, View} from 'react-native';

import {templateApi} from '../../api';
import {AppButton} from '../../components/AppButton';
import {Card} from '../../components/Card';
import {EmptyState} from '../../components/EmptyState';
import {Field} from '../../components/Field';
import {message} from '../../components/MessageHost';
import {OptionTabs} from '../../components/OptionTabs';
import {Screen} from '../../components/Screen';
import {StatusPill} from '../../components/StatusPill';
import {WeekdayPicker, type WeekdayValues} from '../../components/WeekdayPicker';
import {colors, spacing} from '../../theme/theme';
import {CATEGORY_OPTIONS, categoryLabel} from '../../utils/format';
import type {TaskTemplate, TaskTemplatePayload} from '../../types/domain';

const defaultWeekdays: WeekdayValues = {
  applicableSun: 0,
  applicableMon: 1,
  applicableTue: 1,
  applicableWed: 1,
  applicableThu: 1,
  applicableFri: 1,
  applicableSat: 0,
};

const emptyForm = {
  name: '',
  category: 'STUDY',
  icon: '',
  defaultPoints: '10',
  deadlineTime: '21:00',
  sortOrder: '0',
  enabled: 1,
  weekdays: defaultWeekdays,
};

export function TaskTemplatesScreen() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);

  const templatesQuery = useQuery({
    queryKey: ['templates'],
    queryFn: templateApi.list,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({queryKey: ['templates']});
  };

  const saveMutation = useMutation({
    mutationFn: ({id, payload}: {id?: string; payload: TaskTemplatePayload}) =>
      id ? templateApi.update(id, payload) : templateApi.create(payload),
    onSuccess: () => {
      closeForm();
      invalidate();
    },
    onError: error => message.error('保存失败', error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: templateApi.remove,
    onSuccess: invalidate,
    onError: error => message.error('删除失败', error.message),
  });

  const openCreate = () => {
    setEditingTemplate(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setForm({
      name: template.name,
      category: template.category,
      icon: template.icon ?? '',
      defaultPoints: String(template.defaultPoints),
      deadlineTime: template.deadlineTime,
      sortOrder: String(template.sortOrder ?? 0),
      enabled: template.enabled,
      weekdays: {
        applicableSun: template.applicableSun,
        applicableMon: template.applicableMon,
        applicableTue: template.applicableTue,
        applicableWed: template.applicableWed,
        applicableThu: template.applicableThu,
        applicableFri: template.applicableFri,
        applicableSat: template.applicableSat,
      },
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingTemplate(null);
    setForm(emptyForm);
  };

  const submit = () => {
    const payload: TaskTemplatePayload = {
      name: form.name.trim(),
      category: form.category,
      icon: form.icon.trim(),
      defaultPoints: Number(form.defaultPoints),
      ...form.weekdays,
      deadlineTime: form.deadlineTime,
      sortOrder: Number(form.sortOrder || 0),
      enabled: form.enabled,
    };
    saveMutation.mutate({id: editingTemplate?.id, payload});
  };

  const templates = templatesQuery.data ?? [];

  return (
    <Screen
      hideHeading
      subtitle="维护每天自动生成任务的模板"
      refreshing={templatesQuery.isFetching}
      onRefresh={() => {
        templatesQuery.refetch();
      }}>
      <AppButton title="新增模板" onPress={openCreate} />

      {templates.length === 0 ? (
        <Card>
          <EmptyState title="暂无任务模板" />
        </Card>
      ) : (
        templates.map(template => (
          <Card key={template.id}>
            <View style={styles.head}>
              <View style={styles.info}>
                <Text style={styles.title}>{template.name}</Text>
                <Text style={styles.meta}>
                  {categoryLabel(template.category)} · {template.defaultPoints} 血清素 · {template.deadlineTime}
                </Text>
              </View>
              <StatusPill
                label={template.enabled ? '启用' : '停用'}
                tone={template.enabled ? 'success' : 'warning'}
              />
            </View>
            <View style={styles.actions}>
              <AppButton title="编辑" variant="secondary" onPress={() => openEdit(template)} />
              <AppButton
                title="删除"
                variant="danger"
                loading={deleteMutation.isPending}
                onPress={() =>
                  Alert.alert('删除模板', `确定删除 ${template.name}？`, [
                    {text: '取消', style: 'cancel'},
                    {text: '删除', style: 'destructive', onPress: () => deleteMutation.mutate(template.id)},
                  ])
                }
              />
            </View>
          </Card>
        ))
      )}

      <Modal
        animationType="slide"
        transparent
        visible={formOpen}
        onRequestClose={closeForm}>
        <View style={styles.modalMask}>
          <Card>
            <View style={styles.modalBody}>
              <Text style={styles.modalTitle}>{editingTemplate ? '编辑模板' : '新增模板'}</Text>
              <Field
                label="模板名称"
                onChangeText={name => setForm(current => ({...current, name}))}
                placeholder="例如 阅读 30 分钟"
                value={form.name}
              />
              <Text style={styles.label}>分类</Text>
              <OptionTabs
                options={CATEGORY_OPTIONS.map(item => ({
                  label: item.label,
                  value: item.value,
                }))}
                value={form.category}
                onChange={category => setForm(current => ({...current, category}))}
              />
              <Field
                keyboardType="numeric"
                label="默认血清素"
                onChangeText={defaultPoints => setForm(current => ({...current, defaultPoints}))}
                value={form.defaultPoints}
              />
              <WeekdayPicker
                value={form.weekdays}
                onChange={weekdays => setForm(current => ({...current, weekdays}))}
              />
              <Field
                label="截止时间"
                onChangeText={deadlineTime => setForm(current => ({...current, deadlineTime}))}
                placeholder="HH:mm"
                value={form.deadlineTime}
              />
              <Text style={styles.label}>启用状态</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  setForm(current => ({
                    ...current,
                    enabled: current.enabled ? 0 : 1,
                  }))
                }
                style={styles.enabledRow}>
                <Text style={styles.enabledText}>{form.enabled ? '已启用' : '已停用'}</Text>
                <Text style={styles.enabledAction}>点击切换</Text>
              </Pressable>
              <View style={styles.actions}>
                <AppButton title="取消" variant="ghost" onPress={closeForm} />
                <AppButton
                  disabled={!form.name.trim() || !Number(form.defaultPoints)}
                  loading={saveMutation.isPending}
                  title="保存"
                  onPress={submit}
                />
              </View>
            </View>
          </Card>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md,
  },
  info: {
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
    lineHeight: 19,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  enabledRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  enabledText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  enabledAction: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
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
