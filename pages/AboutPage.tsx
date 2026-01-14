
import React from 'react';
import Logo from '../components/Logo';
import { useI18n } from '../contexts/I18nContext';

const AboutPage: React.FC = () => {
    const { t } = useI18n();
    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="relative">
                <img 
                    className="h-56 w-full object-cover" 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1771&q=80" 
                    alt="Pessoas colaborando em um projeto" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8">
                     <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">{t('about.title')}</h1>
                </div>
            </div>

            <div className="p-8 md:p-12 space-y-16">
                <section>
                    <p className="text-sm text-brand-moz font-semibold mb-2 uppercase tracking-wider">{t('about.mission')}</p>
                    <h2 className="text-3xl font-bold text-brand-up mb-4 tracking-tight">{t('about.subtitle')}</h2>
                    <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                        <p>
                            <span className="font-semibold text-gray-800">MozupAcademy</span> {t('about.p1').replace('A MozupAcademy', '')}
                        </p>
                        <p>
                            {t('about.p2')}
                        </p>
                    </div>
                </section>

                 <div className="text-center pt-8 border-t border-gray-200">
                    <Logo className="h-14 w-auto mx-auto"/>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
