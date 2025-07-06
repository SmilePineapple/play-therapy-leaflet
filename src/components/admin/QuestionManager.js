import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase } from '../../lib/supabase';
import './QuestionManager.css';

const QuestionManager = ({ user }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions, filter]);

  const loadQuestions = async () => {
    try {

      setLoading(true);
      setError('');

      let query = supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: questionsError } = await query;

      if (questionsError) {
        console.error('Error loading questions:', questionsError);
        setError('Failed to load questions');
        return;
      }


      setQuestions(data || []);

    } catch (error) {
      console.error('Error in loadQuestions:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateQuestionStatus = async (questionId, newStatus, response = '') => {
    try {

      setError('');
      setSuccess('');

      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (response.trim()) {
        updateData.response = response.trim();
        updateData.answered_by = user?.email;
        updateData.answered_at = new Date().toISOString();
        // Also set responded_at and responded_by for backward compatibility
        updateData.responded_by = user?.email;
        updateData.responded_at = new Date().toISOString();
      }

      const { data, error: updateError } = await supabase
        .from('questions')
        .update(updateData)
        .eq('id', questionId)
        .select();

      if (updateError) {
        console.error('Error updating question:', updateError);
        setError(`Failed to update question status: ${updateError.message}`);
        return false;
      }

      if (!data || data.length === 0) {
        console.error('No question found with ID:', questionId);
        setError('Question not found or could not be updated');
        return false;
      }


      setSuccess(`Question ${newStatus} successfully`);
      setSelectedQuestion(null);
      setResponseText('');
      await loadQuestions();
      return true;

    } catch (error) {
      console.error('Error in updateQuestionStatus:', error);
      setError(`An unexpected error occurred: ${error.message}`);
      return false;
    }
  };

  const deleteQuestion = async (questionId) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {

      setError('');
      setSuccess('');

      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('id', questionId);

      if (deleteError) {
        console.error('Error deleting question:', deleteError);
        setError('Failed to delete question');
        return;
      }


      setSuccess('Question deleted successfully');
      await loadQuestions();

    } catch (error) {
      console.error('Error in deleteQuestion:', error);
      setError('An unexpected error occurred');
    }
  };

  const formatDate = (dateString) => {
    // Parse the datetime string as local time to avoid timezone conversion
    let date;
    if (dateString.includes('T') && !dateString.includes('Z') && !dateString.includes('+')) {
      // Parse as local time by manually extracting components
      const [datePart, timePart] = dateString.split('T');
      const [year, month, day] = datePart.split('-').map(Number);
      const [hour, minute] = timePart ? timePart.split(':').map(Number) : [0, 0];
      date = new Date(year, month - 1, day, hour, minute);
    } else {
      date = new Date(dateString);
    }

    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-badge status-pending',
      approved: 'status-badge status-approved',
      rejected: 'status-badge status-rejected'
    };
    return statusClasses[status] || 'status-badge';
  };

  const filteredQuestions = questions.filter(question => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      question.question?.toLowerCase().includes(searchLower) ||
      question.name?.toLowerCase().includes(searchLower) ||
      question.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleQuestionSelect = (question) => {

    setSelectedQuestion(question);
    setResponseText(question.response || '');
  };

  const handleResponseSubmit = async (status) => {
    if (selectedQuestion) {
      const success = await updateQuestionStatus(selectedQuestion.id, status, responseText);
      if (!success) {
        console.error('Failed to update question status');
      }
    }
  };

  if (loading) {
    return (
      <div className="question-manager-loading">
        <div className="loading-spinner" />
        <p>Loading questions...</p>
      </div>
    );
  }

  return (
    <div className="question-manager">
      <div className="question-manager-header">
        <h1>Question Management</h1>
        <button onClick={loadQuestions} className="refresh-btn">
          🔄 Refresh
        </button>
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

      <div className="question-controls">
        <div className="filter-controls">
          <label htmlFor="status-filter">Filter by status:</label>
          <select
            id="status-filter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Questions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="search-controls">
          <label htmlFor="search-input">Search questions:</label>
          <input
            id="search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by question, name, or email..."
            className="search-input"
          />
        </div>
      </div>

      <div className="question-stats">
        <div className="stat-item">
          <span className="stat-label">Total:</span>
          <span className="stat-value">{questions.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pending:</span>
          <span className="stat-value">{questions.filter(q => q.status === 'pending').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Approved:</span>
          <span className="stat-value">{questions.filter(q => q.status === 'approved').length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Rejected:</span>
          <span className="stat-value">{questions.filter(q => q.status === 'rejected').length}</span>
        </div>
      </div>

      <div className="question-content">
        <div className="question-list">
          <h2>Questions ({filteredQuestions.length})</h2>
          {filteredQuestions.length > 0 ? (
            <div className="questions">
              {filteredQuestions.map((question) => (
                <div
                  key={question.id}
                  className={`question-item ${selectedQuestion?.id === question.id ? 'selected' : ''}`}
                  onClick={() => handleQuestionSelect(question)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleQuestionSelect(question);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="question-header">
                    <span className={getStatusBadge(question.status)}>
                      {question.status}
                    </span>
                    <span className="question-date">
                      {formatDate(question.created_at)}
                    </span>
                  </div>
                  <div className="question-text">
                    {question.question}
                  </div>
                  <div className="question-meta">
                    <span>From: {question.name || 'Anonymous'}</span>
                    {question.email && <span>({question.email})</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-questions">
              <p>No questions found</p>
            </div>
          )}
        </div>

        {selectedQuestion && (
          <div className="question-detail">
            <h2>Question Details</h2>
            <div className="detail-card">
              <div className="detail-header">
                <span className={getStatusBadge(selectedQuestion.status)}>
                  {selectedQuestion.status}
                </span>
                <button
                  onClick={() => deleteQuestion(selectedQuestion.id)}
                  className="delete-btn"
                  title="Delete question"
                >
                  🗑️ Delete
                </button>
              </div>

              <div className="detail-content">
                <div className="detail-section">
                  <h3>Question</h3>
                  <p>{selectedQuestion.question}</p>
                </div>

                <div className="detail-section">
                  <h3>Submitted by</h3>
                  <p>{selectedQuestion.name || 'Anonymous'}</p>
                  {selectedQuestion.email && <p>{selectedQuestion.email}</p>}
                  <p className="detail-date">Submitted: {formatDate(selectedQuestion.created_at)}</p>
                </div>

                {selectedQuestion.response && (
                  <div className="detail-section">
                    <h3>Current Response</h3>
                    <p>{selectedQuestion.response}</p>
                    {(selectedQuestion.answered_by || selectedQuestion.responded_by) && (
                      <p className="detail-meta">
                        Answered by: {selectedQuestion.answered_by || selectedQuestion.responded_by} on {formatDate(selectedQuestion.answered_at || selectedQuestion.responded_at)}
                      </p>
                    )}
                  </div>
                )}

                <div className="detail-section">
                  <h3>Admin Response</h3>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Enter your response to this question..."
                    className="response-textarea"
                    rows={4}
                  />
                </div>

                <div className="detail-actions">
                  <button
                    onClick={() => handleResponseSubmit('approved')}
                    className="btn-success"
                    disabled={!responseText.trim()}
                  >
                    ✅ Approve & Respond
                  </button>
                  <button
                    onClick={() => handleResponseSubmit('rejected')}
                    className="btn-danger"
                  >
                    ❌ Reject
                  </button>
                  {selectedQuestion.status !== 'pending' && (
                    <button
                      onClick={() => updateQuestionStatus(selectedQuestion.id, 'pending')}
                      className="btn-secondary"
                    >
                      ↩️ Mark as Pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

QuestionManager.propTypes = {
  user: PropTypes.shape({
    email: PropTypes.string
  })
};

export default QuestionManager;
