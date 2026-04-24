export const queryKeys = {
  me: ["me"] as const,
  familyMembers: ["family-members"] as const,
  tasksRoot: ["tasks"] as const,
  tasks: (filters: unknown) => ["tasks", filters] as const,
  pointLogsRoot: ["point-logs"] as const,
  pointsBalance: ["points-balance"] as const,
  pointLogs: (filters: unknown) => ["point-logs", filters] as const,
  rewardsRoot: ["rewards"] as const,
  rewards: (filters: unknown) => ["rewards", filters] as const,
  redeemOrdersRoot: ["redeem-orders"] as const,
  redeemOrders: (filters: unknown) => ["redeem-orders", filters] as const,
};
