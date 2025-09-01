import React, { Component, ReactNode } from 'react';

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch() {
    // optional: send to telemetry
    // console.error('ErrorBoundary caught:', err);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-4 rounded-lg border bg-red-50 text-sm text-red-700">
            Something went wrong. Please refresh and try again.
          </div>
        )
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;