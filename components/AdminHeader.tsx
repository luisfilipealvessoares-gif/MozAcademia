
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useI18n } from '../contexts/I18nContext';

const AdminHeader: React.FC = () => {
  const { profile, signOut } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    // Explicitly navigate to the admin login page to ensure a clean redirect.
    // This prevents the user from being stuck on a page if the reactive state change is slow.
    navigate('/admin/login', { replace: true });
  };

  return (
    <header className="bg-white shadow-sm z-10 border-b">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div>
          {/* This space can be used for breadcrumbs or page titles in the future */}
        </div>
        <div className="flex items-center space-x-6">
            <span className="text-gray-600 font-medium">
                {t('admin.header.hello', { name: profile?.full_name || 'Admin' })}
            </span>
            <Link to="/" className="text-sm text-gray-500 hover:text-brand-moz font-medium transition-colors">
              {t('admin.header.viewSite')}
            </Link>
            <button
                onClick={handleSignOut}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
            >
                {t('admin.header.logout')}
            </button>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
