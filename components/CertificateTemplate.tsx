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
        <div ref={ref} className="w-[800px] h-[600px] bg-white relative overflow-hidden border-8 border-double border-brand-moz p-10 flex flex-col items-center justify-between text-center shadow-2xl mx-auto">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none flex items-center justify-center">
                <Logo className="w-[500px] h-auto grayscale" />
            </div>

            {/* Header */}
            <div className="z-10 w-full flex flex-col items-center">
                <Logo className="h-20 w-auto mb-6" />
                <h1 className="text-5xl font-serif text-brand-moz font-bold tracking-wider uppercase mb-2">Certificado de Conclusão</h1>
                <div className="w-32 h-1 bg-brand-up rounded-full mb-8"></div>
            </div>

            {/* Content */}
            <div className="z-10 flex-grow flex flex-col justify-center space-y-6">
                <p className="text-xl text-gray-600 font-light">A MozUp Academy certifica que</p>
                
                <h2 className="text-4xl font-bold text-gray-900 font-serif italic border-b-2 border-gray-200 pb-2 px-10 inline-block mx-auto min-w-[400px]">
                    {studentName || "Nome do Aluno"}
                </h2>

                <p className="text-lg text-gray-600">
                    da empresa <span className="font-semibold text-gray-800">{companyName || "Nome da Empresa"}</span>
                </p>

                <p className="text-xl text-gray-600 font-light">
                    concluiu com êxito o curso de
                </p>

                <h3 className="text-3xl font-bold text-brand-up max-w-2xl mx-auto leading-tight">
                    {courseName || "Título do Curso"}
                </h3>

                <p className="text-lg text-gray-600 mt-4">
                    em <span className="font-semibold text-gray-800">{completionDate || "Data de Conclusão"}</span>
                </p>
            </div>

            {/* Footer / Signatures */}
            <div className="z-10 w-full flex justify-around items-end mt-12">
                <div className="flex flex-col items-center">
                    <div className="w-64 border-t-2 border-gray-400 mb-2"></div>
                    <p className="font-bold text-gray-800">{instructorName}</p>
                    <p className="text-sm text-brand-moz font-semibold">{instructorTitle}</p>
                </div>
                
                {/* Seal */}
                <div className="relative">
                    <div className="w-24 h-24 bg-brand-moz rounded-full flex items-center justify-center text-white font-bold border-4 border-brand-up shadow-lg">
                        <span className="text-xs text-center leading-tight">SELO DE<br/>QUALIDADE<br/>MOZUP</span>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <div className="w-64 border-t-2 border-gray-400 mb-2"></div>
                    <p className="font-bold text-gray-800">Coordenação Pedagógica</p>
                    <p className="text-sm text-brand-moz font-semibold">MozUp Academy</p>
                </div>
            </div>
            
            {/* Decorative Corners */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-brand-up rounded-tl-3xl m-4"></div>
            <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-brand-up rounded-tr-3xl m-4"></div>
            <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-brand-up rounded-bl-3xl m-4"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-brand-up rounded-br-3xl m-4"></div>
        </div>
    );
});

export default CertificateTemplate;
