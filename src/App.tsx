import React, { Component, ReactNode } from 'react';
import { RouterProvider } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { AuthProvider } from './context/AuthContext';
import { router } from './router';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('App Unhandled React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl font-bold mb-4 border border-rose-500/30">
            ⚠️
          </div>
          <h1 className="text-2xl font-black mb-2">Something went wrong rendering the UI</h1>
          <p className="text-sm text-slate-300 max-w-md mb-6 font-mono bg-slate-800 p-4 rounded-xl text-left overflow-auto border border-slate-700">
            {this.state.error?.message || 'Unknown Application Error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 bg-[#004990] hover:bg-[#002B5C] text-white rounded-xl font-bold text-xs transition-all shadow-md"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
        {typeof window !== 'undefined' && process.env.NODE_ENV === 'production' && <SpeedInsights />}
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
