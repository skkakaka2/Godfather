import { useMemo, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Col, Popconfirm, Row, Select, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";

import { PageHeading } from "@/components/PageHeading";
import { StatusTag } from "@/components/StatusTag";
import { storeApi, userApi } from "@/lib/api";
import { formatDateTime, formatPoints } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { RedeemOrder } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";

const statusOptions = [
  { label: "全部状态", value: "" },
  { label: "待审批", value: "PENDING" },
  { label: "已通过", value: "APPROVED" },
  { label: "已拒绝", value: "REJECTED" },
];

export function RedeemOrdersPage() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState<number | undefined>();

  const canApprove =
    currentUser?.role === "ADMIN" || currentUser?.role === "PARENT";

  const membersQuery = useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: userApi.familyMembers,
  });

  const ordersQuery = useQuery({
    queryKey: queryKeys.redeemOrders({ status, userId }),
    queryFn: () => storeApi.getRedeemOrders({ status: status || undefined, userId }),
  });

  const approveMutation = useMutation({
    mutationFn: storeApi.approveRedeemOrder,
    onSuccess: async () => {
      message.success("订单已审批通过");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.redeemOrdersRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.pointLogsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance }),
      ]);
    },
    onError: (error) => message.error(error.message),
  });

  const rejectMutation = useMutation({
    mutationFn: storeApi.rejectRedeemOrder,
    onSuccess: async () => {
      message.success("订单已拒绝并退还积分");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.redeemOrdersRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.rewardsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.pointLogsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance }),
      ]);
    },
    onError: (error) => message.error(error.message),
  });

  const columns = useMemo<ColumnsType<RedeemOrder>>(
    () => [
      {
        title: "申请时间",
        dataIndex: "createdAt",
        render: (value: string) => formatDateTime(value),
      },
      {
        title: "兑换人",
        dataIndex: "userId",
        render: (value: number) =>
          membersQuery.data?.find((item) => item.id === value)?.nickname ?? `#${value}`,
      },
      {
        title: "奖励",
        dataIndex: "rewardName",
      },
      {
        title: "消耗积分",
        dataIndex: "pointsCost",
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
          if (!canApprove || record.status !== "PENDING") {
            return <Typography.Text type="secondary">无可执行操作</Typography.Text>;
          }

          return (
            <Space>
              <Button
                type="primary"
                onClick={() => approveMutation.mutate(record.id)}
                loading={approveMutation.isPending}
              >
                通过
              </Button>
              <Popconfirm
                title="确认拒绝该兑换申请？"
                okText="确认拒绝"
                cancelText="取消"
                onConfirm={() => rejectMutation.mutate(record.id)}
              >
                <Button danger loading={rejectMutation.isPending}>
                  拒绝
                </Button>
              </Popconfirm>
            </Space>
          );
        },
      },
    ],
    [approveMutation, canApprove, membersQuery.data, rejectMutation],
  );

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="兑换审批"
        description="这里先承接当前后端的申请、通过、拒绝流程。通知和审批备注可以后续再补。"
      />

      <Card className="glass-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Typography.Text strong>状态</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={status}
              onChange={setStatus}
              options={statusOptions}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Typography.Text strong>成员</Typography.Text>
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

      <Card className="glass-card" title="订单列表">
        <Table<RedeemOrder>
          rowKey="id"
          columns={columns}
          dataSource={ordersQuery.data ?? []}
          loading={ordersQuery.isLoading}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 960 }}
        />
      </Card>
    </Space>
  );
}
