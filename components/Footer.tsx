
import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-gray-300 border-t border-gray-700 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
            <Logo className="h-12 w-auto" variant="dark" />
            <p className="text-gray-400 text-sm">Capacitação profissional para o futuro, hoje.</p>
          </div>
          <div className="md:col-span-1">
            <h3 className="font-semibold text-white mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li><Link to="/#cursos" className="text-gray-300 hover:text-brand-moz">Cursos</Link></li>
              <li><Link to="/#noticias" className="text-gray-300 hover:text-brand-moz">Notícias</Link></li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h3 className="font-semibold text-white mb-4">Conta</h3>
            <ul className="space-y-2">
              <li><Link to="/login" className="text-gray-300 hover:text-brand-moz">Login Aluno</Link></li>
              <li><Link to="/admin/login" className="text-gray-300 hover:text-brand-moz">Acesso Admin</Link></li>
              <li><Link to="/support" className="text-gray-300 hover:text-brand-moz">Suporte</Link></li>
            </ul>
          </div>
           <div className="md:col-span-1">
             <h3 className="font-semibold text-white mb-4">Contato</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:mozuppemba@gmail.com" className="text-gray-300 hover:text-brand-moz">mozuppemba@gmail.com</a></li>
              <li><a href="tel:858593163" className="text-gray-300 hover:text-brand-moz">858593163</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-gray-700 pt-8 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} MozupAcademy. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
