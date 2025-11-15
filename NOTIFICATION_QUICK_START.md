# ⚡ NOTIFICATION SYSTEM - QUICK START

## 2 Steps to Get Notifications Working

---

## Step 1: Run SQL Script (5 min)

1. Open: https://supabase.com/dashboard/project/iclnquvhushnvjzzcjrs/sql/new
2. Copy all from: `supabase/SETUP_NOTIFICATIONS.sql`
3. Paste and click **RUN**
4. Wait for ✅ success

**If you get "function name not unique" error:**
- The script has been updated to fix this
- Just run it again - it will now work! ✅

---

## Step 2: Restart Dev Server

```bash
npm run dev
```

---

## ✅ Test It Works

1. Open app in browser
2. Go to Tasks
3. Create a task, assign to yourself
4. **Watch for popup!** 🎉
5. Check bell in header (shows badge)
6. Click bell → see notifications page

---

## 🎯 What You Get

✅ Popup notifications (auto-close 5 sec)  
✅ Bell badge with unread count  
✅ Full notifications page  
✅ Mark as read/delete  
✅ Real-time updates  
✅ Works for: tasks, team, projects, documents  

---

## 🔧 Troubleshooting

**Error: "function name not unique"**
- ✅ The SQL script has been updated
- ✅ Run the script again - it now drops old versions first
- ✅ Should work without errors

**No notifications appearing:**
- ✅ Make sure SQL script ran successfully
- ✅ Restart dev server
- ✅ Check browser console for errors

---

## 📚 Full Guide

See: `NOTIFICATION_SYSTEM_COMPLETE.md`

---

**Done! Your notifications are now live!** 🚀

