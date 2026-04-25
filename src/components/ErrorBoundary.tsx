import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
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
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  reloadPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 via-white to-slate-200 dark:from-blue-950 dark:via-slate-900 dark:to-teal-950 p-4">
          <div className="text-center max-w-md w-full">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
              Ups, ein Fehler ist aufgetreten
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">
              Es tut uns leid! Ein unerwarteter Fehler ist aufgetreten.
              <br />
              <span className="text-teal-600 dark:text-teal-400 font-medium">
                Dein Lernfortschritt ist sicher in localStorage gespeichert und geht nicht verloren.
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-2 justify-center mb-4">
              <button
                onClick={this.reloadPage}
                className="px-5 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-lg shadow-teal-500/20 transition-colors"
              >
                Seite neu laden
              </button>
              <button
                onClick={() => {
                  this.resetErrorBoundary();
                  window.location.hash = '';
                  window.history.pushState({}, '', window.location.pathname);
                }}
                className="px-5 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-lg transition-colors"
              >
                Zur Startseite
              </button>
            </div>

            <details className="text-left">
              <summary className="text-slate-500 dark:text-slate-400 text-sm cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                Technische Details anzeigen
              </summary>
              <pre className="mt-2 p-3 bg-slate-900 dark:bg-slate-800 text-emerald-400 text-xs rounded-lg text-left overflow-x-auto max-h-40">
                {this.state.error?.message}
                {'\n\n'}
                {this.state.error?.stack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
