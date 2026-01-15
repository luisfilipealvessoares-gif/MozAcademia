

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchTicketAndReplies = useCallback(async () => {
        if (!userId || !ticketId) return;
        
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const ticketQuery = supabase
                .from('support_tickets')
                .select('*, user_profiles(full_name, id)')
                .eq('id', ticketId)
                .abortSignal(signal);
                
            if (!isAdmin) {
                ticketQuery.eq('user_id', userId);
            }
            const { data: ticketData, error: ticketError } = await ticketQuery.single();

            if (signal.aborted) return;
            if (ticketError || !ticketData) {
                console.error("Error fetching ticket or access denied:", ticketError);
                setTicket(null);
                return;
            }
            setTicket(ticketData as any);

            const { data: repliesData, error: repliesError } = await supabase
                .from('ticket_replies')
                .select('*, user_profiles(full_name, is_admin)')
                .eq('ticket_id', ticketId)
                .order('created_at', { ascending: true })
                .abortSignal(signal);

            if (signal.aborted) return;
            if (repliesData) {
                setReplies(repliesData as any);
            } else if (repliesError) {
                console.error("Error fetching replies:", repliesError);
            }
        } catch(error: any) {
            if (error.name !== 'AbortError') {
                console.error("Failed to fetch ticket details:", error);
            }
        } finally {
            if (!signal.aborted) {
                setLoading(false);
            }
        }
    }, [ticketId, userId, isAdmin]);

    useEffect(() => {
        setLoading(true);
        fetchTicketAndReplies();

        const channel = supabase.channel(`ticket-details-${ticketId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'ticket_replies',
                filter: `ticket_id=eq.${ticketId}`
            }, () => {
                fetchTicketAndReplies();
            })
            .subscribe();

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            supabase.removeChannel(channel);
        };
    }, [fetchTicketAndReplies, ticketId]);

    const handlePostReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !ticketId || !newMessage.trim()) return;

        setSubmitting(true);
        const { error } = await supabase
            .from('ticket_replies')
            .insert({ ticket_id: ticketId, user_id: user.id, message: newMessage });
        
        if (!error) {
            setNewMessage('');
            // UI will update via the realtime subscription
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
    
    const getStatusText = (status: 'open' | 'in_progress' | 'closed') => {
      switch (status) {
        case 'open': return 'Aberto';
        case 'in_progress': return 'Em Progresso';
        case 'closed': return 'Fechado';
        default: return status;
      }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div>
        </div>
    );

    if (!ticket) return (
        <div className="text-center p-8 bg-white rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold text-red-600">Ticket não encontrado ou acesso negado.</h2>
            <Link to={isAdmin ? "/admin/support" : "/support"} className="mt-4 inline-block text-brand-moz hover:underline">Voltar para Tickets</Link>
        </div>
    );

    const backLink = isAdmin ? "/admin/support" : "/support";

    return (
        <div className="space-y-6">
            <Link to={backLink} className="font-semibold text-brand-up hover:text-brand-moz">&larr; Voltar para Tickets</Link>
            
            <div className="bg-white p-6 rounded-xl shadow-md border">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-grow">
                        <h1 className="text-2xl font-bold text-gray-800">{ticket.subject}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Aberto por <span className="font-medium text-gray-700">{ticket.user_profiles?.full_name}</span> em {new Date(ticket.created_at).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(ticket.status)}`}>
                            {getStatusText(ticket.status)}
                        </span>
                        {isAdmin && (
                            <select 
                                value={ticket.status} 
                                onChange={(e) => handleStatusChange(e.target.value as any)}
                                className="text-xs font-semibold rounded-md border-gray-300 focus:ring-brand-moz focus:border-brand-moz"
                            >
                                <option value="open">Aberto</option>
                                <option value="in_progress">Em Progresso</option>
                                <option value="closed">Fechado</option>
                            </select>
                        )}
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t">
                    <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>
            </div>

            <div className="space-y-4">
                {replies.map(reply => (
                    <div key={reply.id} className={`flex ${reply.user_profiles?.is_admin ? 'justify-start' : 'justify-end'}`}>
                        <div className={`p-4 rounded-xl max-w-lg ${reply.user_profiles?.is_admin ? 'bg-gray-100' : 'bg-brand-light'}`}>
                            <p className="font-bold text-sm mb-1 text-gray-800">{reply.user_profiles?.full_name}</p>
                            <p className="text-gray-800 whitespace-pre-wrap">{reply.message}</p>
                            <p className="text-xs text-gray-500 text-right mt-2">{new Date(reply.created_at).toLocaleString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {ticket.status !== 'closed' && (
                <div className="bg-white p-6 rounded-lg shadow-md border mt-6">
                    <h3 className="text-lg font-bold mb-4">Adicionar Resposta</h3>
                    <form onSubmit={handlePostReply}>
                        <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            rows={5}
                            className="w-full p-2 border rounded-md focus:ring-brand-moz focus:border-brand-moz"
                            placeholder="Escreva sua resposta..."
                            required
                            disabled={submitting}
                        />
                        <div className="text-right mt-4">
                            <button type="submit" disabled={submitting || !newMessage.trim()} className="px-6 py-2 bg-brand-moz text-white font-semibold rounded-lg hover:bg-brand-up disabled:opacity-50">
                                {submitting ? 'Enviando...' : 'Enviar Resposta'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default TicketDetailsPage;
