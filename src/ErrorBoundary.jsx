import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(err) {
    return { err };
  }
  componentDidCatch(err, info) {
    console.error("ErrorBoundary caught:", err, info);
  }
  render() {
    if (this.state.err) {
      const e = this.state.err;
      return (
        <div style={{ padding: 16, fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          <h2>UI Crash</h2>
          <div>{String(e?.message || e)}</div>
          {"\n\n"}
          <div>{String(e?.stack || "")}</div>
        </div>
      );
    }
    return this.props.children;
  }
}
