

import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../contexts/I18nContext';

const MapPinIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
const PhoneIcon = (props: React.SVGProps<SVGSVGElement>) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;


const Footer: React.FC = () => {
  const { t } = useI18n();
  return (
    <footer className="bg-brand-up text-white mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <div>
            <h3 className="font-semibold text-white mb-4">{t('footer.navigation')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/#cursos" className="text-gray-200 hover:text-white hover:underline">{t('header.courses')}</Link></li>
              <li><Link to="/about" className="text-gray-200 hover:text-white hover:underline">{t('header.about')}</Link></li>
               <li><Link to="/support" className="text-gray-200 hover:text-white hover:underline">{t('footer.support')}</Link></li>
               <li><a href="https://www.mozup.org" target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:text-white hover:underline">{t('footer.mozupWebsite')}</a></li>
            </ul>
             <h3 className="font-semibold text-white mb-4 mt-6">{t('footer.account')}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/login" className="text-gray-200 hover:text-white hover:underline">{t('footer.studentLogin')}</Link></li>
              <li><Link to="/admin/login" className="text-gray-200 hover:text-white hover:underline">{t('footer.adminLogin')}</Link></li>
            </ul>
          </div>

           <div>
             <h3 className="font-semibold text-white mb-4">{t('footer.maputo')}</h3>
            <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-3 text-gray-200">
                  <MapPinIcon className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>Rua dos Desportistas nº 691, Prédio JAT VI – 1, Piso 1, Maputo – Moçambique</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-200">
                  <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                  <span>+258 84 777 3751 / +258 84 500 4700</span>
                </div>
            </div>
          </div>

           <div>
             <h3 className="font-semibold text-white mb-4">{t('footer.pemba')}</h3>
            <div className="space-y-3 text-sm">
                 <div className="flex items-start space-x-3 text-gray-200">
                  <MapPinIcon className="w-4 h-4 mt-1 flex-shrink-0" />
                  <span>Av. Alberto Chipande, Business Park, Porta 01, Pemba – Moçambique</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-200">
                  <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                  <span>+258 85 859 3163</span>
                </div>
            </div>
          </div>

        </div>
        <div className="mt-12 border-t border-white/20 pt-8 text-center text-gray-200 space-y-4">
          <p className="text-2xl font-bold tracking-tight text-white">{t('footer.slogan')}</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} MozupAcademy. {t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;