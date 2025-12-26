import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  // FIX: Initialized state within the constructor.
  // This is the standard approach for class components and ensures `this.state` and `this.props`
  // are correctly typed and available throughout the component lifecycle.
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ocorreu um erro inesperado.</h1>
          <p className="text-gray-700 mb-6">Nossa equipe foi notificada. Por favor, tente recarregar a página.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-orange-500 text-white font-semibold py-2 px-6 rounded-lg hover:bg-orange-600 transition"
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
