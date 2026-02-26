
import React from 'react';
import { useI18n } from '../contexts/I18nContext';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
    const { t } = useI18n();
    const navigate = useNavigate();

    return (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border max-w-4xl mx-auto relative">
            <button 
                onClick={() => navigate(-1)} 
                className="mb-6 flex items-center text-brand-moz hover:text-brand-up transition-colors font-semibold"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('back')}
            </button>

            <h1 className="text-3xl font-bold text-brand-up mb-6">{t('privacy.title')}</h1>
            <p className="text-sm text-gray-500 mb-8">{t('privacy.lastUpdated')}</p>

            <div className="space-y-6 text-gray-700 prose prose-lg max-w-none">
                <p>{t('privacy.intro')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('privacy.section1.title')}</h2>
                <p>{t('privacy.section1.p1')}</p>
                <ul>
                    <li>{t('privacy.section1.list.item1')}</li>
                    <li>{t('privacy.section1.list.item2')}</li>
                    <li>{t('privacy.section1.list.item3')}</li>
                    <li>{t('privacy.section1.list.item4')}</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('privacy.section2.title')}</h2>
                <p>{t('privacy.section2.p1')}</p>
                <ul>
                    <li>{t('privacy.section2.list.item1')}</li>
                    <li>{t('privacy.section2.list.item2')}</li>
                    <li>{t('privacy.section2.list.item3')}</li>
                    <li>{t('privacy.section2.list.item4')}</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('privacy.section3.title')}</h2>
                <p>{t('privacy.section3.p1')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('privacy.section4.title')}</h2>
                <p>{t('privacy.section4.p1')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('privacy.section5.title')}</h2>
                <p>{t('privacy.section5.p1')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('privacy.section6.title')}</h2>
                <p>{t('privacy.section6.p1')}</p>
                <ul>
                    <li>{t('privacy.section6.list.item1')}</li>
                    <li>{t('privacy.section6.list.item2')}</li>
                    <li>{t('privacy.section6.list.item3')}</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('privacy.section7.title')}</h2>
                <p>{t('privacy.section7.p1')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('privacy.section8.title')}</h2>
                <p>{t('privacy.section8.p1')}</p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
