
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Logo from './Logo';
import { useI18n } from '../contexts/I18nContext';

// This component no longer needs an `onSuccess` prop, as it now directly
// triggers a state update in the parent context, causing it to be unmounted.
const CompleteProfileModal: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useI18n();
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || '');
      setPhoneNumber(profile.phone_number || '');
      setSexo(profile.sexo || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !companyName || !phoneNumber || !sexo) {
        setError(t('profile.modal.error.allFields'));
        return;
    };

    setLoading(true);
    setError('');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        company_name: companyName,
        phone_number: phoneNumber,
        sexo: sexo,
      })
      .eq('id', user.id);

    if (error) {
      setError(t('profile.modal.error.update', { message: error.message }));
      setLoading(false);
    } else {
      // Re-fetch the profile in the AuthContext. This will cause the UserDashboard
      // to re-render without this modal, fixing the loop.
      await refreshProfile();
      // No reload or callback is needed; the component will unmount automatically.
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-center mb-4">
            <Logo className="h-12 w-auto" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('profile.modal.title')}</h2>
        <p className="text-center text-gray-600 mb-6">{t('profile.modal.subtitle')}</p>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="companyNameModal" className="block text-sm font-medium text-gray-700">{t('profile.modal.companyName')} <span className="text-red-500">*</span></label>
            <input
              id="companyNameModal"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label htmlFor="phoneNumberModal" className="block text-sm font-medium text-gray-700">{t('profile.modal.phone')} <span className="text-red-500">*</span></label>
            <input
              id="phoneNumberModal"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
            />
          </div>
          <div>
            <label htmlFor="sexoModal" className="block text-sm font-medium text-gray-700">{t('profile.modal.gender')} <span className="text-red-500">*</span></label>
            <select
              id="sexoModal"
              value={sexo}
              onChange={(e) => setSexo(e.target.value as 'masculino' | 'feminino' | '')}
              required
              className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
            >
              <option value="" disabled>{t('profile.modal.gender.select')}</option>
              <option value="masculino">{t('profile.modal.gender.male')}</option>
              <option value="feminino">{t('profile.modal.gender.female')}</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-white bg-brand-moz rounded-md hover:bg-brand-up focus:outline-none focus:bg-brand-up disabled:bg-brand-moz/50 font-semibold"
            >
              {loading ? t('profile.modal.saving') : t('profile.modal.button')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
