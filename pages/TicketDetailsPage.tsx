import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { SupportTicket, TicketReply } from '../types';

const TicketDetailsPage: React.FC = () => {
    const { ticketId } = useParams<{ ticketId: string }>();
    const { user, isAdmin } = useAuth();
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [replies, setReplies] = useState<TicketReply[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const userId = user?.id;

    const fetchTicketAndReplies = useCallback(async () => {
        if (!userId || !ticketId) return;

        // Fetch ticket details
        const ticketQuery = supabase.from('support_tickets').select('*, user_profiles(full_name, id)').eq('id', ticketId);
        // Security: Non-admins can only fetch their own tickets
        if (!isAdmin) {
            ticketQuery.eq('user_id', userId);
        }
        const { data: ticketData, error: ticketError } = await ticketQuery.single();

        if (ticketError || !ticketData) {
            console.error("Error fetching ticket or access denied:", ticketError);
            setLoading(false);
            return;
        }
        setTicket(ticketData as any);

        // Fetch replies
        const { data: repliesData } = await supabase
            .from('ticket_replies')
            .select('*, user_profiles(full_name, is_admin)')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (repliesData) setReplies(repliesData as any);
        setLoading(false);
    }, [ticketId, userId, isAdmin]);

    useEffect(() => {
        fetchTicketAndReplies();
    }, [fetchTicketAndReplies]);

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !ticketId || !newMessage.trim()) return;

        setSubmitting(true);
        const { data: newReplyData, error } = await supabase
            .from('ticket_replies')
            .insert({ ticket_id: ticketId, user_id: user.id, message: newMessage })
            .select('*, user_profiles(full_name, is_admin)')
            .single();

        if (newReplyData) {
            setReplies([...replies, newReplyData as any]);
            setNewMessage('');
        }
        setSubmitting(false);
    };
    
    const handleStatusChange = async (newStatus: 'open' | 'in_progress' | 'closed') => {
        if (!isAdmin || !ticketId) return;
        const { error } = await supabase.from('support_tickets').update({ status: newStatus }).eq('id', ticketId);
        if (!error && ticket) {
            setTicket({ ...ticket, status: newStatus });
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div>Carregando ticket...</div>;
    if (!ticket) return <div>Ticket não encontrado ou acesso negado.</div>;

    const backLink = isAdmin ? "/admin/support" : "/support";

    return (
        <div className="space-y-6">
            <Link to={backLink} className="text-brand-moz hover:underline">&larr; Voltar para Tickets</Link>
            
            <div className="bg-white p-6 rounded-lg shadow-md border">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">{ticket.subject}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Aberto por {ticket.user_profiles?.full_name} em {new Date(ticket.created_at).toLocaleString()}
                        </p>
                    </div>
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Aberto' : ticket.status === 'in_progress' ? 'Em Progresso' : 'Fechado'}
                    </span>
                </div>
            </div>

            <div className="space-y-4">
                {/* Initial Description */}
                <div className="flex">
                     <div className="flex-shrink-0 mr-3">
                        <div className="w-10 h-10 rounded-full bg-brand-light text-brand-up flex items-center justify-center font-bold">
                           {ticket.user_profiles?.full_name?.charAt(0)}
                        </div>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg flex-1">
                        <p className="font-semibold text-gray-800">{ticket.user_profiles?.full_name}</p>
                        <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                    </div>
                </div>

                {/* Replies */}
                {replies.map(reply => (
                    <div key={reply.id} className={`flex ${reply.user_id === user?.id ? 'justify-end' : ''}`}>
                         <div className={`flex items-start max-w-xl ${reply.user_id === user?.id ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex-shrink-0 ${reply.user_id === user?.id ? 'ml-3' : 'mr-3'}`}>
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${reply.user_profiles?.is_admin ? 'bg-gray-700 text-white' : 'bg-brand-light text-brand-up'}`}>
                                    {reply.user_profiles?.is_admin ? 'A' : reply.user_profiles?.full_name?.charAt(0)}
                                </div>
                            </div>
                            <div className={`${reply.user_id === user?.id ? 'bg-brand-moz text-white' : 'bg-white border'} p-4 rounded-lg shadow-sm`}>
                                <p className={`font-semibold ${reply.user_id === user?.id ? 'text-white' : 'text-gray-800'}`}>{reply.user_profiles?.is_admin ? `${reply.user_profiles.full_name} (Admin)` : reply.user_profiles?.full_name}</p>
                                <p className="whitespace-pre-wrap">{reply.message}</p>
                                <p className={`text-xs mt-2 ${reply.user_id === user?.id ? 'text-gray-200' : 'text-gray-500'}`}>{new Date(reply.created_at).toLocaleString()}</p>
                            </div>
                         </div>
                    </div>
                ))}
            </div>

            {ticket.status !== 'closed' && (
                <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-bold mb-4">Responder ao Ticket</h3>
                    <form onSubmit={handlePostReply}>
                        <textarea
                            value={newMessage}
                            onChange={e => setNewMessage(e.target.value)}
                            rows={5}
                            className="w-full p-2 border rounded-md"
                            placeholder="Digite sua mensagem aqui..."
                            required
                        />
                        <div className="text-right mt-4">
                            <button type="submit" disabled={submitting} className="bg-brand-moz text-white px-6 py-2 rounded-md hover:bg-brand-up disabled:opacity-50">
                                {submitting ? 'Enviando...' : 'Enviar Resposta'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {isAdmin && (
                 <div className="bg-white p-6 rounded-lg shadow-md border">
                    <h3 className="font-bold mb-4">Ações de Administrador</h3>
                    <div className="flex space-x-4">
                        <button onClick={() => handleStatusChange('open')} disabled={ticket.status === 'open'} className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50">Marcar como Aberto</button>
                        <button onClick={() => handleStatusChange('in_progress')} disabled={ticket.status === 'in_progress'} className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50">Marcar como Em Progresso</button>
                        <button onClick={() => handleStatusChange('closed')} disabled={ticket.status === 'closed'} className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50">Marcar como Fechado</button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default TicketDetailsPage;