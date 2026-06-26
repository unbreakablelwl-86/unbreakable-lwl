import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';

interface Props {
  children: ReactNode;
  section?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[RouteErrorBoundary${this.props.section ? ` / ${this.props.section}` : ''}]`, error, errorInfo);
    try {
      import('@sentry/react').then((Sentry) => {
        Sentry.captureException(error, {
          tags: { section: this.props.section || 'unknown' },
          extra: { componentStack: errorInfo.componentStack },
        });
      });
    } catch {
      // Sentry not available
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="text-center max-w-sm mx-auto space-y-5">
            <div
              className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto"
              style={{ boxShadow: '0 0 24px rgba(255,85,0,0.12)' }}
            >
              <AlertTriangle className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl tracking-wider text-foreground mb-1">
                {this.props.section ? `${this.props.section.toUpperCase()} HIT A WALL` : 'SOMETHING BROKE'}
              </h2>
              <p className="text-muted-foreground text-sm">
                This section crashed but the rest of the app is fine.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-display text-sm tracking-wide rounded-xl hover:bg-primary/90 transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                TRY AGAIN
              </button>
              <button
                onClick={() => window.history.back()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 border border-border text-muted-foreground font-display text-sm tracking-wide rounded-xl hover:text-foreground hover:border-primary/30 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                GO BACK
              </button>
            </div>
            {this.state.error && (
              <details className="text-left">
                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Error details
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-card border border-border text-[10px] text-muted-foreground overflow-x-auto whitespace-pre-wrap">
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
