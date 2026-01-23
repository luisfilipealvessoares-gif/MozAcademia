import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import CoursePlayerPage from './pages/CoursePlayerPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import ProfilePage from './pages/ProfilePage';
import Footer from './components/Footer';
import UserDashboard from './pages/UserDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './components/AdminLayout';
import WelcomePage from './pages/WelcomePage';
import AdminCourseManagementPage from './pages/AdminCourseManagementPage';
import AuthRedirectHandler from './components/AuthRedirectHandler';
import AdminCertificateRequests from './pages/AdminCertificateRequests';
import AdminStudentProgress from './pages/AdminStudentProgress';
import AdminCoursesListPage from './pages/AdminCoursesListPage';
import UserLayout from './components/UserLayout';
import SupportPage from './pages/SupportPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import AboutPage from './pages/AboutPage';
import ScrollToTop from './components/ScrollToTop';
import { supabase } from './services/supabase';
import UpdatePasswordPage from './pages/UpdatePasswordPage';


// Este componente contém a lógica de roteamento.
const AppRoutes: React.FC = () => {
    const { loading } = useAuth();

    // Aguarda o estado de autenticação ser carregado para evitar redirecionamentos indevidos.
    if (loading) {
        return null; // O AuthProvider já mostra um spinner global.
    }

    // Roteamento normal da aplicação
    return (
        <Routes>
            {/* Rotas de Admin com Layout de Admin */}
            <Route path="/admin" element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
            <Route path="/admin/courses" element={<AdminRoute><AdminLayout><AdminCoursesListPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/courses/:courseId" element={<AdminRoute><AdminLayout><AdminCourseManagementPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/certificates" element={<AdminRoute><AdminLayout><AdminCertificateRequests /></AdminLayout></AdminRoute>} />
            <Route path="/admin/progress" element={<AdminRoute><AdminLayout><AdminStudentProgress /></AdminLayout></AdminRoute>} />
            <Route path="/admin/analytics" element={<AdminRoute><AdminLayout><AdminAnalyticsPage /></AdminLayout></AdminRoute>} />
            <Route path="/admin/login" element={<AdminLoginPage />} />

            {/* Rotas Públicas e de Usuário com Layout padrão */}
            <Route path="/*" element={
                <>
                    <Header />
                    <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                        <Routes>
                            {/* Rotas Públicas */}
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<AuthPage />} />
                            <Route path="/welcome" element={<WelcomePage />} />
                            <Route path="/about" element={<AboutPage />} />
                            <Route path="/update-password" element={<UpdatePasswordPage />} />

                            {/* Rotas Protegidas de Usuário */}
                            <Route path="/course/:courseId" element={<ProtectedRoute><CoursePlayerPage /></ProtectedRoute>} />
                            
                            <Route path="/dashboard" element={<ProtectedRoute><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />
                            <Route path="/profile" element={<ProtectedRoute><UserLayout><ProfilePage /></UserLayout></ProtectedRoute>} />
                            <Route path="/support" element={<ProtectedRoute><UserLayout><SupportPage /></UserLayout></ProtectedRoute>} />
                        </Routes>
                    </main>
                    <Footer />
                </>
            } />
        </Routes>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthRedirectHandler />
      <ScrollToTop />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <AppRoutes />
      </div>
    </AuthProvider>
  );
};

export default App;