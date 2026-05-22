export function todayString() {
  return formatLocalDate(new Date());
}

export function shiftDate(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number);
  return formatLocalDate(new Date(year, month - 1, day + days));
}

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const CATEGORY_OPTIONS = [
  {value: 'STUDY', label: '学习'},
  {value: 'SPORT', label: '运动'},
  {value: 'CHORE', label: '家务'},
  {value: 'HOBBY', label: '爱好'},
  {value: 'TALENT', label: '才艺'},
  {value: 'OTHER', label: '其他'},
] as const;

export function categoryLabel(category?: string | null) {
  if (!category) {
    return '未分类';
  }
  return CATEGORY_OPTIONS.find(item => item.value === category)?.label ?? category;
}

export function formatStock(stock: number) {
  return stock === -1 ? '不限量' : String(stock);
}

export const EXCHANGE_RATE = 100;

export function formatPoints(value?: number | null) {
  if (value === undefined || value === null) {
    return '0';
  }
  return String(value);
}

export function roleLabel(role?: string | null) {
  const labels: Record<string, string> = {
    ADMIN: '管理员',
    PARENT: '家长',
    CHILD: '孩子',
  };
  return role ? labels[role] ?? role : '未知角色';
}

export function taskStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    PENDING: '待完成',
    COMPLETED: '待确认',
    CONFIRMED: '已确认',
    REJECTED: '已打回',
    SETTLED: '已结算',
  };
  return status ? labels[status] ?? status : '未知';
}

export function orderStatusLabel(status?: string | null) {
  const labels: Record<string, string> = {
    PENDING: '待审批',
    APPROVED: '已通过',
    REJECTED: '已拒绝',
  };
  return status ? labels[status] ?? status : '未知';
}

export function isManagerRole(role?: string | null) {
  return role === 'ADMIN' || role === 'PARENT';
}
