import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Typography,
} from "antd";
import dayjs from "dayjs";

import { PageHeading } from "@/components/PageHeading";
import { StatusTag } from "@/components/StatusTag";
import { taskApi, userApi } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { formatDate, formatPoints } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { DailyTask } from "@/lib/types";

const statusOptions = [
  { label: "全部状态", value: "" },
  { label: "待完成", value: "PENDING" },
  { label: "待确认", value: "COMPLETED" },
  { label: "已确认", value: "CONFIRMED" },
  { label: "已打回", value: "REJECTED" },
];

type ConfirmFormValues = {
  points?: number;
  remark?: string;
};

type RejectFormValues = {
  reason: string;
};

export function TasksPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [status, setStatus] = useState("");
  const [taskDate, setTaskDate] = useState<string | undefined>(dayjs().format("YYYY-MM-DD"));
  const [userId, setUserId] = useState<string | undefined>(currentUser?.id);
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmForm] = Form.useForm<ConfirmFormValues>();
  const [rejectForm] = Form.useForm<RejectFormValues>();

  const canReview = currentUser?.role === "ADMIN" || currentUser?.role === "PARENT";

  const membersQuery = useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: userApi.familyMembers,
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks({ status, taskDate, userId }),
    queryFn: () => taskApi.list({ status: status || undefined, taskDate, userId }),
  });

  const invalidateTasks = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksRoot }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pointLogsRoot }),
    ]);
  };

  const completeMutation = useMutation({
    mutationFn: ({ id, userId: assigneeId }: { id: string; userId: string }) => taskApi.complete(id, assigneeId),
    onSuccess: async () => {
      message.success("突触已激活，等待前额叶确认");
      await invalidateTasks();
    },
    onError: (error) => message.error(error.message),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: ConfirmFormValues }) =>
      taskApi.confirm(id, values.points, values.remark),
    onSuccess: async () => {
      message.success("突触已确认，血清素已发放");
      setConfirmOpen(false);
      setSelectedTask(null);
      confirmForm.resetFields();
      await invalidateTasks();
    },
    onError: (error) => message.error(error.message),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: RejectFormValues }) => taskApi.reject(id, values.reason),
    onSuccess: async () => {
      message.success("突触已打回");
      setRejectOpen(false);
      setSelectedTask(null);
      rejectForm.resetFields();
      await invalidateTasks();
    },
    onError: (error) => message.error(error.message),
  });

  const getMemberName = (id: string) => membersQuery.data?.find((item) => item.id === id)?.nickname ?? `#${id}`;

  const tasks = tasksQuery.data ?? [];

  const renderActions = (record: DailyTask) => {
    const isSelfTask = currentUser?.id === record.userId;
    return (
      <Space wrap>
        {(record.status === "PENDING" || record.status === "REJECTED") && isSelfTask ? (
          <Button
            type="primary"
            size="small"
            onClick={() => completeMutation.mutate({ id: record.id, userId: record.userId })}
            loading={completeMutation.isPending}
          >
            激活突触
          </Button>
        ) : null}

        {record.status === "COMPLETED" && canReview ? (
          <>
            <Button
              size="small"
              onClick={() => {
                setSelectedTask(record);
                confirmForm.setFieldsValue({ points: record.points, remark: "" });
                setConfirmOpen(true);
              }}
            >
              确认发血清素
            </Button>
            <Button
              size="small"
              danger
              onClick={() => {
                setSelectedTask(record);
                rejectForm.resetFields();
                setRejectOpen(true);
              }}
            >
              打回
            </Button>
          </>
        ) : null}
      </Space>
    );
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading title="突触管理" description="当前页面优先承接后端已经可用的激活、前额叶确认、打回流程。" />

      <Card className="glass-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8} lg={6}>
            <Typography.Text strong>日期</Typography.Text>
            <DatePicker
              style={{ width: "100%", marginTop: 8 }}
              value={taskDate ? dayjs(taskDate) : undefined}
              onChange={(_, dateString) => setTaskDate((dateString as string) || undefined)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8} lg={6}>
            <Typography.Text strong>状态筛选</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </Col>
          {canReview ? (
            <Col xs={24} md={8} lg={6}>
              <Typography.Text strong>执行人</Typography.Text>
              <Select
                style={{ width: "100%", marginTop: 8 }}
                placeholder="筛选成员"
                allowClear
                value={userId}
                onChange={(value) => setUserId(value)}
                options={membersQuery.data?.map((item) => ({
                  label: item.nickname,
                  value: item.id,
                }))}
              />
            </Col>
          ) : null}
        </Row>
      </Card>

      {tasksQuery.isLoading ? (
        <Card className="glass-card" loading />
      ) : tasks.length === 0 ? (
        <Card className="glass-card">
          <Typography.Text type="secondary">今天还没有突触</Typography.Text>
        </Card>
      ) : (
        <Row gutter={[12, 12]}>
          {tasks.map((task) => (
            <Col xs={24} md={12} key={task.id}>
              <Card className="glass-card" size="small" style={{ borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <Typography.Text strong style={{ fontSize: 15 }}>{task.name}</Typography.Text>
                  <StatusTag status={task.status} />
                </div>
                <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                  {task.category || "未分类"} · {getMemberName(task.userId)} · {formatDate(task.taskDate)}
                </Typography.Text>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                  <Typography.Text>{formatPoints(task.points)}</Typography.Text>
                  {renderActions(task)}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title={`确认突触：${selectedTask?.name ?? ""}`}
        open={confirmOpen}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedTask(null);
        }}
        footer={null}
      >
        <Form<ConfirmFormValues>
          form={confirmForm}
          layout="vertical"
          onFinish={(values) => {
            if (selectedTask) {
              confirmMutation.mutate({ id: selectedTask.id, values });
            }
          }}
        >
          <Form.Item name="points" label="发放血清素">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="remark" label="确认备注">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={confirmMutation.isPending}>
            确认并发放血清素
          </Button>
        </Form>
      </Modal>

      <Modal
        title={`打回突触：${selectedTask?.name ?? ""}`}
        open={rejectOpen}
        onCancel={() => {
          setRejectOpen(false);
          setSelectedTask(null);
        }}
        footer={null}
      >
        <Form<RejectFormValues>
          form={rejectForm}
          layout="vertical"
          onFinish={(values) => {
            if (selectedTask) {
              rejectMutation.mutate({ id: selectedTask.id, values });
            }
          }}
        >
          <Form.Item name="reason" label="打回原因" rules={[{ required: true, message: "请填写打回原因" }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" danger htmlType="submit" block loading={rejectMutation.isPending}>
            确认打回
          </Button>
        </Form>
      </Modal>
    </Space>
  );
}
