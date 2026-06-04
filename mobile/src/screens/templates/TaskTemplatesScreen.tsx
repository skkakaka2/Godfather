import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {useState} from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {Button, Card, Dialog, Portal, Switch, Text, TextInput} from 'react-native-paper';

import {templateApi} from '../../api';
import {ChoiceChips} from '../../components/ChoiceChips';
import {ConfirmDialog} from '../../components/ConfirmDialog';
import {EmptyState} from '../../components/EmptyState';
import {message} from '../../components/MessageHost';
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
  const [deletingTemplate, setDeletingTemplate] = useState<TaskTemplate | null>(null);
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
      <Button mode="contained" onPress={openCreate}>
        新增模板
      </Button>

      {templates.length === 0 ? (
        <Card mode="outlined">
          <Card.Content>
            <EmptyState title="暂无任务模板" />
          </Card.Content>
        </Card>
      ) : (
        templates.map(template => (
          <Card key={template.id} mode="outlined">
            <Card.Content>
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
            </Card.Content>
            <Card.Actions style={styles.actions}>
              <Button mode="contained-tonal" onPress={() => openEdit(template)}>
                编辑
              </Button>
              <Button
                buttonColor={colors.danger}
                loading={deleteMutation.isPending}
                mode="contained"
                onPress={() => setDeletingTemplate(template)}>
                删除
              </Button>
            </Card.Actions>
          </Card>
        ))
      )}

      <Portal>
        <Dialog visible={formOpen} onDismiss={closeForm}>
          <Dialog.Title>{editingTemplate ? '编辑模板' : '新增模板'}</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView contentContainerStyle={styles.modalBody}>
              <TextInput
                label="模板名称"
                mode="outlined"
                onChangeText={name => setForm(current => ({...current, name}))}
                placeholder="例如 阅读 30 分钟"
                value={form.name}
              />
              <Text style={styles.label}>分类</Text>
              <ChoiceChips
                options={CATEGORY_OPTIONS.map(item => ({
                  label: item.label,
                  value: item.value,
                }))}
                value={form.category}
                onChange={category => setForm(current => ({...current, category}))}
              />
              <TextInput
                keyboardType="numeric"
                label="默认血清素"
                mode="outlined"
                onChangeText={defaultPoints => setForm(current => ({...current, defaultPoints}))}
                value={form.defaultPoints}
              />
              <WeekdayPicker
                value={form.weekdays}
                onChange={weekdays => setForm(current => ({...current, weekdays}))}
              />
              <TextInput
                label="截止时间"
                mode="outlined"
                onChangeText={deadlineTime => setForm(current => ({...current, deadlineTime}))}
                placeholder="HH:mm"
                value={form.deadlineTime}
              />
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.label}>启用状态</Text>
                  <Text style={styles.meta}>{form.enabled ? '已启用' : '已停用'}</Text>
                </View>
                <Switch
                  value={!!form.enabled}
                  onValueChange={() =>
                    setForm(current => ({
                      ...current,
                      enabled: current.enabled ? 0 : 1,
                    }))
                  }
                />
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={closeForm}>取消</Button>
            <Button
              disabled={!form.name.trim() || !Number(form.defaultPoints)}
              loading={saveMutation.isPending}
              mode="contained"
              onPress={submit}>
              保存
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <ConfirmDialog
        danger
        confirmLabel="删除"
        message={`确定删除 ${deletingTemplate?.name ?? ''}？`}
        onConfirm={() => {
          if (deletingTemplate) {
            deleteMutation.mutate(deletingTemplate.id);
            setDeletingTemplate(null);
          }
        }}
        onDismiss={() => setDeletingTemplate(null)}
        title="删除模板"
        visible={!!deletingTemplate}
      />
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
  actions: {
    paddingHorizontal: spacing.md,
  },
  modalBody: {
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  switchRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
