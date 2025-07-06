import React, { useState, useEffect, useCallback } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { dbHelpers, subscriptions } from '../lib/supabase';
import { trackQuestionSubmit } from '../utils/analytics';
import Loading from '../components/Loading';
import styles from './QA.module.css';

const QA = () => {
  const { announce, focusFirstHeading } = useAccessibility();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'answered', 'unanswered', 'popular'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popular'
  const [searchTerm, setSearchTerm] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ text: '', session: '', anonymous: false });
  const [submitting, setSubmitting] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState(new Set());
  const [expandedAnswers, setExpandedAnswers] = useState(new Set());
  const [submissionMessage, setSubmissionMessage] = useState('');


  const loadQuestions = useCallback(async () => {
    try {

      const { data, error } = await dbHelpers.getQuestions();
      if (error) {
        console.error('❌ Error loading questions:', error);
        announce('Error loading questions');
        return;
      }


      setQuestions(data || []);

    } catch (error) {
      console.error('❌ Error loading questions:', error);
      announce('Error loading questions');
    } finally {
      setLoading(false);
    }
  }, [announce]);

  const loadSessions = useCallback(async () => {
    try {
      const { data, error } = await dbHelpers.getSessions();
      if (error) {
        console.error('❌ Error loading sessions:', error);
        return;
      }

      setSessions(data || []);

    } catch (error) {
      console.error('❌ Error loading sessions:', error);
    }
  }, []);

  useEffect(() => {
    focusFirstHeading();
    announce('Questions and answers page loaded');

    loadQuestions();
    loadSessions();

    // Set up real-time subscription for new questions
    const unsubscribe = subscriptions.subscribeToQuestions('all', (payload) => {

      if (payload.eventType === 'INSERT') {
        const newQuestion = payload.new;
        setQuestions(prev => [newQuestion, ...prev]);
        announce(`New question submitted: ${newQuestion.question.substring(0, 50)}...`);
      } else if (payload.eventType === 'UPDATE') {
        const updatedQuestion = payload.new;
        setQuestions(prev => prev.map(q =>
          q.id === updatedQuestion.id ? updatedQuestion : q
        ));
        if (updatedQuestion.answered) {
          announce(`Question answered: ${updatedQuestion.question.substring(0, 50)}...`);
        }
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [announce, focusFirstHeading, loadQuestions, loadSessions]);

  const submitQuestion = async (e) => {
    e.preventDefault();

    if (!newQuestion.text.trim()) {
      announce('Please enter a question');
      return;
    }

    setSubmitting(true);

    try {
      const questionData = {
        question: newQuestion.text.trim(),
        session_id: newQuestion.session || null,
        anonymous: newQuestion.anonymous,
        answered: false,
        votes: 0
      };

      // Submit to Supabase
      const { data, error } = await dbHelpers.submitQuestion(questionData);

      if (error) {
        throw error;
      }
      // Track the question submission
      if (data && data[0]) {
        trackQuestionSubmit(data[0].id);
      }
      // Reset form
      setNewQuestion({ text: '', session: '', anonymous: false });
      setShowQuestionForm(false);

      // Show success message
      setSubmissionMessage('✅ Your question has been submitted successfully!');
      setTimeout(() => setSubmissionMessage(''), 5000);

      announce('Question submitted successfully');

      // Refresh questions list to show the new question immediately
      await loadQuestions();


    } catch (error) {
      console.error('❌ Error submitting question:', error);
      announce('Error submitting question. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const voteForQuestion = async (questionId) => {
    try {
      // Update vote count in Supabase
      const { data, error } = await dbHelpers.voteForQuestion(questionId);

      if (error) {
        throw error;
      }
      // Handle response from the voting function
      if (data && data.success) {
        // Update local state with the new vote count
        setQuestions(prev => prev.map(q =>
          q.id === questionId
            ? { ...q, votes: data.new_vote_count, voted: true }
            : q
        ));

        announce(data.message || 'Vote recorded');
      } else {
        // Vote was not recorded (duplicate vote)
        announce(data?.message || 'Vote not recorded');
      }
    } catch (error) {
      console.error('❌ Error voting for question:', error);
      announce('Error recording vote');
    }
  };

  // Filter and sort questions
  const filteredQuestions = questions
    .filter(question => {
      // Filter by status
      if (filter === 'answered' && !question.answered) {
        return false;
      }
      if (filter === 'unanswered' && question.answered) {
        return false;
      }
      if (filter === 'popular' && question.votes < 3) {
        return false;
      }
      // Filter by session
      if (selectedSession && question.session_id !== selectedSession) {
        return false;
      }
      // Filter by search term
      if (searchTerm && !question.question.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'popular':
          return b.votes - a.votes;
        case 'newest':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // Helper function to check if text needs truncation (more than 3 lines)
  const needsTruncation = (text) => {
    if (!text) return false;
    const lines = text.split('\n');
    if (lines.length > 2) return true;
    // Estimate if text would wrap to more than 2 lines (rough estimate: 80 chars per line)
    return text.length > 160;
  };

  // Toggle question expansion
  const toggleQuestionExpansion = (questionId) => {
    setExpandedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  // Toggle answer expansion
  const toggleAnswerExpansion = (questionId) => {
    setExpandedAnswers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  if (loading) {
    return <Loading message="Loading Q&A..." />;
  }

  return (
    <div className={styles.qaPage} data-testid="qa-page">
      <div className="container">
        <header className={styles.pageHeader}>
          <h1>Questions & Answers</h1>
          <p className={styles.pageDescription}>
            Ask questions about sessions, get answers from speakers, and engage with the conference community.
          </p>
        </header>


        {/* Ask Question Button */}
        <section className={styles.askQuestionSection}>
          <button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className={`btn btn-primary ${styles.btnLarge}`}
            aria-expanded={showQuestionForm}
          >
            ❓ Ask a Question
          </button>

          {/* Submission Success Message */}
          {submissionMessage && (
            <div className={styles.successMessage} role="alert" aria-live="polite">
              {submissionMessage}
            </div>
          )}
        </section>

        {/* Question Form */}
        {showQuestionForm && (
          <section className={styles.questionFormSection} aria-labelledby="form-title" data-testid="question-form">
            <h2 id="form-title">Submit Your Question</h2>
            <form onSubmit={submitQuestion} className={styles.questionForm}>
              <div className={styles.formGroup}>
                <label htmlFor="question-text" className={styles.formLabel}>
                  Your Question *
                </label>
                <textarea
                  id="question-text"
                  value={newQuestion.text}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
                  className={styles.formTextarea}
                  rows="4"
                  placeholder="Type your question here..."
                  required
                  maxLength="500"
                />
                <div className={styles.charCount}>
                  {newQuestion.text.length}/500 characters
                </div>
              </div>


              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={newQuestion.anonymous}
                    onChange={(e) => setNewQuestion(prev => ({ ...prev, anonymous: e.target.checked }))}
                    className={styles.formCheckbox}
                  />
                  <span className={styles.checkboxText}>Submit anonymously</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  disabled={submitting || !newQuestion.text.trim()}
                  className="btn btn-primary"
                >
                  {submitting ? '📤 Submitting...' : '📤 Submit Question'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowQuestionForm(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Filters and Search */}
        <section className={styles.qaControls} aria-labelledby="controls-title" data-testid="filter-sort-options">
          <h2 id="controls-title" className="sr-only">Filter and Search</h2>
          <div className={styles.controlsGrid}>
            {/* Search */}
            <div className="search-group">
              <label htmlFor="question-search" className="sr-only">Search questions</label>
              <input
                id="question-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="🔍 Search questions..."
                className={styles.searchInput}
              />
            </div>


          </div>

          <div className={styles.filterSortGrid}>
            {/* Status Filter */}
            <div className="filter-group">
              <fieldset className={styles.filterFieldset}>
                <legend className={styles.filterLegend}>Filter by Status</legend>
                <div className={styles.filterButtons}>
                  {[
                    { id: 'all-filter', value: 'all', label: 'All', icon: '❓' },
                    { id: 'unanswered-filter', value: 'unanswered', label: 'Unanswered', icon: '⏳' },
                    { id: 'answered-filter', value: 'answered', label: 'Answered', icon: '✅' },
                    { id: 'popular-filter', value: 'popular', label: 'Popular', icon: '🔥' }
                  ].map(filterOption => (
                    <button
                      key={filterOption.id}
                      onClick={() => setFilter(filterOption.value)}
                      className={`${styles.filterBtn} ${filter === filterOption.value ? styles.active : ''}`}
                      aria-pressed={filter === filterOption.value}
                    >
                      <span aria-hidden="true">{filterOption.icon}</span>
                      {filterOption.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            {/* Sort Options */}
            <div className={styles.sortGroup}>
              <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.formSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Results Info */}
          <div className={styles.resultsInfo} role="status" aria-live="polite">
            Showing {filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''}
          </div>
        </section>

        {/* Questions List */}
        <section className="questions-section" aria-labelledby="questions-title">
          <h2 id="questions-title" className="sr-only">Questions List</h2>

          {filteredQuestions.length === 0 ? (
            <div className={styles.noQuestions} data-testid="empty-questions">
              <h3>No questions found</h3>
              <p>
                {questions.length === 0
                  ? 'Be the first to ask a question!'
                  : 'No questions match your current filters.'}
              </p>
              {questions.length === 0 ? (
                <button onClick={() => setShowQuestionForm(true)} className="btn btn-primary">
                  ❓ Ask the First Question
                </button>
              ) : (
                <button onClick={() => { setFilter('all'); setSearchTerm(''); setSelectedSession(''); }} className="btn btn-primary">
                  Show All Questions
                </button>
              )}
            </div>
          ) : (
            <div className={styles.questionsList} data-testid="questions-list">
              {filteredQuestions.map((question) => (
                <article key={question.id} className={`${styles.questionCard} ${question.answered ? styles.answered : styles.unanswered}`}>
                  <header className={styles.questionHeader}>
                    <div className={styles.questionMeta}>
                      <span className={styles.questionAuthor}>
                        {question.author || (question.anonymous ? 'Anonymous' : 'Conference Attendee')}
                      </span>
                      <time className={styles.questionTime} dateTime={question.created_at}>
                        {formatDate(question.created_at)}
                      </time>
                      {question.session_title && (
                        <span className={styles.questionSession}>
                          📅 {question.session_title}
                        </span>
                      )}
                    </div>

                    <div className="question-status">
                      {question.answered ? (
                        <span className={`${styles.statusBadge} ${styles.answered}`} aria-label="Answered">
                          ✅ Answered
                        </span>
                      ) : (
                        <span className={`${styles.statusBadge} ${styles.unanswered}`} aria-label="Awaiting answer">
                          ⏳ Pending
                        </span>
                      )}
                    </div>
                  </header>

                  <div className="question-content">
                    <div className={styles.questionBubble}>
                      <div className={styles.questionAvatar}>❓</div>
                      <div className={styles.questionContent}>
                        <div className={styles.questionAuthor}>
                          {question.author_name || (question.anonymous ? 'Anonymous' : 'Conference Attendee')}
                        </div>
                        <div className={`${styles.questionText} ${
                          expandedQuestions.has(question.id)
                            ? styles.questionTextExpanded
                            : styles.questionTextCollapsed
                        }`}>
                          {question.question}
                        </div>
                        {needsTruncation(question.question) && (
                          <button
                            onClick={() => toggleQuestionExpansion(question.id)}
                            className={styles.expandButton}
                            aria-label={expandedQuestions.has(question.id) ? 'Show less' : 'Show more'}
                          >
                            {expandedQuestions.has(question.id) ? '▲ Show less' : '▼ Show more'}
                          </button>
                        )}
                      </div>
                    </div>

                    {question.response && (
                      <div className={styles.answerBubble}>
                        <div className={styles.answerAvatar}>💬</div>
                        <div className={styles.answerContent}>
                          <div className={styles.answerAuthor}>
                            {question.responded_by || 'Conference Team'}
                          </div>
                          <div className={`${styles.answerText} ${
                            expandedAnswers.has(question.id)
                              ? styles.answerSectionExpanded
                              : styles.answerSectionCollapsed
                          }`}>
                            {question.response}
                          </div>
                          {needsTruncation(question.response) && (
                            <button
                              onClick={() => toggleAnswerExpansion(question.id)}
                              className={styles.expandButton}
                              aria-label={expandedAnswers.has(question.id) ? 'Show less answer' : 'Show more answer'}
                            >
                              {expandedAnswers.has(question.id) ? '▲ Show less' : '▼ Show more'}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <footer className={styles.questionFooter}>
                    <div className={styles.questionActions}>
                      <button
                        onClick={() => voteForQuestion(question.id)}
                        disabled={question.voted}
                        className={`${styles.voteBtn} ${question.voted ? styles.voted : ''}`}
                        aria-label={`${question.voted ? 'You voted for this question' : 'Vote for this question'}. Current votes: ${question.votes}`}
                        title={question.voted ? 'You already voted' : 'Click to vote for this question'}
                      >
                        <span className="vote-icon" aria-hidden="true">
                          👍
                        </span>
                        <span className={styles.voteCount}>{question.votes}</span>
                        <span className={styles.voteLabel}>Popular</span>
                      </button>

                      {question.session_id && (
                        <span className={styles.sessionLink}>
                          📅 Related to session
                        </span>
                      )}
                    </div>

                    <div className={styles.questionTags}>
                      {question.answered && (
                        <span className={`${styles.tag} ${styles.answeredTag}`}>Answered</span>
                      )}
                      {question.votes >= 5 && (
                        <span className={`${styles.tag} ${styles.popularTag}`}>Popular</span>
                      )}
                      {question.anonymous && (
                        <span className={`${styles.tag} ${styles.anonymousTag}`}>Anonymous</span>
                      )}
                    </div>
                  </footer>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default QA;
