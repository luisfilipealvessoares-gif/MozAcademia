
import React from 'react';

const MailIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;

const SupportPage: React.FC = () => {
    const supportEmail = "info@mozup.org";

    const faqs = [
        {
            question: "Como altero a minha senha?",
            answer: "Você pode redefinir sua senha na página de login, clicando na opção 'Esqueceu a senha?'. Um link para redefinição será enviado para o seu e-mail."
        },
        {
            question: "O acesso aos cursos expira?",
            answer: "Não, o seu acesso aos materiais do curso é vitalício. Uma vez inscrito, você pode aprender no seu próprio ritmo, sem prazos."
        },
        {
            question: "Como obtenho o meu certificado?",
            answer: "Após completar 100% dos módulos do curso e ser aprovado no quiz final, a opção para 'Solicitar Certificado' ficará disponível na página do curso."
        },
        {
            question: "Não consigo visualizar os vídeos. O que faço?",
            answer: "Certifique-se de que sua conexão com a internet está estável. Tente limpar o cache do seu navegador ou usar um navegador diferente. Se o problema persistir, entre em contato conosco."
        }
    ];

    return (
        <div className="space-y-12">
            <div>
                <h1 className="text-4xl font-extrabold text-gray-900">Suporte e Contactos</h1>
                <p className="text-xl text-gray-600 mt-2">Estamos aqui para ajudar. Encontre respostas ou entre em contacto connosco.</p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Info */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 space-y-8">
                    <h2 className="text-2xl font-bold text-brand-up">Nossos Contactos</h2>
                    <div className="space-y-6">
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-brand-light p-3 rounded-full"><MailIcon className="w-6 h-6 text-brand-moz" /></div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">Email</h3>
                                <p className="text-gray-600">Para dúvidas gerais e suporte técnico.</p>
                                <a href={`mailto:${supportEmail}`} className="text-brand-up hover:underline font-medium break-all">{supportEmail}</a>
                            </div>
                        </div>
                         <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-brand-light p-3 rounded-full"><PhoneIcon className="w-6 h-6 text-brand-moz" /></div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">Telefone</h3>
                                <p className="text-gray-600">Maputo: <span className="font-medium text-gray-800">+258 84 777 3751 / +258 84 500 4700</span></p>
                                <p className="text-gray-600">Pemba: <span className="font-medium text-gray-800">+258 85 859 3163</span></p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0 bg-brand-light p-3 rounded-full"><MapPinIcon className="w-6 h-6 text-brand-moz" /></div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-800">Endereços</h3>
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
                     <h2 className="text-2xl font-bold text-brand-up mb-6">Perguntas Frequentes</h2>
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
