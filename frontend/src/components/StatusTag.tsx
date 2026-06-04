import { Tag } from "antd";

type StatusTagProps = {
  status: string;
};

const STATUS_MAP: Record<
  string,
  {
    color: string;
    label: string;
  }
> = {
  ON: { color: "green", label: "上架中" },
  OFF: { color: "default", label: "已下架" },
  PENDING: { color: "gold", label: "待处理" },
  COMPLETED: { color: "blue", label: "待确认" },
  CONFIRMED: { color: "green", label: "已确认" },
  REJECTED: { color: "red", label: "已打回" },
  APPROVED: { color: "green", label: "已通过" },
  SETTLED: { color: "cyan", label: "已结算" },
  REDEEM: { color: "volcano", label: "正式扣除" },
  FREEZE: { color: "gold", label: "冻结血清素" },
  UNFREEZE: { color: "blue", label: "解冻退还" },
  EARN: { color: "green", label: "血清素收入" },
  MANUAL_ADD: { color: "cyan", label: "手动增加" },
  MANUAL_SUB: { color: "red", label: "手动扣减" },
  ENDORPHIN_EARN: { color: "green", label: "连击奖励" },
  ENDORPHIN_EXCHANGE: { color: "volcano", label: "激发血清素" },
};

export function StatusTag({ status }: StatusTagProps) {
  const config = STATUS_MAP[status] ?? { color: "default", label: status };

  return <Tag color={config.color}>{config.label}</Tag>;
}
