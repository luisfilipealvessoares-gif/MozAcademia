
import React from 'react';
import { useI18n } from '../contexts/I18nContext';

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

const SupportPage: React.FC = () => {
    const { t } = useI18n();
    const supportEmail = "info@mozup.org";

    const faqs = [
        {
            question: t('support.faq.q1'),
            answer: t('support.faq.a1')
        },
        {
            question: t('support.faq.q2'),
            answer: t('support.faq.a2')
        },
        {
            question: t('support.faq.q3'),
            answer: t('support.faq.a3')
        },
        {
            question: t('support.faq.q4'),
            answer: t('support.faq.a4')
        }
    ];

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900">{t('support.title')}</h1>
                <p className="text-xl text-gray-600 mt-2">{t('support.subtitle')}</p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-8">
                    <h2 className="text-2xl font-bold text-brand-up">{t('support.contacts.title')}</h2>
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-brand-light p-3 rounded-full"><MailIcon className="w-6 h-6 text-brand-moz" /></div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">{t('support.contacts.email')}</h3>
                                <p className="text-gray-600">{t('support.contacts.email.desc')}</p>
                                <a href={`mailto:${supportEmail}`} className="text-brand-up hover:underline font-medium break-all">{supportEmail}</a>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-brand-light p-3 rounded-full"><PhoneIcon className="w-6 h-6 text-brand-moz" /></div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">{t('support.contacts.phone')}</h3>
                                <p className="text-gray-600">Maputo: <span className="font-medium text-gray-800">+258 84 777 3751 / +258 84 500 4700</span></p>
                                <p className="text-gray-600">Pemba: <span className="font-medium text-gray-800">+258 85 859 3163</span></p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-brand-light p-3 rounded-full"><MapPinIcon className="w-6 h-6 text-brand-moz" /></div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">{t('support.contacts.address')}</h3>
                                <p className="text-gray-600 font-medium">Maputo:</p>
                                <p className="text-gray-600">Rua dos Desportistas nº 691, Prédio JAT VI – 1, Piso 1</p>
                                <p className="text-gray-600 font-medium mt-2">Pemba:</p>
                                <p className="text-gray-600">Av. Alberto Chipande, Business Park, Porta 01</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
                     <h2 className="text-2xl font-bold text-brand-up mb-6">{t('support.faq.title')}</h2>
                     <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <details key={index} className="group border-b pb-4 last:border-b-0">
                                <summary className="flex justify-between items-center cursor-pointer list-none">
                                    <span className="font-semibold text-gray-800 group-hover:text-brand-moz">{faq.question}</span>
                                    <span className="transition group-open:rotate-180">
                                        <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                                    </span>
                                </summary>
                                <p className="text-gray-600 mt-3 group-open:animate-fadeIn">{faq.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SupportPage;
