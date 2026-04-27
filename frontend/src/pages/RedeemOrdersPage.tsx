import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Col, Pagination, Popconfirm, Row, Select, Space, Typography } from "antd";

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
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [status, setStatus] = useState("");
  const [userId, setUserId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const canApprove = currentUser?.role === "ADMIN" || currentUser?.role === "PARENT";

  const membersQuery = useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: userApi.familyMembers,
  });

  const ordersQuery = useQuery({
    queryKey: queryKeys.redeemOrders({ status, userId, page, pageSize }),
    queryFn: () =>
      storeApi.getRedeemOrdersPaged({
        status: status || undefined,
        userId,
        page,
        pageSize,
      }),
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
      message.success("订单已拒绝并退还血清素");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.redeemOrdersRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.rewardsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.pointLogsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance }),
      ]);
    },
    onError: (error) => message.error(error.message),
  });

  const getMemberName = (id: string) => membersQuery.data?.find((item) => item.id === id)?.nickname ?? `#${id}`;

  const logData = ordersQuery.data;
  const orders = logData?.list ?? [];

  const renderActions = (order: RedeemOrder) => {
    if (!canApprove || order.status !== "PENDING") {
      return <Typography.Text type="secondary">无可执行操作</Typography.Text>;
    }
    return (
      <Space>
        <Button
          type="primary"
          size="small"
          onClick={() => approveMutation.mutate(order.id)}
          loading={approveMutation.isPending}
        >
          通过
        </Button>
        <Popconfirm
          title="确认拒绝该激发申请？"
          okText="确认拒绝"
          cancelText="取消"
          onConfirm={() => rejectMutation.mutate(order.id)}
        >
          <Button size="small" danger loading={rejectMutation.isPending}>
            拒绝
          </Button>
        </Popconfirm>
      </Space>
    );
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="激发审批"
        description="这里先承接当前后端的申请、通过、拒绝流程。通知和审批备注可以后续再补。"
      />

      <Card className="glass-card">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12} lg={8}>
            <Typography.Text strong>状态</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
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
              onChange={(value) => {
                setUserId(value);
                setPage(1);
              }}
              options={membersQuery.data?.map((item) => ({
                label: item.nickname,
                value: item.id,
              }))}
            />
          </Col>
        </Row>
      </Card>

      {ordersQuery.isLoading ? (
        <Card className="glass-card" loading />
      ) : orders.length === 0 ? (
        <Card className="glass-card">
          <Typography.Text type="secondary">暂无激发记录</Typography.Text>
        </Card>
      ) : (
        <>
          <Row gutter={[12, 12]}>
            {orders.map((order) => (
              <Col xs={24} md={12} key={order.id}>
                <Card className="glass-card" size="small" style={{ borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <Typography.Text strong style={{ fontSize: 15 }}>{order.rewardName}</Typography.Text>
                    <StatusTag status={order.status} />
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {getMemberName(order.userId)} · {formatDateTime(order.createdAt)}
                  </Typography.Text>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <Typography.Text>{formatPoints(order.pointsCost)}</Typography.Text>
                    {renderActions(order)}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          {logData && logData.total > pageSize && (
            <Pagination
              current={page}
              pageSize={pageSize}
              total={logData.total}
              showSizeChanger
              showTotal={(total) => `共 ${total} 条`}
              onChange={(p, ps) => {
                setPage(p);
                setPageSize(ps);
              }}
              style={{ textAlign: "center" }}
            />
          )}
        </>
      )}
    </Space>
  );
}
