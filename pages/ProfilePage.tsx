
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { EyeIcon, EyeSlashIcon } from '../components/Icons';

const ProfilePage: React.FC = () => {
    const { user, profile, loading: authLoading, refreshProfile } = useAuth();
    
    // State for profile info
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // State for password change
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

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
            await refreshProfile();
        }
        setLoading(false);
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword.length < 6) {
            setPasswordMessage('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordMessage('As senhas não coincidem.');
            return;
        }

        setPasswordLoading(true);
        setPasswordMessage('');

        const { error } = await supabase.auth.updateUser({ password: newPassword });

        if (error) {
            setPasswordMessage('Erro ao alterar a senha: ' + error.message);
        } else {
            setPasswordMessage('Senha alterada com sucesso!');
            setNewPassword('');
            setConfirmPassword('');
        }
        setPasswordLoading(false);
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div>
            </div>
        );
    }
    
    return (
        <div className="max-w-2xl mx-auto space-y-10">
            <div>
                <h1 className="text-3xl font-bold mb-1">Meu Perfil</h1>
                <p className="text-gray-600">Atualize suas informações pessoais e de segurança.</p>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Informações Pessoais</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="mt-1 w-full px-4 py-2 text-gray-500 bg-gray-200 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nome Completo <span className="text-red-500">*</span></label>
                        <input
                            id="fullName"
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="mt-1 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
                        />
                    </div>
                     <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Nome da Empresa <span className="text-red-500">*</span></label>
                        <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            required
                            className="mt-1 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
                        />
                    </div>
                     <div>
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Telefone <span className="text-red-500">*</span></label>
                        <input
                            id="phoneNumber"
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            required
                            className="mt-1 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 text-white bg-brand-moz rounded-md hover:bg-brand-up focus:outline-none focus:bg-brand-up disabled:bg-brand-moz disabled:opacity-50 font-semibold"
                        >
                            {loading ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
                {message && <p className={`mt-4 text-center text-sm ${message.includes('Erro') ? 'text-red-600' : 'text-brand-up'}`}>{message}</p>}
            </div>

            {/* Change Password Card */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Alterar Senha</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Nova Senha</label>
                        <div className="relative mt-1">
                            <input
                                id="newPassword"
                                type={isPasswordVisible ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">A senha deve ter no mínimo 6 caracteres.</p>
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Nova Senha</label>
                         <div className="relative mt-1">
                            <input
                                id="confirmPassword"
                                type={isConfirmPasswordVisible ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
                            />
                             <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                aria-label={isConfirmPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
                            >
                                {isConfirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={passwordLoading}
                            className="w-full px-4 py-2 text-white bg-brand-moz rounded-md hover:bg-brand-up focus:outline-none focus:bg-brand-up disabled:bg-brand-moz disabled:opacity-50 font-semibold"
                        >
                            {passwordLoading ? 'Alterando...' : 'Alterar Senha'}
                        </button>
                    </div>
                </form>
                {passwordMessage && <p className={`mt-4 text-center text-sm ${passwordMessage.includes('Erro') || passwordMessage.includes('não') ? 'text-red-600' : 'text-brand-up'}`}>{passwordMessage}</p>}
            </div>
        </div>
    );
};

export default ProfilePage;
