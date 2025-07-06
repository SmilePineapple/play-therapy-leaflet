# Database Cleanup Scripts

These scripts will help you clean up the 2024 sessions and duplicate announcements from your database.

## 📋 Available Scripts

### 1. `cleanup-2024-data.sql` (Comprehensive Cleanup)
**Recommended for most users**
- ✅ Removes all sessions with 2024 dates
- ✅ Removes duplicate announcements (keeps latest version)
- ✅ Removes announcements with 2024 references
- ✅ Provides detailed progress reports
- ✅ Shows final data summary

### 2. `remove-2024-sessions-only.sql` (Sessions Only)
**Use if you only want to clean up sessions**
- ✅ Removes only sessions with 2024 dates
- ✅ Leaves announcements untouched
- ✅ Simpler and faster execution

### 3. `cleanup-duplicate-announcements.sql` (Announcements Only)
**Use if you only want to clean up announcements**
- ✅ Removes duplicate announcements by title
- ✅ Removes announcements with 2024 references
- ✅ Shows breakdown by category

## 🚀 How to Use

1. **Go to your Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Select your **communication-matters-conference** project

2. **Open SQL Editor**
   - Click on **SQL Editor** in the left sidebar

3. **Run the Script**
   - Copy the contents of your chosen script
   - Paste into the SQL Editor
   - Click **Run** to execute

4. **Check the Results**
   - The script will show progress messages
   - Review the final summary

## ⚠️ Important Notes

- **Backup Recommended**: These scripts delete data permanently
- **Run Once**: Don't run the same script multiple times
- **Check Results**: Use the verification queries at the bottom of each script

## 🔍 Expected Results

After running the cleanup:
- **Sessions**: Should only contain 2025 conference dates
- **Announcements**: Should have no duplicates and only 2025 references
- **Total Sessions**: Should be around 61 sessions (based on parsed-sessions.json)

## 🆘 Troubleshooting

If you get permission errors:
1. Make sure you're logged into the correct Supabase project
2. Check that you have admin access to the database
3. Try running the scripts one section at a time

## ✅ Verification

After cleanup, you can verify the results with these queries:

```sql
-- Check session count and date range
SELECT 
    COUNT(*) as total_sessions,
    MIN(start_time::date) as earliest_date,
    MAX(start_time::date) as latest_date
FROM sessions;

-- Check announcement count
SELECT COUNT(*) as total_announcements FROM announcements;

-- Look for any remaining 2024 references
SELECT COUNT(*) as sessions_with_2024 FROM sessions 
WHERE start_time::text LIKE '%2024%';
```

---

**Ready to clean up your database?** Start with `cleanup-2024-data.sql` for a complete cleanup!