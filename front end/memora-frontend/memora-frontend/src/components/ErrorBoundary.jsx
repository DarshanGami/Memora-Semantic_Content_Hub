import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log error info here if needed
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    console.log('ErrorBoundary render', this.state);
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-100 text-red-800 border-2 border-red-400 rounded-xl">
          <h2 className="text-2xl font-bold mb-4">Something went wrong in the dashboard.</h2>
          <pre className="whitespace-pre-wrap break-all">{this.state.error?.toString()}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary; 