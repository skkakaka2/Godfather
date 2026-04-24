import { useMemo, useState } from "react";

import { DeleteOutlined, EditOutlined, PlusOutlined, PoweroffOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
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
  Typography,
  message,
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
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);
  const [status, setStatus] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [form] = Form.useForm<RewardPayload>();

  const canManage =
    currentUser?.role === "ADMIN" || currentUser?.role === "PARENT";

  const rewardsQuery = useQuery({
    queryKey: queryKeys.rewards({ status }),
    queryFn: () => storeApi.getRewards({ status: status || undefined }),
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
      message.success("奖励创建成功");
      setDrawerOpen(false);
      form.resetFields();
      await refreshRewards();
    },
    onError: (error) => message.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: RewardPayload }) =>
      storeApi.updateReward(id, payload),
    onSuccess: async () => {
      message.success("奖励更新成功");
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
      message.success("奖励已删除");
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
      message.success("兑换申请已提交");
      await Promise.all([
        refreshRewards(),
        queryClient.invalidateQueries({ queryKey: queryKeys.pointLogsRoot }),
      ]);
    },
    onError: (error) => message.error(error.message),
  });

  const rewardCards = useMemo(() => rewardsQuery.data ?? [], [rewardsQuery.data]);

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
        title="奖励商城"
        description="支持家长上架与维护奖励，孩子或成员直接发起兑换申请。"
        extra={
          <Space>
            <Select
              value={status}
              onChange={setStatus}
              options={statusOptions}
              style={{ minWidth: 148 }}
            />
            {canManage ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
                新建奖励
              </Button>
            ) : null}
          </Space>
        }
      />

      {rewardCards.length === 0 ? (
        <Card className="glass-card">
          <Empty description="当前筛选下没有奖励商品" />
        </Card>
      ) : (
        <Row gutter={[20, 20]}>
          {rewardCards.map((reward) => (
            <Col xs={24} md={12} xl={8} key={reward.id}>
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
                      {reward.description || "暂未填写奖励说明。"}
                    </Typography.Paragraph>
                  </div>

                  <div className="reward-card__meta">
                    <div>
                      <span>兑换价格</span>
                      <strong>{formatPoints(reward.pointsPrice)}</strong>
                    </div>
                    <div>
                      <span>库存</span>
                      <strong>{reward.stock === -1 ? "不限量" : reward.stock}</strong>
                    </div>
                  </div>

                  <Typography.Text type="secondary">
                    更新时间 {formatDateTime(reward.updatedAt)}
                  </Typography.Text>

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
                          title="确认删除该奖励？"
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

                    <Button
                      type="primary"
                      disabled={reward.status !== "ON"}
                      loading={redeemMutation.isPending}
                      onClick={() => redeemMutation.mutate(reward.id)}
                    >
                      申请兑换
                    </Button>
                  </Space>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Drawer
        title={editingReward ? "编辑奖励" : "新建奖励"}
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
          <Form.Item
            name="name"
            label="奖励名称"
            rules={[{ required: true, message: "请输入奖励名称" }]}
          >
            <Input placeholder="例如：周末游乐园、半小时动画片" />
          </Form.Item>

          <Form.Item name="description" label="奖励说明">
            <Input.TextArea rows={4} placeholder="说明兑换后如何兑现、限制条件等" />
          </Form.Item>

          <Form.Item
            name="pointsPrice"
            label="兑换积分"
            rules={[{ required: true, message: "请输入兑换积分" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="stock" label="库存">
            <InputNumber min={-1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="imageUrl" label="封面图地址">
            <Input placeholder="当前版本先支持图片 URL" />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            block
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {editingReward ? "保存修改" : "创建奖励"}
          </Button>
        </Form>
      </Drawer>
    </Space>
  );
}
