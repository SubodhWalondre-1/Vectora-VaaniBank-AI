export default function EligibilityTab({ eligibility }) {
  const statusColor = (s) =>
    s === "good" ? "#0F6E56" : s === "warn" ? "#854F0B" : "var(--color-text-primary, #0f172a)";

  return (
    <div className="flex flex-col">
      {eligibility.map((row, i) => (
        <div
          key={i}
          className="flex items-center justify-between py-2.5"
          style={{
            borderBottom: i < eligibility.length - 1
              ? "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.08))"
              : "none",
          }}
        >
          <span className="text-sm" style={{ color: "var(--color-text-secondary, #64748b)" }}>
            {row.label}
          </span>
          <span
            className="text-sm font-medium text-right"
            style={{ color: statusColor(row.status), maxWidth: "55%" }}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
