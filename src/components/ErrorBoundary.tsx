import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto"
              style={{ boxShadow: '0 0 30px rgba(255,85,0,0.15)' }}>
              <AlertTriangle className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl tracking-wider text-foreground mb-2">
                SOMETHING WENT WRONG
              </h1>
              <p className="text-muted-foreground text-sm">
                An unexpected error occurred. Try refreshing the page.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-display tracking-wide rounded-xl hover:bg-primary/90 transition-all"
                style={{ boxShadow: '0 0 20px rgba(255,85,0,0.2)' }}
              >
                <RefreshCw className="w-4 h-4" />
                RELOAD PAGE
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-3 border border-border text-muted-foreground font-display tracking-wide text-sm rounded-xl hover:text-foreground hover:border-primary/30 transition-all"
              >
                TRY AGAIN
              </button>
            </div>
            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Error details
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-card border border-border text-[10px] text-muted-foreground overflow-x-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
