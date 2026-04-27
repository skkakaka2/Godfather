import { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  Col,
  InputNumber,
  Modal,
  Pagination,
  Row,
  Select,
  Space,
  Typography,
} from "antd";

import { PageHeading } from "@/components/PageHeading";
import { StatCard } from "@/components/StatCard";
import { StatusTag } from "@/components/StatusTag";
import { storeApi } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/lib/auth-store";

const typeOptions = [
  { label: "全部类型", value: "" },
  { label: "连击奖励", value: "ENDORPHIN_EARN" },
  { label: "激发血清素", value: "ENDORPHIN_EXCHANGE" },
];

const EXCHANGE_RATE = 100;

export function EndorphinsPage() {
  const currentUser = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [exchangeOpen, setExchangeOpen] = useState(false);
  const [exchangeAmount, setExchangeAmount] = useState<number | null>(null);

  const logsQuery = useQuery({
    queryKey: queryKeys.endorphinLogs({ type, page, pageSize }),
    queryFn: () =>
      storeApi.getEndorphinLogs({
        type: type || undefined,
        page,
        pageSize,
      }),
  });

  const balanceQuery = useQuery({
    queryKey: queryKeys.endorphinBalance,
    queryFn: storeApi.getEndorphinBalance,
  });

  const exchangeMutation = useMutation({
    mutationFn: (amount: number) => storeApi.exchangeEndorphins(amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.endorphinLogsRoot });
      queryClient.invalidateQueries({ queryKey: queryKeys.endorphinBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.pointsBalance });
      queryClient.invalidateQueries({ queryKey: queryKeys.pointLogsRoot });
      setExchangeOpen(false);
      setExchangeAmount(null);
    },
  });

  const logData = logsQuery.data;
  const logs = logData?.list ?? [];
  const balance = balanceQuery.data ?? 0;

  return (
    <Space direction="vertical" size={24} style={{ width: "100%" }}>
      <PageHeading
        title="内啡肽脉冲"
        description="连续激活突触可获得内啡肽奖励，内啡肽可激发为血清素。兑换比率：1 内啡肽 → 100 血清素。"
        extra={
          <Button type="primary" onClick={() => setExchangeOpen(true)}>
            激发血清素
          </Button>
        }
      />

      <div className="stat-grid">
        <StatCard
          label="当前内啡肽"
          value={`${balance} 个`}
          hint={`${currentUser?.nickname ?? currentUser?.username ?? "当前用户"} 的可用内啡肽`}
        />
      </div>

      <Card className="glass-card">
        <Row gutter={[16, 16]} align="middle">
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

      {logsQuery.isLoading ? (
        <Card className="glass-card" loading />
      ) : logs.length === 0 ? (
        <Card className="glass-card">
          <Typography.Text type="secondary">暂无内啡肽记录</Typography.Text>
        </Card>
      ) : (
        <>
          <Row gutter={[12, 12]}>
            {logs.map((log) => (
              <Col xs={24} md={12} key={log.id}>
                <Card className="glass-card" size="small" style={{ borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <Typography.Text type="secondary" style={{ fontSize: 13 }}>{formatDateTime(log.createdAt)}</Typography.Text>
                    <StatusTag status={`ENDORPHIN_${log.type}`} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                    <Typography.Text
                      strong
                      style={{ fontSize: 18 }}
                      type={log.amount >= 0 ? "success" : "danger"}
                    >
                      {log.amount >= 0 ? "+" : ""}{log.amount} 个
                    </Typography.Text>
                    <Typography.Text type="secondary">余额 {log.balanceAfter} 个</Typography.Text>
                  </div>
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {log.remark || "-"}
                  </Typography.Text>
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

      <Modal
        title="激发血清素"
        open={exchangeOpen}
        onCancel={() => {
          setExchangeOpen(false);
          setExchangeAmount(null);
        }}
        onOk={() => {
          if (exchangeAmount && exchangeAmount > 0) {
            exchangeMutation.mutate(exchangeAmount);
          }
        }}
        confirmLoading={exchangeMutation.isPending}
        okText="确认激发"
        okButtonProps={{ disabled: !exchangeAmount || exchangeAmount <= 0 }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Text>
            当前内啡肽余额：<Typography.Text strong>{balance}</Typography.Text> 个
          </Typography.Text>
          <Typography.Text>
            兑换比率：1 内啡肽 → {EXCHANGE_RATE} 血清素
          </Typography.Text>
          <div>
            <Typography.Text>激发数量</Typography.Text>
            <InputNumber
              style={{ width: "100%", marginTop: 8 }}
              min={1}
              max={balance}
              value={exchangeAmount}
              onChange={(value) => setExchangeAmount(value)}
              placeholder="输入内啡肽数量"
            />
          </div>
          {exchangeAmount && exchangeAmount > 0 && (
            <Typography.Text type="secondary">
              可获得 <Typography.Text strong>{exchangeAmount * EXCHANGE_RATE}</Typography.Text> 血清素
            </Typography.Text>
          )}
        </Space>
      </Modal>
    </Space>
  );
}
