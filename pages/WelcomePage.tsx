
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

// Simple Check icon component for visual feedback
const CheckIcon: React.FC = () => (
    <svg className="w-16 h-16 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const WelcomePage: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-full max-w-lg p-8 text-center bg-white rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <CheckIcon />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Conta ativada com sucesso!</h1>
        <p className="mt-4 text-gray-600">
          Seu cadastro foi confirmado. Você já pode acessar a plataforma e começar seus estudos.
        </p>
        <div className="mt-8">
          <Link
            to="/dashboard"
            className="inline-block w-full max-w-xs px-6 py-3 text-lg font-semibold text-white bg-orange-500 rounded-md hover:bg-orange-600 focus:outline-none focus:bg-orange-600"
          >
            Acessar meus cursos
          </Link>
        </div>
        <div className="mt-6">
            <Logo className="h-10 w-auto mx-auto"/>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
