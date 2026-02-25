import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabase';
import { CertificateRequest } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import CertificateTemplate from '../components/CertificateTemplate';

const AdminCertificateRequests: React.FC = () => {
    const [requests, setRequests] = useState<CertificateRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    // Certificate Simulator State
    const [showSimulator, setShowSimulator] = useState(false);
    const [simStudentName, setSimStudentName] = useState('João da Silva');
    const [simCompanyName, setSimCompanyName] = useState('Empresa Modelo Lda.');
    const [simCourseName, setSimCourseName] = useState('Introdução ao Petróleo e Gás');
    const [simCompletionDate, setSimCompletionDate] = useState(new Date().toLocaleDateString('pt-PT'));

    const fetchRequests = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        setError(null);
        try {
            const { data: certRequestsData, error: certError } = await supabase
                .from('certificate_requests')
                .select('*')
                .eq('status', 'pending')
                .order('requested_at', { ascending: false })
                .abortSignal(signal);

            if (certError) throw certError;
            if (signal.aborted) return;
            
            if (certRequestsData && certRequestsData.length > 0) {
                const userIds = [...new Set(certRequestsData.map(req => req.user_id))];
                const courseIds = [...new Set(certRequestsData.map(req => req.course_id))];

                const [usersRes, coursesRes, enrollmentsRes] = await Promise.all([
                    supabase.from('user_profiles').select('id, full_name, company_name').in('id', userIds).abortSignal(signal),
                    supabase.from('courses').select('id, title').in('id', courseIds).abortSignal(signal),
                    supabase.from('enrollments').select('user_id, course_id, enrolled_at').in('user_id', userIds).abortSignal(signal)
                ]);

                if (signal.aborted) return;

                if (usersRes.error) throw usersRes.error;
                if (coursesRes.error) throw coursesRes.error;
                if (enrollmentsRes.error) throw enrollmentsRes.error;
                
                const usersMap = new Map(usersRes.data.map(u => [u.id, u]));
                const coursesMap = new Map(coursesRes.data.map(c => [c.id, c]));
                const enrollmentsMap = new Map(enrollmentsRes.data.map(e => [`${e.user_id}-${e.course_id}`, e.enrolled_at]));
                
                const joinedRequests = certRequestsData.map(req => ({
                    ...req,
                    user_profiles: usersMap.get(req.user_id) || null,
                    courses: coursesMap.get(req.course_id) || null,
                    enrolled_at: enrollmentsMap.get(`${req.user_id}-${req.course_id}`)
                }));

                if (!signal.aborted) {
                    setRequests(joinedRequests as CertificateRequest[]);
                }
            } else {
                if (!signal.aborted) setRequests([]);
            }
        } catch (err: any) {
            // Check for AbortError by name or message content
            if (err.name === 'AbortError' || err.message?.includes('AbortError') || err.message?.includes('aborted')) {
                return;
            }
            console.error("Erro ao buscar pedidos:", err.message);
            setError("Não foi possível carregar os pedidos. Tente novamente mais tarde.");
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchRequests();

        const channel = supabase.channel('certificate-requests-changes')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'certificate_requests' }, fetchRequests)
          .subscribe();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            supabase.removeChannel(channel);
        };
    }, [fetchRequests]);

    const handleApprove = async (requestId: string) => {
        if (window.confirm('Tem certeza que deseja aprovar este pedido de certificado?')) {
            await supabase.from('certificate_requests').update({ status: 'issued' }).eq('id', requestId);
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        const tableData = requests.map(req => [
            req.user_profiles?.full_name || 'N/A',
            req.user_profiles?.company_name || 'N/A',
            req.courses?.title || 'N/A',
            req.enrolled_at ? new Date(req.enrolled_at).toLocaleDateString() : 'N/A',
        ]);
        autoTable(doc, {
            head: [['Aluno', 'Empresa', 'Curso', 'Data de Inscrição']],
            body: tableData,
        });
        doc.save('pedidos_certificados.pdf');
    };

    const exportToExcel = () => {
        const dataToExport = requests.map(req => ({
            'Aluno': req.user_profiles?.full_name || 'N/A',
            'Empresa': req.user_profiles?.company_name || 'N/A',
            'Curso': req.courses?.title || 'N/A',
            'Data de Inscrição': req.enrolled_at ? new Date(req.enrolled_at).toLocaleDateString() : 'N/A',
            'Data do Pedido': new Date(req.requested_at).toLocaleDateString(),
        }));
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
        XLSX.writeFile(wb, 'pedidos_certificados.xlsx');
    };

    return (
        <div className="space-y-5">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold">Pedidos de Certificado</h1>
                    <p className="text-gray-600 mt-1 text-sm">Aprove os pedidos de alunos que concluíram os cursos.</p>
                </div>
                <div className="space-x-2">
                    <button onClick={exportToPDF} className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 border shadow-sm transition-all duration-200">Exportar PDF</button>
                    <button onClick={exportToExcel} className="bg-white text-gray-700 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-100 border shadow-sm transition-all duration-200">Exportar Excel</button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Data Inscrição</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-6 text-gray-500 text-sm">Carregando...</td></tr>
                        ) : error ? (
                            <tr><td colSpan={5} className="text-center p-6 text-red-500 text-sm">{error}</td></tr>
                        ) : requests.length > 0 ? (
                            requests.map(req => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors duration-200">
                                    <td className="px-4 py-2 whitespace-nowrap font-medium text-xs">{req.user_profiles?.full_name || '[Aluno Removido]'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs">{req.user_profiles?.company_name || 'N/A'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs">{req.courses?.title || '[Curso Removido]'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-xs text-gray-500">{req.enrolled_at ? new Date(req.enrolled_at).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap text-right">
                                        <button onClick={() => handleApprove(req.id)} className="bg-brand-moz text-white px-2.5 py-1 rounded-md text-xs font-medium hover:bg-brand-up transition-all duration-200">Aprovar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-10 text-gray-500 text-sm">Nenhum pedido de certificado pendente.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Certificate Simulator Section */}
            <div className="mt-10 border-t pt-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Simulador de Certificados</h2>
                        <p className="text-gray-600 text-sm">Visualize e teste o layout dos certificados antes da emissão.</p>
                    </div>
                    <button 
                        onClick={() => setShowSimulator(!showSimulator)}
                        className="bg-brand-moz text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-up transition-colors"
                    >
                        {showSimulator ? 'Ocultar Simulador' : 'Abrir Simulador'}
                    </button>
                </div>

                {showSimulator && (
                    <div className="bg-gray-50 p-6 rounded-xl border shadow-inner">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nome do Aluno</label>
                                <input 
                                    type="text" 
                                    value={simStudentName} 
                                    onChange={(e) => setSimStudentName(e.target.value)}
                                    className="w-full p-2 border rounded-md text-sm focus:ring-brand-moz focus:border-brand-moz"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Empresa</label>
                                <input 
                                    type="text" 
                                    value={simCompanyName} 
                                    onChange={(e) => setSimCompanyName(e.target.value)}
                                    className="w-full p-2 border rounded-md text-sm focus:ring-brand-moz focus:border-brand-moz"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Curso</label>
                                <input 
                                    type="text" 
                                    value={simCourseName} 
                                    onChange={(e) => setSimCourseName(e.target.value)}
                                    className="w-full p-2 border rounded-md text-sm focus:ring-brand-moz focus:border-brand-moz"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Data de Conclusão</label>
                                <input 
                                    type="text" 
                                    value={simCompletionDate} 
                                    onChange={(e) => setSimCompletionDate(e.target.value)}
                                    className="w-full p-2 border rounded-md text-sm focus:ring-brand-moz focus:border-brand-moz"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center overflow-auto p-4 bg-gray-200 rounded-lg border border-gray-300">
                            <div className="transform scale-75 origin-top">
                                <CertificateTemplate 
                                    studentName={simStudentName}
                                    companyName={simCompanyName}
                                    courseName={simCourseName}
                                    completionDate={simCompletionDate}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCertificateRequests;