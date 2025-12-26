
import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Logo className="h-12 w-auto" />
            <p className="text-gray-500 text-sm">Capacitação profissional para o futuro, hoje.</p>
          </div>
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li><a href="/#cursos" className="text-gray-600 hover:text-brand-moz">Cursos</a></li>
              <li><a href="/#noticias" className="text-gray-600 hover:text-brand-moz">Notícias</a></li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h3 className="font-semibold text-gray-800 mb-4">Conta</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-gray-600 hover:text-brand-moz">Login Aluno</Link></li>
              <li><Link to="/admin/login" className="text-gray-600 hover:text-brand-moz">Acesso Admin</Link></li>
            </ul>
          </div>
          <div className="md:col-span-1">
             <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-brand-moz">Termos de Serviço</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-moz">Política de Privacidade</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} MozupAcademy. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;