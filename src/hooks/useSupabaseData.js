import { useState, useEffect, useCallback } from 'react';
import { dbHelpers } from '../lib/supabase';

/**
 * Custom hook for fetching data from Supabase with loading states and error handling
 * @param {string} dataType - Type of data to fetch ('sessions', 'announcements', 'sponsors', 'questions')
 * @param {object} options - Additional options like sessionId for questions
 * @returns {object} { data, loading, error, refetch }
 */
export const useSupabaseData = (dataType, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let result;

      switch (dataType) {
        case 'sessions':
          result = await dbHelpers.getSessions();
          break;
        case 'announcements':
          result = await dbHelpers.getAnnouncements();
          break;
        case 'sponsors':
          result = await dbHelpers.getSponsors();
          break;
        case 'questions':
          result = await dbHelpers.getQuestions(options.sessionId);
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      if (result.error) {
        console.error(`❌ Error fetching ${dataType}:`, result.error);
        setError(result.error);
        setData([]);
      } else {
        setData(result.data || []);
      }
    } catch (err) {
      console.error(`❌ Exception while fetching ${dataType}:`, err);
      setError(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [dataType, options.sessionId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch
  };
};

/**
 * Custom hook for submitting data to Supabase
 * @param {string} dataType - Type of data to submit ('questions')
 * @returns {object} { submit, loading, error, success }
 */
export const useSupabaseSubmit = (dataType) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      let result;

      switch (dataType) {
        case 'questions':
          result = await dbHelpers.submitQuestion(data);
          break;
        default:
          throw new Error(`Unknown submit type: ${dataType}`);
      }

      if (result.error) {
        console.error(`❌ Error submitting ${dataType}:`, result.error);
        setError(result.error);
        setSuccess(false);
      } else {
        setSuccess(true);
        setError(null);
      }

      return result;
    } catch (err) {
      console.error(`❌ Exception while submitting ${dataType}:`, err);
      setError(err);
      setSuccess(false);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, [dataType]);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
    setLoading(false);
  }, [dataType]);

  return {
    submit,
    loading,
    error,
    success,
    reset
  };
};
