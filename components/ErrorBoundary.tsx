import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Changed state initialization from a constructor to a class property.
  // This ensures 'state' and 'props' are correctly recognized on the component type, resolving the compilation errors.
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ocorreu um erro inesperado.</h1>
          <p className="text-gray-700 mb-6">Nossa equipe foi notificada. Por favor, tente recarregar a página.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand-moz text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-up transition"
          >
            Recarregar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
