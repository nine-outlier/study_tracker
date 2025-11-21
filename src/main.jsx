import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// ErrorBoundary class definition
// We keep this here to catch errors at the very top level of the application
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error in React component:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-slate-100">
          <div className="max-w-2xl w-full p-10 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 dark:bg-gray-900 dark:ring-gray-800 text-center">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Something went wrong.</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              A critical error occurred. Please restart the application. If the problem persists, check the console for details.
            </p>
            <div className="mt-6 text-left">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Error Details</label>
                <pre className="mt-2 p-4 bg-slate-100 rounded-lg text-xs text-red-700 font-mono overflow-auto dark:bg-gray-950 dark:text-red-300 border border-slate-200 dark:border-gray-800 max-h-64">
                {this.state.error && this.state.error.toString()}
                </pre>
            </div>
            <button 
                onClick={() => window.location.reload()} 
                className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-md hover:bg-slate-800 transition-colors dark:bg-slate-700 dark:hover:bg-slate-600"
            >
                Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);