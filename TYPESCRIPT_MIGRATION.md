# TypeScript Migration Guide

## 🎯 Overview
This guide outlines the step-by-step process for migrating the Communication Matters Q&A application from JavaScript to TypeScript, improving type safety, developer experience, and code maintainability.

## 📋 Migration Strategy

### Phase 1: Setup and Configuration
1. Install TypeScript dependencies
2. Configure TypeScript compiler
3. Set up type definitions
4. Create base types and interfaces

### Phase 2: Gradual Migration
1. Start with utility files
2. Migrate components one by one
3. Add type definitions for external libraries
4. Update build and test configurations

### Phase 3: Advanced Types
1. Implement strict type checking
2. Add generic types
3. Create custom type guards
4. Optimize type definitions

## 🛠️ Installation and Setup

### Dependencies
```bash
# Install TypeScript and related packages
npm install --save-dev typescript @types/react @types/react-dom @types/node
npm install --save-dev @types/jest @testing-library/jest-dom

# Optional: Additional type definitions
npm install --save-dev @types/react-router-dom
```

### TypeScript Configuration
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": [
      "dom",
      "dom.iterable",
      "es6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/hooks/*": ["hooks/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"]
    }
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules",
    "build"
  ]
}
```

## 📝 Type Definitions

### Core Types
```typescript
// src/types/index.ts
export interface Question {
  id: number;
  text: string;
  votes: number;
  answered: boolean;
  created_at: string;
  session_id: string | null;
  anonymous: boolean;
  user_id?: string;
  author_name?: string;
}

export interface Session {
  id: string;
  name: string;
  created_at: string;
  description?: string;
  active: boolean;
}

export interface QuestionSubmission {
  text: string;
  session?: string;
  anonymous?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized: any;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  new_vote_count?: number;
}

// Database types
export interface Database {
  public: {
    Tables: {
      questions: {
        Row: Question;
        Insert: Omit<Question, 'id' | 'created_at' | 'votes'>;
        Update: Partial<Omit<Question, 'id' | 'created_at'>>;
      };
      question_votes: {
        Row: {
          id: number;
          question_id: number;
          voter_ip: string;
          created_at: string;
        };
        Insert: {
          question_id: number;
          voter_ip: string;
        };
        Update: never;
      };
      sessions: {
        Row: Session;
        Insert: Omit<Session, 'id' | 'created_at'>;
        Update: Partial<Omit<Session, 'id' | 'created_at'>>;
      };
    };
    Functions: {
      increment_question_votes: {
        Args: {
          question_id: number;
          voter_ip: string;
        };
        Returns: VoteResponse;
      };
    };
  };
}

// Component Props Types
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  showDetails?: boolean;
}

export interface ErrorFallbackProps {
  error: Error;
  errorInfo: React.ErrorInfo;
  onRetry: () => void;
  onReload: () => void;
}

export interface QuestionCardProps {
  question: Question;
  onVote: (questionId: number) => Promise<void>;
  onAnswer?: (questionId: number, answer: string) => Promise<void>;
  showActions?: boolean;
}

export interface QuestionFormProps {
  onSubmit: (question: QuestionSubmission) => Promise<void>;
  loading?: boolean;
  error?: string;
  sessionId?: string;
}

// Hook Types
export interface UseQuestionsOptions {
  sessionId?: string;
  autoLoad?: boolean;
  realTime?: boolean;
}

export interface UseQuestionsReturn {
  questions: Question[];
  loading: boolean;
  error: string | null;
  submitting: boolean;
  stats: {
    total: number;
    answered: number;
    unanswered: number;
    popular: number;
  };
  submitQuestion: (question: QuestionSubmission) => Promise<void>;
  voteForQuestion: (questionId: number) => Promise<{ success: boolean; message: string }>;
  loadQuestions: () => Promise<void>;
  getFilteredQuestions: (filters?: QuestionFilters) => Question[];
  clearError: () => void;
}

export interface QuestionFilters {
  status?: 'answered' | 'unanswered' | 'popular';
  session?: string;
  search?: string;
  sortBy?: 'newest' | 'oldest' | 'popular';
}

// Utility Types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type SortOrder = 'asc' | 'desc';

export type QuestionStatus = 'answered' | 'unanswered';

// Event Types
export interface QuestionEvent {
  type: 'question_submitted' | 'question_voted' | 'question_answered';
  payload: Question;
  timestamp: string;
}

// Performance Types
export interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  tags: Record<string, string>;
  url: string;
}

export interface PerformanceMetrics {
  [key: string]: {
    count: number;
    min: number;
    max: number;
    avg: number;
    latest: number;
  };
}
```

### Supabase Types
```typescript
// src/types/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from './index';

export type SupabaseClient = ReturnType<typeof createClient<Database>>;

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update'];

export type Functions<T extends keyof Database['public']['Functions']> = 
  Database['public']['Functions'][T];
```

## 🔄 Migration Examples

### 1. Utility Functions
```typescript
// src/utils/validation.ts (migrated)
import { ValidationResult, QuestionSubmission } from '@/types';

export const sanitizeText = (text: string): string => {
  if (typeof text !== 'string') return '';
  
  return text
    .trim()
    .replace(/[<>"'&]/g, '')
    .substring(0, 1000);
};

export const validateQuestionText = (text: string): ValidationResult => {
  const errors: string[] = [];
  const sanitized = sanitizeText(text);
  
  if (!sanitized) {
    errors.push('Question text is required');
  } else if (sanitized.length < 10) {
    errors.push('Question must be at least 10 characters long');
  } else if (sanitized.length > 500) {
    errors.push('Question must be less than 500 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};

export const validateQuestionSubmission = (questionData: QuestionSubmission): ValidationResult => {
  const errors: string[] = [];
  const sanitized: Partial<QuestionSubmission> = {};
  
  const textValidation = validateQuestionText(questionData.text);
  if (!textValidation.isValid) {
    errors.push(...textValidation.errors);
  } else {
    sanitized.text = textValidation.sanitized;
  }
  
  sanitized.anonymous = Boolean(questionData.anonymous);
  
  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
};
```

### 2. Custom Hooks
```typescript
// src/hooks/useQuestions.ts (migrated)
import { useState, useEffect, useCallback } from 'react';
import { 
  Question, 
  QuestionSubmission, 
  UseQuestionsOptions, 
  UseQuestionsReturn,
  QuestionFilters,
  ApiResponse,
  VoteResponse
} from '@/types';
import * as dbHelpers from '@/lib/supabase';

export const useQuestions = (options: UseQuestionsOptions = {}): UseQuestionsReturn => {
  const { sessionId = null, autoLoad = true, realTime = true } = options;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadQuestions = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      
      const response: ApiResponse<Question[]> = await dbHelpers.getQuestions(sessionId);
      
      if (response.error) {
        setError('Failed to load questions');
        return;
      }
      
      setQuestions(response.data || []);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  const submitQuestion = useCallback(async (questionData: QuestionSubmission): Promise<void> => {
    if (!questionData.text?.trim()) {
      throw new Error('Question text is required');
    }

    setSubmitting(true);
    setError(null);
    
    try {
      const payload = {
        text: questionData.text.trim(),
        session_id: questionData.session || null,
        anonymous: questionData.anonymous || false,
        votes: 0,
        answered: false
      };
      
      const response: ApiResponse<Question> = await dbHelpers.submitQuestion(payload);
      
      if (response.error) {
        throw new Error('Failed to submit question');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit question';
      setError(errorMessage);
      throw err;
    } finally {
      setSubmitting(false);
    }
  }, []);

  const voteForQuestion = useCallback(async (questionId: number): Promise<{ success: boolean; message: string }> => {
    try {
      setError(null);
      
      const response: ApiResponse<VoteResponse> = await dbHelpers.voteForQuestion(questionId);
      
      if (response.error) {
        throw new Error('Failed to record vote');
      }
      
      if (response.data?.success) {
        setQuestions(prev => prev.map(q => 
          q.id === questionId 
            ? { ...q, votes: response.data!.new_vote_count || q.votes + 1 }
            : q
        ));
        
        return { success: true, message: response.data.message };
      } else {
        return { success: false, message: response.data?.message || 'Vote not recorded' };
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote';
      setError(errorMessage);
      throw err;
    }
  }, []);

  const getFilteredQuestions = useCallback((filters: QuestionFilters = {}): Question[] => {
    const { status, session, search, sortBy = 'newest' } = filters;
    
    return questions
      .filter(question => {
        if (status === 'answered' && !question.answered) return false;
        if (status === 'unanswered' && question.answered) return false;
        if (status === 'popular' && question.votes < 3) return false;
        if (session && question.session_id !== session) return false;
        if (search && !question.text.toLowerCase().includes(search.toLowerCase())) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'oldest':
            return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          case 'popular':
            return b.votes - a.votes;
          case 'newest':
          default:
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
      });
  }, [questions]);

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Load questions on mount
  useEffect(() => {
    if (autoLoad) {
      loadQuestions();
    }
  }, [loadQuestions, autoLoad]);

  // Calculate stats
  const stats = {
    total: questions.length,
    answered: questions.filter(q => q.answered).length,
    unanswered: questions.filter(q => !q.answered).length,
    popular: questions.filter(q => q.votes >= 3).length
  };

  return {
    questions,
    loading,
    error,
    submitting,
    stats,
    submitQuestion,
    voteForQuestion,
    loadQuestions,
    getFilteredQuestions,
    clearError
  };
};
```

### 3. Component Migration
```typescript
// src/components/QuestionCard.tsx (new component)
import React from 'react';
import { QuestionCardProps } from '@/types';
import styles from './QuestionCard.module.css';

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  onVote, 
  onAnswer, 
  showActions = true 
}) => {
  const [voting, setVoting] = React.useState<boolean>(false);
  const [answering, setAnswering] = React.useState<boolean>(false);

  const handleVote = async (): Promise<void> => {
    if (voting) return;
    
    setVoting(true);
    try {
      await onVote(question.id);
    } catch (error) {
      console.error('Vote failed:', error);
    } finally {
      setVoting(false);
    }
  };

  const handleAnswer = async (answer: string): Promise<void> => {
    if (!onAnswer || answering) return;
    
    setAnswering(true);
    try {
      await onAnswer(question.id, answer);
    } catch (error) {
      console.error('Answer failed:', error);
    } finally {
      setAnswering(false);
    }
  };

  return (
    <div className={`${styles.questionCard} ${question.answered ? styles.answered : ''}`}>
      <div className={styles.questionContent}>
        <p className={styles.questionText}>{question.text}</p>
        
        <div className={styles.questionMeta}>
          <span className={styles.timestamp}>
            {new Date(question.created_at).toLocaleDateString()}
          </span>
          {question.session_id && (
            <span className={styles.session}>Session: {question.session_id}</span>
          )}
          {question.anonymous && (
            <span className={styles.anonymous}>Anonymous</span>
          )}
        </div>
      </div>
      
      {showActions && (
        <div className={styles.questionActions}>
          <button
            className={`${styles.voteBtn} ${voting ? styles.voting : ''}`}
            onClick={handleVote}
            disabled={voting || question.answered}
            aria-label={`Vote for this question (${question.votes} votes)`}
          >
            👍 {question.votes}
          </button>
          
          {onAnswer && !question.answered && (
            <button
              className={styles.answerBtn}
              onClick={() => handleAnswer('Sample answer')}
              disabled={answering}
              aria-label="Answer this question"
            >
              {answering ? 'Answering...' : 'Answer'}
            </button>
          )}
        </div>
      )}
      
      {question.answered && (
        <div className={styles.answeredBadge} aria-label="This question has been answered">
          ✅ Answered
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
```

## 🧪 Testing with TypeScript

### Test Types
```typescript
// src/types/test.ts
import { RenderResult } from '@testing-library/react';
import { Question, Session } from './index';

export interface MockSupabaseClient {
  from: jest.Mock;
  select: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  eq: jest.Mock;
  order: jest.Mock;
  limit: jest.Mock;
  single: jest.Mock;
  rpc: jest.Mock;
  channel: jest.Mock;
  mockSuccess: (data: any) => { data: any; error: null };
  mockError: (message: string) => { data: null; error: { message: string } };
}

export interface TestRenderResult extends RenderResult {
  user: any; // userEvent instance
}

export interface TestQuestion extends Partial<Question> {
  id: number;
  text: string;
}

export interface TestSession extends Partial<Session> {
  id: string;
  name: string;
}
```

### Updated Test Helpers
```typescript
// src/utils/testHelpers.ts (TypeScript version)
import { render, RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { 
  MockSupabaseClient, 
  TestRenderResult, 
  TestQuestion, 
  TestSession 
} from '@/types/test';

export const createMockSupabaseClient = (): MockSupabaseClient => {
  const mockData = {
    questions: [
      {
        id: 1,
        text: 'Test question 1',
        votes: 5,
        answered: false,
        created_at: '2025-01-01T00:00:00Z',
        session_id: 'test-session',
        anonymous: false
      } as TestQuestion
    ],
    sessions: [
      {
        id: 'test-session',
        name: 'Test Session',
        created_at: '2025-01-01T00:00:00Z'
      } as TestSession
    ]
  };

  return {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: mockData.questions[0], error: null }),
    rpc: jest.fn().mockResolvedValue({ data: { success: true, new_vote_count: 6 }, error: null }),
    channel: jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnValue({
        unsubscribe: jest.fn()
      })
    }),
    mockSuccess: (data: any) => ({ data, error: null }),
    mockError: (message: string) => ({ data: null, error: { message } })
  };
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
): TestRenderResult => {
  const { initialEntries = ['/'], ...renderOptions } = options;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
};
```

## 📊 Migration Progress Tracking

### File Migration Checklist
- [ ] `src/types/index.ts` (new)
- [ ] `src/types/supabase.ts` (new)
- [ ] `src/types/test.ts` (new)
- [ ] `src/utils/validation.js` → `src/utils/validation.ts`
- [ ] `src/utils/testHelpers.js` → `src/utils/testHelpers.ts`
- [ ] `src/hooks/useQuestions.js` → `src/hooks/useQuestions.ts`
- [ ] `src/lib/supabase.js` → `src/lib/supabase.ts`
- [ ] `src/components/ErrorBoundary.js` → `src/components/ErrorBoundary.tsx`
- [ ] `src/pages/QA.js` → `src/pages/QA.tsx`
- [ ] `src/pages/Home.js` → `src/pages/Home.tsx`
- [ ] `src/pages/News.js` → `src/pages/News.tsx`
- [ ] `src/App.js` → `src/App.tsx`
- [ ] `src/index.js` → `src/index.tsx`

### Benefits After Migration
1. **Type Safety**: Catch errors at compile time
2. **Better IDE Support**: Enhanced autocomplete and refactoring
3. **Documentation**: Types serve as living documentation
4. **Maintainability**: Easier to understand and modify code
5. **Team Collaboration**: Clear contracts between components

### Common Migration Patterns

#### Props Interface
```typescript
// Before (JS)
const MyComponent = ({ title, items, onSelect }) => {
  // ...
};

// After (TS)
interface MyComponentProps {
  title: string;
  items: Item[];
  onSelect: (item: Item) => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, items, onSelect }) => {
  // ...
};
```

#### State with Types
```typescript
// Before (JS)
const [questions, setQuestions] = useState([]);
const [loading, setLoading] = useState(false);

// After (TS)
const [questions, setQuestions] = useState<Question[]>([]);
const [loading, setLoading] = useState<boolean>(false);
```

#### API Responses
```typescript
// Before (JS)
const response = await fetch('/api/questions');
const data = await response.json();

// After (TS)
const response = await fetch('/api/questions');
const data: ApiResponse<Question[]> = await response.json();
```

---

*This migration should be done incrementally, starting with utility functions and gradually moving to components. The `allowJs` option in tsconfig.json allows for gradual migration.*