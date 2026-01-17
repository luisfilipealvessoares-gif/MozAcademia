
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
import Logo from './Logo';
import { useI18n } from '../contexts/I18nContext';

const countries = ["Afeganistão", "África do Sul", "Albânia", "Alemanha", "Andorra", "Angola", "Antiga e Barbuda", "Arábia Saudita", "Argélia", "Argentina", "Arménia", "Austrália", "Áustria", "Azerbaijão", "Bahamas", "Bangladexe", "Barbados", "Barém", "Bélgica", "Belize", "Benim", "Bielorrússia", "Bolívia", "Bósnia e Herzegovina", "Botsuana", "Brasil", "Brunei", "Bulgária", "Burquina Faso", "Burúndi", "Butão", "Cabo Verde", "Camarões", "Camboja", "Canadá", "Catar", "Cazaquistão", "Chade", "Chile", "China", "Chipre", "Colômbia", "Comores", "Congo-Brazzaville", "Congo-Kinshasa", "Coreia do Norte", "Coreia do Sul", "Cosovo", "Costa do Marfim", "Costa Rica", "Croácia", "Cuaite", "Cuba", "Dinamarca", "Jibuti", "Dominica", "Egito", "Emirados Árabes Unidos", "Equador", "Eritreia", "Eslováquia", "Eslovénia", "Espanha", "Estado da Palestina", "Estados Unidos", "Estónia", "Etiópia", "Fiji", "Filipinas", "Finlândia", "França", "Gabão", "Gâmbia", "Gana", "Geórgia", "Granada", "Grécia", "Guatemala", "Guiana", "Guiné", "Guiné Equatorial", "Guiné-Bissau", "Haiti", "Honduras", "Hungria", "Iémen", "Ilhas Marechal", "Ilhas Salomão", "Índia", "Indonésia", "Irão", "Iraque", "Irlanda", "Islândia", "Israel", "Itália", "Jamaica", "Japão", "Jordânia", "Kiribati", "Laus", "Lesoto", "Letónia", "Líbano", "Libéria", "Líbia", "Listenstaine", "Lituânia", "Luxemburgo", "Macedónia do Norte", "Madagáscar", "Malásia", "Maláui", "Maldivas", "Mali", "Malta", "Marrocos", "Maurícia", "Mauritânia", "México", "Mianmar", "Micronésia", "Moçambique", "Moldávia", "Mónaco", "Mongólia", "Montenegro", "Namíbia", "Nauru", "Nepal", "Nicarágua", "Níger", "Nigéria", "Noruega", "Nova Zelândia", "Omã", "Países Baixos", "Palau", "Panamá", "Papua Nova Guiné", "Paquistão", "Paraguai", "Peru", "Polónia", "Portugal", "Quénia", "Quirguistão", "Reino Unido", "República Centro-Africana", "República Checa", "República Dominicana", "Roménia", "Ruanda", "Rússia", "Salvador", "Samoa", "Santa Lúcia", "São Cristóvão e Neves", "São Marinho", "São Tomé e Príncipe", "São Vicente e Granadinas", "Senegal", "Serra Leoa", "Sérvia", "Seicheles", "Singapura", "Síria", "Somália", "Sri Lanca", "Essuatíni", "Sudão", "Sudão do Sul", "Suécia", "Suíça", "Suriname", "Tailândia", "Taiuã", "Tajiquistão", "Tanzânia", "Timor-Leste", "Togo", "Tonga", "Trindade e Tobago", "Tunísia", "Turcomenistão", "Turquia", "Tuvalu", "Ucrânia", "Uganda", "Uruguai", "Usbequistão", "Vanuatu", "Vaticano", "Venezuela", "Vietname", "Zâmbia", "Zimbábue"];


// This component no longer needs an `onSuccess` prop, as it now directly
// triggers a state update in the parent context, causing it to be unmounted.
const CompleteProfileModal: React.FC = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { t } = useI18n();
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sexo, setSexo] = useState<'masculino' | 'feminino' | ''>('');
  const [endereco, setEndereco] = useState('');
  const [provincia, setProvincia] = useState('');
  const [pais, setPais] = useState('');
  const [atividadeComercial, setAtividadeComercial] = useState('');
  const [idade, setIdade] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || '');
      setPhoneNumber(profile.phone_number || '');
      setSexo(profile.sexo || '');
      setEndereco(profile.endereco || '');
      setProvincia(profile.provincia || '');
      setPais(profile.pais || '');
      setAtividadeComercial(profile.atividade_comercial || '');
      setIdade(profile.idade || '');
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !companyName || !phoneNumber || !sexo || !endereco || !provincia || !pais || !atividadeComercial || !idade) {
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
        endereco,
        provincia,
        pais,
        atividade_comercial: atividadeComercial,
        idade: Number(idade),
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
      <div className="bg-white rounded-lg p-8 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-center mb-4">
            <Logo className="h-12 w-auto" />
        </div>
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">{t('profile.modal.title')}</h2>
        <p className="text-center text-gray-600 mb-6">{t('profile.modal.subtitle')}</p>
        <form onSubmit={handleUpdateProfile} className="space-y-4 overflow-y-auto pr-2">
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
          <div>
              <label htmlFor="enderecoModal" className="block text-sm font-medium text-gray-700">{t('profile.page.address')} <span className="text-red-500">*</span></label>
              <input id="enderecoModal" type="text" value={endereco} onChange={(e) => setEndereco(e.target.value)} required className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz"/>
          </div>
          <div>
              <label htmlFor="provinciaModal" className="block text-sm font-medium text-gray-700">{t('profile.page.province')} <span className="text-red-500">*</span></label>
              <input id="provinciaModal" type="text" value={provincia} onChange={(e) => setProvincia(e.target.value)} required className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz"/>
          </div>
          <div>
              <label htmlFor="paisModal" className="block text-sm font-medium text-gray-700">{t('profile.page.country')} <span className="text-red-500">*</span></label>
              <select id="paisModal" value={pais} onChange={(e) => setPais(e.target.value)} required className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz">
                  <option value="" disabled>{t('profile.page.country.select')}</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>
          <div>
              <label htmlFor="atividadeComercialModal" className="block text-sm font-medium text-gray-700">{t('profile.page.businessActivity')} <span className="text-red-500">*</span></label>
              <input id="atividadeComercialModal" type="text" value={atividadeComercial} onChange={(e) => setAtividadeComercial(e.target.value)} required className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz"/>
          </div>
          <div>
              <label htmlFor="idadeModal" className="block text-sm font-medium text-gray-700">{t('profile.page.age')} <span className="text-red-500">*</span></label>
              <input id="idadeModal" type="number" value={idade} onChange={(e) => setIdade(e.target.value === '' ? '' : parseInt(e.target.value, 10))} required className="mt-1 w-full px-3 py-2 text-gray-700 bg-white border rounded-md focus:border-brand-moz focus:ring-brand-moz"/>
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