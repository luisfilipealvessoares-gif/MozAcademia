import React, { ErrorInfo, ReactNode } from 'react';
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

// Define a proper interface for the internal component props.
interface ErrorBoundaryInternalProps {
    t: (key: string) => string;
    children: ReactNode;
}

// FIX: Switched to class field syntax for state initialization. This is a more
// modern and concise approach that resolves compiler errors where properties on
// `this` were not being correctly recognized.
class ErrorBoundaryInternal extends React.Component<ErrorBoundaryInternalProps, State> {
  state: State = { hasError: false };

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
    return <ErrorBoundaryInternal t={t} children={children} />;
};

export default ErrorBoundary;
