
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';
import { EyeIcon, EyeSlashIcon } from '../components/Icons';
import { useI18n } from '../contexts/I18nContext';

const UpdatePasswordPage: React.FC = () => {
    const { t } = useI18n();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
    const [isTokenValid, setIsTokenValid] = useState(false);
    const [checkingToken, setCheckingToken] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setIsTokenValid(true);
                setCheckingToken(false);
            }
        });

        const timer = setTimeout(() => {
            setCheckingToken(false);
        }, 2500);

        return () => {
            subscription.unsubscribe();
            clearTimeout(timer);
        };
    }, []);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 8) {
            setError(t('auth.passwordMinLengthError'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('auth.passwordsMismatchError'));
            return;
        }

        setLoading(true);
        const { error: updateError } = await supabase.auth.updateUser({ password });

        if (updateError) {
            setError(t('auth.updatePassword.error', { message: updateError.message }));
        } else {
            setSuccess(t('auth.updatePassword.success'));
            sessionStorage.setItem('password_updated', 'true');
            
            setTimeout(() => {
                // The global onAuthStateChange listener in AuthContext will handle the signOut
                navigate('/login');
            }, 3000);
        }
        setLoading(false);
    };

    const handleResend = async () => {
        // This is a simplified version. A real-world scenario might need a way to get the user's email again.
        // For now, we redirect to login where they can restart the process.
        navigate('/login');
    }

    if (checkingToken) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brand-moz"></div>
            </div>
        );
    }
    
    return (
        <div className="min-h-[60vh] flex items-center justify-center py-12">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border">
                {success ? (
                    <div className="text-center">
                        <svg className="w-16 h-16 text-brand-moz mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <h2 className="text-2xl font-bold text-brand-up">{t('success')}</h2>
                        <p className="mt-4 text-gray-700">{success}</p>
                    </div>
                ) : !isTokenValid ? (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-red-600">{t('auth.updatePassword.invalidTitle')}</h2>
                        <p className="mt-4 text-gray-700">{t('auth.updatePassword.invalidMessage')}</p>
                        <button onClick={handleResend} className="mt-6 w-full bg-brand-moz text-white font-semibold py-3 rounded-lg hover:bg-brand-up">
                            {t('auth.updatePassword.retryButton')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center">
                            <Logo className="h-16 w-auto" />
                            <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
                                {t('auth.updatePassword.title')}
                            </h2>
                        </div>
                        <form className="mt-8 space-y-6" onSubmit={handleUpdatePassword}>
                             <div>
                                <label htmlFor="password" className="sr-only">{t('profile.page.newPassword')}</label>
                                <div className="relative">
                                    <input id="password" name="password" type={isPasswordVisible ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm" placeholder={t('profile.page.newPassword')}/>
                                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
                                        {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                                    </button>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="confirm-password" className="sr-only">{t('profile.page.confirmNewPassword')}</label>
                                <div className="relative">
                                    <input id="confirm-password" name="confirm-password" type={isConfirmPasswordVisible ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm" placeholder={t('profile.page.confirmNewPassword')}/>
                                     <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}>
                                        {isConfirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                                    </button>
                                </div>
                            </div>
                            
                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                            <div>
                                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-moz hover:bg-brand-up focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-moz disabled:opacity-50">
                                    {loading ? t('profile.page.saving') : t('profile.page.saveChanges')}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default UpdatePasswordPage;