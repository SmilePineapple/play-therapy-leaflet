// Custom hook for managing questions functionality
// This demonstrates better code organization and reusability

import { useState, useEffect, useCallback } from 'react';
import { dbHelpers, subscriptions } from '../lib/supabase';

export const useQuestions = (sessionId = null) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Load questions from database
  const loadQuestions = useCallback(async () => {
    try {
      setError(null);

      const { data, error: dbError } = await dbHelpers.getQuestions(sessionId);

      if (dbError) {
        console.error('❌ useQuestions: Error loading questions:', dbError);
        setError('Failed to load questions');
        return;
      }

      setQuestions(data || []);

    } catch (err) {
      console.error('❌ useQuestions: Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  // Submit a new question
  const submitQuestion = useCallback(async (questionData) => {
    if (!questionData.text?.trim()) {
      throw new Error('Question text is required');
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        question: questionData.text.trim(),
        session_id: questionData.session || null,
        anonymous: questionData.anonymous || false,
        votes: 0,
        answered: false
      };

      const { error: submitError } = await dbHelpers.submitQuestion(payload);

      if (submitError) {
        console.error('❌ useQuestions: Error submitting question:', submitError);
        throw new Error('Failed to submit question');
      }
      // Note: Real-time subscription will handle adding to local state

    } catch (err) {
      console.error('❌ useQuestions: Submit error:', err);
      setError(err.message);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  // Vote for a question
  const voteForQuestion = useCallback(async (questionId) => {
    try {
      setError(null);

      const { data, error: voteError } = await dbHelpers.voteForQuestion(questionId);

      if (voteError) {
        console.error('❌ useQuestions: Error voting:', voteError);
        throw new Error('Failed to record vote');
      }

      // Handle response from voting function
      if (data?.success) {
        // Update local state with new vote count
        setQuestions(prev => prev.map(q =>
          q.id === questionId
            ? { ...q, votes: data.new_vote_count, voted: true }
            : q
        ));
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data?.message || 'Vote not recorded' };
      }

    } catch (err) {
      console.error('❌ useQuestions: Vote error:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {

    const unsubscribe = subscriptions.subscribeToQuestions('all', (payload) => {

      try {
        if (payload.eventType === 'INSERT') {
          const newQuestion = payload.new;

          // Only add if it matches our session filter (or no filter)
          if (!sessionId || newQuestion.session_id === sessionId) {
            setQuestions(prev => [newQuestion, ...prev]);
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedQuestion = payload.new;

          setQuestions(prev => prev.map(q =>
            q.id === updatedQuestion.id ? updatedQuestion : q
          ));
        } else if (payload.eventType === 'DELETE') {
          const deletedQuestion = payload.old;

          setQuestions(prev => prev.filter(q => q.id !== deletedQuestion.id));
        }
      } catch (err) {
        console.error('❌ useQuestions: Error handling real-time update:', err);
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [sessionId]);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Filter and sort utilities
  const getFilteredQuestions = useCallback((filters = {}) => {
    const { status, session, search, sortBy = 'newest' } = filters;

    return questions
      .filter(question => {
        // Filter by status
        if (status === 'answered' && !question.answered) return false;
        if (status === 'unanswered' && question.answered) return false;
        if (status === 'popular' && question.votes < 3) return false;

        // Filter by session
        if (session && question.session_id !== session) return false;

        // Filter by search term
        if (search && !question.text.toLowerCase().includes(search.toLowerCase())) {
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
  }, [questions]);

  // Statistics
  const stats = {
    total: questions.length,
    answered: questions.filter(q => q.answered).length,
    unanswered: questions.filter(q => !q.answered).length,
    popular: questions.filter(q => q.votes >= 3).length
  };

  return {
    // State
    questions,
    loading,
    error,
    submitting,
    stats,

    // Actions
    submitQuestion,
    voteForQuestion,
    loadQuestions,
    getFilteredQuestions,

    // Utilities
    clearError: () => setError(null)
  };
};

export default useQuestions;
