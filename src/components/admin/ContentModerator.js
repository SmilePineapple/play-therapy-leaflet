import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { supabase, dbHelpers } from '../../lib/supabase';
import './ContentModerator.css';

const ContentModerator = ({ user }) => {
  const [announcements, setAnnouncements] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [sponsorAdverts, setSponsorAdverts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('announcements');
  const [selectedItem, setSelectedItem] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSessions, setFilteredSessions] = useState([]);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadAnnouncements(),
        loadSessions(),
        loadQuestions()
      ]);
    } catch (err) {
      console.error('Error loading content:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const loadSponsorAdverts = useCallback(async () => {
    try {
      const { data, error } = await dbHelpers.getSponsorAdverts();
      if (error) {
        console.error('Error loading sponsor adverts:', error);
      } else {
        setSponsorAdverts(data || []);
      }
    } catch (err) {
      console.error('Error loading sponsor adverts:', err);
    }
  }, []);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedFile(file);

    // Create a preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Clean up the preview URL when component unmounts
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleSponsorAdvertUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      // Upload file to Supabase storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `sponsor-advert-${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('sponsor-adverts')
        .upload(fileName, selectedFile);

      if (uploadError) {
        console.error('Error uploading file:', uploadError);
        setError(`Failed to upload image: ${uploadError.message}`);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('sponsor-adverts')
        .getPublicUrl(fileName);

      // Add to database
      const { error: addError } = await dbHelpers.addSponsorAdvert(publicUrl);
      if (addError) {
        console.error('Error adding sponsor advert:', addError);
        setError(`Failed to save image: ${addError.message}`);
        return;
      }

      setSuccess('Sponsor image uploaded successfully!');

      // Reload advert data
      await loadSponsorAdverts();

      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);

      // Reset file input
      const fileInput = document.getElementById('sponsor-file-input');
      if (fileInput) fileInput.value = '';
    } catch (err) {
      console.error('Error handling sponsor advert upload:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    }
  };

  const handleDeleteSponsorAdvert = async (imageUrl) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this sponsor image?')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const { error } = await dbHelpers.deleteSponsorAdvert(imageUrl);
      if (error) {
        console.error('Error deleting sponsor advert:', error);
        setError(`Failed to delete image: ${error.message}`);
        return;
      }

      setSuccess('Sponsor image deleted successfully!');
      await loadSponsorAdverts();
    } catch (err) {
      console.error('Error deleting sponsor advert:', err);
      setError(`An unexpected error occurred: ${err.message}`);
    }
  };

  const renderSponsorAdvert = () => {
    return (
      <div className="sponsor-advert-section">
        <h3>Sponsor Images Management</h3>

        <div className="current-adverts">
          <h4>Current Sponsor Images ({sponsorAdverts.length}):</h4>
          {sponsorAdverts.length > 0 ? (
            <div className="adverts-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              {sponsorAdverts.map((advert, index) => (
                <div key={advert.id || index} className="advert-item" style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: '#f9f9f9'
                }}>
                  <img
                    src={advert.image_url}
                    alt={`Sponsor advertisement ${index + 1}`}
                    style={{
                      width: '100%',
                      maxHeight: '200px',
                      objectFit: 'contain',
                      marginBottom: '10px',
                      border: '1px solid #eee'
                    }}
                  />
                  <div className="advert-actions" style={{ textAlign: 'center' }}>
                    <button
                      onClick={() => handleDeleteSponsorAdvert(advert.image_url)}
                      className="delete-btn"
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                      title="Delete this sponsor image"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{
              padding: '20px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              textAlign: 'center',
              color: '#6c757d'
            }}>No sponsor images currently uploaded</p>
          )}
        </div>

        <div className="upload-section">
          <h4>Upload New Sponsor Image:</h4>
          <input
            id="sponsor-file-input"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          <p className="upload-note">Supported formats: JPG, PNG, GIF. Recommended size: 400x300px</p>

          {previewUrl && (
            <div className="preview-section" style={{ marginTop: '20px' }}>
              <h5>Preview:</h5>
              <img
                src={previewUrl}
                alt="Preview of selected image"
                style={{ maxWidth: '400px', maxHeight: '300px', objectFit: 'contain', border: '1px solid #ddd' }}
              />
              <div style={{ marginTop: '10px' }}>
                <button
                  onClick={handleSponsorAdvertUpload}
                  className="btn btn-primary"
                  style={{ marginRight: '10px' }}
                >
                  Add Sponsor Image
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    const fileInput = document.getElementById('sponsor-file-input');
                    if (fileInput) fileInput.value = '';
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const loadContentByTab = useCallback(async () => {
    try {
  
      setLoading(true);
      setError('');

      switch (activeTab) {
        case 'announcements':
          await loadAnnouncements();
          break;
        case 'sessions':
          await loadSessions();
          break;
        case 'questions':
          await loadQuestions();
          break;
        default:
          break;
      }

      // Always load sponsor adverts
      await loadSponsorAdverts();
    } catch (error) {
      console.error('Error loading content:', error);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [activeTab, loadAnnouncements, loadSessions, loadQuestions, loadSponsorAdverts]);

  const loadAnnouncements = useCallback(async () => {
    const { data, error: announcementsError } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (announcementsError) {
      console.error('Error loading announcements:', announcementsError);
      throw announcementsError;
    }

    setAnnouncements(data || []);
  }, []);

  const loadSessions = useCallback(async () => {
    const { data, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .order('start_time', { ascending: true });

    if (sessionsError) {
      console.error('Error loading sessions:', sessionsError);
      throw sessionsError;
    }

    setSessions(data || []);
    setFilteredSessions(data || []);
  }, []);

  // Search sessions based on search term
  const searchSessions = (term) => {
    if (!term.trim()) {
      setFilteredSessions(sessions);
      return;
    }

    const lowerTerm = term.toLowerCase();
    const filtered = sessions.filter(session => {
      return (
        (session.title && session.title.toLowerCase().includes(lowerTerm)) ||
        (session.description && session.description.toLowerCase().includes(lowerTerm)) ||
        (session.presenter && session.presenter.toLowerCase().includes(lowerTerm)) ||
        (session.location && session.location.toLowerCase().includes(lowerTerm)) ||
        (session.session_type && session.session_type.toLowerCase().includes(lowerTerm))
      );
    });

    setFilteredSessions(filtered);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    searchSessions(term);
  };

  const loadQuestions = useCallback(async () => {
    const { data, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (questionsError) {
      console.error('Error loading questions:', questionsError);
      throw questionsError;
    }

    // Migrate questions that have response but no answer field
    if (data && data.length > 0) {
      const questionsToMigrate = data.filter(q => q.response && !q.answer);
      const questionsToFixStatus = data.filter(q => q.status === 'approved' && !q.answered);

      let needsReload = false;

      if (questionsToMigrate.length > 0) {
        for (const question of questionsToMigrate) {
          await supabase
            .from('questions')
            .update({ answer: question.response })
            .eq('id', question.id);
        }
        needsReload = true;
      }

      if (questionsToFixStatus.length > 0) {
        for (const question of questionsToFixStatus) {
          await supabase
            .from('questions')
            .update({ answered: true })
            .eq('id', question.id);
        }
        needsReload = true;
      }

      if (needsReload) {
        // Reload questions after migration
        const { data: updatedData } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });

        setQuestions(updatedData || []);
      } else {
        setQuestions(data || []);
      }
    } else {
      setQuestions([]);
    }
  }, []);

  const deleteItem = async (tableName, itemId) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(`Are you sure you want to delete this ${tableName.slice(0, -1)}? This action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', itemId);

      if (deleteError) {
        console.error('Error deleting item:', deleteError);
        setError(`Failed to delete ${tableName.slice(0, -1)}`);
        return;
      }

      setSuccess(`${tableName.slice(0, -1)} deleted successfully`);
      setSelectedItem(null);
      await loadContent();

    } catch (error) {
      console.error('Error in deleteItem:', error);
      setError('An unexpected error occurred');
    }
  };

  const updateItem = async (tableName, itemId, updateData) => {
    try {
      setError('');
      setSuccess('');

      // Create the update object
      const updateObj = {
        ...updateData
      };

      // Only add updated_at for tables that support it (not sessions)
      if (tableName !== 'sessions') {
        updateObj.updated_at = new Date().toISOString();
      }

      // Special handling for questions with responses
      if (tableName === 'questions') {
        // Debug the question update data
        console.log('Updating question with response:', updateData);

        if (updateData.response && updateData.response.trim()) {
          // Set both answered_at and responded_at for backward compatibility
          updateObj.answered_at = new Date().toISOString();
          updateObj.answered_by = user?.email;
          updateObj.responded_at = new Date().toISOString();
          updateObj.responded_by = user?.email;
          updateObj.status = 'answered';
          updateObj.answered = true;
          // Set the answer field for QA page compatibility
          updateObj.answer = updateData.response;
        } else if (updateData.status === 'approved') {
          // If marking as approved, set answered to true so it shows on QA page
          updateObj.status = 'approved';
          updateObj.answered = true;
        } else if (updateData.status === 'rejected') {
          // If marking as rejected, set answered to false
          updateObj.status = 'rejected';
          updateObj.answered = false;
        } else if (updateData.status === 'pending') {
          // If marking as pending, set answered to false
          updateObj.status = 'pending';
          updateObj.answered = false;
        }
      }

      // Debug for session updates
      if (tableName === 'sessions') {


        // For sessions, we'll let the database trigger handle updated_at
        // Remove any updated_at from the update object to avoid schema cache issues
        delete updateObj.updated_at;
      }

      const { data, error: updateError } = await supabase
        .from(tableName)
        .update(updateObj)
        .eq('id', itemId)
        .select();

      if (updateError) {
        console.error('Error updating item:', updateError);
        setError(`Failed to update ${tableName.slice(0, -1)}: ${updateError.message}`);
        return;
      }


      setSuccess(`${tableName.slice(0, -1)} updated successfully`);
      setEditMode(false);
      setSelectedItem(null);
      await loadContent();

    } catch (error) {
      console.error('Error in updateItem:', error);
      setError(`An unexpected error occurred: ${error.message}`);
    }
  };

  const createAnnouncement = async (announcementData) => {
    try {
      
      setError('');
      setSuccess('');

      // Validate required fields
      if (!announcementData.title?.trim()) {
        setError('Title is required');
        return false;
      }
      if (!announcementData.content?.trim()) {
        setError('Content is required');
        return false;
      }

      const { data, error: createError } = await supabase
        .from('announcements')
        .insert({
          title: announcementData.title.trim(),
          content: announcementData.content.trim(),
          summary: announcementData.summary?.trim() || announcementData.content.trim().substring(0, 150),
          priority: announcementData.priority || 'normal',
          category: announcementData.category || 'general',
          created_at: new Date().toISOString()
        })
        .select();

      if (createError) {
        console.error('Error creating announcement:', createError);
        setError(`Failed to create announcement: ${createError.message}`);
        return false;
      }

      if (!data || data.length === 0) {
        console.error('No data returned after creating announcement');
        setError('Announcement creation failed - no data returned');
        return false;
      }

      
      setSuccess('Announcement created successfully');
      setEditMode(false);
      setEditData({});
      await loadAnnouncements();
      return true;

    } catch (error) {
      console.error('Error in createAnnouncement:', error);
      setError(`An unexpected error occurred: ${error.message}`);
      return false;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };

  const handleEdit = (item) => {

    setSelectedItem(item);
    setEditData({ ...item });
    setEditMode(true);
  };

  const handleSave = async () => {
    if (selectedItem) {
      // Check if this is a session being cancelled
      const isSessionCancellation = activeTab === 'sessions' &&
        selectedItem.status !== 'cancelled' &&
        editData.status === 'cancelled';

      await updateItem(activeTab, selectedItem.id, editData);

      // Create automatic announcement for session cancellation
      if (isSessionCancellation) {


        // Check if current user is an admin before creating announcement
        const { isAdmin, error: adminError } = await supabase.isCurrentUserAdmin();

        if (adminError) {

        }

        if (isAdmin) {

          const announcementTitle = `Session Cancelled: ${editData.title}`;
          const announcementContent = `We regret to inform you that the session "${editData.title}" scheduled for ${formatDate(editData.start_time)} has been cancelled.${editData.cancellation_notes ? `\n\nReason: ${editData.cancellation_notes}` : ''}`;

          const announcementData = {
            title: announcementTitle,
            content: announcementContent,
            summary: `Session "${editData.title}" has been cancelled`,
            priority: 'important',
            category: 'session_update'
          };

          const success = await createAnnouncement(announcementData);
          if (success) {

          } else {
            console.error('❌ Failed to create automatic cancellation announcement');
          }
        } else {


        }
      }
    } else {
      // Creating new item
      if (activeTab === 'announcements') {
        const success = await createAnnouncement(editData);
        if (!success) {
          console.error('Failed to create announcement');
        }
      }
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedItem(null);
    setEditData({});
  };

  const handleCancelSession = (session) => {

    setSelectedItem(session);
    setEditData({
      ...session,
      status: 'cancelled',
      cancellation_notes: session.cancellation_notes || ''
    });
    setEditMode(true);
  };

  const renderContent = () => {
    let items = [];
    let tableName = '';

    switch (activeTab) {
      case 'announcements':
        items = announcements;
        tableName = 'announcements';
        break;
      case 'sessions':
        items = filteredSessions; // Use filtered sessions for search
        tableName = 'sessions';
        break;
      case 'questions':
        items = questions;
        tableName = 'questions';
        break;
      case 'sponsors':
        return renderSponsorAdvert();
      default:
        return null;
    }

    return (
      <div className="content-list">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="content-item">
              <div className="content-header">
                <div className="content-meta">
                  <span className="content-id">ID: {item.id}</span>
                  <span className="content-date">
                    {formatDate(item.created_at || item.start_time)}
                  </span>
                </div>
                <div className="content-actions">
                  <button
                    onClick={() => handleEdit(item)}
                    className="edit-btn"
                    title="Edit item"
                  >
                    ✏️ Edit
                  </button>
                  {activeTab === 'sessions' && (
                    <button
                      onClick={() => handleCancelSession(item)}
                      className={`cancel-btn ${item.status === 'cancelled' ? 'cancelled' : ''}`}
                      title={item.status === 'cancelled' ? 'Session is cancelled' : 'Cancel session'}
                      disabled={item.status === 'cancelled'}
                    >
                      {item.status === 'cancelled' ? '❌ Cancelled' : '🚫 Cancel'}
                    </button>
                  )}
                  <button
                    onClick={() => deleteItem(tableName, item.id)}
                    className="delete-btn"
                    title="Delete item"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
              <div className="content-body">
                {activeTab === 'announcements' && (
                  <>
                    <h3>{item.title}</h3>
                    <p className="content-summary">{item.summary || item.content?.substring(0, 150) + '...'}</p>
                    <div className="content-tags">
                      <span className={`priority-badge priority-${item.priority}`}>
                        {item.priority}
                      </span>
                      <span className="category-badge">{item.category}</span>
                    </div>
                  </>
                )}
                {activeTab === 'sessions' && (
                  <>
                    <h3 className={item.status === 'cancelled' ? 'cancelled-session' : ''}>
                      {item.title}
                      {item.status === 'cancelled' && <span className="cancelled-indicator"> (CANCELLED)</span>}
                    </h3>
                    <p className="content-summary">{item.description?.substring(0, 150) + '...'}</p>
                    {item.status === 'cancelled' && item.cancellation_notes && (
                      <p className="cancellation-notes">📝 Cancellation: {item.cancellation_notes}</p>
                    )}
                    <div className="content-tags">
                      <span className="session-badge">{item.session_type}</span>
                      <span className="location-badge">{item.location}</span>
                      {item.status === 'cancelled' && (
                        <span className="status-badge status-cancelled">Cancelled</span>
                      )}
                    </div>
                  </>
                )}
                {activeTab === 'questions' && (
                  <>
                    <h3>Question from {item.name || 'Anonymous'}</h3>
                    <p className="content-summary">{item.question?.substring(0, 150) + '...'}</p>
                    <div className="content-tags">
                      <span className={`status-badge status-${item.status}`}>
                        {item.status}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-content">
            <p>No {activeTab} found</p>
          </div>
        )}
      </div>
    );
  };

  const renderEditForm = () => {
    if (!editMode) return null;

    return (
      <div className="edit-modal">
        <div className="edit-modal-content">
          <div className="edit-modal-header">
            <h2>{selectedItem ? 'Edit' : 'Create'} {activeTab.slice(0, -1)}</h2>
            <button onClick={handleCancel} className="close-btn">✕</button>
          </div>
          <div className="edit-modal-body">
            {activeTab === 'announcements' && (
              <>
                <div className="form-group">
                  <label htmlFor="announcement-title">Title</label>
                  <input
                    id="announcement-title"
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="announcement-content">Content</label>
                  <textarea
                    id="announcement-content"
                    value={editData.content || ''}
                    onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                    className="form-textarea"
                    rows={6}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="announcement-summary">Summary</label>
                  <input
                    id="announcement-summary"
                    type="text"
                    value={editData.summary || ''}
                    onChange={(e) => setEditData({ ...editData, summary: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="announcement-priority">Priority</label>
                    <select
                      id="announcement-priority"
                      value={editData.priority || 'normal'}
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                      className="form-select"
                    >
                      <option value="normal">Normal</option>
                      <option value="important">Important</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="announcement-category">Category</label>
                    <select
                      id="announcement-category"
                      value={editData.category || 'general'}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="form-select"
                    >
                      <option value="general">General</option>
                      <option value="catering">Catering</option>
                      <option value="venue">Venue</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'sessions' && (
              <>
                <div className="form-group">
                  <label htmlFor="session-title">Title</label>
                  <input
                    id="session-title"
                    type="text"
                    value={editData.title || ''}
                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="session-description">Description</label>
                  <textarea
                    id="session-description"
                    value={editData.description || ''}
                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                    className="form-textarea"
                    rows={4}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="session-location">Location</label>
                    <input
                      id="session-location"
                      type="text"
                      value={editData.location || ''}
                      onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                      className="form-input"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="session-type">Session Type</label>
                    <input
                      id="session-type"
                      type="text"
                      value={editData.session_type || ''}
                      onChange={(e) => setEditData({ ...editData, session_type: e.target.value })}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="session-status">Status</label>
                    <select
                      id="session-status"
                      value={editData.status || 'active'}
                      onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                      className="form-select"
                    >
                      <option value="active">Active</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                {editData.status === 'cancelled' && (
                  <div className="form-group">
                    <label htmlFor="cancellation-notes">Cancellation Notes</label>
                    <textarea
                      id="cancellation-notes"
                      value={editData.cancellation_notes || ''}
                      onChange={(e) => setEditData({ ...editData, cancellation_notes: e.target.value })}
                      className="form-textarea"
                      rows={3}
                      placeholder="Please provide details about the cancellation..."
                    />
                  </div>
                )}
              </>
            )}
            {activeTab === 'questions' && (
              <>
                <div className="form-group">
                  <label htmlFor="question-text">Question</label>
                  <textarea
                    id="question-text"
                    value={editData.question || ''}
                    onChange={(e) => setEditData({ ...editData, question: e.target.value })}
                    className="form-textarea"
                    rows={4}
                    readOnly
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="question-response">Response</label>
                  <textarea
                    id="question-response"
                    value={editData.response || ''}
                    onChange={(e) => setEditData({ ...editData, response: e.target.value })}
                    className="form-textarea"
                    rows={4}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="question-status">Status</label>
                  <select
                    id="question-status"
                    value={editData.status || 'pending'}
                    onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <div className="edit-modal-footer">
            <button onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              {selectedItem ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="content-moderator-loading">
        <div className="loading-spinner" />
        <p>Loading content...</p>
      </div>
    );
  }

  return (
    <div className="content-moderator">
      <div className="content-moderator-header">
        <h1>Content Moderation</h1>
        <div className="header-actions">
          {activeTab === 'announcements' && (
            <button
              onClick={() => {
                setSelectedItem(null);
                setEditData({});
                setEditMode(true);
              }}
              className="create-btn"
            >
              ➕ Create Announcement
            </button>
          )}
          <button onClick={loadContent} className="refresh-btn">
            🔄 Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      <div className="content-tabs">
        <button
          className={`tab-btn ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Announcements ({announcements.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          📅 Sessions ({sessions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'questions' ? 'active' : ''}`}
          onClick={() => setActiveTab('questions')}
        >
          ❓ Questions ({questions.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'sponsors' ? 'active' : ''}`}
          onClick={() => setActiveTab('sponsors')}
        >
          🏢 Sponsors
        </button>
      </div>

      {/* Search functionality for sessions */}
      {activeTab === 'sessions' && (
        <div className="search-section">
          <div className="search-input-group">
            <input
              type="text"
              placeholder="🔍 Search sessions by title, presenter, location, or type..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilteredSessions(sessions);
                }}
                className="clear-search-btn"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          <div className="search-results-info">
            {searchTerm ? (
              <span>Showing {filteredSessions.length} of {sessions.length} sessions</span>
            ) : (
              <span>Showing all {sessions.length} sessions</span>
            )}
          </div>
        </div>
      )}

      <div className="content-moderator-body">
        {renderContent()}
      </div>

      {renderEditForm()}
    </div>
  );
};

ContentModerator.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string
  })
};

export default ContentModerator;

