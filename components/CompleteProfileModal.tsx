
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Logo from './Logo';

// This component no longer needs an `onSuccess` prop, as it now directly
// triggers a state update in the parent context, causing it to be unmounted.
const CompleteProfileModal: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || '');
      setPhoneNumber(profile.phone_number || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !companyName || !phoneNumber) {
        setError("Por favor, preencha todos os campos obrigatórios.");
        return;
    };

    setLoading(true);
    setError('');

    const { error } = await supabase
      .from('user_profiles')
      .update({
        company_name: companyName,
        phone_number: phoneNumber,
      })
      .eq('id', user.id);

    if (error) {
      setError('Erro ao atualizar o perfil: ' + error.message);
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
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Complete seu Perfil</h2>
        <p className="text-center text-gray-600 mb-6">Para continuar, precisamos que você preencha as informações abaixo.</p>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="companyNameModal" className="block text-sm font-medium text-gray-700">Nome da Empresa <span className="text-red-500">*</span></label>
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
            <label htmlFor="phoneNumberModal" className="block text-sm font-medium text-gray-700">Telefone <span className="text-red-500">*</span></label>
            <input
              id="phoneNumberModal"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz focus:ring-opacity-40 focus:outline-none focus:ring"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-white bg-brand-moz rounded-md hover:bg-brand-up focus:outline-none focus:bg-brand-up disabled:bg-brand-moz/50 font-semibold"
            >
              {loading ? 'Salvando...' : 'Salvar e Continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfileModal;
