import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Customer Panel Error Boundary] Caught exception:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
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
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.subtitle}>कुछ गलत हो गया, कृपया पुनः प्रयास करें</p>
            
            <p style={styles.text}>
              The kiosk experienced a minor system issue. You can safely reset to return to the language selection.
            </p>

            <button style={styles.button} onClick={this.handleReset}>
              Return to Start
            </button>
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
    height: "100dvh",
    backgroundColor: "var(--body-bg, #F8FAFC)",
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: 24,
    boxSizing: "border-box",
  },
  card: {
    maxWidth: 400,
    width: "100%",
    padding: "40px 32px",
    borderRadius: 24,
    backgroundColor: "var(--card-bg, #FFFFFF)",
    border: "1px solid var(--card-border, #E2E8F0)",
    boxShadow: "var(--card-shadow, 0 10px 25px rgba(0,0,0,0.05))",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: "var(--text-primary, #0F172A)",
    margin: 0,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-muted, #64748B)",
    margin: "-8px 0 0 0",
    fontStyle: "italic",
  },
  text: {
    fontSize: 13,
    color: "var(--text-secondary, #475569)",
    lineHeight: 1.6,
    margin: 0,
  },
  button: {
    width: "100%",
    padding: "14px 20px",
    borderRadius: 14,
    backgroundColor: "var(--accent-blue, #2563EB)",
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(37, 99, 235, 0.2)",
    marginTop: 8,
    transition: "transform 0.2s ease",
  },
};
