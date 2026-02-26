
import React from 'react';
import { useI18n } from '../contexts/I18nContext';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  const { t } = useI18n();
  
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center pb-4 border-b">
            <h2 className="text-2xl font-bold text-brand-up">{t('terms.title')}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
        </div>
        
        <div className="my-6 space-y-4 overflow-y-auto pr-4 text-sm text-gray-700">
            <p className="font-semibold">{t('terms.p1')}</p>
            <p>{t('terms.p2')}</p>

            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h1')}</h3>
            <p>{t('terms.p1_1')}</p>
            
            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h2')}</h3>
            <p>{t('terms.p2_1')}</p>

            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h3')}</h3>
            <p>{t('terms.p3_1')}</p>

            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h4')}</h3>
            <p>{t('terms.p4_1')}</p>

            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h5')}</h3>
            <p>{t('terms.p5_1')}</p>

            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h6')}</h3>
            <p>{t('terms.p6_1')}</p>
            
            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h7')}</h3>
            <p>{t('terms.p7_1')}</p>
            
            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h8')}</h3>
            <p>{t('terms.p8_1')}</p>
            
            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h9')}</h3>
            <p>{t('terms.p9_1')}</p>
            
            <h3 className="font-bold text-gray-800 pt-2">{t('terms.h10')}</h3>
            <p>{t('terms.p10_1')}</p>

            <p className="font-bold pt-4 text-gray-800">{t('terms.final')}</p>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t mt-auto">
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold transition-all">
            {t('close')}
          </button>
          <button onClick={onAccept} className="px-6 py-2 rounded-lg text-white bg-brand-moz hover:bg-brand-up font-semibold shadow-md hover:shadow-lg transition-all">
            {t('terms.acceptButton')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;
