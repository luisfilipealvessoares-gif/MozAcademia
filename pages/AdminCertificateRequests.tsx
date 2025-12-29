
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { CertificateRequest } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const AdminCertificateRequests: React.FC = () => {
    const [requests, setRequests] = useState<CertificateRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRequests = async () => {
            setLoading(true);
            const { data: certRequestsData } = await supabase
                .from('certificate_requests')
                .select('*, user_profiles(full_name, company_name), courses(title)')
                .eq('status', 'pending')
                .order('requested_at', { ascending: false });
            
            if (certRequestsData && certRequestsData.length > 0) {
                const userIds = [...new Set(certRequestsData.map(req => req.user_id))];
                const { data: enrollmentsData } = await supabase
                    .from('enrollments')
                    .select('user_id, course_id, enrolled_at')
                    .in('user_id', userIds);
                
                const enrollmentsMap = new Map(enrollmentsData?.map(e => [`${e.user_id}-${e.course_id}`, e.enrolled_at]));

                const joinedRequests = certRequestsData.map(req => ({
                    ...req,
                    enrolled_at: enrollmentsMap.get(`${req.user_id}-${req.course_id}`)
                }));
                setRequests(joinedRequests as CertificateRequest[]);
            } else {
                setRequests([]);
            }
            setLoading(false);
        };
        fetchRequests();
    }, []);

    const handleApprove = async (requestId: string) => {
        if (window.confirm('Tem certeza que deseja aprovar este pedido de certificado?')) {
            await supabase.from('certificate_requests').update({ status: 'issued' }).eq('id', requestId);
            setRequests(prev => prev.filter(req => req.id !== requestId));
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Pedidos de Certificado</h1>
                    <p className="text-gray-600 mt-1">Aprove os pedidos de alunos que concluíram os cursos.</p>
                </div>
                <div className="space-x-2">
                    <button onClick={exportToPDF} className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 border shadow-sm">Exportar PDF</button>
                    <button onClick={exportToExcel} className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 border shadow-sm">Exportar Excel</button>
                </div>
            </div>
            <div className="bg-white shadow-md rounded-lg overflow-x-auto border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aluno</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data Inscrição</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={5} className="text-center p-6 text-gray-500">Carregando...</td></tr>
                        ) : requests.length > 0 ? (
                            requests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{req.user_profiles?.full_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{req.user_profiles?.company_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{req.courses?.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.enrolled_at ? new Date(req.enrolled_at).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <button onClick={() => handleApprove(req.id)} className="bg-brand-moz text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-brand-up">Aprovar</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={5} className="text-center p-10 text-gray-500">Nenhum pedido de certificado pendente.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCertificateRequests;
