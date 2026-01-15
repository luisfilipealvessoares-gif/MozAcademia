import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import { EyeIcon, EyeSlashIcon } from '../components/Icons';
import { useI18n } from '../contexts/I18nContext';

const ProfilePage: React.FC = () => {
    const { user, profile, loading: authLoading, refreshProfile, signOut, controlUserUpdateSignOut } = useAuth();
    const { t } = useI18n();
    
    // State for profile info
    const [fullName, setFullName] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [sexo, setSexo] = useState<'masculino' | 'feminino' | ''>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // State for password change
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
    const [passwordUpdateSuccess, setPasswordUpdateSuccess] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setCompanyName(profile.company_name || '');
            setPhoneNumber(profile.phone_number || '');
            setSexo(profile.sexo || '');
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
                sexo: sexo,
            })
            .eq('id', user.id);

        if (error) {
            setMessage(t('profile.page.updateError', { message: error.message }));
        } else {
            setMessage(t('profile.page.updateSuccess'));
            await refreshProfile();
        }
        setLoading(false);
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordLoading || passwordUpdateSuccess) return;

        setPasswordMessage(null);

        if (newPassword.length < 8) {
            setPasswordMessage({ text: t('profile.page.passwordMinLength'), type: 'error' });
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setPasswordMessage({ text: t('auth.passwordsMismatchError'), type: 'error' });
            return;
        }
        
        setPasswordLoading(true);
        controlUserUpdateSignOut(false);
        
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        
        setPasswordLoading(false);

        if (error) {
            setPasswordMessage({ text: `Erro ao alterar senha: ${error.message}`, type: 'error' });
            controlUserUpdateSignOut(true);
        } else {
            setPasswordUpdateSuccess(true);
            setPasswordMessage({
                text: '✓ Senha alterada com sucesso! A sua sessão será terminada em 3 segundos por segurança.',
                type: 'success'
            });
            
            setTimeout(async () => {
                await signOut();
            }, 3000);
        }
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
                <h1 className="text-3xl font-bold mb-1">{t('profile.page.title')}</h1>
                <p className="text-gray-600">{t('profile.page.subtitle')}</p>
            </div>

            {/* Profile Info Card */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('profile.page.personalInfo')}</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('profile.page.email')}</label>
                        <input
                            id="email"
                            type="email"
                            value={user?.email || ''}
                            disabled
                            className="mt-1 w-full px-4 py-2 text-gray-500 bg-gray-200 border border-gray-300 rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">{t('profile.page.fullName')} <span className="text-red-500">*</span></label>
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
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">{t('profile.modal.companyName')} <span className="text-red-500">*</span></label>
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
                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">{t('profile.modal.phone')} <span className="text-red-500">*</span></label>
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
                        <label htmlFor="sexo" className="block text-sm font-medium text-gray-700">{t('profile.modal.gender')} <span className="text-red-500">*</span></label>
                        <select
                            id="sexo"
                            value={sexo}
                            onChange={(e) => setSexo(e.target.value as 'masculino' | 'feminino' | '')}
                            required
                            className="mt-1 w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
                        >
                            <option value="" disabled>{t('profile.modal.gender.select')}</option>
                            <option value="masculino">{t('profile.modal.gender.male')}</option>
                            <option value="feminino">{t('profile.modal.gender.female')}</option>
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 text-white bg-brand-moz rounded-md hover:bg-brand-up focus:outline-none focus:bg-brand-up disabled:bg-brand-moz disabled:opacity-50 font-semibold"
                        >
                            {loading ? t('profile.page.saving') : t('profile.page.saveChanges')}
                        </button>
                    </div>
                </form>
                {message && <p className={`mt-4 text-center text-sm ${message.includes('Erro') ? 'text-red-600' : 'text-brand-up'}`}>{message}</p>}
            </div>

            {/* Change Password Card */}
            <div className="bg-white p-8 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">{t('profile.page.changePassword')}</h2>
                <form onSubmit={handlePasswordUpdate} className="space-y-6">
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">{t('profile.page.newPassword')}</label>
                        <div className="relative mt-1">
                            <input
                                id="newPassword"
                                type={isPasswordVisible ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={passwordLoading || passwordUpdateSuccess}
                                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                aria-label={isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')}
                                disabled={passwordLoading || passwordUpdateSuccess}
                            >
                                {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                            </button>
                        </div>
                    </div>
                     <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700">{t('profile.page.confirmNewPassword')}</label>
                        <div className="relative mt-1">
                            <input
                                id="confirmNewPassword"
                                type={isConfirmPasswordVisible ? "text" : "password"}
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                                disabled={passwordLoading || passwordUpdateSuccess}
                                className="w-full px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                                aria-label={isConfirmPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')}
                                disabled={passwordLoading || passwordUpdateSuccess}
                            >
                                {isConfirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                            </button>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={passwordLoading || passwordUpdateSuccess}
                            className="w-full px-4 py-2 text-white bg-brand-moz rounded-md hover:bg-brand-up focus:outline-none focus:bg-brand-up disabled:bg-brand-moz disabled:opacity-50 font-semibold transition-colors"
                        >
                            {passwordLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('profile.page.changingPassword')}
                                </span>
                            ) : t('profile.page.changePasswordButton')}
                        </button>
                    </div>
                </form>
                {passwordMessage && (
                    <div className={`mt-4 p-4 rounded-lg text-center ${
                        passwordMessage.type === 'success'
                            ? 'bg-brand-light border border-brand-moz'
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        <p className={`font-semibold ${
                            passwordMessage.type === 'success'
                                ? 'text-brand-up'
                                : 'text-red-700'
                        }`}>
                            {passwordMessage.text}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;