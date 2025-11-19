import './index.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// ErrorBoundary class definition
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
        <div className="p-8 dark:text-slate-100">
          <div className="p-10 bg-white rounded-xl shadow-md text-center dark:bg-gray-900">
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">Something went wrong.</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">A critical error occurred. Please restart the application. If the problem persists, check the console for details.</p>
            <pre className="mt-4 text-left bg-slate-100 p-4 rounded text-sm text-red-700 dark:bg-gray-800 dark:text-red-300 overflow-auto">
              {this.state.error && this.state.error.toString()}
            </pre>
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