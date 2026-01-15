
import React, { useState } from 'react';
import { useI18n } from '../contexts/I18nContext';

// Icons
const EnvelopeIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 6.75z" /></svg>;
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>;
const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
);

interface FAQItem {
    q: string;
    a: string;
}

const FAQAccordion: React.FC<{ items: FAQItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleItem = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="space-y-4">
            {items.map((item, index) => (
                <div key={index} className="border-b border-gray-200 last:border-b-0">
                    <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex justify-between items-center text-left py-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-moz rounded-md"
                        aria-expanded={openIndex === index}
                        aria-controls={`faq-answer-${index}`}
                    >
                        <span className="text-gray-800 font-semibold">{item.q}</span>
                        <ChevronDownIcon className={`w-5 h-5 text-brand-moz transition-transform duration-300 transform ${openIndex === index ? 'rotate-180' : ''}`} />
                    </button>
                    <div
                        id={`faq-answer-${index}`}
                        className={`grid transition-all duration-500 ease-in-out ${openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                    >
                        <div className="overflow-hidden">
                             <p className="pb-4 pt-2 text-gray-600 leading-relaxed">
                                {item.a}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};


const SupportPage: React.FC = () => {
    const { t } = useI18n();

    const faqs = [
        { q: t('user.support.faq.q1'), a: t('user.support.faq.a1') },
        { q: t('user.support.faq.q2'), a: t('user.support.faq.a2') },
        { q: t('user.support.faq.q3'), a: t('user.support.faq.a3') },
        { q: t('user.support.faq.q4'), a: t('user.support.faq.a4') },
    ];

    return (
        <div className="space-y-10">
            <div className="text-center">
                <h1 className="text-4xl font-extrabold text-gray-900">{t('user.support.title')}</h1>
                <p className="text-xl text-gray-600 mt-2 max-w-2xl mx-auto">{t('user.support.subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contacts Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('user.support.contacts.title')}</h2>
                    <div className="space-y-6">
                        {/* Email */}
                        <div>
                            <div className="flex items-center space-x-3 mb-1">
                                <EnvelopeIcon className="w-5 h-5 text-brand-up"/>
                                <h3 className="font-semibold text-gray-700">{t('user.support.contacts.email.title')}</h3>
                            </div>
                            <p className="text-sm text-gray-500 pl-8 mb-1">{t('user.support.contacts.email.desc')}</p>
                            <a href="mailto:info@mozup.org" className="text-brand-moz hover:underline pl-8">info@mozup.org</a>
                        </div>
                        {/* Phone */}
                        <div>
                             <div className="flex items-center space-x-3 mb-2">
                                <PhoneIcon className="w-5 h-5 text-brand-up"/>
                                <h3 className="font-semibold text-gray-700">{t('user.support.contacts.phone.title')}</h3>
                            </div>
                             <div className="pl-8 space-y-1 text-brand-moz">
                                <p><strong>{t('footer.maputo')}:</strong> +258 84 777 3751 / +258 84 500 4700</p>
                                <p><strong>{t('footer.pemba')}:</strong> +258 85 859 3163</p>
                            </div>
                        </div>
                        {/* Address */}
                        <div>
                             <div className="flex items-center space-x-3 mb-2">
                                <MapPinIcon className="w-5 h-5 text-brand-up"/>
                                <h3 className="font-semibold text-gray-700">{t('user.support.contacts.address.title')}</h3>
                            </div>
                            <div className="pl-8 space-y-2 text-gray-600 text-sm">
                                <p><strong>{t('footer.maputo')}:</strong> Rua dos Desportistas nº 691, Prédio JAT VI – 1, Piso 1</p>
                                <p><strong>{t('footer.pemba')}:</strong> Av. Alberto Chipande, Business Park, Porta 01</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Card */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                     <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('user.support.faq.title')}</h2>
                     <FAQAccordion items={faqs} />
                </div>
            </div>
        </div>
    );
};

export default SupportPage;