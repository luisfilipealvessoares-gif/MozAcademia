import React from 'react';
import { useI18n } from '../contexts/I18nContext';

const Logo: React.FC<{ className?: string, variant?: 'light' | 'dark' }> = ({ className = "h-12 w-auto", variant = 'light' }) => {
  const { t } = useI18n();
  const academyColor = variant === 'dark' ? '#FFFFFF' : '#1F2937';

  // Common styles for the text block to ensure consistency.
  const textStyle: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    fontSize: '50px',
  };

  return (
    <div className={className}>
        <svg 
            viewBox="0 0 580 120" 
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
            aria-label="MozUp Academy Logo"
        >
            {/* The font is loaded globally in index.html, so it's available here. */}
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" style={textStyle}>
                <tspan style={{ fontWeight: 800, fill: '#f7941d' }}>MOZ</tspan>
                <tspan style={{ fontWeight: 800, fill: '#d95829' }}>UP</tspan>
                <tspan style={{ fontWeight: 500, fill: academyColor }}> {t('logo.academy')}</tspan>
            </text>
        </svg>
    </div>
  );
};

export default Logo;
