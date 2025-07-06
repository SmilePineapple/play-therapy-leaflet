import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import AdminAuth from '../components/admin/AdminAuth';
import AdminDashboard from '../components/admin/AdminDashboard';
import QuestionManager from '../components/admin/QuestionManager';
import ContentModerator from '../components/admin/ContentModerator';
import Analytics from '../components/admin/Analytics';
import styles from './Admin.module.css';

const Admin = () => {

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {

        setLoading(false);
        return;
      }

      if (session?.user) {

        // Check if user has admin role using the is_admin function
        const { data: isAdminResult, error: adminCheckError } = await supabase
          .rpc('is_admin', { user_email: session.user.email });

        if (adminCheckError) {

          setIsAuthenticated(false);
        } else if (isAdminResult) {

          // Get admin profile data
          const { data: profile, error: profileError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

          if (profileError) {

            // Still allow access since is_admin confirmed they are admin
            setIsAuthenticated(true);
            setCurrentUser({ ...session.user, role: 'admin' });
          } else {

            setIsAuthenticated(true);
            setCurrentUser({ ...session.user, ...profile });
          }
        } else {

          setIsAuthenticated(false);
        }
      } else {

        setIsAuthenticated(false);
      }
    } catch (error) {

      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (credentials) => {

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) {

        throw error;
      }


      await checkAuthStatus();
      return { success: true };
    } catch (error) {

      return { success: false, error: error.message };
    }
  };

  const handleLogout = async () => {

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {

      } else {

        setIsAuthenticated(false);
        setCurrentUser(null);
        setActiveTab('dashboard');
      }
    } catch (error) {

    }
  };

  const renderActiveTab = () => {

    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard user={currentUser} />;
      case 'questions':
        return <QuestionManager user={currentUser} />;
      case 'moderation':
        return <ContentModerator user={currentUser} />;
      case 'analytics':
        return <Analytics user={currentUser} />;
      default:
        return <AdminDashboard user={currentUser} />;
    }
  };


  if (loading) {

    return (
      <div className={styles['admin-loading']}>
        <div className={styles['loading-spinner']} />
        <p>Loading admin interface...</p>
      </div>
    );
  }

  if (!isAuthenticated) {

    return <AdminAuth onLogin={handleLogin} />;
  }


  return (
    <div className={styles['admin-container']}>
      <header className={styles['admin-header']}>
        <div className={styles['admin-header-content']}>
          <h1>Admin Dashboard</h1>
          <div className={styles['admin-user-info']}>
            <span>Welcome, {currentUser?.name || currentUser?.email}</span>
            <button onClick={handleLogout} className={styles['logout-btn']} data-testid="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <nav className={styles['admin-nav']}>
        <button
          className={`${styles['nav-btn']} ${activeTab === 'dashboard' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('dashboard')}
          data-testid="tab-dashboard"
        >
          Dashboard
        </button>
        <button
          className={`${styles['nav-btn']} ${activeTab === 'questions' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('questions')}
          data-testid="tab-questions"
        >
          Q&A Management
        </button>
        <button
          className={`${styles['nav-btn']} ${activeTab === 'moderation' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('moderation')}
          data-testid="tab-content"
        >
          Content Moderation
        </button>
        <button
          className={`${styles['nav-btn']} ${activeTab === 'analytics' ? styles['active'] : ''}`}
          onClick={() => setActiveTab('analytics')}
          data-testid="tab-analytics"
        >
          Analytics
        </button>
      </nav>

      <main className={styles['admin-main']} data-testid="admin-dashboard">
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default Admin;
