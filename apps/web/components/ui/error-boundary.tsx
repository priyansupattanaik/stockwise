'use client';

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Widget caught error in ErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-6 border border-border rounded-lg bg-card text-card-foreground text-center space-y-3">
          <AlertTriangle className="w-6 h-6 text-loss" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-foreground">
              {this.props.fallbackTitle ?? 'Component Display Error'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm">
              {this.state.error?.message ?? 'An unexpected rendering error occurred in this module.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={this.handleReset} className="gap-1.5">
            <RefreshCw className="w-3 h-3" />
            <span>Retry component</span>
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
