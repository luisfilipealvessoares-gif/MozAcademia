
import React from 'react';
import { useI18n } from '../contexts/I18nContext';

const PrivacyPolicyPage: React.FC = () => {
    const { t } = useI18n();

    return (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border max-w-4xl mx-auto">
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
