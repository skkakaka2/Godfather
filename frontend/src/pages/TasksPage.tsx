import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";

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
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState<number | undefined>();
  const [selectedTask, setSelectedTask] = useState<DailyTask | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [confirmForm] = Form.useForm<ConfirmFormValues>();
  const [rejectForm] = Form.useForm<RejectFormValues>();

  const canReview = currentUser?.role === "ADMIN";

  const membersQuery = useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: userApi.familyMembers,
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks({ status, userId }),
    queryFn: () => taskApi.list({ status: status || undefined, userId }),
  });

  const invalidateTasks = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.tasksRoot }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pointLogsRoot }),
    ]);
  };

  const completeMutation = useMutation({
    mutationFn: ({ id, userId: assigneeId }: { id: number; userId: number }) =>
      taskApi.complete(id, assigneeId),
    onSuccess: async () => {
      message.success("任务已打卡，等待家长确认");
      await invalidateTasks();
    },
    onError: (error) => message.error(error.message),
  });

  const confirmMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: ConfirmFormValues }) =>
      taskApi.confirm(id, values.points, values.remark),
    onSuccess: async () => {
      message.success("任务已确认，积分已发放");
      setConfirmOpen(false);
      setSelectedTask(null);
      confirmForm.resetFields();
      await invalidateTasks();
    },
    onError: (error) => message.error(error.message),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: RejectFormValues }) =>
      taskApi.reject(id, values.reason),
    onSuccess: async () => {
      message.success("任务已打回");
      setRejectOpen(false);
      setSelectedTask(null);
      rejectForm.resetFields();
      await invalidateTasks();
    },
    onError: (error) => message.error(error.message),
  });

  const columns = useMemo<ColumnsType<DailyTask>>(
    () => [
      {
        title: "任务",
        dataIndex: "name",
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{record.name}</Typography.Text>
            <Typography.Text type="secondary">{record.category || "未分类"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "执行人",
        dataIndex: "userId",
        render: (value: number) =>
          membersQuery.data?.find((item) => item.id === value)?.nickname ?? `#${value}`,
      },
      {
        title: "日期",
        dataIndex: "taskDate",
        render: (value: string) => formatDate(value),
      },
      {
        title: "积分",
        dataIndex: "points",
        render: (value: number) => formatPoints(value),
      },
      {
        title: "状态",
        dataIndex: "status",
        render: (value: string) => <StatusTag status={value} />,
      },
      {
        title: "操作",
        key: "actions",
        render: (_, record) => {
          const isSelfTask = currentUser?.id === record.userId;

          return (
            <Space wrap>
              {(record.status === "PENDING" || record.status === "REJECTED") && isSelfTask ? (
                <Button
                  type="primary"
                  onClick={() => completeMutation.mutate({ id: record.id, userId: record.userId })}
                  loading={completeMutation.isPending}
                >
                  打卡完成
                </Button>
              ) : null}

              {record.status === "COMPLETED" && canReview ? (
                <>
                  <Button
                    onClick={() => {
                      setSelectedTask(record);
                      confirmForm.setFieldsValue({
                        points: record.points,
                        remark: "",
                      });
                      setConfirmOpen(true);
                    }}
                  >
                    确认发积分
                  </Button>
                  <Button
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
        },
      },
    ],
    [
      canReview,
      completeMutation,
      confirmForm,
      currentUser?.id,
      membersQuery.data,
      rejectForm,
    ],
  );

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="任务管理"
        description="当前页面优先承接后端已经可用的打卡、家长确认、打回流程。"
      />

      <Card className="glass-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Typography.Text strong>状态筛选</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
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
        </Row>
      </Card>

      <Card className="glass-card" title="任务列表">
        <Table<DailyTask>
          rowKey="id"
          columns={columns}
          dataSource={tasksQuery.data ?? []}
          loading={tasksQuery.isLoading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 920 }}
        />
      </Card>

      <Modal
        title={`确认任务：${selectedTask?.name ?? ""}`}
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
          <Form.Item name="points" label="发放积分">
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="remark" label="确认备注">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={confirmMutation.isPending}>
            确认并发放积分
          </Button>
        </Form>
      </Modal>

      <Modal
        title={`打回任务：${selectedTask?.name ?? ""}`}
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
          <Form.Item
            name="reason"
            label="打回原因"
            rules={[{ required: true, message: "请填写打回原因" }]}
          >
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
