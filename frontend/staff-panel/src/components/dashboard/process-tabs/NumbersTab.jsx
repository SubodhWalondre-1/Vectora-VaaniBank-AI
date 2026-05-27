export default function NumbersTab({ numbers }) {
  return (
    <div className="flex flex-col">
      {numbers.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2.5 py-2.5"
          style={{
            borderBottom: i < numbers.length - 1
              ? "0.5px solid var(--color-border-tertiary, rgba(0,0,0,0.08))"
              : "none",
          }}
        >
          <div
            className="flex items-center justify-center rounded-lg shrink-0"
            style={{
              width: 32, height: 32,
              background: "#E6F1FB",
              fontSize: 16,
            }}
          >
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs" style={{ color: "var(--color-text-secondary, #64748b)" }}>
              {item.label}
            </div>
            <div
              className="text-sm font-medium mt-0.5"
              style={{
                color: "var(--color-text-primary, #0f172a)",
                fontFamily: item.value.match(/^\d/) ? "var(--font-mono, monospace)" : "inherit",
              }}
            >
              {item.value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
