import { useMemo, useState } from "react";

import {
  CheckOutlined,
  CloseOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Checkbox,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Popconfirm,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  TimePicker,
  Typography,
} from "antd";
import dayjs from "dayjs";

import { PageHeading } from "@/components/PageHeading";
import { templateApi } from "@/lib/api";
import { formatPoints } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { TaskTemplate, TaskTemplatePayload } from "@/lib/types";

const CATEGORY_OPTIONS = [
  { value: "STUDY", label: "学习", color: "blue" },
  { value: "SPORT", label: "运动", color: "green" },
  { value: "CHORE", label: "家务", color: "orange" },
  { value: "HOBBY", label: "爱好", color: "purple" },
  { value: "TALENT", label: "才艺", color: "cyan" },
  { value: "OTHER", label: "其他", color: "default" },
] as const;

const WEEKDAY_OPTIONS = [
  { label: "日", value: "applicableSun" as const },
  { label: "一", value: "applicableMon" as const },
  { label: "二", value: "applicableTue" as const },
  { label: "三", value: "applicableWed" as const },
  { label: "四", value: "applicableThu" as const },
  { label: "五", value: "applicableFri" as const },
  { label: "六", value: "applicableSat" as const },
];

const categoryMap = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c])
);

type WeekdayField = (typeof WEEKDAY_OPTIONS)[number]["value"];

function getDayLabels(tpl: TaskTemplate) {
  return WEEKDAY_OPTIONS.filter(
    (opt) => tpl[opt.value] === 1
  )
    .map((opt) => `周${opt.label}`)
    .join("、");
}

const defaultFormValues: TaskTemplatePayload = {
  name: "",
  category: "STUDY",
  defaultPoints: 5,
  applicableSun: 0,
  applicableMon: 1,
  applicableTue: 1,
  applicableWed: 1,
  applicableThu: 1,
  applicableFri: 1,
  applicableSat: 0,
  deadlineTime: "21:00",
  sortOrder: 0,
  enabled: 1,
};

export function TaskTemplatesPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingTpl, setEditingTpl] = useState<TaskTemplate | null>(null);
  const [checkedDays, setCheckedDays] = useState<WeekdayField[]>([]);
  const [form] = Form.useForm<TaskTemplatePayload>();

  const templatesQuery = useQuery({
    queryKey: queryKeys.taskTemplates({}),
    queryFn: () => templateApi.list(),
  });

  const refreshTemplates = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.taskTemplatesRoot });

  const createMutation = useMutation({
    mutationFn: templateApi.create,
    onSuccess: async () => {
      message.success("模板创建成功");
      setDrawerOpen(false);
      form.resetFields();
      await refreshTemplates();
    },
    onError: (error) => message.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskTemplatePayload }) =>
      templateApi.update(id, payload),
    onSuccess: async () => {
      message.success("模板更新成功");
      setDrawerOpen(false);
      setEditingTpl(null);
      form.resetFields();
      await refreshTemplates();
    },
    onError: (error) => message.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: templateApi.remove,
    onSuccess: async () => {
      message.success("模板已删除");
      await refreshTemplates();
    },
    onError: (error) => message.error(error.message),
  });

  const templates = useMemo(
    () => templatesQuery.data ?? [],
    [templatesQuery.data]
  );

  const openCreate = () => {
    setEditingTpl(null);
    form.setFieldsValue({
      ...defaultFormValues,
      deadlineTime: dayjs(defaultFormValues.deadlineTime, "HH:mm") as unknown as string,
    });
    setCheckedDays(
      WEEKDAY_OPTIONS.filter((opt) => (defaultFormValues as Record<string, unknown>)[opt.value] === 1).map((opt) => opt.value)
    );
    setDrawerOpen(true);
  };

  const openEdit = (tpl: TaskTemplate) => {
    setEditingTpl(tpl);
    form.setFieldsValue({
      name: tpl.name,
      category: tpl.category,
      icon: tpl.icon ?? "",
      defaultPoints: tpl.defaultPoints,
      applicableSun: tpl.applicableSun,
      applicableMon: tpl.applicableMon,
      applicableTue: tpl.applicableTue,
      applicableWed: tpl.applicableWed,
      applicableThu: tpl.applicableThu,
      applicableFri: tpl.applicableFri,
      applicableSat: tpl.applicableSat,
      deadlineTime: dayjs(tpl.deadlineTime, "HH:mm") as unknown as string,
      sortOrder: tpl.sortOrder ?? 0,
      enabled: tpl.enabled,
    });
    setCheckedDays(
      WEEKDAY_OPTIONS.filter((opt) => tpl[opt.value] === 1).map((opt) => opt.value)
    );
    setDrawerOpen(true);
  };

  const handleSubmit = () => {
    const allValues = form.getFieldsValue(true) as TaskTemplatePayload;
    const payload = {
      ...allValues,
      deadlineTime: dayjs.isDayjs(allValues.deadlineTime)
        ? (allValues.deadlineTime as unknown as dayjs.Dayjs).format("HH:mm")
        : allValues.deadlineTime,
    };
    if (editingTpl) {
      updateMutation.mutate({ id: editingTpl.id, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="突触模板"
        description="创建和管理可复用的突触模板，系统将按模板自动生成每日突触。"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            新建模板
          </Button>
        }
      />

      {templates.length === 0 ? (
        <Card className="glass-card">
          <Empty description="暂无突触模板，点击上方按钮创建" />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {templates.map((tpl) => {
            const cat = categoryMap[tpl.category] ?? {
              label: tpl.category,
              color: "default" as const,
            };
            return (
              <Col xs={24} md={12} xl={8} key={tpl.id}>
                <Card className="reward-card animate-enter" bordered={false}>
                  <div className="reward-card__cover">
                    <div className="reward-card__orb" />
                    <Tag color={tpl.enabled === 1 ? "green" : "default"}>
                      {tpl.enabled === 1 ? "已启用" : "已禁用"}
                    </Tag>
                  </div>

                  <Space direction="vertical" size={14} style={{ width: "100%" }}>
                    <div>
                      <Typography.Title level={4} style={{ marginBottom: 6 }}>
                        {tpl.name}
                      </Typography.Title>
                      <Space size={8}>
                        <Tag color={cat.color}>{cat.label}</Tag>
                        <Tag icon={<CopyOutlined />}>{getDayLabels(tpl) || "未设置"}</Tag>
                      </Space>
                    </div>

                    <div className="reward-card__meta">
                      <div>
                        <span>默认血清素</span>
                        <strong>{formatPoints(tpl.defaultPoints)}</strong>
                      </div>
                      <div>
                        <span>截止时间</span>
                        <strong>{tpl.deadlineTime || "未设置"}</strong>
                      </div>
                    </div>

                    <Space wrap>
                      <Button icon={<EditOutlined />} onClick={() => openEdit(tpl)}>
                        编辑
                      </Button>
                      <Popconfirm
                        title="确认删除该模板？删除后不会影响已生成的每日突触。"
                        okText="删除"
                        cancelText="取消"
                        onConfirm={() => deleteMutation.mutate(tpl.id)}
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          loading={deleteMutation.isPending}
                        >
                          删除
                        </Button>
                      </Popconfirm>
                    </Space>
                  </Space>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      <Drawer
        title={editingTpl ? "编辑模板" : "新建模板"}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingTpl(null);
        }}
        width={480}
      >
        <Form<TaskTemplatePayload>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="模板名称"
            rules={[{ required: true, message: "请输入模板名称" }]}
          >
            <Input placeholder="例如：语文作业、钢琴练习" />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: "请选择分类" }]}
          >
            <Select options={CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))} />
          </Form.Item>

          <Form.Item name="icon" label="图标标识">
            <Input placeholder="预留字段，暂可不填" />
          </Form.Item>

          <Form.Item
            name="defaultPoints"
            label="默认血清素"
            rules={[{ required: true, message: "请输入默认血清素" }]}
          >
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="适用星期" required>
            <Checkbox.Group
              options={WEEKDAY_OPTIONS.map((opt) => ({
                label: opt.label,
                value: opt.value,
              }))}
              value={checkedDays}
              onChange={(checkedValues) => {
                const fields: Partial<Record<WeekdayField, number>> = {};
                WEEKDAY_OPTIONS.forEach((opt) => {
                  fields[opt.value] = (
                    checkedValues as WeekdayField[]
                  ).includes(opt.value)
                    ? 1
                    : 0;
                });
                form.setFieldsValue(fields);
                setCheckedDays(checkedValues as WeekdayField[]);
              }}
            />
          </Form.Item>

          <Form.Item
            name="deadlineTime"
            label="截止时间"
            rules={[{ required: true, message: "请选择截止时间" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="sortOrder" label="排序">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            name="enabled"
            label="启用状态"
            valuePropName="checked"
            getValueFromEvent={(checked: boolean) => (checked ? 1 : 0)}
            getValueProps={(value: number) => ({ checked: value === 1 })}
          >
            <Switch
              checkedChildren={<CheckOutlined />}
              unCheckedChildren={<CloseOutlined />}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {editingTpl ? "保存修改" : "创建模板"}
          </Button>
        </Form>
      </Drawer>
    </Space>
  );
}
