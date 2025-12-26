
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
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
import SupportPage from './pages/SupportPage';
import TicketDetailsPage from './pages/TicketDetailsPage';
import AdminSupportPage from './pages/AdminSupportPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthRedirectHandler />
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Routes>
          {/* Admin Routes with Admin Layout */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          } />
           <Route path="/admin/courses/:courseId" element={
            <AdminRoute>
              <AdminLayout>
                <AdminCourseManagementPage />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/support" element={
            <AdminRoute>
              <AdminLayout>
                <AdminSupportPage />
              </AdminLayout>
            </AdminRoute>
          } />
           <Route path="/admin/support/ticket/:ticketId" element={
            <AdminRoute>
              <AdminLayout>
                <TicketDetailsPage />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Public and User Routes with standard Layout */}
          <Route path="/*" element={
            <>
              <Header />
              <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Routes>
                  <Route path="/login" element={<AuthPage />} />
                  <Route path="/welcome" element={<WelcomePage />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <ProfilePage />
                    </ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <UserDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/course/:courseId" element={
                    <ProtectedRoute>
                      <CoursePlayerPage />
                    </ProtectedRoute>
                  } />
                  <Route path="/support" element={
                    <ProtectedRoute>
                      <SupportPage />
                    </ProtectedRoute>
                  } />
                   <Route path="/support/ticket/:ticketId" element={
                    <ProtectedRoute>
                      <TicketDetailsPage />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
            </>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
};

export default App;
