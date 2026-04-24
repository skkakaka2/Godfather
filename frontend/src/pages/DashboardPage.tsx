import { useQuery } from "@tanstack/react-query";
import { Card, Col, List, Row, Skeleton, Space, Typography } from "antd";

import { PageHeading } from "@/components/PageHeading";
import { StatCard } from "@/components/StatCard";
import { StatusTag } from "@/components/StatusTag";
import { storeApi, taskApi, userApi } from "@/lib/api";
import { formatDateTime, formatPoints } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";

export function DashboardPage() {
  const today = new Date().toISOString().slice(0, 10);

  const membersQuery = useQuery({
    queryKey: queryKeys.familyMembers,
    queryFn: userApi.familyMembers,
  });

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks({ taskDate: today }),
    queryFn: () => taskApi.list({ taskDate: today }),
  });

  const balanceQuery = useQuery({
    queryKey: queryKeys.pointsBalance,
    queryFn: storeApi.getBalance,
  });

  const rewardQuery = useQuery({
    queryKey: queryKeys.rewards({ status: "ON" }),
    queryFn: () => storeApi.getRewards({ status: "ON" }),
  });

  const orderQuery = useQuery({
    queryKey: queryKeys.redeemOrders({}),
    queryFn: () => storeApi.getRedeemOrders({}),
  });

  const loading =
    membersQuery.isLoading ||
    tasksQuery.isLoading ||
    balanceQuery.isLoading ||
    rewardQuery.isLoading ||
    orderQuery.isLoading;

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const tasks = tasksQuery.data ?? [];
  const pendingTasks = tasks.filter((item) => item.status === "PENDING").length;
  const waitingConfirm = tasks.filter((item) => item.status === "COMPLETED").length;
  const rewards = rewardQuery.data ?? [];
  const orders = orderQuery.data ?? [];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="家庭节奏总览"
        description="先把今日任务、积分余额和待审批兑换放到同一屏上，便于家长快速介入。"
      />

      <div className="stat-grid">
        <StatCard label="今日任务" value={tasks.length} hint="包含已完成与待确认" />
        <StatCard
          label="待完成"
          value={pendingTasks}
          hint="还未打卡的任务"
          tone="gold"
        />
        <StatCard
          label="待确认"
          value={waitingConfirm}
          hint="需要家长处理"
          tone="blue"
        />
        <StatCard
          label="当前积分"
          value={formatPoints(balanceQuery.data)}
          hint="当前登录用户余额"
          tone="green"
        />
      </div>

      <Row gutter={[20, 20]}>
        <Col xs={24} xl={14}>
          <Card className="glass-card" title="今日任务清单">
            <List
              dataSource={tasks.slice(0, 6)}
              locale={{ emptyText: "今天还没有任务" }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.name}
                    description={`执行人 #${item.userId} · ${formatPoints(item.points)}`}
                  />
                  <StatusTag status={item.status} />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card className="glass-card" title="家庭成员">
            <List
              dataSource={membersQuery.data ?? []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.nickname} description={item.username} />
                  <Space>
                    <Typography.Text>{formatPoints(item.points)}</Typography.Text>
                    <StatusTag status={item.role} />
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className="glass-card" title="上架奖励">
            <List
              dataSource={rewards.slice(0, 5)}
              locale={{ emptyText: "暂无上架奖励" }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta title={item.name} description={item.description || "暂无描述"} />
                  <Typography.Text strong>{formatPoints(item.pointsPrice)}</Typography.Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card className="glass-card" title="最近兑换订单">
            <List
              dataSource={orders.slice(0, 5)}
              locale={{ emptyText: "暂无兑换记录" }}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.rewardName}
                    description={formatDateTime(item.createdAt)}
                  />
                  <StatusTag status={item.status} />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
