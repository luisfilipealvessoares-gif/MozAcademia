import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { SupportTicket } from '../types';
import { Link } from 'react-router-dom';

const SupportPage: React.FC = () => {
    const { user } = useAuth();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const userId = user?.id;

    useEffect(() => {
        const fetchTickets = async () => {
            if (!userId) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (data) setTickets(data);
            setLoading(false);
        };
        fetchTickets();
    }, [userId]);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !subject || !description) return;

        setSubmitting(true);
        const { data, error } = await supabase
            .from('support_tickets')
            .insert({ user_id: user.id, subject, description, status: 'open' })
            .select()
            .single();

        if (data) {
            setTickets([data, ...tickets]);
            setShowCreateModal(false);
            setSubject('');
            setDescription('');
        } else {
            alert("Erro ao criar o ticket: " + error.message);
        }
        setSubmitting(false);
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Meus Tickets de Suporte</h1>
                    <p className="text-gray-600 mt-1">Veja seus tickets ou crie um novo.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-brand-moz text-white font-semibold py-2 px-5 rounded-lg hover:bg-brand-up transition-all shadow-sm"
                >
                    Criar Novo Ticket
                </button>
            </div>

            <div className="bg-brand-light p-6 rounded-lg border border-brand-moz/20">
                <h3 className="font-bold text-lg mb-2">Precisa de Ajuda?</h3>
                <p className="text-gray-700">Se preferir, entre em contato conosco diretamente:</p>
                <p className="mt-2">Email: <a href="mailto:mozuppemba@gmail.com" className="text-brand-up font-semibold hover:underline">mozuppemba@gmail.com</a></p>
                <p>Telefone: <a href="tel:858593163" className="text-brand-up font-semibold hover:underline">858593163</a></p>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr><td colSpan={4} className="text-center p-6">Carregando tickets...</td></tr>
                        ) : tickets.length > 0 ? (
                            tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium">{ticket.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                                            {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Progresso' : 'Fechado'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.created_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <Link to={`/support/ticket/${ticket.id}`} className="text-brand-up hover:text-brand-moz font-semibold">
                                            Ver Detalhes
                                        </Link>
                                    </td>
                                </tr>
                            ))
                        ) : (
                             <tr><td colSpan={4} className="text-center p-6 text-gray-500">Você não tem nenhum ticket de suporte.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showCreateModal && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-xl">
                         <h2 className="text-2xl font-bold mb-6">Criar Novo Ticket</h2>
                         <form onSubmit={handleCreateTicket} className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Assunto</label>
                                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required className="mt-1 w-full p-2 border rounded-md" />
                             </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700">Descrição</label>
                                <textarea value={description} onChange={e => setDescription(e.target.value)} required rows={5} className="mt-1 w-full p-2 border rounded-md"></textarea>
                             </div>
                             <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
                                <button type="submit" disabled={submitting} className="bg-brand-moz text-white px-4 py-2 rounded-md hover:bg-brand-up disabled:opacity-50">
                                    {submitting ? 'Enviando...' : 'Enviar Ticket'}
                                </button>
                            </div>
                         </form>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default SupportPage;