
import React from 'react';
import Logo from '../components/Logo';

const AboutPage: React.FC = () => {
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
                     <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">Sobre a <span className="text-brand-moz">MozupAcademy</span></h1>
                </div>
            </div>

            <div className="p-8 md:p-12 space-y-12">
                <section>
                    <p className="text-sm text-brand-moz font-semibold mb-2">A NOSSA MISSÃO</p>
                    <h2 className="text-3xl font-bold text-brand-up mb-4 tracking-tight">Capacitação Digital para o Crescimento Empresarial</h2>
                    <div className="space-y-4 text-lg text-gray-700 leading-relaxed">
                        <p>
                            A <span className="font-semibold text-gray-800">MozupAcademy</span> é a plataforma de e-learning do MozUp, o centro de excelência dedicado a tornar as empresas moçambicanas mais competitivas. A nossa academia é uma extensão digital da missão do MozUp: transferir competências e conhecimentos essenciais para apoiar o desenvolvimento económico local.
                        </p>
                        <p>
                            Através de cursos online desenvolvidos por especialistas, focados em setores estratégicos como o de GNL, capacitamos profissionais e PMEs para que possam competir em oportunidades de negócios locais e internacionais. A MozupAcademy oferece a flexibilidade necessária para que você aprenda no seu ritmo, preparando-o para os desafios do mercado atual.
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