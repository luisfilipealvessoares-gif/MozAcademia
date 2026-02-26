import React, { forwardRef } from 'react';
import Logo from './Logo';

interface CertificateTemplateProps {
    studentName: string;
    companyName: string;
    courseName: string;
    completionDate: string;
    instructorName?: string;
    instructorTitle?: string;
}

const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(({
    studentName,
    companyName,
    courseName,
    completionDate,
    instructorName = "Diretor de Formação",
    instructorTitle = "MozUp Academy"
}, ref) => {
    return (
        <div ref={ref} className="w-[1123px] h-[794px] bg-white relative flex flex-col items-center justify-between p-16 shadow-2xl mx-auto text-gray-800 font-sans box-border">
            
            {/* Decorative Borders */}
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-brand-moz to-brand-up"></div>
            <div className="absolute bottom-0 left-0 w-full h-4 bg-gradient-to-r from-brand-up to-brand-moz"></div>
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none z-0">
                <Logo className="w-[600px] grayscale" />
            </div>

            {/* Header Section */}
            <div className="z-10 w-full flex justify-between items-start border-b border-gray-200 pb-8">
                <Logo className="h-20 w-auto" />
                <div className="text-right">
                    <h1 className="text-5xl font-serif font-bold text-brand-up uppercase tracking-widest">Certificado</h1>
                    <p className="text-xl text-brand-moz font-light tracking-[0.2em] uppercase mt-1">de Conclusão</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="z-10 flex-grow flex flex-col justify-center items-center text-center w-full space-y-4 py-2">
                
                <div className="space-y-1">
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">A MozUp Academy certifica que</p>
                    <h2 className="text-4xl font-bold text-gray-900 font-serif italic leading-tight px-8 py-1 border-b-2 border-gray-100 inline-block min-w-[600px]">
                        {studentName || "Nome do Aluno"}
                    </h2>
                </div>

                <div className="space-y-1">
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Da empresa</p>
                    <p className="text-xl text-gray-700 font-medium">
                        {companyName || "Nome da Empresa"}
                    </p>
                </div>

                <div className="space-y-2 w-full max-w-4xl">
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold">Concluiu com êxito o curso online de</p>
                    <h3 className="text-3xl font-bold text-brand-up leading-tight px-4">
                        {courseName || "Título do Curso"}
                    </h3>
                </div>

                <div className="pt-2">
                    <p className="text-sm text-gray-500 uppercase tracking-widest font-semibold mb-1">Data de Conclusão</p>
                    <p className="text-lg text-gray-800 font-medium border px-4 py-1 rounded border-gray-200 inline-block">
                        {completionDate || "DD/MM/AAAA"}
                    </p>
                </div>
            </div>

            {/* Footer / Signatures */}
            <div className="z-10 w-full flex justify-between items-end pt-4 border-t border-gray-200 mt-auto">
                
                {/* Instructor Signature (Left) */}
                <div className="flex flex-col items-center w-1/3">
                    <div className="h-20 flex items-end justify-center w-full mb-1">
                         <div className="font-serif text-3xl text-gray-400 italic font-bold opacity-50 transform -rotate-3">Assinado</div>
                    </div>
                    <div className="w-full border-t border-gray-400"></div>
                    <p className="font-bold text-sm text-gray-900 uppercase tracking-wide mt-1">{instructorName}</p>
                    <p className="text-[10px] text-brand-moz font-bold uppercase tracking-wider">{instructorTitle}</p>
                </div>

                {/* Empty Center Space */}
                <div className="w-1/3"></div>

                {/* Director Signature + Seal (Right) */}
                <div className="flex flex-col items-center w-1/3 relative">
                     {/* Seal Positioned Above/Behind Signature Area */}
                     <div className="absolute -top-16 opacity-90">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-brand-moz shadow-md border-4 border-brand-moz ring-4 ring-brand-light relative">
                            <div className="absolute inset-0 rounded-full border border-dashed border-gray-300 m-1"></div>
                            <div className="text-center">
                                <span className="block text-[8px] font-bold tracking-widest text-gray-400 uppercase">MozUp</span>
                                <span className="block text-lg font-black leading-none my-0.5 text-brand-up">SELO</span>
                                <span className="block text-[6px] tracking-widest text-gray-400 uppercase">Qualidade</span>
                            </div>
                        </div>
                    </div>

                     <div className="h-20 flex items-end justify-center w-full mb-1">
                         {/* Placeholder for second signature if needed */}
                    </div>
                    <div className="w-full border-t border-gray-400 relative z-10"></div>
                    <p className="font-bold text-sm text-gray-900 uppercase tracking-wide mt-1 relative z-10">Coordenação Pedagógica</p>
                    <p className="text-[10px] text-brand-moz font-bold uppercase tracking-wider relative z-10">MozUp Academy</p>
                </div>
            </div>

            {/* Disclaimer Note */}
            <div className="z-10 w-full text-center mt-4 mb-2 px-16">
                <p className="text-[9px] text-gray-400 leading-tight">
                    O presente certificado destina-se exclusivamente a comprovar a participação e/ou conclusão da formação acima mencionada, 
                    não constituindo certificação profissional regulamentada, nem conferindo habilitação técnica, equivalência académica 
                    ou reconhecimento oficial por parte das autoridades competentes.
                </p>
            </div>
        </div>
    );
});

export default CertificateTemplate;
