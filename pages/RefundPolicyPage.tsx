
import React from 'react';
import { useI18n } from '../contexts/I18nContext';

const RefundPolicyPage: React.FC = () => {
    const { t } = useI18n();

    return (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-up mb-6">{t('refund.title')}</h1>
            <p className="text-sm text-gray-500 mb-8">{t('refund.lastUpdated')}</p>

            <div className="space-y-6 text-gray-700 prose prose-lg max-w-none">
                <p>{t('refund.intro')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('refund.section1.title')}</h2>
                <p>{t('refund.section1.p1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('refund.section2.title')}</h2>
                <p>{t('refund.section2.p1')}</p>
                <ul>
                    <li>{t('refund.section2.list.item1')}</li>
                    <li>{t('refund.section2.list.item2')}</li>
                </ul>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('refund.section3.title')}</h2>
                <p>{t('refund.section3.p1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('refund.section4.title')}</h2>
                <p>{t('refund.section4.p1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('refund.section5.title')}</h2>
                <p>{t('refund.section5.p1')}</p>
            </div>
        </div>
    );
};

export default RefundPolicyPage;
