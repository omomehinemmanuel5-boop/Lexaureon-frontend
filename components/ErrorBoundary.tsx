'use client';

import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; label?: string; }
interface State { error: Error | null; }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          background: '#1a0a0a',
          border: '1px solid #7f1d1d',
          borderRadius: 8,
          padding: 16,
          margin: 8,
          fontFamily: 'monospace',
          fontSize: 11,
          color: '#fca5a5',
          maxWidth: '100%',
          overflow: 'auto',
        }}>
          <div style={{ color: '#ef4444', fontWeight: 700, marginBottom: 8 }}>
            ⚠ [{this.props.label ?? 'Component'}] crashed
          </div>
          <div style={{ color: '#fca5a5', wordBreak: 'break-all' }}>
            {this.state.error.message}
          </div>
          <div style={{ color: '#6b7280', marginTop: 8, fontSize: 10, whiteSpace: 'pre-wrap' }}>
            {this.state.error.stack?.slice(0, 400)}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
