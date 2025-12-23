
import React from 'react';
import Logo from './Logo';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <Logo className="h-10 w-auto" />
          <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} MozupAcademy. Todos os direitos reservados.</p>
          <div className="flex space-x-4">
            <Link to="/admin/login" className="text-sm text-gray-500 hover:text-orange-500 transition">
              Acesso Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
