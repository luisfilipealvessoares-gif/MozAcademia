
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';

const ProfilePage: React.FC = () => {
    const { user, profile, loading: authLoading } = useAuth();
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setCompanyName(profile.company_name || '');
            setPhoneNumber(profile.phone_number || '');
        }
    }, [profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setMessage('');

        const { error } = await supabase
            .from('user_profiles')
            .update({
                full_name: fullName,
                company_name: companyName,
                phone_number: phoneNumber,
            })
            .eq('id', user.id);

        if (error) {
            setMessage('Erro ao atualizar o perfil: ' + error.message);
        } else {
            setMessage('Perfil atualizado com sucesso!');
        }
        setLoading(false);
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
            <div className="bg-white p-8 rounded-lg shadow-md">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="mt-1 w-full px-4 py-2 text-gray-500 bg-gray-200 border rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome Completo</label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="mt-1 w-full px-4 py-2 text-gray-700 bg-gray-50 border rounded-md focus:border-orange-400 focus:ring-orange-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                        />
                    </div>
                     <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome da Empresa (Opcional)</label>
                        <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="mt-1 w-full px-4 py-2 text-gray-700 bg-gray-50 border rounded-md focus:border-orange-400 focus:ring-orange-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                        />
                    </div>
                     <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefone (Opcional)</label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="mt-1 w-full px-4 py-2 text-gray-700 bg-gray-50 border rounded-md focus:border-orange-400 focus:ring-orange-300 focus:ring-opacity-40 focus:outline-none focus:ring"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600 disabled:bg-orange-300"
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
                {message && <p className={`mt-4 text-center text-sm ${message.includes('Erro') ? 'text-red-600' : 'text-orange-600'}`}>{message}</p>}
            </div>
        </div>
    );
};

export default ProfilePage;
