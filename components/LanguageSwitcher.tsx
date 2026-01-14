import React from 'react';
import { useI18n } from '../contexts/I18nContext';

const LanguageSwitcher: React.FC = () => {
    const { language, changeLanguage } = useI18n();

    const buttonBaseStyle = "px-3 py-1 text-sm font-bold rounded-md transition-colors duration-200";
    const activeStyle = "bg-brand-moz text-white";
    const inactiveStyle = "bg-gray-200 text-gray-600 hover:bg-gray-300";

    return (
        <div className="flex items-center space-x-1 p-1 bg-gray-100 rounded-lg">
            <button
                onClick={() => changeLanguage('pt')}
                className={`${buttonBaseStyle} ${language === 'pt' ? activeStyle : inactiveStyle}`}
                aria-label="Mudar para Português"
            >
                PT
            </button>
            <button
                onClick={() => changeLanguage('en')}
                className={`${buttonBaseStyle} ${language === 'en' ? activeStyle : inactiveStyle}`}
                aria-label="Switch to English"
            >
                EN
            </button>
        </div>
    );
};

export default LanguageSwitcher;
