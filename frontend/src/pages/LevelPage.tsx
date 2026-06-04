import { useMemo } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { App, Button, Card, Col, Progress, Row, Space, Tag, Typography } from "antd";
import { CrownOutlined, GiftOutlined, SafetyCertificateOutlined, ThunderboltOutlined } from "@ant-design/icons";

import { PageHeading } from "@/components/PageHeading";
import { levelApi } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { LevelConfig } from "@/lib/types";

const privilegeMeta: Record<string, { label: string; color: string }> = {
  bonusPercent: { label: "血清素加成", color: "gold" },
  dailySignBonus: { label: "每日签到", color: "green" },
  streakShield: { label: "连击护盾", color: "blue" },
  doubleCard: { label: "翻倍卡", color: "orange" },
  dailyChest: { label: "幸运宝箱", color: "purple" },
  expBoost: { label: "经验加速", color: "cyan" },
  redeemDiscount: { label: "兑换折扣", color: "red" },
  avatarFrame: { label: "专属外观", color: "magenta" },
  wishDiscount: { label: "愿望直达", color: "volcano" },
};

function getPrivilegeList(config: {
  bonusPercent: number;
  dailySignBonus: number;
  streakShield: number;
  doubleCard: number;
  dailyChest: boolean;
  expBoost: number;
  redeemDiscount: number;
  avatarFrame: string | null;
  wishDiscount: number;
}) {
  const list: { key: string; label: string; color: string; detail: string; unlocked: boolean }[] = [];

  list.push({
    key: "bonusPercent",
    ...privilegeMeta.bonusPercent,
    detail: `+${config.bonusPercent}%`,
    unlocked: config.bonusPercent > 0,
  });
  list.push({
    key: "dailySignBonus",
    ...privilegeMeta.dailySignBonus,
    detail: `+${config.dailySignBonus} 血清素`,
    unlocked: config.dailySignBonus > 0,
  });
  list.push({
    key: "streakShield",
    ...privilegeMeta.streakShield,
    detail: `每月${config.streakShield}次`,
    unlocked: config.streakShield > 0,
  });
  list.push({
    key: "doubleCard",
    ...privilegeMeta.doubleCard,
    detail: `每周${config.doubleCard}张`,
    unlocked: config.doubleCard > 0,
  });
  list.push({
    key: "dailyChest",
    ...privilegeMeta.dailyChest,
    detail: "每天1次",
    unlocked: config.dailyChest,
  });
  list.push({
    key: "expBoost",
    ...privilegeMeta.expBoost,
    detail: `+${config.expBoost}%`,
    unlocked: config.expBoost > 0,
  });
  list.push({
    key: "redeemDiscount",
    ...privilegeMeta.redeemDiscount,
    detail: config.redeemDiscount < 1 ? `${Math.round(config.redeemDiscount * 100)}折` : "无折扣",
    unlocked: config.redeemDiscount < 1,
  });
  list.push({
    key: "avatarFrame",
    ...privilegeMeta.avatarFrame,
    detail: config.avatarFrame ?? "未解锁",
    unlocked: !!config.avatarFrame,
  });
  list.push({
    key: "wishDiscount",
    ...privilegeMeta.wishDiscount,
    detail: `降价${config.wishDiscount}%`,
    unlocked: config.wishDiscount > 0,
  });

  return list;
}

export function LevelPage() {
  const { message } = App.useApp();
  const queryClient = useQueryClient();

  const infoQuery = useQuery({
    queryKey: queryKeys.levelInfo,
    queryFn: levelApi.getInfo,
  });

  const configsQuery = useQuery({
    queryKey: queryKeys.levelConfigs,
    queryFn: levelApi.listConfigs,
  });

  const signMutation = useMutation({
    mutationFn: levelApi.dailySign,
    onSuccess: () => {
      message.success("签到成功！");
      queryClient.invalidateQueries({ queryKey: queryKeys.levelInfo });
      queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance });
    },
    onError: (error) => {
      message.error(error.message);
    },
  });

  const chestMutation = useMutation({
    mutationFn: levelApi.openChest,
    onSuccess: (data) => {
      message.success(`幸运宝箱：开出 ${data.points} 血清素！`);
      queryClient.invalidateQueries({ queryKey: queryKeys.levelInfo });
      queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance });
    },
    onError: (error) => message.error(error.message),
  });

  const doubleCardMutation = useMutation({
    mutationFn: levelApi.useDoubleCard,
    onSuccess: () => {
      message.success("翻倍卡已激活！今天完成任务的血清素将翻倍");
      queryClient.invalidateQueries({ queryKey: queryKeys.levelInfo });
    },
    onError: (error) => message.error(error.message),
  });

  const info = infoQuery.data;
  const configs = configsQuery.data ?? [];

  // 按大等级分组配置
  const groupedConfigs = useMemo(() => {
    const map = new Map<number, LevelConfig[]>();
    for (const c of configs) {
      if (!map.has(c.level)) map.set(c.level, []);
      map.get(c.level)!.push(c);
    }
    return map;
  }, [configs]);

  const expPercent = useMemo(() => {
    if (!info) return 0;
    if (!info.nextExpRequired) return 100;
    const prevExp = groupedConfigs.get(info.level)?.find((c) => c.subLevel === info.subLevel)?.expRequired ?? 0;
    const range = info.nextExpRequired - prevExp;
    if (range <= 0) return 100;
    return Math.min(Math.round(((info.exp - prevExp) / range) * 100), 100);
  }, [info, groupedConfigs]);

  const privileges = info ? getPrivilegeList(info) : [];

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading title="自律等级" description="完成突触激活获得经验，经验累积升级解锁特权，养成自律好习惯。" />

      {/* 等级信息卡片 */}
      <Card className="glass-card">
        <Row gutter={[24, 16]} align="middle">
          <Col xs={24} md={12}>
            <Space direction="vertical" size={8}>
              <Space>
                <CrownOutlined style={{ fontSize: 28, color: "#faad14" }} />
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {info?.title ?? "自律新手"}
                </Typography.Title>
                <Tag color="gold">Lv.{info?.totalLevel ?? 1}</Tag>
              </Space>
              <Typography.Text type="secondary">
                大境界 Lv.{info?.level ?? 1} · {info?.subLevel === 1 ? "低等" : info?.subLevel === 2 ? "中等" : "高等"}
              </Typography.Text>
            </Space>
          </Col>
          <Col xs={24} md={12}>
            <Space direction="vertical" size={4} style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Typography.Text type="secondary">经验进度</Typography.Text>
                <Typography.Text type="secondary">
                  {info?.exp ?? 0} / {info?.nextExpRequired ?? "MAX"}
                </Typography.Text>
              </div>
              <Progress percent={expPercent} strokeColor="#faad14" />
              {info?.nextExpRequired && (
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  距离下一阶段还需 {info.nextExpRequired - (info?.exp ?? 0)} 经验
                </Typography.Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 今日操作 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card className="glass-card" size="small" style={{ textAlign: "center" }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Text strong>每日签到</Typography.Text>
              <Typography.Text type="secondary">
                {info?.dailySignBonus ? `+${info.dailySignBonus} 血清素` : "+2 经验"}
              </Typography.Text>
              <Button
                type="primary"
                icon={<SafetyCertificateOutlined />}
                loading={signMutation.isPending}
                onClick={() => signMutation.mutate()}
                block
              >
                签到
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="glass-card" size="small" style={{ textAlign: "center" }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Text strong>幸运宝箱</Typography.Text>
              <Typography.Text type="secondary">{info?.dailyChest ? "3~20 血清素" : "Lv.6 解锁"}</Typography.Text>
              <Button
                type="primary"
                icon={<GiftOutlined />}
                loading={chestMutation.isPending}
                onClick={() => chestMutation.mutate()}
                disabled={!info?.dailyChest}
                block
              >
                {info?.dailyChest ? "开宝箱" : "未解锁"}
              </Button>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="glass-card" size="small" style={{ textAlign: "center" }}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Text strong>翻倍卡</Typography.Text>
              <Typography.Text type="secondary">
                {info?.doubleCard ? `每周${info.doubleCard}张` : "Lv.5 解锁"}
              </Typography.Text>
              <Button
                type="primary"
                icon={<ThunderboltOutlined />}
                loading={doubleCardMutation.isPending}
                onClick={() => doubleCardMutation.mutate()}
                disabled={!info?.doubleCard}
                block
              >
                {info?.doubleCard ? "使用翻倍卡" : "未解锁"}
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 当前特权列表 */}
      <Card className="glass-card" title="当前特权">
        <Row gutter={[12, 12]}>
          {privileges.map((p) => (
            <Col xs={12} sm={8} md={6} key={p.key}>
              <Tag
                color={p.unlocked ? p.color : "default"}
                style={{ width: "100%", textAlign: "center", padding: "4px 8px" }}
              >
                {p.unlocked ? "✅" : "🔒"} {p.label}
                {p.unlocked && <span style={{ marginLeft: 4, opacity: 0.8 }}>{p.detail}</span>}
              </Tag>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 等级总览 */}
      <Card className="glass-card" title="等级总览">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {Array.from(groupedConfigs.entries()).map(([level, subs]) => {
            const lastSub = subs[subs.length - 1];
            const isCurrentLevel = info?.level === level;
            const isLocked = (info?.level ?? 1) < level;

            return (
              <Card
                key={level}
                size="small"
                style={{
                  borderRadius: 8,
                  opacity: isLocked ? 0.45 : 1,
                  border: isCurrentLevel ? "2px solid #faad14" : undefined,
                  background: isCurrentLevel ? "#fffbe6" : undefined,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Space>
                    <CrownOutlined style={{ color: isLocked ? "#d9d9d9" : "#faad14" }} />
                    <Typography.Text strong={isCurrentLevel}>
                      Lv.{level} {lastSub.title.replace(/^(低等|中等|高等)/, "")}
                    </Typography.Text>
                    {isCurrentLevel && <Tag color="gold">当前</Tag>}
                  </Space>
                  <Typography.Text type="secondary">累计 {lastSub.expRequired} 经验</Typography.Text>
                </div>
                <div style={{ marginTop: 4, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {subs.map((sub) => {
                    const subLabel = sub.subLevel === 1 ? "低等" : sub.subLevel === 2 ? "中等" : "高等";
                    const isReached = info ? info.exp >= sub.expRequired : false;
                    return (
                      <Tag key={sub.subLevel} color={isReached ? "gold" : "default"}>
                        {subLabel} ({sub.expRequired})
                      </Tag>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </Space>
      </Card>
    </Space>
  );
}
