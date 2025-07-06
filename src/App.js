import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Programme from './pages/Programme';
import SessionDetail from './pages/SessionDetail';
import MyAgenda from './pages/MyAgenda';
import News from './pages/News';
import QA from './pages/QA';
import Sponsors from './pages/Sponsors';
import Map from './pages/Map';
import Admin from './pages/Admin';
import About from './pages/About';
import { supabase } from './lib/supabase';
import { initializeSession, trackPageView } from './utils/analytics';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import SkipLink from './components/SkipLink';
import ErrorBoundary from './components/ErrorBoundary';
import Loading from './components/Loading';

// Component to track page views
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    const pageName = location.pathname.replace('/', '') || 'home';
    trackPageView(pageName);
  }, [location]);

  return null;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [_error, _setError] = useState(null);

  useEffect(() => {
    // Initialize analytics session
    initializeSession();

    const testConnection = async () => {
      try {
        const { data, error } = await supabase.from('sessions').select('count');
        if (error) {
          console.warn('⚠️ Supabase connection issue:', error.message);
        }
      } catch (err) {
        console.warn('⚠️ Supabase connection issue:', err);
      } finally {
        setIsLoading(false);
      }
    };
    testConnection();
  }, []);

  if (isLoading) {
    return (
      <Loading
        message="Loading Communication Matters Conference App..."
        size="large"
        overlay={true}
      />
    );
  }

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="App">
            <PageTracker />
            <SkipLink />
            <Header />
            <Navigation />

            <main id="main-content" tabIndex="-1">

              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/programme" element={<Programme />} />
                <Route path="/session/:sessionId" element={<SessionDetail />} />
                <Route path="/my-agenda" element={<MyAgenda />} />
                <Route path="/map" element={<Map />} />
                <Route path="/announcements" element={<News />} />
                <Route path="/qa" element={<QA />} />
                <Route path="/qa/:sessionId" element={<QA />} />
                <Route path="/sponsors" element={<Sponsors />} />
                <Route path="/about" element={<About />} />
                <Route path="/admin" element={<Admin />} />
                {/* Additional routes can be added here */}
              </Routes>
            </main>

            {/* Accessibility announcements */}
            <div id="live-region" aria-live="polite" aria-atomic="true" className="sr-only" />
          </div>
        </Router>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
