import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAccessibility } from '../contexts/AccessibilityContext';
import styles from './AnnouncementModal.module.css';

const AnnouncementModal = ({ announcement, isOpen, onClose }) => {
  const { announce } = useAccessibility();

  useEffect(() => {
    if (isOpen) {
      announce(`Opened announcement: ${announcement?.title}`);

      // Focus the modal when it opens
      const modal = document.getElementById('announcement-modal');
      if (modal) {
        modal.focus();
      }

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      // Handle escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      return () => {
        document.body.style.overflow = 'unset';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, announcement, announce, onClose]);

  if (!isOpen || !announcement) {
    return null;
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'important': return '⚠️';
      default: return '📢';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'schedule': return '📅';
      case 'venue': return '📍';
      case 'technical': return '💻';
      case 'catering': return '🍽️';
      case 'transport': return '🚌';
      default: return '📢';
    }
  };

  return (
    <div
      className={styles.modalOverlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
    >
      <div
        id="announcement-modal"
        className={`${styles.modalContent} ${announcement.priority === 'urgent' ? styles.urgent : ''}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Close Button */}
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close announcement"
          title="Close (Esc)"
        >
          ✕
        </button>

        {/* Modal Header */}
        <header className={styles.modalHeader}>
          <div className={styles.modalMeta}>
            <span className={styles.priorityIcon} aria-hidden="true">
              {getPriorityIcon(announcement.priority)}
            </span>
            <span className={styles.categoryIcon} aria-hidden="true">
              {getCategoryIcon(announcement.category)}
            </span>
            <time className={styles.modalTime} dateTime={announcement.created_at}>
              {formatDate(announcement.created_at)}
            </time>
          </div>

          <h2 id="modal-title" className={styles.modalTitle}>
            {announcement.title}
          </h2>

          {announcement.priority === 'urgent' && (
            <div className={styles.urgentBanner} role="alert">
              🚨 URGENT ANNOUNCEMENT
            </div>
          )}
        </header>

        {/* Modal Body */}
        <div id="modal-content" className={styles.modalBody}>
          {announcement.summary && (
            <div className={styles.modalSummary}>
              <h3 className={styles.summaryTitle}>Summary</h3>
              <p>{announcement.summary}</p>
            </div>
          )}

          <div className={styles.modalFullContent}>
            <h3 className={styles.contentTitle}>Full Details</h3>
            <div className={styles.contentText}>
              {announcement.content ? (
                announcement.content.split('\n').map((paragraph, index) => (
                  <p key={`paragraph-${index}`}>{paragraph}</p>
                ))
              ) : (
                <p>No additional details available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <footer className={styles.modalFooter}>
          <div className={styles.modalTags}>
            {announcement.priority && (
              <span className={`${styles.tag} ${styles[`priority${announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)}`]}`}>
                {announcement.priority}
              </span>
            )}
            {announcement.category && (
              <span className={`${styles.tag} ${styles[`category${announcement.category.charAt(0).toUpperCase() + announcement.category.slice(1)}`]}`}>
                {announcement.category}
              </span>
            )}
          </div>

          <div className={styles.modalActions}>
            {announcement.action_url && (
              <a
                href={announcement.action_url}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                {announcement.action_text || 'Learn More'}
              </a>
            )}
            <button
              onClick={onClose}
              className="btn btn-secondary"
            >
              Close
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

AnnouncementModal.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    summary: PropTypes.string,
    priority: PropTypes.oneOf(['low', 'normal', 'important', 'urgent']),
    category: PropTypes.oneOf(['general', 'schedule', 'venue', 'technical', 'catering', 'transport']),
    created_at: PropTypes.string,
    action_url: PropTypes.string,
    action_text: PropTypes.string
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default AnnouncementModal;
