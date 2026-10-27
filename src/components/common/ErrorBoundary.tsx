import React, { Component, ErrorInfo, ReactNode } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReset = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      const {
        fallbackTitle = 'Something went wrong on this page',
        fallbackMessage = 'An unexpected rendering error occurred. You can reload or reset this view without losing your session.',
      } = this.props;

      return (
        <div className="w-full max-w-xl mx-auto my-12 p-6 sm:p-8 bg-white dark:bg-boxdark rounded-3xl border border-rose-200/80 dark:border-rose-900/40 shadow-lg text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Pulsing Alert Icon */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-rose-500/10 dark:bg-rose-500/20 animate-ping opacity-75" />
            <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-50 to-amber-50 dark:from-rose-950/40 dark:to-amber-950/40 border border-rose-200/60 dark:border-rose-800/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner">
              <ErrorOutlineIcon style={{ fontSize: 32 }} />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Isolated UI Error Guard
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white">
              {fallbackTitle}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
              {this.state.error?.message || fallbackMessage}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleReset}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-sm shadow-md shadow-primary/20 transition-all cursor-pointer active:scale-95"
            >
              <RefreshIcon style={{ fontSize: 18 }} />
              Retry View
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>

          {process.env.NODE_ENV !== 'production' && this.state.error && (
            <details className="text-left text-xs bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 overflow-x-auto">
              <summary className="cursor-pointer font-bold mb-1">Debug Details</summary>
              <pre className="whitespace-pre-wrap">{this.state.error.stack}</pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
