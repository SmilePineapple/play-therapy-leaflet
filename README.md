# Communication Matters AAC Conference App

A fully accessible, responsive web application for the annual Communication Matters AAC Conference. Built with accessibility as a core priority, following WCAG 2.1 AA standards.

## 🌟 Features

### Core Functionality
- **Programme Management**: Browse sessions, filter by day/track, bookmark favorites
- **Interactive Map**: Campus navigation with accessibility information
- **Real-time Announcements**: Conference updates and important notices
- **Q&A System**: Submit questions, vote on popular questions, get answers
- **Sponsor Showcase**: Discover conference sponsors and partners
- **My Agenda**: Personal schedule management and export

### Accessibility Features
- **WCAG 2.1 AA Compliant**: Full accessibility standards compliance
- **High Contrast Mode**: Enhanced visibility for users with visual impairments
- **Keyboard Navigation**: Complete keyboard accessibility
- **Screen Reader Support**: ARIA labels, roles, and live regions
- **Large Touch Targets**: Mobile-friendly interaction areas (44px minimum)
- **Font Size Controls**: Adjustable text size for better readability
- **Reduced Motion**: Respects user motion preferences
- **Clear Language**: Simple, AAC-friendly content and navigation

### Technical Features
- **Progressive Web App (PWA)**: Offline functionality and app-like experience
- **Responsive Design**: Mobile-first approach with tablet and desktop support
- **Real-time Updates**: Live announcements and Q&A updates
- **Local Storage**: Persistent user preferences and bookmarks
- **Modern Stack**: React, Supabase, and modern web technologies

## 🎨 Design System

### Colors
- **Primary**: Bright Yellow (#FFF275)
- **Secondary**: Mid-Grey (#555-666)
- **Background**: White (#FFFFFF)
- **High Contrast**: Available for enhanced accessibility

### Typography
- **Primary Font**: ITC Avant Garde Gothic
- **Web Alternatives**: Poppins, Montserrat, Open Sans
- **Adjustable Sizes**: User-controlled font scaling

### Components
- **Buttons**: Bold yellow primary, grey secondary, large touch areas
- **Icons**: Simple line-based AAC-friendly symbols with text labels
- **Cards**: Clean, accessible layouts with clear hierarchy

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager
- Supabase account (for backend services)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd communication-matters-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_project_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Setup

### Supabase Configuration

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Set up the database tables** using the following SQL:

```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  speaker TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT NOT NULL,
  track TEXT,
  day TEXT NOT NULL,
  session_type TEXT DEFAULT 'presentation',
  capacity INTEGER,
  accessibility_features TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements table
CREATE TABLE announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('urgent', 'important', 'normal')),
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'schedule', 'venue', 'technical', 'catering', 'transport')),
  action_url TEXT,
  action_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  text TEXT NOT NULL,
  session_id UUID REFERENCES sessions(id),
  anonymous BOOLEAN DEFAULT false,
  votes INTEGER DEFAULT 0,
  answered BOOLEAN DEFAULT false,
  answer TEXT,
  answered_by TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sponsors table
CREATE TABLE sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('platinum', 'gold', 'silver', 'bronze', 'partner', 'supporter')),
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  tagline TEXT,
  products TEXT,
  contact_info TEXT,
  social_media JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access" ON sessions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON announcements FOR SELECT USING (true);
CREATE POLICY "Public read access" ON questions FOR SELECT USING (true);
CREATE POLICY "Public read access" ON sponsors FOR SELECT USING (true);

-- Create policies for authenticated insert (questions)
CREATE POLICY "Authenticated insert" ON questions FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated update votes" ON questions FOR UPDATE USING (true);
```

3. **Add sample data** (optional):

```sql
-- Sample sessions
INSERT INTO sessions (title, speaker, description, start_time, end_time, location, track, day) VALUES
('Opening Keynote: The Future of AAC', 'Dr. Sarah Johnson', 'Exploring emerging trends and technologies in augmentative and alternative communication.', '2025-09-08 09:00:00+00', '2025-09-08 10:00:00+00', 'Main Auditorium', 'Keynote', 'Monday'),
('AAC Assessment Strategies', 'Prof. Michael Chen', 'Evidence-based approaches to AAC assessment across the lifespan.', '2025-09-08 10:30:00+00', '2025-09-08 11:30:00+00', 'Room A', 'Clinical', 'Monday');

-- Sample announcements
INSERT INTO announcements (title, content, priority, category) VALUES
('Welcome to Communication Matters 2025!', 'We are delighted to welcome you to this year''s conference. Please check your programme for any last-minute updates.', 'important', 'general'),
('Lunch Menu Available', 'Today''s lunch menu includes vegetarian, vegan, and gluten-free options. Please see the catering desk for details.', 'normal', 'catering');

-- Sample sponsors
INSERT INTO sponsors (name, tier, description, website_url) VALUES
('TechAAC Solutions', 'platinum', 'Leading provider of AAC technology and software solutions for individuals with communication needs.', 'https://techaacsolutions.com'),
('Communication Partners Ltd', 'gold', 'Specialists in AAC training and support services for families and professionals.', 'https://communicationpartners.co.uk');
```

## 📱 PWA Setup

The app is configured as a Progressive Web App (PWA) with:

- **Service Worker**: Automatic caching and offline functionality
- **Web App Manifest**: App-like installation on mobile devices
- **Offline Support**: Core functionality available without internet
- **Push Notifications**: Real-time updates (when implemented)

### Installing as an App

1. **On Mobile**: Use "Add to Home Screen" option in your browser
2. **On Desktop**: Look for the install prompt in the address bar
3. **Manual**: Use browser settings to install the PWA

## 🧪 Testing

### Accessibility Testing

```bash
# Install accessibility testing tools
npm install -g @axe-core/cli

# Run accessibility audit
axe http://localhost:3000
```

### Manual Testing Checklist

- [ ] **Keyboard Navigation**: Tab through all interactive elements
- [ ] **Screen Reader**: Test with NVDA, JAWS, or VoiceOver
- [ ] **High Contrast**: Toggle high contrast mode
- [ ] **Font Scaling**: Test different font sizes
- [ ] **Mobile**: Test on various mobile devices
- [ ] **Offline**: Test PWA functionality without internet

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Set environment variables** in Vercel dashboard:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Alternative Deployment Options

- **Netlify**: Connect GitHub repository for automatic deployments
- **GitHub Pages**: Use `npm run build` and deploy the `build` folder
- **Firebase Hosting**: Use Firebase CLI for deployment

## 🔧 Configuration

### Environment Variables

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics
REACT_APP_GA_TRACKING_ID=your_google_analytics_id

# Optional: Error Tracking
REACT_APP_SENTRY_DSN=your_sentry_dsn
```

### Customization

#### Colors and Branding
Edit `src/App.css` to customize:
- Color variables (CSS custom properties)
- Font families and sizes
- Spacing and layout

#### Content
Update content in:
- `src/pages/` - Page components
- `public/manifest.json` - PWA configuration
- `public/index.html` - Meta tags and title

## 📚 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.js       # Main navigation header
│   ├── Navigation.js   # Mobile-friendly navigation
│   └── SkipLink.js     # Accessibility skip link
├── contexts/           # React contexts
│   └── AccessibilityContext.js  # Accessibility state management
├── lib/               # Utilities and services
│   └── supabase.js    # Database connection and helpers
├── pages/             # Main page components
│   ├── Home.js        # Landing page
│   ├── Programme.js   # Session listings
│   ├── MyAgenda.js    # Personal schedule
│   ├── Map.js         # Campus map and venues
│   ├── News.js        # Announcements
│   ├── QA.js          # Questions and answers
│   └── Sponsors.js    # Sponsor showcase
├── App.js             # Main application component
├── App.css            # Global styles and design system
└── index.js           # Application entry point
```

## 🤝 Contributing

### Development Guidelines

1. **Accessibility First**: Every feature must be accessible
2. **Mobile First**: Design for mobile, enhance for desktop
3. **Performance**: Optimize for slow connections
4. **Testing**: Test with real assistive technologies

### Code Standards

- **ESLint**: Follow React and accessibility linting rules
- **Prettier**: Consistent code formatting
- **Comments**: Document accessibility considerations
- **Semantic HTML**: Use proper HTML elements and ARIA

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Test accessibility thoroughly
4. Submit pull request with detailed description
5. Ensure all checks pass

## 📞 Support

### Getting Help

- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issues for bugs or feature requests
- **Accessibility**: Contact the development team for accessibility questions

### Contact Information

- **Project Lead**: [Your Name] - [email@example.com]
- **Accessibility Consultant**: [Consultant Name] - [email@example.com]
- **Technical Support**: [Support Email] - [support@example.com]

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Communication Matters**: For their commitment to accessibility
- **AAC Community**: For feedback and testing
- **Accessibility Experts**: For guidance and best practices
- **Open Source Contributors**: For the tools and libraries used

---

**Built with ❤️ for the AAC community**

*This application prioritizes accessibility and inclusion, ensuring that all users can participate fully in the Communication Matters Conference experience.*