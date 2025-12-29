import React from 'react';
import Logo from '../components/Logo';

// --- Icon Components ---
const TargetIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
    </svg>
);
const RocketLaunchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a6 6 0 01-7.38 5.84m2.56-5.84a6 6 0 01-5.84-7.38m5.84 2.56v4.82" />
    </svg>
);
const GlobeAltIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5" />
    </svg>
);


const HowItWorksPage: React.FC = () => {
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
                     <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">Como Funciona a <span className="text-brand-moz">MozupAcademy</span></h1>
                </div>
            </div>

            <div className="p-8 md:p-12 space-y-12">
                <section>
                    <h2 className="text-2xl font-bold text-brand-up mb-4">A Nossa Missão</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        A <span className="font-semibold">MozupAcademy</span> é a plataforma de e-learning do MozUp, o centro de excelência dedicado a tornar as empresas moçambicanas mais competitivas. A nossa academia é uma extensão digital da missão do MozUp: transferir competências e conhecimentos essenciais para apoiar o desenvolvimento económico local.
                    </p>
                </section>

                <section className="grid md:grid-cols-3 gap-8 text-center">
                    <div className="bg-brand-light p-6 rounded-lg">
                         <TargetIcon className="w-12 h-12 text-brand-moz mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Capacitação Estratégica</h3>
                        <p className="text-gray-600 text-sm">Cursos focados em setores vitais, como GNL, para preparar PMEs para oportunidades reais de negócio.</p>
                    </div>
                     <div className="bg-brand-light p-6 rounded-lg">
                         <RocketLaunchIcon className="w-12 h-12 text-brand-moz mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Crescimento Acelerado</h3>
                        <p className="text-gray-600 text-sm">Oferecemos as ferramentas para que profissionais e empresas possam competir em mercados locais e internacionais.</p>
                    </div>
                     <div className="bg-brand-light p-6 rounded-lg">
                         <GlobeAltIcon className="w-12 h-12 text-brand-moz mx-auto mb-4" />
                        <h3 className="font-bold text-lg mb-2">Acesso Flexível</h3>
                        <p className="text-gray-600 text-sm">Aprenda no seu ritmo, de qualquer lugar, com uma plataforma digital moderna e intuitiva.</p>
                    </div>
                </section>
                
                <section>
                     <h2 className="text-2xl font-bold text-brand-up mb-4">O Elo Digital para o Sucesso</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        Através de cursos online desenvolvidos por especialistas, focados em setores estratégicos como o de GNL, capacitamos profissionais e PMEs para que possam competir em oportunidades de negócios locais e internacionais. A MozupAcademy oferece a flexibilidade necessária para que você aprenda no seu ritmo, preparando-o para os desafios do mercado atual. Junte-se a nós e seja parte da transformação económica de Moçambique.
                    </p>
                </section>

                 <div className="text-center pt-8 border-t border-gray-200">
                    <Logo className="h-14 w-auto mx-auto"/>
                </div>
            </div>
        </div>
    );
};

export default HowItWorksPage;