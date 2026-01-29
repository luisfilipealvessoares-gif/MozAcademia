
import React from 'react';
import { useI18n } from '../contexts/I18nContext';

const TermsAndConditionsPage: React.FC = () => {
    const { t } = useI18n();

    // Reusing the same translations from the TermsModal for consistency
    return (
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg border max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-brand-up mb-6">{t('terms.title')}</h1>
            
            <div className="space-y-6 text-gray-700 prose prose-lg max-w-none">
                <p className="font-semibold">{t('terms.p1')}</p>
                <p>{t('terms.p2')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h1')}</h2>
                <p>{t('terms.p1_1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h2')}</h2>
                <p>{t('terms.p2_1')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h3')}</h2>
                <p>{t('terms.p3_1')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h4')}</h2>
                <p>{t('terms.p4_1')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h5')}</h2>
                <p>{t('terms.p5_1')}</p>

                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h6')}</h2>
                <p>{t('terms.p6_1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h7')}</h2>
                <p>{t('terms.p7_1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h8')}</h2>
                <p>{t('terms.p8_1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h9')}</h2>
                <p>{t('terms.p9_1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h10')}</h2>
                <p>{t('terms.p10_1')}</p>
                
                <h2 className="text-xl font-bold text-gray-800 pt-4">{t('terms.h11')}</h2>
                <p>{t('terms.p11_1')}</p>

                <p className="font-bold pt-4 text-gray-800">{t('terms.final')}</p>
            </div>
        </div>
    );
};

export default TermsAndConditionsPage;
