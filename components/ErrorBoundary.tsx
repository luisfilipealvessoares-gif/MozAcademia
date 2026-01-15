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
        <h1 className="text-2xl font-bold text-red-600 mb-4">{t('error.boundary.title')}</h1>
        <p className="text-gray-700 mb-6">{t('error.boundary.subtitle')}</p>
        <button
            onClick={() => window.location.reload()}
            className="bg-brand-moz text-white font-semibold py-2 px-6 rounded-lg hover:bg-brand-up transition"
        >
            {t('error.boundary.button')}
        </button>
    </div>
);


class ErrorBoundaryInternal extends Component<Props & { t: (key: string) => string }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // FIX: In a class component, props must be accessed via `this.props`.
      return <ErrorFallback t={this.props.t} />;
    }

    // FIX: In a class component, children must be accessed via `this.props.children`.
    return this.props.children;
  }
}

const ErrorBoundary: React.FC<Props> = ({ children }) => {
    const { t } = useI18n();
    return <ErrorBoundaryInternal t={t}>{children}</ErrorBoundaryInternal>;
};

export default ErrorBoundary;