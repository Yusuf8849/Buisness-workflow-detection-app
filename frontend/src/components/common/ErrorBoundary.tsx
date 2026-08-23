import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0e1a] text-[#e8edf5] flex items-center justify-center p-6">
          <div className="max-w-lg w-full rounded-2xl bg-[#0a0e1a]/95 border border-[#f43f5e]/40 shadow-[0_0_50px_rgba(244,63,94,0.25)] p-8 text-center space-y-6 backdrop-blur-[24px]">
            <div className="w-16 h-16 rounded-2xl bg-[#f43f5e]/20 border border-[#f43f5e] flex items-center justify-center mx-auto text-[#f43f5e] shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-[#e8edf5] font-display">
                Something Went Wrong
              </h2>
              <p className="text-xs font-mono text-slate-300">
                {this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="glass-button-primary px-6 py-3 rounded-2xl text-[#0a0e1a] font-bold text-xs font-mono flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
