# Deployment Guide

This guide covers deploying the Communication Matters Conference app to production with proper security and performance optimizations.

## Pre-Deployment Checklist

### 1. Security Hardening ✅
- [x] Console statements removed from production build
- [x] ESLint warnings fixed
- [x] PropTypes validation added
- [x] Content Security Policy implemented
- [x] Security headers configured
- [x] Input sanitization implemented
- [x] Rate limiting utilities created

### 2. Performance Optimization ✅
- [x] Code splitting utilities implemented
- [x] Lazy loading components created
- [x] Image optimization utilities
- [x] Caching strategies implemented
- [x] Performance monitoring tools
- [x] Bundle optimization utilities

### 3. Production Build
```bash
# Use the production build script for optimal deployment
npm run build:production

# Or use standard build
npm run build
```

## Deployment Options

### Option 1: Netlify (Recommended)

1. **Connect Repository**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login and deploy
   netlify login
   netlify deploy --prod --dir=build
   ```

2. **Environment Variables**
   Set in Netlify dashboard:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=production
   ```

3. **Netlify Configuration**
   Create `netlify.toml`:
   ```toml
   [build]
     publish = "build"
     command = "npm run build:production"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   
   [build.environment]
     NODE_VERSION = "18"
   ```

### Option 2: Vercel

1. **Deploy with Vercel CLI**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Vercel Configuration**
   Create `vercel.json`:
   ```json
   {
     "buildCommand": "npm run build:production",
     "outputDirectory": "build",
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           {
             "key": "X-Frame-Options",
             "value": "DENY"
           },
           {
             "key": "X-Content-Type-Options",
             "value": "nosniff"
           }
         ]
       }
     ]
   }
   ```

### Option 3: Traditional Web Server

1. **Build the Application**
   ```bash
   npm run build:production
   ```

2. **Apache Configuration**
   Add to `.htaccess` in build folder:
   ```apache
   RewriteEngine On
   RewriteRule ^(?!.*\.).*$ /index.html [L]
   
   # Security Headers
   Header always set X-Frame-Options "DENY"
   Header always set X-Content-Type-Options "nosniff"
   Header always set X-XSS-Protection "1; mode=block"
   Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
   ```

3. **Nginx Configuration**
   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /path/to/build;
     index index.html;
     
     # Security headers
     add_header X-Frame-Options "DENY" always;
     add_header X-Content-Type-Options "nosniff" always;
     add_header X-XSS-Protection "1; mode=block" always;
     
     # SPA routing
     location / {
       try_files $uri $uri/ /index.html;
     }
     
     # Cache static assets
     location /static/ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }
   }
   ```

## Environment Configuration

### Required Environment Variables
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key

# Environment
NODE_ENV=production

# Optional: Analytics
REACT_APP_GA_TRACKING_ID=your-ga-id
```

### Security Environment Variables
```bash
# Rate limiting (if using backend)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS settings
CORS_ORIGIN=https://your-domain.com
```

## Post-Deployment Verification

### 1. Functionality Tests
- [ ] App loads correctly
- [ ] Navigation works
- [ ] Database connectivity
- [ ] PWA installation
- [ ] Offline functionality
- [ ] Accessibility features

### 2. Security Tests
```bash
# Test security headers
curl -I https://your-domain.com

# Check SSL configuration
ssllabs.com/ssltest/

# Verify CSP
# Use browser dev tools to check for CSP violations
```

### 3. Performance Tests
- [ ] Lighthouse audit (aim for 90+ scores)
- [ ] Core Web Vitals
- [ ] Load testing
- [ ] Mobile performance

## Monitoring and Maintenance

### 1. Error Monitoring
```javascript
// Add to your error boundary or main app
if (process.env.NODE_ENV === 'production') {
  window.addEventListener('error', (event) => {
    // Log to your monitoring service
    console.error('Production error:', event.error);
  });
}
```

### 2. Performance Monitoring
```javascript
// Web Vitals reporting
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 3. Regular Updates
- Update dependencies monthly
- Security audit quarterly
- Performance review quarterly
- Accessibility audit annually

## Troubleshooting

### Common Issues

1. **Routing Issues**
   - Ensure SPA routing is configured
   - Check for missing redirects

2. **Environment Variables**
   - Verify all required variables are set
   - Check variable naming (REACT_APP_ prefix)

3. **Build Failures**
   - Clear node_modules and reinstall
   - Check for ESLint errors
   - Verify all imports are correct

4. **Performance Issues**
   - Enable gzip compression
   - Optimize images
   - Use CDN for static assets

### Support

For deployment issues:
1. Check the browser console for errors
2. Review server logs
3. Test locally with production build
4. Verify environment configuration

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use HTTPS** in production
3. **Implement CSP** to prevent XSS
4. **Regular security audits** with `npm audit`
5. **Monitor for vulnerabilities** in dependencies
6. **Implement rate limiting** for API endpoints
7. **Validate all inputs** on client and server
8. **Use secure headers** as implemented in `_headers`

## Performance Best Practices

1. **Code splitting** for large components
2. **Lazy loading** for images and routes
3. **Caching strategies** for API responses
4. **Bundle optimization** and tree shaking
5. **Service worker** for offline functionality
6. **CDN usage** for static assets
7. **Image optimization** and modern formats
8. **Performance monitoring** and alerting