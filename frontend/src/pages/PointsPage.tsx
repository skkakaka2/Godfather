import { useMemo, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Card, Col, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import { PageHeading } from "@/components/PageHeading";
import { StatCard } from "@/components/StatCard";
import { StatusTag } from "@/components/StatusTag";
import { storeApi, userApi } from "@/lib/api";
import { formatDateTime, formatPoints } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { PointLog } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";

const typeOptions = [
  { label: "全部类型", value: "" },
  { label: "冻结血清素", value: "FREEZE" },
  { label: "正式扣除", value: "REDEEM" },
  { label: "解冻退还", value: "UNFREEZE" },
  { label: "手动增加", value: "MANUAL_ADD" },
  { label: "手动扣减", value: "MANUAL_SUB" },
  { label: "收入", value: "EARN" },
];

export function PointsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const [type, setType] = useState("");
  const [userId, setUserId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const membersQuery = useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: userApi.familyMembers,
  });

  const logsQuery = useQuery({
    queryKey: queryKeys.pointLogs({ userId, type, page, pageSize }),
    queryFn: () =>
      storeApi.getPointLogs({
        userId,
        type: type || undefined,
        page,
        pageSize,
      }),
  });

  const balanceQuery = useQuery({
    queryKey: queryKeys.pointsBalance,
    queryFn: storeApi.getBalance,
  });

  const columns = useMemo<ColumnsType<PointLog>>(
    () => [
      {
        title: "时间",
        dataIndex: "createdAt",
        render: (value: string) => formatDateTime(value),
      },
      {
        title: "用户",
        dataIndex: "userId",
        render: (value: string) =>
          membersQuery.data?.find((item) => item.id === value)?.nickname ?? `#${value}`,
      },
      {
        title: "类型",
        dataIndex: "type",
        render: (value: string) => <StatusTag status={value} />,
      },
      {
        title: "变动",
        dataIndex: "amount",
        render: (value: number) => (
          <Typography.Text type={value >= 0 ? "success" : "danger"}>
            {value >= 0 ? "+" : ""}
            {value}
          </Typography.Text>
        ),
      },
      {
        title: "余额",
        dataIndex: "balanceAfter",
        render: (value: number) => formatPoints(value),
      },
      {
        title: "说明",
        dataIndex: "remark",
        render: (value: string | null) => value || "-",
      },
    ],
    [membersQuery.data],
  );

  const logData = logsQuery.data;
  const logs = logData?.list ?? [];
  const income = logs.filter((item) => item.amount > 0).reduce((sum, item) => sum + item.amount, 0);
  const outcome = logs.filter((item) => item.amount < 0).reduce((sum, item) => sum + Math.abs(item.amount), 0);

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="血清素流水"
        description="当前版本先覆盖余额、流水和基础筛选，后面再补统计图、排行榜和规则中心。"
      />

      <div className="stat-grid">
        <StatCard
          label="当前余额"
          value={formatPoints(balanceQuery.data)}
          hint={`${currentUser?.nickname ?? currentUser?.username ?? "当前用户"} 的可用血清素`}
        />
        <StatCard label="本页收入" value={`${income} 滴`} hint="当前页数据中累计收入" tone="green" />
        <StatCard label="本页支出" value={`${outcome} 滴`} hint="当前页数据中累计支出" tone="gold" />
      </div>

      <Card className="glass-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={12} lg={8}>
            <Typography.Text strong>星球居民</Typography.Text>
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
                label: `${item.nickname} (${item.username})`,
                value: item.id,
              }))}
            />
          </Col>
          <Col xs={24} md={12} lg={8}>
            <Typography.Text strong>流水类型</Typography.Text>
            <Select
              style={{ width: "100%", marginTop: 8 }}
              value={type}
              onChange={(value) => {
                setType(value);
                setPage(1);
              }}
              options={typeOptions}
            />
          </Col>
        </Row>
      </Card>

      <Card className="glass-card" title="血清素流水明细">
        <Table<PointLog>
          rowKey="id"
          columns={columns}
          dataSource={logData?.list ?? []}
          loading={logsQuery.isLoading}
          pagination={{
            current: page,
            pageSize,
            total: logData?.total ?? 0,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
          scroll={{ x: 920 }}
        />
      </Card>
    </Space>
  );
}
