# Database Setup Instructions

This document provides step-by-step instructions for setting up the database schema for the Communication Matters Conference application.

## Prerequisites

- Supabase project created and configured
- Database connection established
- Access to Supabase SQL Editor

## Required Database Updates

### 1. Run the SQL Script

Execute the `database-updates.sql` file in your Supabase SQL Editor to:

- Create the `increment_question_votes()` function for vote management
- Add user authentication fields to the questions table
- Create the `question_votes` table to prevent duplicate voting
- Set up Row Level Security (RLS) policies

### 2. Database Schema Overview

#### Questions Table
The questions table should have the following structure:

```sql
CREATE TABLE questions (
  id SERIAL PRIMARY KEY, -- Note: Using INTEGER/SERIAL instead of UUID
  text TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id),
  anonymous BOOLEAN DEFAULT false,
  votes INTEGER DEFAULT 0,
  answered BOOLEAN DEFAULT false,
  answer TEXT,
  answered_by TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  user_id UUID REFERENCES auth.users(id), -- Added for future auth
  author_name TEXT, -- Added for future auth
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Question Votes Table
Tracks voting history to prevent duplicate votes:

```sql
CREATE TABLE question_votes (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(question_id, user_id),
  UNIQUE(question_id, ip_address)
);
```

### 3. Functions

#### increment_question_votes()
This function handles vote increments with duplicate prevention:

- Checks if user has already voted (by user_id or IP)
- Increments vote count if vote is valid
- Returns JSON response with success status and message

### 4. Row Level Security (RLS)

The following RLS policies are applied:

- **question_votes**: Public read access, authenticated insert
- **questions**: Should allow public read and insert (configure as needed)

## Features Implemented

### ✅ Question Persistence
- Questions are now saved to Supabase database
- Real-time updates when new questions are submitted
- Proper error handling and user feedback

### ✅ Voting System
- Vote counting with duplicate prevention
- Support for both authenticated and anonymous users
- Real-time vote count updates

### ✅ Real-time Subscriptions
- Live updates for new questions (INSERT events)
- Live updates for question changes (UPDATE events)
- Proper payload handling for different event types

## Future Enhancements

### 🔄 User Authentication
The database is prepared for user authentication with:
- `user_id` field in questions table
- `author_name` field for display purposes
- User-based vote tracking in question_votes table

### 🔄 Answer System
The questions table includes fields for answers:
- `answer`: The response text
- `answered_by`: Who provided the answer
- `answered_at`: When the answer was provided
- `answered`: Boolean flag for quick filtering

### 🔄 Admin Interface
Future development will include:
- Admin authentication system
- Interface for answering questions
- Moderation tools
- Analytics and reporting

## Testing the Implementation

1. **Submit a Question**: Go to Q&A page and submit a new question
2. **Check Database**: Verify the question appears in Supabase
3. **Vote on Question**: Click vote button and verify count increases
4. **Prevent Duplicate Votes**: Try voting again (should show "already voted" message)
5. **Real-time Updates**: Open multiple browser tabs and verify live updates

## Troubleshooting

### Common Issues

1. **Function not found error**: Ensure `database-updates.sql` was executed successfully
2. **Permission denied**: Check RLS policies are correctly configured
3. **Duplicate vote prevention not working**: Verify question_votes table exists and has proper constraints

### Debug Steps

1. Check Supabase logs for any SQL errors
2. Verify table structure matches expected schema
3. Test functions directly in SQL Editor
4. Check browser console for JavaScript errors

## Security Considerations

- RLS policies prevent unauthorized data access
- Vote tracking prevents manipulation
- SQL injection protection through parameterized queries
- Future user authentication will add additional security layers

For questions or issues, refer to the main project documentation or contact the development team.