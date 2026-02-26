
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

// Simple Check icon component for visual feedback
const CheckIcon: React.FC = () => (
    <svg className="w-16 h-16 text-brand-moz" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
    </svg>
);

const WelcomePage: React.FC = () => {
  const { signOut } = useAuth();

  useEffect(() => {
    // Desconecta o usuário para forçá-lo a fazer login com suas novas credenciais.
    // Isso evita o "auto-login" após a confirmação do e-mail,
    // tornando o fluxo de acesso mais claro para o usuário.
    signOut();
  }, [signOut]);

  return (
    <div className="flex items-center justify-center py-12 bg-brand-light -mx-8 -my-8 rounded-xl min-h-[60vh]">
      <div className="w-full max-w-lg p-8 text-center bg-white rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <CheckIcon />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Conta activada com sucesso</h1>
        <p className="mt-4 text-gray-600">
          O seu registo foi confirmado. Por favor, regresse à página inicial para aceder à sua conta.
        </p>
        <div className="mt-8">
          <Link
            to="/login"
            className="inline-block w-full max-w-xs px-6 py-3 text-lg font-semibold text-white bg-brand-moz rounded-md hover:bg-brand-up focus:outline-none focus:bg-brand-up"
          >
            Iniciar sessão ou Aceder à conta
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
