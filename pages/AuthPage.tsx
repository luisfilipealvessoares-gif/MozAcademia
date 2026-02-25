

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';
import { EyeIcon, EyeSlashIcon } from '../components/Icons';
import TermsModal from '../components/TermsModal';

// Adicionado para a renderização programática do hCaptcha
declare global {
    interface Window {
        hcaptcha: any;
    }
}

const AuthPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'register' ? 'register' : 'login';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // States for resend functionality
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { user, isAdmin, loading: authLoading } = useAuth();
  const { t } = useI18n();

  // Refs for registration hCaptcha
  const captchaContainer = useRef<HTMLDivElement | null>(null);
  const captchaIdRef = useRef<string | null>(null);

  // useEffect for registration hCaptcha
  useEffect(() => {
    if (view !== 'register') {
      if (captchaIdRef.current && window.hcaptcha) {
        try { window.hcaptcha.remove(captchaIdRef.current); } catch (e) { console.warn("Register captcha cleanup failed:", e); }
        captchaIdRef.current = null;
      }
      return;
    }

    setHcaptchaToken(null);
    let intervalId: number;

    const tryRender = () => {
      if (captchaContainer.current && window.hcaptcha && !captchaIdRef.current) {
        clearInterval(intervalId);
        // Ensure container is empty before rendering
        if (captchaContainer.current.innerHTML !== "") {
            captchaContainer.current.innerHTML = "";
        }
        try {
            const widgetId = window.hcaptcha.render(captchaContainer.current, {
            sitekey: '548ec312-7f46-453c-811c-05b036e6a6fa',
            callback: setHcaptchaToken,
            'expired-callback': () => setHcaptchaToken(null),
            'error-callback': () => setHcaptchaToken(null),
            });
            captchaIdRef.current = widgetId;
        } catch (e) {
            console.warn("hCaptcha render error:", e);
        }
      }
    };

    intervalId = window.setInterval(tryRender, 100);

    return () => {
      clearInterval(intervalId);
      if (captchaIdRef.current && window.hcaptcha) {
        try { window.hcaptcha.remove(captchaIdRef.current); } catch (e) { console.warn("Register captcha cleanup failed on unmount:", e); }
        captchaIdRef.current = null;
      }
    };
  }, [view]);
  
  useEffect(() => {
    // Check for password update success message from sessionStorage
    if (sessionStorage.getItem('password_updated')) {
        setNotification(t('auth.passwordResetSuccess'));
        sessionStorage.removeItem('password_updated');
    }
  }, [t]);
  
  // useEffect for immediate password validation feedback
  useEffect(() => {
    // Only run validation for the register view
    if (view === 'register') {
      if (password && password.length < 8) {
        setError(t('auth.passwordMinLengthError'));
      } else if (confirmPassword && password !== confirmPassword) {
        setError(t('auth.passwordsMismatchError'));
      } else {
        // This clears the error state ONLY if it's one of our validation messages.
        // This prevents clearing an unrelated API error message when the user types.
        if (error === t('auth.passwordMinLengthError') || error === t('auth.passwordsMismatchError')) {
          setError(null);
        }
      }
    } else {
      // If we switch to login view, clear any lingering validation errors
      if (error === t('auth.passwordMinLengthError') || error === t('auth.passwordsMismatchError')) {
        setError(null);
      }
    }
  }, [password, confirmPassword, view, error, t]);


  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final validation before submitting
    if (view === 'register') {
        if (password.length < 8) {
            setError(t('auth.passwordMinLengthError'));
            return;
        }
        if (password !== confirmPassword) {
            setError(t('auth.passwordsMismatchError'));
            return;
        }
        if (!termsAccepted) {
            setError(t('auth.acceptTermsError'));
            return;
        }
        if (!hcaptchaToken) {
            setError(t('auth.captchaError'));
            return;
        }
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setResendMessage('');
    setNotification(null);

    try {
      if (view === 'login') {
        localStorage.removeItem('awaiting_confirmation');
        
        // Define a preferência de "Lembrar-me" antes de fazer o login.
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('rememberMe');
        }

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;

        if (signInData.user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('is_admin')
                .eq('id', signInData.user.id)
                .single();
            
            if (profile?.is_admin) {
                await supabase.auth.signOut();
                throw new Error(t('auth.adminCredentialsError'));
            }
        }
      } else if (view === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken: hcaptchaToken,
            emailRedirectTo: `${window.location.origin}/welcome`,
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        
        if (data.user) {
            // Definitive check: If email_confirmed_at exists, the user is already registered and confirmed.
            if (data.user.email_confirmed_at) {
                setError(t('auth.emailExistsError'));
                setLoading(false);
                return;
            }

            // Differentiate between a brand new user and an existing, unconfirmed user.
            // A user created more than 60 seconds ago is considered existing.
            const createdAt = new Date(data.user.created_at).getTime();
            const now = Date.now();
            const isExistingUser = (now - createdAt) > 60000; // 60 seconds threshold

            localStorage.setItem('awaiting_confirmation', 'true');
            setRegisteredEmail(email);
            
            if (isExistingUser) {
                setSuccessMessage(t('auth.emailConfirmation.messageExisting', { email }));
            } else {
                setSuccessMessage(t('auth.emailConfirmation.messageNew', { email }));
            }

            setEmail('');
            setPassword('');
            setFullName('');
            setConfirmPassword('');
            setTermsAccepted(false);
            setHcaptchaToken(null);
        } else if (!error) {
            setError(t('auth.unexpectedError'));
        }
      }
    } catch (error: any) {
      setError(error.error_description || error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendEmail = async () => {
    if (!registeredEmail) return;
    setResendLoading(true);
    setResendMessage('');
    
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: registeredEmail,
    });

    if (error) {
      setResendMessage(t('auth.emailConfirmation.resendError', { message: error.message }));
    } else {
      setResendMessage(t('auth.emailConfirmation.resendSuccess'));
    }
    setResendLoading(false);
  };
  
  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage({ text: '', type: '' });

    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `https://moz-academia.vercel.app/update-password`,
    });
    
    setResetLoading(false);
    if (error) {
        setResetMessage({ text: t('auth.resetPassword.error', { message: error.message }), type: 'error' });
    } else {
        setResetMessage({ text: t('auth.resetPassword.success'), type: 'success' });
    }
  }


  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-brand-moz"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />;
  }


  return (
    <>
    <TermsModal 
      isOpen={isTermsModalOpen} 
      onClose={() => setIsTermsModalOpen(false)}
      onAccept={() => {
          setTermsAccepted(true);
          setIsTermsModalOpen(false);
      }}
    />
    {isResetModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
             <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
                 <h2 className="text-2xl font-bold text-brand-up mb-4">{t('auth.resetPassword.title')}</h2>
                 <p className="text-gray-600 mb-6">{t('auth.resetPassword.instructions')}</p>
                 <form onSubmit={handlePasswordResetRequest} className="space-y-4">
                     <div>
                        <label htmlFor="reset-email" className="sr-only">{t('auth.emailPlaceholder')}</label>
                        <input id="reset-email" type="email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} required placeholder={t('auth.emailPlaceholder')} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-moz" />
                     </div>
                     <button type="submit" disabled={resetLoading} className="w-full bg-brand-moz text-white font-semibold py-3 rounded-lg hover:bg-brand-up disabled:opacity-50">
                         {resetLoading ? t('loading') : t('auth.resetPassword.button')}
                     </button>
                 </form>
                 {resetMessage.text && <p className={`mt-4 text-sm text-center font-semibold ${resetMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{resetMessage.text}</p>}
                 <div className="mt-6 text-center">
                    <button onClick={() => { setIsResetModalOpen(false); setResetMessage({ text: '', type: '' }); }} className="text-sm text-gray-600 hover:underline">{t('back')}</button>
                 </div>
             </div>
        </div>
    )}
    <div className="min-h-[80vh] flex items-center justify-center py-12 bg-gradient-to-br from-brand-light to-gray-50">
      <div className="w-full max-w-sm p-6 space-y-6 bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200">
        {successMessage ? (
           <div className="text-center">
             <div className="flex justify-center mb-4">
                <svg className="w-16 h-16 text-brand-moz" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 002-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
             </div>
             <h2 className="text-2xl font-bold text-brand-up">{t('auth.emailConfirmation.title')}</h2>
             <p className="mt-4 text-gray-700">{successMessage}</p>
             <div className="mt-6 space-y-4">
                <button
                    onClick={handleResendEmail}
                    disabled={resendLoading}
                    className="w-full px-4 py-3 text-brand-moz border border-brand-moz rounded-lg font-semibold hover:bg-brand-light disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                    {resendLoading ? t('auth.emailConfirmation.resending') : t('auth.emailConfirmation.resendButton')}
                </button>
                {resendMessage && <p className={`text-sm ${resendMessage.includes('Erro') || resendMessage.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{resendMessage}</p>}
                <button
                    onClick={() => {
                        setSuccessMessage(null);
                        setRegisteredEmail('');
                        setSearchParams({});
                    }}
                    className="w-full px-4 py-3 text-white bg-brand-moz rounded-lg font-semibold hover:bg-brand-up shadow-sm hover:shadow-lg transition-all"
                >
                    {t('auth.emailConfirmation.backToLoginButton')}
                </button>
             </div>
           </div>
        ) : (
        <>
            <div className="flex flex-col items-center">
                <Logo className="h-14 w-auto" />
                <h2 className="mt-5 text-2xl font-extrabold text-center text-gray-900">
                  {view === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}
                </h2>
            </div>

            {notification && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-800 p-4 rounded-md shadow-sm" role="alert">
                  <p className="font-bold">{t('success')}</p>
                  <p>{notification}</p>
              </div>
            )}
            
            <form className="mt-6 space-y-4" onSubmit={handleAuth}>
                <div className="space-y-3">
                    {view === 'register' && (
                    <div>
                        <label htmlFor="full-name" className="sr-only">{t('auth.fullNamePlaceholder')}</label>
                        <input id="full-name" name="full-name" type="text" autoComplete="name" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm transition-shadow" placeholder={t('auth.fullNamePlaceholder')} />
                    </div>
                    )}
                    <div>
                    <label htmlFor="email-address" className="sr-only">{t('auth.emailPlaceholder')}</label>
                    <input id="email-address" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm transition-shadow" placeholder={t('auth.emailPlaceholder')} />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">{t('auth.passwordPlaceholder')}</label>
                        <div className="relative">
                            <input id="password" name="password" type={isPasswordVisible ? "text" : "password"} autoComplete={view === 'login' ? "current-password" : "new-password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm transition-shadow" placeholder={t('auth.passwordPlaceholder')} />
                            <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" onClick={() => setIsPasswordVisible(!isPasswordVisible)} aria-label={isPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')}>
                                {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                            </button>
                        </div>
                    </div>
                    {view === 'register' && (
                        <div>
                            <label htmlFor="confirm-password" className="sr-only">{t('auth.confirmPasswordPlaceholder')}</label>
                            <div className="relative">
                                <input
                                    id="confirm-password"
                                    name="confirm-password"
                                    type={isConfirmPasswordVisible ? "text" : "password"}
                                    autoComplete="new-password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="appearance-none relative block w-full px-3 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-moz focus:border-transparent sm:text-sm transition-shadow"
                                    placeholder={t('auth.confirmPasswordPlaceholder')}
                                />
                                <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5" onClick={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} aria-label={isConfirmPasswordVisible ? t('auth.hidePassword') : t('auth.showPassword')}>
                                    {isConfirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {view === 'login' && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-brand-moz focus:ring-brand-up border-gray-300 rounded" />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                {t('auth.rememberMe')}
                            </label>
                        </div>
                        <div className="text-sm">
                            <button type="button" onClick={() => setIsResetModalOpen(true)} className="font-medium text-brand-up hover:text-brand-moz">
                                {t('auth.forgotPassword')}
                            </button>
                        </div>
                    </div>
                )}

                {view === 'register' && (
                    <>
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="focus:ring-brand-up h-4 w-4 text-brand-moz border-gray-300 rounded"
                                />
                            </div>
                            <div className="ml-3 text-xs">
                                <label htmlFor="terms" className="font-medium text-gray-700">
                                    {t('auth.terms.agree')}{' '}
                                    <button type="button" onClick={() => setIsTermsModalOpen(true)} className="text-brand-up hover:underline font-semibold">
                                        {t('auth.terms.link')}
                                    </button>
                                </label>
                            </div>
                        </div>
                         <div className="flex justify-center">
                            <div ref={captchaContainer}></div>
                        </div>
                    </>
                )}

                {error && <p className="text-red-500 text-xs text-center pt-1">{error}</p>}

                <div>
                    <button type="submit" disabled={loading || (view === 'register' && (!termsAccepted || !hcaptchaToken))} className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-brand-moz hover:bg-brand-up focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-moz disabled:bg-brand-moz disabled:opacity-50 transition-all duration-300 shadow-md hover:shadow-lg">
                    {loading ? t('loading') : (view === 'login' ? t('auth.loginButton') : t('auth.registerButton'))}
                    </button>
                </div>
            </form>

            <div className="text-xs text-center">
                <button
                    type="button"
                    onClick={() => {
                        const nextView = view === 'login' ? 'register' : 'login';
                        setSearchParams({ view: nextView });
                        setError(null);
                        setSuccessMessage(null);
                        setTermsAccepted(false);
                        setHcaptchaToken(null);
                    }}
                    className="font-medium text-brand-up hover:text-brand-moz"
                >
                    {view === 'login' ? t('auth.toggleToRegister') : t('auth.toggleToLogin')}
                </button>
            </div>
        </>
        )}
      </div>
    </div>
    </>
  );
};

export default AuthPage;