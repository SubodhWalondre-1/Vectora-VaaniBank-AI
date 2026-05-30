import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, showDetails: false, copied: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Staff Panel Error Boundary] Caught exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, showDetails: false, copied: false });
    window.location.href = "/";
  };

  handleCopy = () => {
    if (!this.state.error) return;
    navigator.clipboard.writeText(this.state.error.stack || this.state.error.toString());
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.iconCircle}>
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--accent-red, #EF4444)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="9" x2="15" y2="15" />
                <line x1="15" y1="9" x2="9" y2="15" />
              </svg>
            </div>
            
            <h2 style={styles.title}>Workspace Exception Caught</h2>
            <p style={styles.text}>
              The staff dashboard encountered an unexpected exception. You can reload your workspace to resume operations safely.
            </p>

            <div style={styles.buttonRow}>
              <button style={styles.primaryButton} onClick={this.handleReset}>
                Reload Workspace
              </button>
              
              <button
                style={styles.secondaryButton}
                onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
              >
                {this.state.showDetails ? "Hide Logs" : "Show Logs"}
              </button>
            </div>

            {this.state.showDetails && (
              <div style={styles.detailsContainer}>
                <div style={styles.detailsHeader}>
                  <span style={styles.detailsTitle}>Technical Stack Trace</span>
                  <button style={styles.copyBtn} onClick={this.handleCopy}>
                    {this.state.copied ? "✓ Copied" : "Copy Trace"}
                  </button>
                </div>
                <pre style={styles.stackTrace}>
                  {this.state.error?.stack || this.state.error?.toString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100vw",
    height: "100vh",
    backgroundColor: "var(--body-bg, #F8FAFC)",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: 24,
    boxSizing: "border-box",
  },
  card: {
    maxWidth: 520,
    width: "100%",
    padding: "40px 36px",
    borderRadius: 24,
    backgroundColor: "var(--card-bg, #FFFFFF)",
    border: "1px solid var(--card-border, #E2E8F0)",
    boxShadow: "var(--card-shadow, 0 10px 25px rgba(0,0,0,0.05))",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 18,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontWeight: 800,
    color: "var(--text-primary, #0F172A)",
    margin: 0,
    letterSpacing: "-0.4px",
  },
  text: {
    fontSize: 14,
    color: "var(--text-secondary, #475569)",
    lineHeight: 1.6,
    margin: 0,
    textAlign: "center",
  },
  buttonRow: {
    display: "flex",
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    padding: "14px 20px",
    borderRadius: 12,
    backgroundColor: "var(--accent-blue, #2563EB)",
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.2)",
    transition: "transform 0.15s ease",
  },
  secondaryButton: {
    padding: "14px 20px",
    borderRadius: 12,
    backgroundColor: "transparent",
    color: "var(--text-secondary, #475569)",
    fontSize: 14,
    fontWeight: 600,
    border: "1px solid var(--card-border, #E2E8F0)",
    cursor: "pointer",
    transition: "background-color 0.15s ease",
  },
  detailsContainer: {
    width: "100%",
    borderRadius: 12,
    border: "1px solid var(--card-border, #E2E8F0)",
    backgroundColor: "var(--body-bg, #F8FAFC)",
    padding: 16,
    boxSizing: "border-box",
    textAlign: "left",
    marginTop: 12,
  },
  detailsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text-muted, #64748B)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  copyBtn: {
    fontSize: 11,
    fontWeight: 600,
    color: "var(--accent-blue, #2563EB)",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
  },
  stackTrace: {
    fontSize: 11,
    fontFamily: "monospace",
    color: "var(--text-secondary, #475569)",
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    maxHeight: 180,
    overflowY: "auto",
  },
};
