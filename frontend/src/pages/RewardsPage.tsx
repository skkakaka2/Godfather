import { useMemo, useState } from "react";

import { DeleteOutlined, EditOutlined, PlusOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  App,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  Input,
  InputNumber,
  Pagination,
  Popconfirm,
  Row,
  Select,
  Space,
  Tabs,
  Typography,
} from "antd";

import { PageHeading } from "@/components/PageHeading";
import { StatusTag } from "@/components/StatusTag";
import { storeApi } from "@/lib/api";
import { formatDateTime, formatPoints } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import type { Reward, RewardPayload } from "@/lib/types";
import { useAuthStore } from "@/lib/auth-store";

const statusOptions = [
  { label: "全部状态", value: "" },
  { label: "上架中", value: "ON" },
  { label: "已下架", value: "OFF" },
];

export function RewardsPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState("rewards");
  const [status, setStatus] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [redeemPage, setRedeemPage] = useState(1);
  const [redeemPageSize, setRedeemPageSize] = useState(10);
  const [form] = Form.useForm<RewardPayload>();

  const canManage = currentUser?.role === "ADMIN" || currentUser?.role === "PARENT";

  const rewardsQuery = useQuery({
    queryKey: queryKeys.rewards({ status }),
    queryFn: () => {
      if (!canManage) {
        setStatus("ON");
      }
      return storeApi.getRewards({ status: status || undefined });
    },
  });

  const refreshRewards = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.rewardsRoot }),
      queryClient.invalidateQueries({ queryKey: queryKeys.redeemOrdersRoot }),
      queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance }),
    ]);

  const createMutation = useMutation({
    mutationFn: storeApi.createReward,
    onSuccess: async () => {
      message.success("多巴胺创建成功");
      setDrawerOpen(false);
      form.resetFields();
      await refreshRewards();
    },
    onError: (error) => message.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RewardPayload }) => storeApi.updateReward(id, payload),
    onSuccess: async () => {
      message.success("多巴胺更新成功");
      setDrawerOpen(false);
      setEditingReward(null);
      form.resetFields();
      await refreshRewards();
    },
    onError: (error) => message.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: storeApi.deleteReward,
    onSuccess: async () => {
      message.success("多巴胺已删除");
      await refreshRewards();
    },
    onError: (error) => message.error(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: storeApi.toggleReward,
    onSuccess: async () => {
      message.success("状态已切换");
      await refreshRewards();
    },
    onError: (error) => message.error(error.message),
  });

  const redeemMutation = useMutation({
    mutationFn: storeApi.redeem,
    onSuccess: async () => {
      message.success("激发申请已提交");
      await Promise.all([
        refreshRewards(),
        queryClient.invalidateQueries({ queryKey: queryKeys.pointLogsRoot }),
        queryClient.invalidateQueries({ queryKey: queryKeys.redeemOrdersRoot }),
      ]);
    },
    onError: (error) => message.error(error.message),
  });

  const rewardCards = useMemo(() => rewardsQuery.data ?? [], [rewardsQuery.data]);

  const redeemOrdersQuery = useQuery({
    queryKey: [...queryKeys.redeemOrders({ status: "APPROVED" }), "my", redeemPage, redeemPageSize],
    queryFn: () =>
      storeApi.getRedeemOrdersPaged({
        userId: currentUser?.id,
        status: "APPROVED",
        page: redeemPage,
        pageSize: redeemPageSize,
      }),
    enabled: !!currentUser?.id && activeTab === "redeemed",
  });

  const openCreate = () => {
    setEditingReward(null);
    form.setFieldsValue({
      name: "",
      description: "",
      pointsPrice: 10,
      imageUrl: "",
      stock: -1,
    });
    setDrawerOpen(true);
  };

  const openEdit = (reward: Reward) => {
    setEditingReward(reward);
    form.setFieldsValue({
      name: reward.name,
      description: reward.description ?? "",
      pointsPrice: reward.pointsPrice,
      imageUrl: reward.imageUrl ?? "",
      stock: reward.stock,
    });
    setDrawerOpen(true);
  };

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="多巴胺商城"
        description="支持前额叶上架与维护多巴胺，神经元或成员直接发起激发申请。"
        extra={
          <Space>
            {canManage && activeTab === "rewards" ? (
              <Select value={status} onChange={setStatus} options={statusOptions} style={{ minWidth: 148 }} />
            ) : null}
            {canManage && activeTab === "rewards" ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                新建多巴胺
              </Button>
            ) : null}
          </Space>
        }
      />

      <Tabs
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key)}
        items={[
          {
            key: "rewards",
            label: "奖励列表",
            children: (
              <>
                {rewardCards.length === 0 ? (
                  <Card className="glass-card">
                    <Empty description="当前筛选下没有多巴胺" />
                  </Card>
                ) : (
                  <Row gutter={[16, 16]}>
                    {rewardCards.map((reward) => (
                      <Col xs={24} md={12} xl={6} key={reward.id}>
                        <Card className="reward-card animate-enter" bordered={false}>
                          <div className="reward-card__cover">
                            <div className="reward-card__orb" />
                            <StatusTag status={reward.status} />
                          </div>

                          <Space direction="vertical" size={14} style={{ width: "100%" }}>
                            <div>
                              <Typography.Title level={4} style={{ marginBottom: 6 }}>
                                {reward.name}
                              </Typography.Title>
                              <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
                                {reward.description || "暂未填写多巴胺说明。"}
                              </Typography.Paragraph>
                            </div>

                            <div className="reward-card__meta">
                              <div>
                                <span>激发价格</span>
                                <strong>{formatPoints(reward.pointsPrice)}</strong>
                              </div>
                              <div>
                                <span>库存</span>
                                <strong>{reward.stock === -1 ? "不限量" : reward.stock}</strong>
                              </div>
                            </div>

                            <Typography.Text type="secondary">更新时间 {formatDateTime(reward.updatedAt)}</Typography.Text>

                            <Space wrap>
                              {canManage ? (
                                <>
                                  <Button icon={<EditOutlined />} onClick={() => openEdit(reward)}>
                                    编辑
                                  </Button>
                                  <Button
                                    icon={<PoweroffOutlined />}
                                    onClick={() => toggleMutation.mutate(reward.id)}
                                    loading={toggleMutation.isPending}
                                  >
                                    切换状态
                                  </Button>
                                  <Popconfirm
                                    title="确认删除该多巴胺？"
                                    okText="删除"
                                    cancelText="取消"
                                    onConfirm={() => deleteMutation.mutate(reward.id)}
                                  >
                                    <Button danger icon={<DeleteOutlined />} loading={deleteMutation.isPending}>
                                      删除
                                    </Button>
                                  </Popconfirm>
                                </>
                              ) : null}

                              {!canManage ? (
                                <Popconfirm
                                  title={`确认使用 ${formatPoints(reward.pointsPrice)} 激发「${reward.name}」？`}
                                  okText="确认激发"
                                  cancelText="取消"
                                  onConfirm={() => redeemMutation.mutate(reward.id)}
                                >
                                  <Button type="primary" disabled={reward.status !== "ON"} loading={redeemMutation.isPending}>
                                    激发
                                  </Button>
                                </Popconfirm>
                              ) : null}
                            </Space>
                          </Space>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}
              </>
            ),
          },
          {
            key: "redeemed",
            label: "我的兑换",
            children: (
              <>
                {!redeemOrdersQuery.data?.list.length ? (
                  <Card className="glass-card">
                    <Empty description="暂无已兑换的多巴胺" />
                  </Card>
                ) : (
                  <>
                    <Row gutter={[12, 12]}>
                      {redeemOrdersQuery.data.list.map((order) => (
                        <Col xs={24} md={12} key={order.id}>
                          <Card className="glass-card animate-enter" size="small" style={{ borderRadius: 12 }}>
                            <Space direction="vertical" size={8} style={{ width: "100%" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography.Text strong style={{ fontSize: 15 }}>
                                  {order.rewardName}
                                </Typography.Text>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                  {formatDateTime(order.createdAt)}
                                </Typography.Text>
                              </div>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography.Text type="secondary">
                                  消耗 {formatPoints(order.pointsCost)}
                                </Typography.Text>
                                <StatusTag status={order.status} />
                              </div>
                              {order.remark ? (
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                                  {order.remark}
                                </Typography.Text>
                              ) : null}
                            </Space>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    {redeemOrdersQuery.data.total > redeemPageSize ? (
                      <Pagination
                        current={redeemPage}
                        pageSize={redeemPageSize}
                        total={redeemOrdersQuery.data.total}
                        showSizeChanger
                        showTotal={(total) => `共 ${total} 条`}
                        onChange={(p, ps) => {
                          setRedeemPage(p);
                          setRedeemPageSize(ps);
                        }}
                        style={{ textAlign: "center", marginTop: 16 }}
                      />
                    ) : null}
                  </>
                )}
              </>
            ),
          },
        ]}
      />

      <Drawer
        title={editingReward ? "编辑多巴胺" : "新建多巴胺"}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingReward(null);
        }}
        width={420}
      >
        <Form<RewardPayload>
          form={form}
          layout="vertical"
          onFinish={(values) => {
            if (editingReward) {
              updateMutation.mutate({ id: editingReward.id, payload: values });
            } else {
              createMutation.mutate(values);
            }
          }}
        >
          <Form.Item name="name" label="多巴胺名称" rules={[{ required: true, message: "请输入多巴胺名称" }]}>
            <Input placeholder="例如：周末游乐园、半小时动画片" />
          </Form.Item>

          <Form.Item name="description" label="多巴胺说明">
            <Input.TextArea rows={4} placeholder="说明激发后如何兑现、限制条件等" />
          </Form.Item>

          <Form.Item name="pointsPrice" label="激发血清素" rules={[{ required: true, message: "请输入激发血清素" }]}>
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="stock" label="库存">
            <InputNumber min={-1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="imageUrl" label="封面图地址">
            <Input placeholder="当前版本先支持图片 URL" />
          </Form.Item>

          <Button type="primary" htmlType="submit" block loading={createMutation.isPending || updateMutation.isPending}>
            {editingReward ? "保存修改" : "创建多巴胺"}
          </Button>
        </Form>
      </Drawer>
    </Space>
  );
}
