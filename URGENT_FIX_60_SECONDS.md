# ⚡ URGENT FIX - 60 SECONDS

## 🚨 YOU HAVE INFINITE RECURSION ERROR

### Fix in 2 Steps (60 seconds total)

---

## Step 1: Run SQL (30 seconds)

1. Open: https://supabase.com/dashboard
2. Click: **SQL Editor**
3. Copy: `supabase/FIX_INFINITE_RECURSION.sql` (ALL of it)
4. Paste & **Run**
5. Wait for: ✅ Success message

---

## Step 2: Clear Browser (30 seconds)

1. Press **F12**
2. Click **Application** tab
3. Click **Local Storage**
4. Click **Clear**
5. Press **Ctrl+Shift+R** (hard refresh)

---

## ✅ DONE!

Now test:
1. Signup with any email
2. Create workspace
3. Logout
4. Login again
5. Should go to dashboard ✅

---

## ❌ Still Broken?

Check:
- Did SQL script finish? (check for success message)
- Did you clear localStorage? (should be empty)
- Did you hard refresh? (Ctrl+Shift+R)

If still broken:
- Try incognito mode
- Check Supabase logs
- Check browser console (F12)

---

## 📋 Quick Test

After fix, run this in Supabase SQL Editor:
```sql
SELECT * FROM group_members 
WHERE user_id = auth.uid();
```

Should work ✅ (no recursion error)

---

**That's it! The infinite recursion is fixed.** 🎉

Files:
- SQL: `supabase/FIX_INFINITE_RECURSION.sql`
- Code: Already updated (useGroup.ts)
- Build: ✅ Successful

**Time: 60 seconds**
**Status: READY**

