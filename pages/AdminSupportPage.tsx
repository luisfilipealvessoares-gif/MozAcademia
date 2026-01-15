

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { SupportTicket } from '../types';
import { Link } from 'react-router-dom';

const AdminSupportPage: React.FC = () => {
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'closed'>('all');
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchTickets = useCallback(async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const { data, error } = await supabase
                .from('support_tickets')
                .select('*, user_profiles(full_name)')
                .order('created_at', { ascending: false })
                .abortSignal(signal);

            if (error) throw error;

            if (data && !signal.aborted) setTickets(data as any);

        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error("Error fetching support tickets:", error);
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchTickets();
        
        const channel = supabase.channel('admin-support-tickets')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, fetchTickets)
            .subscribe();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            supabase.removeChannel(channel);
        };
    }, [fetchTickets]);

    const filteredTickets = useMemo(() => {
        if (statusFilter === 'all') return tickets;
        return tickets.filter(ticket => ticket.status === statusFilter);
    }, [tickets, statusFilter]);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="bg-brand-light -mx-8 -my-8 p-8 rounded-xl">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold">Gestão de Tickets de Suporte</h1>
                    <p className="text-gray-600 mt-1">Visualize e gerencie todos os tickets de suporte dos usuários.</p>
                </div>

                <div className="flex space-x-2">
                    {(['all', 'open', 'in_progress', 'closed'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-md text-sm font-semibold ${statusFilter === status ? 'bg-brand-moz text-white' : 'bg-white hover:bg-gray-100'}`}
                        >
                            {status === 'all' ? 'Todos' : status === 'open' ? 'Abertos' : status === 'in_progress' ? 'Em Progresso' : 'Fechados'}
                        </button>
                    ))}
                </div>

                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuário</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assunto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                             {loading ? (
                                <tr><td colSpan={5} className="text-center p-6">Carregando tickets...</td></tr>
                            ) : filteredTickets.length > 0 ? (
                                filteredTickets.map(ticket => (
                                    <tr key={ticket.id}>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium">{ticket.user_profiles?.full_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">{ticket.subject}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                                                {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Progresso' : 'Fechado'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.created_at).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Link to={`/admin/support/ticket/${ticket.id}`} className="text-brand-up hover:text-brand-moz font-semibold">
                                                Gerenciar
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={5} className="text-center p-6 text-gray-500">Nenhum ticket encontrado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminSupportPage;
