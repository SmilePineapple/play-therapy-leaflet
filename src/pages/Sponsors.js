import React, { useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { dbHelpers } from '../lib/supabase';
import Loading from '../components/Loading';
import styles from './Sponsors.module.css';

const Sponsors = () => {
  const { focusFirstHeading, announce } = useAccessibility();
  const [loading, setLoading] = useState(true);
  const [advertImages, setAdvertImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const loadAdvertImages = useCallback(async () => {
    setLoading(true);
    try {

      const { data, error } = await dbHelpers.getSponsorAdverts();

      if (error) {

        setAdvertImages([]);
        return;
      }


      setAdvertImages(data || []);
    } catch (error) {

      setAdvertImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-advance slideshow every 10 seconds
  useEffect(() => {
    if (advertImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prevIndex) =>
          (prevIndex + 1) % advertImages.length
        );
      }, 10000);

      return () => clearInterval(interval);
    }
    return undefined;
  }, [advertImages.length]);

  useEffect(() => {
    focusFirstHeading();
    announce('Sponsors page loaded');

    loadAdvertImages();
  }, [focusFirstHeading, announce, loadAdvertImages]);

  if (loading) {
    return <Loading message="Loading Sponsors..." />;
  }

  return (
    <div className={styles.sponsorsPage} data-testid="sponsors-page">
      <div className="container">
        <header className={styles.pageHeader}>
          <h1>Our Sponsors</h1>
          <p className={styles.pageDescription}>
            Thank you to our amazing sponsors who make this conference possible!
          </p>
        </header>

        {/* Featured Sponsor Advertisement Slideshow */}
        <section className={styles.advertSection} data-testid="sponsors-list">
          {advertImages.length > 0 ? (
            <div className={styles.advertContainer}>
              <h2 className={styles.featuredTitle} data-testid="sponsor-categories">🌟 Featured Sponsors</h2>
              <div className={styles.slideshowContainer}>
                <img
                  src={advertImages[currentImageIndex]?.image_url || advertImages[currentImageIndex]?.url}
                  alt={`Featured Sponsor ${currentImageIndex + 1}`}
                  className={styles.advertImage}
                />
                {advertImages.length > 1 && (
                  <div className={styles.slideshowControls}>
                    <div className={styles.slideshowDots}>
                      {advertImages.map((image, index) => (
                        <button
                          key={`dot-${image.id}`}
                          className={`${styles.dot} ${index === currentImageIndex ? styles.activeDot : ''}`}
                          onClick={() => setCurrentImageIndex(index)}
                          aria-label={`View sponsor ${index + 1}`}
                        />
                      ))}
                    </div>
                    <div className={styles.slideshowInfo}>
                      {advertImages.length > 1 && (
                        <span className={styles.slideCounter}>
                          {currentImageIndex + 1} of {advertImages.length}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className={styles.featuredDescription}>
                Supporting innovation in AAC technology and communication accessibility.
              </p>
            </div>
          ) : (
            <div className={styles.noAdvert}>
              <h2>🌟 Featured Sponsor Opportunity</h2>
              <p>This premium space is available for your organization!</p>
              <p>Reach hundreds of AAC professionals, researchers, and families.</p>
              <button className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                📧 Become a Sponsor
              </button>
            </div>
          )}
        </section>

        {/* Thank You Section */}
        <section className={styles.thankYouSection}>
          <div className={styles.thankYouCard}>
            <h2>🙏 Thank You to Our Sponsors</h2>
            <p>
              We are grateful for the continued support from our sponsors who help make
              Communication Matters conferences accessible and impactful for the AAC community.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Sponsors;
