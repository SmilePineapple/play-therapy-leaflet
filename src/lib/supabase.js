import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// TODO: Replace with your actual Supabase URL and anon key
// Get these from your Supabase project dashboard at https://supabase.com
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Check if Supabase is properly configured
const isSupabaseConfigured = supabaseUrl !== 'YOUR_SUPABASE_URL' &&
                            supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY' &&
                            supabaseUrl &&
                            supabaseAnonKey &&
                            !supabaseUrl.includes('placeholder');

if (!isSupabaseConfigured) {
  console.warn('⚠️ Supabase not configured. Please set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file');
}

// Create Supabase client or mock client for development
let supabase;
try {
  if (isSupabaseConfigured) {
    // Validate URL format
    new URL(supabaseUrl); // This will throw if URL is invalid
    supabase = createClient(supabaseUrl, supabaseAnonKey);

  } else {
    // Create a mock client for development

    supabase = createMockSupabaseClient();
  }
} catch (error) {
  console.error('❌ Failed to initialize Supabase client:', error.message);

  supabase = createMockSupabaseClient();
}

// Mock Supabase client for development when not configured
function createMockSupabaseClient() {
  const mockResponse = { data: [], error: null };
  const mockSingleResponse = { data: null, error: null };

  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve(mockSingleResponse),
          order: () => Promise.resolve(mockResponse)
        }),
        order: () => Promise.resolve(mockResponse)
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve(mockSingleResponse)
        })
      })
    }),
    auth: {
      signInWithPassword: () => Promise.resolve(mockSingleResponse),
      signOut: () => Promise.resolve({ error: null }),
      getUser: () => {

        return Promise.resolve({ data: { user: null }, error: null });
      },
      getSession: () => {

        return Promise.resolve({ data: { session: null }, error: null });
      },
      onAuthStateChange: () => {

        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    channel: () => ({
      on: () => ({
        subscribe: () => () => {} // Return unsubscribe function directly
      }),
      subscribe: () => () => {} // Return unsubscribe function directly
    }),
    removeChannel: () => {}
  };
}

export { supabase };

// Database helper functions
export const dbHelpers = {
  // Sessions
  async getSessions() {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .order('start_time', { ascending: true });

    if (error) {
      console.error('❌ Error fetching sessions:', error);
      return { data: [], error };
    }

    return { data, error: null };
  },

  async getSession(id) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching session:', error);
    } else {
    }

    return { data, error };
  },

  // Announcements
  async getAnnouncements() {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching announcements:', error);
    } else {
      // Log each announcement individually for debugging
      data?.forEach((announcement, index) => {
      });
    }

    return { data, error };
  },

  // Sponsors
  async getSponsors() {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .order('tier', { ascending: true });

    if (error) {
      console.error('❌ Error fetching sponsors:', error);
    } else {
    }

    return { data, error };
  },

  async getSponsor(id) {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('❌ Error fetching sponsor:', error);
    } else {
    }

    return { data, error };
  },

  async getSponsorAdvert() {
    // Try to get from a settings table first, fallback to sponsors table
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'sponsor_advert_image')
      .single();

    if (error) {
      console.error('❌ Error fetching sponsor advert:', error);
      return { data: { image_url: null }, error };
    }

    return { data: { image_url: data?.value }, error: null };
  },

  async updateSponsorAdvert(imageUrl) {
    try {
      // Use upsert with onConflict to handle both insert and update
      const { data, error } = await supabase
        .from('settings')
        .upsert({
          key: 'sponsor_advert_image',
          value: imageUrl,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error upserting sponsor advert:', error);
        return { data: null, error };
      }


      return { data, error: null };
    } catch (err) {
      console.error('❌ Unexpected error in updateSponsorAdvert:', err);
      return { data: null, error: err };
    }
  },

  async getSponsorAdverts() {

    try {
      const { data, error } = await supabase
        .from('settings')
        .select('id, key, value')
        .like('key', 'sponsor_advert_%')
        .order('key', { ascending: true });

      if (error) {
        console.error('❌ Error fetching sponsor adverts:', error);
        return { data: [], error };
      }

      // Return structured data with IDs for proper deletion
      const adverts = data?.map(item => ({
        id: item.id,
        key: item.key,
        image_url: item.value,
        url: item.value // For backward compatibility
      })).filter(advert => advert.image_url) || [];


      return { data: adverts, error: null };
    } catch (err) {
      console.error('❌ Unexpected error in getSponsorAdverts:', err);
      return { data: [], error: err };
    }
  },

  async addSponsorAdvert(imageUrl) {

    try {
      // Use timestamp-based unique key to avoid conflicts
      const timestamp = Date.now();
      const uniqueKey = `sponsor_advert_${timestamp}`;

      const { data, error } = await supabase
        .from('settings')
        .insert({
          key: uniqueKey,
          value: imageUrl,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error adding sponsor advert:', error);
        return { data: null, error };
      }


      return { data, error: null };
    } catch (err) {
      console.error('❌ Unexpected error in addSponsorAdvert:', err);
      return { data: null, error: err };
    }
  },

  async deleteSponsorAdvert(advertId) {

    try {
      const { data, error } = await supabase
        .from('settings')
        .delete()
        .eq('id', advertId)
        .like('key', 'sponsor_advert_%');

      if (error) {
        console.error('❌ Error deleting sponsor advert:', error);
        return { data: null, error };
      }


      return { data, error: null };
    } catch (err) {
      console.error('❌ Unexpected error in deleteSponsorAdvert:', err);
      return { data: null, error: err };
    }
  },

  // Q&A
  async getQuestions(sessionId = null) {
    let query = supabase
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching questions:', error);
    } else {
    }

    return { data, error };
  },

  async submitQuestion(question) {
    const { data, error } = await supabase
      .from('questions')
      .insert([question])
      .select()
      .single();

    if (error) {
      console.error('❌ Error submitting question:', error);
    } else {
    }

    return { data, error };
  },

  async voteForQuestion(questionId) {
    // Get user's IP for anonymous voting (in a real app, you'd get this from the server)
    const userIP = null; // Will be handled by the SQL function

    const { data, error } = await supabase
      .rpc('increment_question_votes', {
        question_id: questionId,
        voter_ip: userIP
      });

    if (error) {
      console.error('❌ Error voting for question:', error);
    } else {
    }

    return { data, error };
  },

  async answerQuestion(questionId, answer, answeredBy) {
    const { data, error } = await supabase
      .from('questions')
      .update({
        answer: answer,
        answered_by: answeredBy,
        answered_at: new Date().toISOString(),
        answered: true
      })
      .eq('id', questionId)
      .select()
      .single();

    if (error) {
      console.error('❌ Error answering question:', error);
    } else {
    }

    return { data, error };
  },

  // Admin authentication
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('❌ Sign in error:', error);
    } else {
    }

    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ Sign out error:', error);
    } else {
    }

    return { error };
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  // Check if current user is an admin
  async isCurrentUserAdmin() {

    try {
      // Use the secure database function instead of accessing auth.users directly
      const { data, error } = await supabase.rpc('is_current_user_admin');

      if (error) {

        return { isAdmin: false, error };
      }

      const isAdmin = !!data;

      return { isAdmin, error: null };
    } catch (error) {
      console.error('🔍 Debug: Exception in isCurrentUserAdmin:', error);
      return { isAdmin: false, error };
    }
  },

  // Real-time subscriptions
  subscribeToAnnouncements(callback) {
    const subscription = supabase
      .channel('announcements')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, callback)
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription);
    };
  },


  // Helper method to get user IP (for anonymous bookmarking)
  getUserIP() {
    // In a real application, you would get this from the server
    // For now, we'll use a fake IP address format since the database expects inet type
    // Generate a consistent fake IP based on session
    if (!window.sessionStorage.getItem('user_session_id')) {
      window.sessionStorage.setItem('user_session_id',
        'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      );
    }

    const sessionId = window.sessionStorage.getItem('user_session_id');
    // Convert session ID to a fake IP address format (192.168.x.x)
    const hash = sessionId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);

    const ip1 = Math.abs(hash) % 256;
    const ip2 = Math.abs(hash >> 8) % 256;
    const fakeIP = `192.168.${ip1}.${ip2}`;
    return fakeIP;
  },

  // Bookmarks
  async getUserBookmarks() {
    const { data, error } = await supabase.rpc('get_user_bookmarks', {
      user_ip: this.getUserIP()
    });

    if (error) {
      console.error('❌ Error fetching bookmarks:', error);
      console.error('🔍 Debug: Error details:', JSON.stringify(error, null, 2));
      return { data: [], error };
    }
    return { data: data ? data.map(row => row.session_id) : [], error: null };
  },

  async addBookmark(sessionId) {
    const { data, error } = await supabase.rpc('add_bookmark', {
      session_id: sessionId,
      user_ip: this.getUserIP()
    });

    if (error) {
      console.error('❌ Error adding bookmark:', error);
      console.error('🔍 Debug: Error details:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }
    return { success: true, data };
  },

  async removeBookmark(sessionId) {
    const { data, error } = await supabase.rpc('remove_bookmark', {
      session_id: sessionId,
      user_ip: this.getUserIP()
    });

    if (error) {
      console.error('❌ Error removing bookmark:', error);
      console.error('🔍 Debug: Error details:', JSON.stringify(error, null, 2));
      return { success: false, error };
    }
    return { success: true, data };
  },

  // Read Announcements - Persistent tracking
  async getUserReadAnnouncements() {

    try {
      // Try to get current session first
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Authenticated user - use database function
        const { data, error } = await supabase.rpc('get_user_read_announcements');

        if (error) {
          console.error('❌ Error fetching read announcements:', error);
          return { data: [], error };
        }


        return { data: data ? data.map(row => row.announcement_id) : [], error: null };
      } else {
        // Anonymous user - use session ID
        const sessionId = this.getUserSessionId();
        const { data, error } = await supabase.rpc('get_user_read_announcements', {
          p_user_session_id: sessionId
        });

        if (error) {
          console.error('❌ Error fetching read announcements for anonymous user:', error);
          return { data: [], error };
        }


        return { data: data ? data.map(row => row.announcement_id) : [], error: null };
      }
    } catch (error) {
      console.error('❌ Exception in getUserReadAnnouncements:', error);
      return { data: [], error };
    }
  },

  async markAnnouncementAsRead(announcementId) {

    try {
      // Try to get current session first
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        // Authenticated user
        const { data, error } = await supabase.rpc('mark_announcement_as_read', {
          p_announcement_id: announcementId
        });

        if (error) {
          console.error('❌ Error marking announcement as read:', error);
          return { success: false, error };
        }


        return { success: true, data };
      } else {
        // Anonymous user
        const sessionId = this.getUserSessionId();
        const { data, error } = await supabase.rpc('mark_announcement_as_read', {
          p_announcement_id: announcementId,
          p_user_session_id: sessionId
        });

        if (error) {
          console.error('❌ Error marking announcement as read (anonymous):', error);
          return { success: false, error };
        }


        return { success: true, data };
      }
    } catch (error) {
      console.error('❌ Exception in markAnnouncementAsRead:', error);
      return { success: false, error };
    }
  },

  async markAllAnnouncementsAsRead(announcementIds) {

    try {
      const results = [];

      for (const announcementId of announcementIds) {
        const result = await this.markAnnouncementAsRead(announcementId);
        results.push(result);
      }

      const allSuccessful = results.every(r => r.success);


      return { success: allSuccessful, results };
    } catch (error) {
      console.error('❌ Exception in markAllAnnouncementsAsRead:', error);
      return { success: false, error };
    }
  },

  // Helper method to get user session ID (for anonymous users)
  getUserSessionId() {
    if (!window.sessionStorage.getItem('user_session_id')) {
      window.sessionStorage.setItem('user_session_id',
        'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now()
      );
    }
    return window.sessionStorage.getItem('user_session_id');
  }
};

// Real-time subscriptions
export const subscriptions = {
  subscribeToAnnouncements(callback) {
    const subscription = supabase
      .channel('announcements')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'announcements'
      }, callback)
      .subscribe();

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(subscription);
    };
  },

  subscribeToQuestions(sessionId, callback) {

    const channel = sessionId === 'all' ? 'questions-all' : `questions-${sessionId}`;
    const subscription = supabase.channel(channel);

    if (sessionId === 'all') {
      // Subscribe to all questions without session filter
      subscription.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'questions'
      }, callback);
    } else {
      // Subscribe to questions for specific session
      subscription.on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'questions',
        filter: `session_id=eq.${sessionId}`
      }, callback);
    }

    subscription.subscribe();

    // Return unsubscribe function
    return () => {

      supabase.removeChannel(subscription);
    };
  }
};

export default supabase;
