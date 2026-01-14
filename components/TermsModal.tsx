
import React from 'react';
import Logo from './Logo';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-2xl font-bold text-brand-up">Termo de Compromisso e Uso</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div className="my-6 space-y-4 overflow-y-auto pr-4 text-sm text-gray-700">
            <p className="font-semibold">A MozupAcademy é a plataforma oficial de e-learning do MozUp, centro de excelência dedicado a fortalecer a competitividade das empresas moçambicanas por meio da capacitação profissional e transferência de conhecimentos.</p>
            <p>Ao aceder, registar-se ou utilizar a plataforma, a EMPRESA ou PROFISSIONAL USUÁRIO declara que leu, compreendeu e aceita integralmente os termos abaixo.</p>

            <h3 className="font-bold text-gray-800 pt-2">1. Objeto</h3>
            <p>Este Termo regula o acesso e uso da plataforma MozupAcademy, que disponibiliza cursos digitais pré-gravados e conteúdos educacionais destinados exclusivamente à formação e capacitação profissional.</p>
            
            <h3 className="font-bold text-gray-800 pt-2">2. Perfil de Utilização</h3>
            <p>A plataforma é destinada a empresas, organizações e profissionais; O acesso pode ser individual ou corporativo, conforme o plano contratado; O uso é exclusivamente educacional e interno.</p>

            <h3 className="font-bold text-gray-800 pt-2">3. Direitos da Plataforma</h3>
            <p>A MozupAcademy reserva-se o direito de: Atualizar, modificar ou remover conteúdos a qualquer momento; Suspender ou cancelar contas que violem este Termo; Monitorar o uso da plataforma para fins de segurança, qualidade e conformidade legal.</p>

            <h3 className="font-bold text-gray-800 pt-2">4. Propriedade Intelectual</h3>
            <p>Todos os cursos, vídeos, textos, materiais, metodologias, marcas e sistemas são propriedade exclusiva do MozUp / MozupAcademy. É expressamente proibido: Copiar, gravar, descarregar, partilhar ou redistribuir conteúdos; Revender ou utilizar os cursos para formação externa; Disponibilizar acessos a terceiros não autorizados. Qualquer violação constitui infração legal e poderá resultar em sanções civis e criminais.</p>

            <h3 className="font-bold text-gray-800 pt-2">5. Responsabilidades do Usuário</h3>
            <p>O usuário compromete-se a: Utilizar a plataforma de forma ética e legal; Não tentar violar sistemas de segurança, pagamento ou acesso; Não utilizar os conteúdos para fins comerciais não autorizados; Garantir que apenas pessoas autorizadas da empresa utilizem o acesso.</p>

            <h3 className="font-bold text-gray-800 pt-2">6. Uso Indevido e Penalidades</h3>
            <p>Em caso de uso indevido, a MozupAcademy poderá: Bloquear imediatamente o acesso; Cancelar planos ativos sem reembolso; Tomar medidas legais cabíveis para reparação de danos.</p>
            
            <h3 className="font-bold text-gray-800 pt-2">7. Pagamentos e Planos</h3>
            <p>O acesso à plataforma pode estar sujeito a pagamento; Valores, prazos e benefícios variam conforme o plano contratado; A falta de pagamento pode resultar na suspensão automática do acesso.</p>
            
            <h3 className="font-bold text-gray-800 pt-2">8. Limitação de Responsabilidade</h3>
            <p>A MozupAcademy: Não garante resultados profissionais, financeiros ou comerciais; Não se responsabiliza por decisões tomadas com base nos conteúdos; Oferece os cursos como ferramenta de capacitação, não como consultoria personalizada.</p>
            
            <h3 className="font-bold text-gray-800 pt-2">9. Proteção de Dados</h3>
            <p>Os dados fornecidos serão utilizados apenas para: Gestão de contas; Comunicação institucional; Melhoria da experiência da plataforma. Nunca serão vendidos ou partilhados sem consentimento legal.</p>
            
            <h3 className="font-bold text-gray-800 pt-2">10. Rescisão</h3>
            <p>O usuário pode encerrar o uso da plataforma a qualquer momento. A MozupAcademy pode rescindir o acesso em caso de violação deste Termo.</p>
            
            <h3 className="font-bold text-gray-800 pt-2">11. Legislação Aplicável</h3>
            <p>Este Termo rege-se pelas leis da República de Moçambique, sendo competente o foro local para resolução de quaisquer litígios.</p>

            <p className="font-bold pt-4 text-gray-800">Ao utilizar a MozupAcademy, o usuário declara concordar integralmente com este Termo.</p>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t mt-auto">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold transition-all">
            Fechar
          </button>
          <button onClick={onAccept} className="px-6 py-2 rounded-lg text-white bg-brand-moz hover:bg-brand-up font-semibold shadow-md hover:shadow-lg transition-all">
            Aceito
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
