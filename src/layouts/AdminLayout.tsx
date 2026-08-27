import React, { useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';

export const AdminLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Add noindex meta tag when admin layout mounts
    let meta = document.querySelector('meta[name="robots"]');
    let created = false;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
      created = true;
    }
    const oldContent = meta.getAttribute('content');
    meta.setAttribute('content', 'noindex, nofollow');

    return () => {
      if (created && meta) {
        document.head.removeChild(meta);
      } else if (meta && oldContent !== null) {
        meta.setAttribute('content', oldContent);
      } else if (meta) {
        meta.removeAttribute('content');
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#004990]" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
      <Sidebar />
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0 pt-16 lg:pt-0">
        <Header title="AI365 Command Center" subtitle="Department Analytics & Administration" />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
