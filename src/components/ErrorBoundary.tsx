import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    message: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TEKSCOdle ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  public render() {
    if (this.state.hasError) {
      let friendlyMessage = 'Something went wrong while loading this checkout lane.';
      try {
        const parsed = JSON.parse(this.state.message);
        if (parsed && typeof parsed.error === 'string') {
          if (parsed.error.includes('Quota exceeded')) {
            friendlyMessage =
              'Daily database read quota was reached. You can still play offline and try again tomorrow.';
          } else if (parsed.error.includes('permission')) {
            friendlyMessage =
              'A leaderboard permission check failed. Please sign in with a verified Google account and retry.';
          }
        }
      } catch {
        // Non-JSON runtime error
      }

      return (
        <div className="min-h-screen bg-[#F4F6F9] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-xl p-8 text-center">
            <h1 className="font-display text-2xl font-bold text-[#0F1D36] mb-3">
              Checkout Till Interrupted
            </h1>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">{friendlyMessage}</p>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#00539F] hover:bg-[#00407B] rounded-lg transition-colors whitespace-nowrap"
            >
              Return to Game
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
