import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useI18n } from '../contexts/I18nContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

interface FallbackProps {
    t: (key: string) => string;
}

const ErrorFallback: React.FC<FallbackProps> = ({ t }) => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Algo correu mal</h1>
        <p className="text-gray-700 mb-6">A nossa equipa foi notificada. Por favor, tente recarregar a página.</p>
        <button
            onClick={() => window.location.reload()}
            className="bg-brand-moz text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-up transition"
        >
            Recarregar Página
        </button>
    </div>
);

// Define a proper interface for the internal component props.
interface ErrorBoundaryInternalProps {
    t: (key: string) => string;
    children: ReactNode;
}

class ErrorBoundaryInternal extends React.Component<ErrorBoundaryInternalProps, State> {
  state: State = { hasError: false };
  // @ts-ignore
  props: ErrorBoundaryInternalProps;

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ErrorFallback t={this.props.t} />;
    }

    return this.props.children;
  }
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
    const { t } = useI18n();
    return <ErrorBoundaryInternal t={t}>{children}</ErrorBoundaryInternal>;
};

export default ErrorBoundary;
