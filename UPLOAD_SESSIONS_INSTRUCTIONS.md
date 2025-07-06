# Upload Sessions to Supabase - Instructions

## Status: Ready to Upload! 🚀

All 61 sessions from the PDF timetable have been parsed and are ready to upload to Supabase.

## Steps to Complete the Upload:

### Step 1: Set Up Database Permissions
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your **communication-matters-conference** project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy and paste the contents of `scripts/setup-sessions-policy.sql` into the SQL Editor
5. Click **Run** to execute the script

### Step 2: Run the Import Script
Once you've run the SQL script, execute the import:

```bash
node scripts/import-sessions.js
```

## What Will Happen:

✅ **Clear existing sessions** (if any)  
✅ **Import all 61 sessions** in batches of 10  
✅ **Transform data** to match database schema:  
- Convert day names to dates (Monday = 2025-09-08, etc.)
- Parse start and end times
- Format descriptions with session numbers and tracks
- Clean up location data

## Session Data Includes:
- **Title** and **Speaker** information
- **Start/End times** with proper timezone
- **Location** and **Track** details
- **Day** (Monday-Friday)
- **Description** with session numbers and categories

## Files Involved:
- `data/parsed-sessions.json` - The 61 parsed sessions
- `scripts/import-sessions.js` - The upload script
- `scripts/setup-sessions-policy.sql` - Database permissions
- `.env.local` - Supabase credentials

## Troubleshooting:

If you get RLS policy errors, make sure you've run the SQL script in Step 1.

If you get column errors, the database schema might be different than expected. Check the actual table structure in Supabase.

---

**Ready to proceed?** Follow Step 1 above, then run the import script!