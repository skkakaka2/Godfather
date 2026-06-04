type StatCardProps = {
  label: string;
  value: string | number;
  hint: string;
  tone?: "brand" | "green" | "gold" | "blue";
};

export function StatCard({
  label,
  value,
  hint,
  tone = "brand",
}: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${tone} animate-enter`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  );
}
